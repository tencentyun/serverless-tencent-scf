import Plugin from "../Plugin";
import * as deepEqual from "fast-deep-equal";
import { readFile, statSync } from "fs";
import { ServiceFunction, ServiceProvider } from "../types";
import {
  Function,
  UpdateFunctionConfigurationRequest,
  Trigger,
  CreateTriggerRequest,
  Environment,
  Variable,
  VpcConfig,
  Code
} from "../api/scf/scf";
import { TriggerImpl, TriggerType } from "../triggers/Base";
import { getTrigger } from "../triggers";
import {
  MAX_DIRECTLY_POST_PACKAGE_SIZE,
  SCF_CAM_POLICY_COS
} from "../constants";

export default class TencentDeploy extends Plugin {
  private getAllFunctionsTask: Promise<Function[]>;
  deployJob = async () => {
    try {
      await this.doDeploy();
      this.json({ success: true });
    } catch (e) {
      this.json({ success: false, error: e });
      throw e;
    }
  };
  hooks = {
    "deploy:deploy": this.deployJob,
    "deploy:function:packageFunction": () =>
      this.serverless.pluginManager.spawn("package:function"),
    "deploy:function:deploy": this.deployJob
  };
  async doDeploy() {
    // 判断是否已经有函数
    const functions = await this.cacheGetAllFunctions();
    const map = new Map<string, Function>();
    for (const f of functions) {
      map.set(f.FunctionName, f);
    }
    // 发布函数
    const tasks = this.getNeedDeployFunctions().map(
      async f =>
        // 这里可考虑进行并发限制 TODO
        await this.deployFunction(f, map.get(f.name))
    );
    await Promise.all(tasks);
  }
  async deployFunction(f: ServiceFunction, r: Function) {
    if (r) {
      // 已经有函数了
      return this.deployExistsFunction(f);
    }
    // 没有，需要新建
    return this.deployNewFunction(f);
  }
  async deployNewFunction(f: ServiceFunction) {
    this.log(`开始创建函数 ${f.name}`);
    await this.provider.api.scf.CreateFunction({
      FunctionName: f.name,
      Handler: f.handler,
      MemorySize: f.memorySize,
      Description: f.description,
      Timeout: f.timeout,
      Environment: parseEnvironment(f.environment),
      Runtime: this.serverless.service.provider.runtime,
      VpcConfig: parseVpcConfig(f.vpc),
      Code: await this.getServiceCode(f)
    });
    this.log(`创建函数 ${f.name} 完成`);
    await this.deployTriggers(f, []);
  }
  async deployExistsFunction(f: ServiceFunction) {
    // 提前获取已有配置
    const fetchTask = this.provider.api.scf.GetFunction({
      FunctionName: f.name
    });
    // 更新代码
    this.log(`开始更新函数 ${f.name} 代码`);
    await this.provider.api.scf.UpdateFunctionCode({
      FunctionName: f.name,
      Handler: f.handler,
      ...(await this.getServiceCode(f))
    });
    this.log(`更新函数 ${f.name} 代码 完成`);
    // 更新配置，如果有变动的话
    const r = await fetchTask;

    let updates: Pick<
      UpdateFunctionConfigurationRequest,
      Exclude<keyof UpdateFunctionConfigurationRequest, "FunctionName">
    > = {} as any;
    //   "memorySize",
    if ("memorySize" in f && f.memorySize !== r.MemorySize) {
      updates.MemorySize = f.memorySize;
    }
    //   "timeout",
    if ("timeout" in f && f.timeout !== r.Timeout) {
      updates.Timeout = f.timeout;
    }
    //   "description",
    if ("description" in f && f.description !== r.Description) {
      updates.Description = f.description;
    }
    //   "environment",
    const environment = parseEnvironment(f.environment);
    if (!deepEqual(environment, r.Environment)) {
      updates.Environment = environment;
    }
    //   "vpc",
    const vpc = parseVpcConfig(f.vpc);
    if (!deepEqual(vpc, r.VpcConfig)) {
      updates.VpcConfig = vpc;
    }
    // api sdk还未支持
    //   "gpu"
    // const useGpu = f.gpu === 'on' ? "TRUE" : "FALSE";
    // if (useGpu !== r.UseGpu) {
    //   updates.UseGpu = useGpu;
    // }
    if (Object.keys(updates).length > 0) {
      this.log(`开始更新函数 ${f.name} 配置`);
      await this.provider.api.scf.UpdateFunctionConfiguration({
        FunctionName: f.name,
        ...updates
      });
      this.log(`更新函数 ${f.name} 配置成功`);
    }

    await this.deployTriggers(f, r.Triggers);
  }
  async deployTriggers(f: ServiceFunction, triggers: Trigger[]) {
    this.log(`开始更新函数 ${f.name} 触发器`);
    const existsTriggers = new Map<string, TriggerImpl<any>>();
    for (const trigger of triggers) {
      const impl = getTrigger(f, trigger.Type, null, trigger);
      existsTriggers.set(impl.hash, impl);
    }

    // 应该先删再建，避免超额度
    const needCreateTriggers: TriggerImpl<any>[] = [];
    for (const wrap of f.events) {
      const type = Object.keys(wrap)[0] as TriggerType;
      const trigger = wrap[type];
      const local = getTrigger(f, type as TriggerType, trigger);
      if (!local) {
        this.log(`无法识别函数 ${f.name} 触发器类型: ${type}`);
        continue;
      }
      const remote = existsTriggers.get(local.hash);
      // 不存在的，创建
      if (!remote) {
        needCreateTriggers.push(local);
      } else {
        existsTriggers.delete(local.hash);
      }
    }

    // 远端多出的，就是要删除的
    for (const [type, remote] of existsTriggers) {
      this.log(
        `开始删除函数 ${f.name} 触发器 ${remote.Type}:${remote.TriggerName}`
      );
      await this.provider.api.scf.DeleteTrigger({
        FunctionName: f.name,
        Type: remote.Type,
        TriggerName: remote.TriggerName,
        TriggerDesc: remote.TriggerDesc
      });
      await remote.afterDelete(this.provider);
      this.log(
        `删除函数 ${f.name} 触发器 ${remote.Type}:${remote.TriggerName} 完成`
      );
    }
    // 创建
    for (const trigger of needCreateTriggers) {
      const params = {
        FunctionName: f.name,
        Type: trigger.Type,
        TriggerName: trigger.TriggerName,
        TriggerDesc: trigger.TriggerDescForCreation
      };
      this.log(
        `开始创建函数 ${f.name} 触发器 ${params.Type}:${params.TriggerName}`
      );
      await trigger.beforeCreate(this.provider);
      await this.provider.api.scf.CreateTrigger(params);
      this.log(
        `创建函数 ${f.name} 触发器 ${params.Type}:${params.TriggerName} 完成`
      );
    }
    if (!existsTriggers.size && !needCreateTriggers.length) {
      this.log(`函数 ${f.name} 触发器无需更新`);
    } else {
      this.log(`函数 ${f.name} 触发器更新完成`);
    }
  }
  async getServiceCode(func: ServiceFunction): Promise<Code> {
    const filePath =
      func.package.artifact || this.serverless.service.package.artifact;
    // 当文件小时，直接提交
    const size = statSync(filePath).size;
    if (size < MAX_DIRECTLY_POST_PACKAGE_SIZE) {
      return {
        ZipFile: await fileToBase64(filePath)
      };
    }
    // 其它情况通过cos上传
    this.debug(
      `函数 ${
        func.name
      } 发布包超过 ${MAX_DIRECTLY_POST_PACKAGE_SIZE} 字节，使用cos方式上传`
    );
    await this.provider.api.cam.assureScfPolicy(SCF_CAM_POLICY_COS);
    const result = await this.provider.api.scf.upload(filePath, func);
    return {
      // 此处Bucket不传appId
      CosBucketName: result.Bucket.replace(/\-\d+$/, ""),
      // 此处需要是路径，以 / 起始
      CosObjectName: "/" + result.Key,
      CosBucketRegion: this.serverless.service.provider.region
    };
  }
  getNeedDeployFunctions() {
    const functions = this.serverless.service.functions;
    return Object.keys(functions)
      .filter(name => {
        const specifiedFunction = this.options["function"];
        return !specifiedFunction || specifiedFunction === name;
      })
      .map<ServiceFunction>(name => {
        return functions[name];
      });
  }
  async cacheGetAllFunctions() {
    if (!this.getAllFunctionsTask) {
      this.getAllFunctionsTask = this.getAllFunctions();
    }
    return await this.getAllFunctionsTask;
  }
  async getAllFunctions() {
    const maxPageSize = 100;
    let list: Function[] = [];
    let total = 0;
    do {
      const { Functions, TotalCount } = await this.ListFunctions(
        list.length,
        maxPageSize
      );
      total = TotalCount;
      list = list.concat(Functions);
    } while (list.length < total);

    return list;
  }
  ListFunctions(offset: number, limit: number) {
    return this.provider.api.scf.ListFunctions({
      Offset: offset,
      Limit: limit
    });
  }
}

/**
 * 解析yml中的environment配置
 * @param env
 */
function parseEnvironment(env: ServiceFunction["environment"]): Environment {
  return {
    Variables: Object.keys(env).map<Variable>(k => ({
      Key: k,
      Value: env[k]
    }))
  };
}
function parseVpcConfig(vpc: ServiceFunction["vpc"] = ""): VpcConfig {
  const [vpcId, subnetId] = vpc.split("/");
  return {
    VpcId: vpc ? vpcId : null,
    SubnetId: vpc ? subnetId : null
  };
}

async function fileToBase64(filePath: string) {
  const data = await new Promise<Buffer>((resolve, reject) => {
    readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
  return data.toString("base64");
}
