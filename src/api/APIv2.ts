import { APIGlobalOptions } from "./API";
import * as CApi from "qcloudapi-sdk";
import TencentProvider from "../Provider";

export default abstract class APIv2 {
  abstract serviceType: string;
  constructor(
    protected options: APIGlobalOptions,
    protected provider: TencentProvider
  ) {}
  capi = new CApi({
    SecretId: this.options.secretId,
    SecretKey: this.options.secretKey,
    serviceType: "apigateway"
  });
  request(action: string, params: any): any {
    return new Promise((resolve, reject) => {
      const region = this.options.region;
      this.provider.debug(
        `api request ${region} scf.${action} params:${JSON.stringify(params)}`
      );
      this.capi.request(
        {
          Region: region,
          Action: action,
          ...params
        },
        null,
        (err, data) => {
          this.provider.debug(
            `api response ${region} ${
              this.capi.defaults.serviceType
            }.${action} error:${JSON.stringify(err)} data:${JSON.stringify(
              data
            )}`
          );
          if (err) {
            return reject(this.provider.makeError(err));
          }
          if (data.code !== 0) {
            return reject(this.provider.makeError(data));
          }
          resolve(data);
        },
        {
          proxy: this.options.proxy
        }
      );
    });
  }
}
