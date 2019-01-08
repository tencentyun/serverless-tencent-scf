import Plugin from "../Plugin";
import { readFileSync } from "fs";

export default class TencentInvoke extends Plugin {
  hooks = {
    "invoke:invoke": async () => {
      await this.invoke(
        this.serverless.service.getFunction(this.options["function"]).name
      );
    }
  };
  async invoke(functionName) {
    let ClientContext: string;
    if (this.options.data) {
      ClientContext = this.options.data;
    } else if (this.options.path) {
      ClientContext = readFileSync(this.options.path).toString();
    }

    const result = await this.provider.api.scf.Invoke({
      FunctionName: functionName,
      ClientContext
    });
    if (result.Result.InvokeResult) {
      throw new Error(result.Result.ErrMsg);
    }
    this.log(`调用 ${functionName} 成功, 结果: ${result.Result.RetMsg}`);
  }
}
