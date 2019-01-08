import { TriggerImpl, TriggerType } from "./Base";
import { TimerTriggerOptions } from "../types";

export default class TimerTrigger extends TriggerImpl<TimerTriggerOptions> {
  Type = TriggerType.TIMER;
  get calculateTriggerName() {
    return this.options.name;
  }
  get calculateTriggerDesc() {
    return JSON.stringify({ cron: this.options.cron });
  }
  get TriggerDescForCreation() {
    const o = JSON.parse(this.TriggerDesc);
    return o.cron;
  }
}
