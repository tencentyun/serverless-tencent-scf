import Plugin from "../Plugin";

export default class TencentRemove extends Plugin {
  hooks = {
    "remove:remove": async () => {
      for (const name of this.serverless.service.getAllFunctionsNames()) {
        this.log(`remove function: ${name}`);
        try {
          await this.provider.api.scf.DeleteFunction({
            FunctionName: name
          });
          this.json({ success: true });
        } catch (e) {
          this.json({ success: false, error: e });
          throw e;
        }
      }
    }
  };
}
