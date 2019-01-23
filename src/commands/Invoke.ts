import Plugin from "../Plugin";
import { readFileSync } from "fs";
import { InvokeResponse } from "../api/scf/scf";

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

    let result: InvokeResponse;
    try {
      result = await this.provider.api.scf.Invoke({
        FunctionName: functionName,
        ClientContext,
        LogType: 'Tail'
      });
    } catch (e) {
      this.json({ success: false, error: e });
      throw e;
    }
    if (result.Result.InvokeResult) {
      this.json({ success: false, error: result.Result.ErrMsg });
      throw new Error(result.Result.ErrMsg);
    }
    this.json({ success: true, data: result });
    this.log(`调用 ${functionName} 成功, 结果: ${result.Result.RetMsg}`);
  }
}
