import Plugin from "../Plugin";
import { Writable } from "stream";
import { FunctionLog, Filter } from "../api/scf/scf";
import * as moment from "moment";
import chalk from "chalk";
import { EOL } from "os";

const API_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

export default class TencentLogs extends Plugin {
  commands = {
    logs: {
      options: {
        requestId: {
          usage: "RequestId"
        }
      }
    }
  };
  hooks = {
    "logs:logs": async () => {
      await this.logs(process.stdout);
    }
  };
  async logs(output: Writable) {
    const functionName = this.serverless.service.getFunction(
      this.options.function
    ).name;
    // 处理流式输出
    const loop = this.options.tail;
    const interval = parseInt(this.options.interval, 10) || 10000;
    let initTimestamp = 0;
    let lastTimestamp = 0;

    // 时间范围，参考aws插件实现
    if (this.options.startTime) {
      const since =
        ["m", "h", "d"].indexOf(
          this.options.startTime[this.options.startTime.length - 1]
        ) !== -1;
      if (since) {
        initTimestamp = moment()
          .subtract(
            this.options.startTime.replace(/\D/g, ""),
            this.options.startTime.replace(/\d/g, "")
          )
          .valueOf();
      } else {
        initTimestamp = moment.utc(this.options.startTime).valueOf();
      }
    } else {
      // 如果未指定，则查最近10分钟日志？感觉不需要
      initTimestamp = moment()
        .subtract(10, "m")
        .valueOf();
      if (this.options.tail) {
        initTimestamp = moment()
          .subtract(10, "s")
          .valueOf();
      }
    }

    do {
      // 轮询间隔
      if (lastTimestamp) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      const startTime = lastTimestamp ? lastTimestamp + 1000 : initTimestamp;
      const logs = await this.getLogs(functionName, startTime);
      this.json(logs);
      for (const log of logs) {
        output.write(this.formatLog(log));
        lastTimestamp = moment(log.StartTime, API_DATE_FORMAT)
          .toDate()
          .getTime();
      }
      lastTimestamp = lastTimestamp || Date.now();
    } while (loop);
  }
  async getLogs(functionName: string, startTime?: number) {
    let Filter: Filter;
    let FunctionRequestId: string;
    if (this.options.requestId) {
      FunctionRequestId = this.options.requestId;
    }

    if (this.options.filter) {
      try {
        Filter = JSON.parse(this.options.filter);
      } catch (e) {
        this.log(
          `无法识别 filter 入参（${
            this.options.filter
          }），请使用JSON格式，如 {"RetCode":"is0"} 表示只返回正确日志`
        );
      }
    }

    let StartTime: string;
    let EndTime: string;
    // FunctionRequestId是最优先的
    if (!FunctionRequestId && startTime) {
      StartTime = moment(startTime).format(API_DATE_FORMAT);
      EndTime = moment()
        .add(30 * 1000)
        .format(API_DATE_FORMAT);
    }
    const result = await this.provider.api.scf.GetFunctionLogs({
      FunctionName: functionName,
      Offset: 0,
      Limit: 50,
      OrderBy: "start_time",
      Order: "asc",
      Filter,
      FunctionRequestId,
      StartTime,
      EndTime
    });
    return result.Data;
  }
  formatLog(log: FunctionLog): string {
    return `
---------------------------------------
${chalk.green(log.StartTime)} ${chalk.yellow(log.RequestId)} ${
      log.RetCode ? chalk.red("失败") : chalk.green("成功")
    } ${log.Duration}ms

返回数据：
${log.RetMsg}

日志：
${log.Log}

`;
  }
}
