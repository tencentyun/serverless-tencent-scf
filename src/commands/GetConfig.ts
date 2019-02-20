import Plugin from "../Plugin";
import { SCF_CAM_POLICY_COS, SCF_CAM_POLICY_APIGATEWAY } from "../constants";
import { ServiceFunction } from "../types";

const policies = [
  [SCF_CAM_POLICY_COS, "cos"],
  [SCF_CAM_POLICY_APIGATEWAY, "API Gateway"]
];

export default class TencentGetConfig extends Plugin {
  commands = {
    tencent: {
      usage: `腾讯云相关指令`,
      commands: {
        getconfig: {
          usage: `(私有指令)获取项目配置`,
          lifecycleEvents: ["getconfig"]
        }
      }
    }
  };
  hooks = {
    "tencent:getconfig:getconfig": async () => {
      this.json({
        success: true,
        data: this.purifyServerlessConfig()
      });
    }
  };
  /**
   * 纯化serverless配置，使它可以安全的序列化，供vscode插件使用
   */
  purifyServerlessConfig() {
    const config = this.serverless.service;
    return {
      name: config.service,
      provider: config.provider,
      functions: config.functions
    };
  }
}
