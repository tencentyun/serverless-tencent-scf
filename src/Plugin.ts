import { Serverless, ServerlessOptions } from "./types";
import { PROVIDER_NAME } from "./constants";
import TencentProvider from "./Provider";

const logPrefix = `(${PROVIDER_NAME}) `;

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}
const jsonBoundary = process.env.JSON_BOUNDARY || guid();

export default abstract class Plugin {
  private hasJsonOutput = false;
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
  get jsonBoundary() {
    return jsonBoundary;
  }
  /**
   * 在日志中输出json数据，通过 #jsonBoundary 进行解析
   * @param data
   */
  json(data: any) {
    if (!process.env.JSON_OUTPUT) {
      return;
    }
    if (!this.hasJsonOutput) {
      this.hasJsonOutput = true;
      this.log(`jsonBoundary(${this.jsonBoundary})`);
    }
    return this.log(
      `${jsonBoundary}(${JSON.stringify(data)})${jsonBoundary}`
    );
  }
  makeError(err: any) {
    if (err instanceof Error) {
      return err;
    }
    const wrap = new this.serverless.classes.Error();
    Object.assign(wrap, err, {
      message: (err && err.message) || JSON.stringify(err)
    });
    return wrap;
  }
}
