import Facade from "./scf";
import { APIGlobalOptions } from "../API";
import * as tencentSdk from "tencentcloud-sdk-nodejs";
import { ServiceFunction } from "../../types";
import * as COS from "cos-nodejs-sdk-v5";
import {
  SCF_BUCKET_NAME,
  MAX_DIRECTLY_POST_PACKAGE_SIZE
} from "../../constants";
import { createHash } from "crypto";
import { createReadStream } from "fs";
import TencentProvider from "../../Provider";

const hashKey = "x-cos-meta-sha256";
export default class ScfAPI extends Facade {
  constructor(
    protected options: APIGlobalOptions,
    protected provider: TencentProvider
  ) {
    super();
  }
  credential = new tencentSdk.common.Credential(
    this.options.secretId,
    this.options.secretKey
  );
  Client = tencentSdk.scf.v20180416.Client;
  Models = tencentSdk.scf.v20180416.Models;
  cos = new COS({
    SecretId: this.options.secretId,
    SecretKey: this.options.secretKey,
    Proxy: this.options.proxy
  });
  bucketName = `${SCF_BUCKET_NAME}-${this.options.appId}`;
  cosHeadBucket = promisify(this.cos.headBucket, this.cos);
  cosPutBucket = promisify(this.cos.putBucket, this.cos);
  cosHeadObject = promisify(this.cos.headObject, this.cos);
  cosPutObject = promisify(this.cos.putObject, this.cos);
  cosSliceUploadFile = promisify(this.cos.sliceUploadFile, this.cos);
  /** 用于scf上传的bucket是否存在 */
  scfBucketExists: Promise<any>;
  request(action, params) {
    const { options } = this;
    return new Promise((resolve, reject) => {
      const region = options.region;
      const client = new this.Client(this.credential, region);
      const req = new this.Models[`${action}Request`]();
      req.deserialize(params);
      this.provider.debug(
        `api request ${region} scf.${action} params:${JSON.stringify(req)}`
      );
      client[action](req, (err, data) => {
        this.provider.debug(
          `api response ${region} scf.${action} error:${JSON.stringify(
            err
          )} data:${JSON.stringify(data)}`
        );
        if (err) {
          return reject(this.provider.makeError(err));
        }
        resolve(data);
      });
    });
  }
  // 换存用户自己的cos，如果文件无变更，则返回false
  async upload(zipFile: string, func: ServiceFunction) {
    if (!this.options.appId) {
      throw new Error(
        `没有配置tencent_app_id，无法进行大于 ${MAX_DIRECTLY_POST_PACKAGE_SIZE}Byte 的包文件上传`
      );
    }
    const commonOptions = {
      Bucket: this.bucketName,
      Region: this.options.region,
      Key: func.name + ".zip"
    };
    // 确保bucket存在
    await this.cacheAssureBucketExists();
    // 准备上传
    // 先判断文件有没有存在，如果存在并且hash一致，跳过
    this.provider.debug(`计算发布文件hash值`);
    const hash = await hashFile(zipFile);
    let headResult;
    try {
      this.provider.debug(`检查函数${func.name}在cos的历史发布文件`);
      headResult = await this.cosHeadObject({
        ...commonOptions
      });
    } catch (e) {
      if (e.statusCode !== 404) {
        throw new Error(
          `无法访问cos，请使用主帐号给本帐号关联相关CAM策略（例如：QcloudCOSFullAccess） ${JSON.stringify(
            e
          )}`
        );
      }
      headResult = e;
    }
    if (hash !== headResult.headers[hashKey]) {
      // 上传
      this.provider.debug(`上传函数${func.name}发布文件到cos`);
      await this.cosSliceUploadFile({
        ...commonOptions,
        FilePath: zipFile,
        [hashKey]: hash
      });
    } else {
      this.provider.debug(`函数${func.name}在cos的发布文件不需要更新`);
    }

    return commonOptions;
  }
  private async cacheAssureBucketExists() {
    if (!this.scfBucketExists) {
      this.scfBucketExists = this.assureBucketExists();
    }
    return await this.scfBucketExists;
  }
  private async assureBucketExists() {
    // 检查是否存在
    let result;
    try {
      this.provider.debug(`检查scf发布bucket是否存在`);
      result = await this.cosHeadBucket({
        Bucket: this.bucketName,
        Region: this.options.region
      });
    } catch (e) {
      if (e.statusCode !== 404) {
        throw new Error(
          `无法访问cos，请使用主帐号给本帐号关联相关CAM策略（例如：QcloudCOSFullAccess） ${JSON.stringify(
            e
          )}`
        );
      }
      result = e;
    }

    // 如果不存在，则创建
    if (result.statusCode !== 200) {
      this.provider.debug(`创建scf发布bucket`);
      await this.cosPutBucket({
        Bucket: this.bucketName,
        Region: this.options.region,
        ACL: "private",
        // TODO 暂行方案，后续使用角色授权替代
        GrantRead: 'id="qcs::cam::uin/3167904327:uin/3167904327"'
      });
    }
  }
}

/**
 * 计算文件的sha256 hash值
 * @param filePath
 */
function hashFile(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    hash.setEncoding("hex");
    createReadStream(filePath)
      .pipe(hash)
      .on("finish", function() {
        resolve(hash.read().toString());
      })
      .on("error", reject);
  });
}

function promisify(fn: Function, context: any) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn.call(context, ...args, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  };
}

export interface GetTempCosInfoResponse {
  Date: string;
  Sign: string;
}
