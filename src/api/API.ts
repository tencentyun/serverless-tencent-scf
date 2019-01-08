import TencentProvider from "../Provider";

export default class APIFacade {
  constructor(
    protected options: APIGlobalOptions,
    protected provider: TencentProvider
  ) {
    this.provider.debug(`使用HTTP/HTTPS代理： ${options.proxy}`);
  }
  /** 切换公共配置 */
  use(options: Partial<APIGlobalOptions>): this {
    return new (this.constructor as any)(
      Object.assign({}, this.options, options)
    );
  }
}

export interface APIGlobalOptions {
  appId: string;
  secretId: string;
  secretKey: string;
  region: string;
  proxy?: string;
}
