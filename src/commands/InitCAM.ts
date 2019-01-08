import Plugin from "../Plugin";
import { SCF_CAM_POLICY_COS, SCF_CAM_POLICY_APIGATEWAY } from "../constants";

const policies = [
  [SCF_CAM_POLICY_COS, "cos"],
  [SCF_CAM_POLICY_APIGATEWAY, "API Gateway"]
];

export default class TencentInitCAM extends Plugin {
  commands = {
    tencent: {
      usage: `腾讯云相关指令`,
      commands: {
        initcam: {
          usage: `初始化腾讯云SCF角色授权`,
          lifecycleEvents: ["initcam"]
        }
      }
    }
  };
  hooks = {
    "tencent:initcam:initcam": async () => {
      for (const [policy, name] of policies) {
        this.log(`检查 ${name} 角色授权`);
        await this.provider.api.cam.assureScfPolicy(policy, true);
      }
      this.log(`检查角色授权完成`);
    }
  };
}
