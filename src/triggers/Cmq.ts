import { TriggerImpl, TriggerType, hashJoin } from "./Base";
import { CmqTriggerOptions } from "../types";

export default class CmqTrigger extends TriggerImpl<CmqTriggerOptions> {
  Type = TriggerType.CMQ;
  get calculateTriggerName() {
    return this.options.instance;
  }
  get hash() {
    return hashJoin([this.Type, this.TriggerName]);
  }
}
