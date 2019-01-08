import { TriggerImpl, TriggerType } from "./Base";
import { COSTriggerOptions } from "../types";
import TencentProvider from "../Provider";
import { SCF_CAM_POLICY_COS } from "../constants";

export default class COSTrigger extends TriggerImpl<COSTriggerOptions> {
  Type = TriggerType.COS;
  get calculateTriggerName() {
    return this.options.bucket;
  }
  get calculateTriggerDesc() {
    return JSON.stringify({
      event: this.options.event,
      filter: {
        Prefix: this.options.prefix,
        Suffix: this.options.suffix
      }
    });
  }
  async beforeCreate(provider: TencentProvider) {
    await provider.api.cam.assureScfPolicy(SCF_CAM_POLICY_COS);
  }
}
