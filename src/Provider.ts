import { PROVIDER_NAME } from "./constants";
import Plugin from "./Plugin";
import * as tencentSdk from "tencentcloud-sdk-nodejs";
import { readFileSync } from "fs";
import * as ini from "ini";
import API from "./api";
const untildify = require("untildify");

function parseCredentialFile(
  filePath: string
): { appId: string; secretId: string; secretKey: string } {
  const content = readFileSync(filePath).toString();
  let data: any = {};
  if (/\.ini$/.test(filePath)) {
    data = ini.parse(content);
  } else {
    data = JSON.parse(content);
  }

  let config = data;
  const def = data.default || data.def;
  if (def) {
    config = def;
  }

  const appId = config.tencent_app_id || config.appId;
  const secretId = config.tencent_secret_id || config.secretId;
  const secretKey = config.tencent_secret_key || config.secretKey;

  if (!secretId || !secretKey) {
    throw new Error(
      "请检查provider.credentials配置，确保 tencent_app_id, tencent_secret_id 与 tencent_secret_key 均已配置"
    );
  }

  return {
    appId,
    secretId,
    secretKey
  };
}

export default class TencentProvider extends Plugin {
  constructor(a, b) {
    super(a, b);
    this.serverless.setProvider(PROVIDER_NAME, this);
  }
  credentialConfig = parseCredentialFile(
    untildify(
      this.serverless.service.provider.credentials ||
        `~/.tccli/default.credential`
    )
  );
  api = new API(
    {
      appId: this.credentialConfig.appId,
      secretId: this.credentialConfig.secretId,
      secretKey: this.credentialConfig.secretKey,
      region: this.serverless.service.provider.region,
      proxy:
        process.env.proxy ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy ||
        process.env.HTTPS_PROXY ||
        process.env.https_proxy
    },
    this
  );
  static getProviderName() {
    return PROVIDER_NAME;
  }
  get provider() {
    return this;
  }
}
