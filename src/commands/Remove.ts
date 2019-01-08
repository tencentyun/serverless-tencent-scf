import Plugin from "../Plugin";

export default class TencentRemove extends Plugin {
  hooks = {
    "remove:remove": async () => {
      for (const name of this.serverless.service.getAllFunctionsNames()) {
        this.log(`remove function: ${name}`);
        await this.provider.api.scf.DeleteFunction({
          FunctionName: name
        });
      }
    }
  };
}
