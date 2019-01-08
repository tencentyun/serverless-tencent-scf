import { Serverless, ServerlessOptions } from "./types";
import { PROVIDER_NAME } from "./constants";
import TencentProvider from "./Provider";

const logPrefix = `(${PROVIDER_NAME}) `;
export default abstract class Plugin {
  constructor(
    public serverless: Serverless,
    public options: ServerlessOptions
  ) {}
  get provider(): TencentProvider {
    return this.serverless.getProvider(PROVIDER_NAME);
  }
  log(str: string) {
    return this.serverless.cli.log(logPrefix + str);
  }
  debug(str: string) {
    if (process.env.SLS_DEBUG) {
      return this.serverless.cli.log(logPrefix + "DEBUG " + str);
    }
  }
  makeError(err: any) {
    if (err instanceof Error) {
      return err;
    }
    const wrap = new this.serverless.classes.Error();
    Object.assign(wrap, err, {
      message: err && err.message || JSON.stringify(err)
    });
    return wrap;
  }
}
