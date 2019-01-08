import { TriggerImpl, TriggerType } from "./Base";
import { CKafkaTriggerOptions } from "../types";
import TencentProvider from "../Provider";

export default class CKafkaTrigger extends TriggerImpl<CKafkaTriggerOptions> {
    Type = TriggerType.CKAFKA;
    get calculateTriggerName() {
      return `${this.options.instance}-${this.options.topic}`;
    }
    get calculateTriggerDesc() {
      return JSON.stringify({
        maxMsgNum: this.options.batchSize,
        offset: "latest"
      });
    }
    get TriggerDesc() {
      if (this.data) {
        return JSON.parse(super.TriggerDesc);
      }
      return super.TriggerDesc;
    }
    // CKafka当前无需授权，以后需要加上
  }