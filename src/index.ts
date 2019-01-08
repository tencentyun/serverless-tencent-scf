import Plugin from "./Plugin";
import Provider from "./Provider";
import Deploy from "./commands/Deploy";
import Invoke from "./commands/Invoke";
import Logs from "./commands/Logs";
import Remove from "./commands/Remove";
import InitCAM from './commands/InitCAM'
import { ServiceFunction, ServiceProvider } from "./types";
import { parseBoolean } from "./util";

class Tencent extends Plugin {
  constructor(serverless, options) {
    super(serverless, options);
    this.formulaService();
    this.serverless.pluginManager.addPlugin(Provider);
    for (const P of [Deploy, Invoke, Logs, Remove, InitCAM]) {
      this.serverless.pluginManager.addPlugin(P);
    }
  }
  /**
   * 标准化/兼容化 处理配置文件
   */
  formulaService() {
    // provider
    this.formulaFunctionCompibility(this.serverless.service.provider);

    // function
    for (const funcName of Object.keys(this.serverless.service.functions)) {
      const func = this.serverless.service.functions[funcName];
      this.formulaFunction(func);
    }
  }
  /**
   * 对Function维度的通用属性进行兼容处理
   *
   * memorySize: 兼容memory的写法
   * gpu: 兼容Y,true,Yes,ON等写法
   * @param func
   */
  formulaFunctionCompibility(
    func: Partial<ServiceFunction> | Partial<ServiceProvider>
  ) {
    if (!("memorySize" in func) && func["memory"]) {
      func.memorySize = func["memory"];
    }
    if ("gpu" in func) {
      func.gpu = parseBoolean(func.gpu);
    }
  }
  /**
   * 对于一些可能的必选属性进行填充
   * @param func
   */
  formulaFunctionDefaults(func: ServiceFunction) {
    func.namespace = func.namespace || "default";
  }
  formulaFunction(func: ServiceFunction) {
    this.formulaFunctionCompibility(func);

    // 从provider取默认值进行合并
    const mergeProperties: FunctionHasDefaultMergeProperty[] = ["environment"];
    for (const p of mergeProperties) {
      func[p] = Object.assign(
        func[p] || {},
        this.serverless.service.provider[p] || {}
      );
    }
    const overrideProperties: FunctionHasDefaultOverrideProperty[] = [
      "namespace",
      "memorySize",
      "timeout",
      "vpc",
      "gpu"
    ];
    const provider = this.serverless.service.provider;
    for (const p of overrideProperties) {
      if (p in func) {
        continue;
      }
      if (p in provider) {
        func[p] = provider[p];
      }
    }

    this.formulaFunctionDefaults(func);
  }
}

type FunctionProperty = keyof ServiceFunction;
/** 可在provider中定义默认值的字段 */
type FunctionHasDefaultProperty = Exclude<
  Extract<FunctionProperty, keyof ServiceProvider>,
  "name"
>;
/** 需要合并的默认字段 */
type FunctionHasDefaultMergeProperty = Extract<
  FunctionHasDefaultProperty,
  "environment"
>;
/** 直接覆盖的字段 */
type FunctionHasDefaultOverrideProperty = Exclude<
  FunctionHasDefaultProperty,
  FunctionHasDefaultMergeProperty
>;

module.exports = Tencent;
