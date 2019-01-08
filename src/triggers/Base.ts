import TencentProvider from "../Provider";
import { ServiceFunction } from "../types";

export enum TriggerType {
  TIMER = "timer",
  CMQ = "cmq",
  COS = "cos",
  CKAFKA = "ckafka",
  API_GATEWAY = "apigw"
}

export function hashJoin(strs: string[]) {
  return strs.join(":");
}
export function formulaJson(json: string) {
  if (!json || typeof json !== "string") {
    return json;
  }
  let value: any = json;
  // while(typeof value === 'string'){
  value = JSON.parse(value);
  // }
  return JSON.stringify(value);
}
export abstract class TriggerImpl<TOptions> {
  constructor(
    /** 在哪个云函数下 */
    protected func: ServiceFunction,
    /** 此配置为serverless.yml中定义的数据 */
    protected options: TOptions,
    /** 此配置为服务端返回的数据 */
    public data: {
      Type: TriggerType;
      TriggerName: string;
      TriggerDesc: string;
    } = null
  ) {}
  abstract Type: TriggerType;
  get TriggerName() {
    if (this.data) {
      return this.data.TriggerName;
    }
    return this.calculateTriggerName;
  }
  get TriggerDesc() {
    if (this.data) {
      return this.data.TriggerDesc;
    }
    return this.calculateTriggerDesc;
  }
  /** 部分接口创建和返回的值不同，需要特殊处理 */
  get TriggerDescForCreation() {
    return this.TriggerDesc;
  }
  // 判断触发器是否重复的标准
  get hash() {
    return hashJoin([
      this.Type,
      this.TriggerName,
      formulaJson(this.TriggerDesc)
    ]);
  }
  get calculateTriggerName() {
    return "";
  }
  get calculateTriggerDesc() {
    return "";
  }
  /** 触发器创建前置任务 */
  async beforeCreate(provider: TencentProvider) {}
  /** 触发器删除后置任务 */
  async afterDelete(provider: TencentProvider) {}
}
