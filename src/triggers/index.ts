import { TriggerType, TriggerImpl } from "./Base";
import { Trigger } from "../api/scf/scf";
import TimerTrigger from "./Timer";
import CmqTrigger from "./Cmq";
import COSTrigger from "./COS";
import CKafkaTrigger from "./CKafka";
import APIGatewayTrigger from "./APIGateway";
import { ServiceFunction } from "../types";

interface TriggerClass {
    new (...any: any[]): TriggerImpl<any>;
  }

export function getTrigger<T>(
    func: ServiceFunction,
    type: string|TriggerType,
    options: T,
    trigger?: Trigger
  ): TriggerImpl<T> {
    let Class: TriggerClass = null;
    switch (type) {
      case TriggerType.TIMER:
        Class = TimerTrigger;
        break;
      case TriggerType.CMQ:
        Class = CmqTrigger;
        break;
      case TriggerType.COS:
        Class = COSTrigger;
        break;
      case TriggerType.CKAFKA:
        Class = CKafkaTrigger;
        break;
      case TriggerType.API_GATEWAY:
        Class = APIGatewayTrigger;
        break;
    }
    if (!Class) {
      return null;
    }
    return new Class(func, options, trigger);
  }