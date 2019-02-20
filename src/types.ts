import Plugin from "./Plugin";
export interface Serverless {
  cli: {
    log(m: string);
  };
  config: Config;
  pluginManager: PluginManager;
  setProvider(name: string, provider: any);
  getProvider(name: string);
  service: Service;
  classes: any;
}
export interface Service {
  service: string;
  provider: ServiceProvider;
  package: ServicePackage;
  plugins: string[];
  functions: {
    [key: string]: ServiceFunction;
  };
  getFunction(name: string): ServiceFunction;
  getAllFunctionsNames(): string[];
}
export interface ServiceProvider {
  /** 如：aws、tencent */
  name: string;
  namespace?: string;
  region: string;
  runtime: string;
  credentials: string;
  // 默认配置
  memorySize?: number;
  timeout?: number;
  vpc?: string;
  gpu?: boolean;
  environment?: {
    [key: string]: string;
  };
}
export interface ServicePackage {
  /** 打包后的zip文件路径 */
  artifact: string;
}
export interface ServiceFunction {
  name?: string;
  namespace?: string;
  handler: string;
  description?: string;
  events?: ServiceFunctionTriggerWrap[];
  memorySize?: number;
  timeout?: number;
  vpc?: string;
  gpu?: boolean;
  environment?: {
    [key: string]: string;
  };
  package: ServicePackage;
}

export interface ServiceFunctionTriggerWrap {
  [type: string]: ServiceFunctionTrigger;
}

export type ServiceFunctionTrigger =
  | TimerTriggerOptions
  | CmqTriggerOptions
  | COSTriggerOptions
  | CKafkaTriggerOptions
  | APIGatewayTriggerOptions;

export interface TimerTriggerOptions {
  name: string;
  cron: string;
  //interval: number
}
export interface CmqTriggerOptions {
  instance: string;
}
export interface COSTriggerOptions {
  bucket: string;
  event: string;
  prefix: string;
  suffix: string;
}
export interface CKafkaTriggerOptions {
  instance: string;
  topic: string;
  batchSize: number;
}
export interface APIGatewayTriggerOptions {
  /** 仅支持ID形式 */
  service: string;
  method: string;
  stage: string;
  auth: boolean;
}

interface Config {
  update(config: any);
}
interface PluginClass {
  new (...any: any[]): Plugin;
}
interface PluginManager {
  addPlugin(Plugin: PluginClass);
  spawn(cmd: string);
}
export interface ServerlessOptions {
  [key: string]: any;
}
