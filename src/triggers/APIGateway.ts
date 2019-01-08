import { APIGatewayTriggerOptions, ServiceFunction } from "../types";
import { TriggerImpl, TriggerType, hashJoin } from "./Base";
import TencentProvider from "../Provider";
import { SCF_CAM_POLICY_APIGATEWAY } from "../constants";

export default class APIGatewayTrigger extends TriggerImpl<
  APIGatewayTriggerOptions
> {
  Type = TriggerType.API_GATEWAY;
  get hash() {
    // 只hash { api: {autoRequired, requestConfig }, service:{serviceId}, release:{environmentName}}
    const desc = JSON.parse(this.TriggerDesc);
    return hashJoin([
      this.Type,
      this.TriggerName,
      JSON.stringify({
        api: {
          authRequired: desc.api.authRequired,
          requestConfig: desc.api.requestConfig
        },
        service: { serviceId: desc.service.serviceId },
        release: { environmentName: desc.release.environmentName }
      })
    ]);
  }
  get calculateTriggerName() {
    return `${this.func.name}_apigw`;
  }
  get calculateTriggerDesc() {
    return JSON.stringify({
      api: {
        authRequired: this.options.auth ? "TRUE" : "FALSE",
        requestConfig: { method: this.options.method }
      },
      service: { serviceId: this.options.service },
      release: { environmentName: this.options.stage }
    });
  }
  async beforeCreate(provider: TencentProvider) {
    await Promise.all([
      // 确保角色已授权
      provider.api.cam.assureScfPolicy(SCF_CAM_POLICY_APIGATEWAY),
      // 创建一定是从本地创建，所以从options读
      this.deleteIfExists(provider, this.func.name, this.options.service)
    ]);
  }
  async afterDelete(provider: TencentProvider) {
    // 删除一定是有远端数据
    const data = JSON.parse(this.data.TriggerDesc);
    await this.deleteIfExists(provider, this.func.name, data.service.serviceId);
  }
  async deleteIfExists(
    provider: TencentProvider,
    functionName: string,
    serviceId: string
  ) {
    // 检查是否已经有了
    const result = await provider.api.apigw.DescribeApisStatus({
      serviceId: serviceId
    });
    const exists = result.apiIdStatusSet.find(o => {
      return o.path === "/" + functionName;
    });
    if (!exists) {
      return;
    }
    // 如果已经存在，要先删除
    // 为了保险，只删除原本就转发到本函数的api
    const detail = await provider.api.apigw.DescribeApi({
      serviceId: serviceId,
      apiId: exists.apiId
    });
    if (
      detail.serviceType === "SCF" &&
      detail.serviceScfFunctionName === functionName
    ) {
      await provider.api.apigw.DeleteApi({
        serviceId: serviceId,
        apiId: exists.apiId
      });
    }
  }
}
