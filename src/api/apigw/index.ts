import APIv2 from "../APIv2";

export default class APIGatewayAPI extends APIv2 {
  get serviceType() {
    return "apigateway";
  }
  async DescribeApisStatus(
    params: DescribeApisStatusRequest
  ): Promise<DescribeApisStatusResponse> {
    return this.request(`DescribeApisStatus`, params);
  }
  async DescribeApi(params: DescribeApiRequest): Promise<DescribeApiResponse> {
    return this.request(`DescribeApi`, params);
  }
  async DeleteApi(params: DeleteApiRequest): Promise<DeleteApiResponse> {
    return this.request(`DeleteApi`, params);
  }
}

export interface DescribeApisStatusRequest {
  /** API 所在的服务唯一 ID。 */
  serviceId: string;
  /** API 接口唯一 ID 数组。 */
  apiIds?: string[];
  /** 偏移量，默认为 0。 */
  offset?: number;
  /** 返回数量，默认为 20，最大值为 100。 */
  limit?: number;
  /** 根据哪个字段排序。 */
  orderby?: string;
  /** 排序方式。 */
  order?: string;
  /** 按照 API 路径名字模糊搜索。 */
  searchName?: string;
  /** 按照 API 唯一 ID 精确搜索。 */
  searchId?: string;
}
export interface DescribeApisStatusResponse {
  /** 公共错误码, 0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  /** 业务侧错误码。成功时返回 Success，错误时返回具体业务错误原因。 */
  codeDesc: string;
  /** 模块错误信息描述，与接口相关。 */
  message: string;
  /** API 所在的服务唯一 ID。 */
  serviceId: string;
  /** 符合条件的 API 接口数量。 */
  totalCount: number;
  /** API 接口列表。 */
  apiIdStatusSet: ApiIdStatus[];
}
export interface ApiIdStatus {
  /** API 接口唯一 ID。 */
  apiId: string;
  /** 用户自定义的 API 接口描述。 */
  apiDesc: string;
  /** API 接口的名称。 */
  apiName: string;
  /** API 接口的类型，当前只有 NORMAL，后续还会增加其他类型的 API。 */
  apiType: string;
  /** API 请求 path。 */
  path: string;
  /** API 请求方式。 */
  method: number;
  /** 创建时间。按照 ISO8601 标准表示，并且使用 UTC 时间。格式为：YYYY-MM-DDThh:mm:ssZ。 */
  createdTime: string;
  /** 最后修改时间。按照 ISO8601 标准表示，并且使用 UTC 时间。格式为：YYYY-MM-DDThh:mm:ssZ。 */
  modifiedTime: string;
  /** 是否需要签名认证，TRUE 表示需要，FALSE 表示不需要。 */
  authRequired: string;
}

export interface DeleteApiRequest {
  /** API 所在的服务唯一 ID。 */
  serviceId: string;
  /** API 接口唯一 ID。 */
  apiId: string;
}
export interface DeleteApiResponse {
  /** 公共错误码, 0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  /** 业务侧错误码。成功时返回 Success，错误时返回具体业务错误原因。 */
  codeDesc: string;
  /** 模块错误信息描述，与接口相关。 */
  message: string;
}

export interface DescribeApiRequest {
  /** API 所在的服务唯一 ID。 */
  serviceId: string;
  /** API 接口唯一 ID。 */
  apiId: string;
}
export interface DescribeApiResponse {
  /** 公共错误码, 0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  /** 业务侧错误码。成功时返回 Success，错误时返回具体业务错误原因。 */
  codeDesc: string;
  /** 模块错误信息描述，与接口相关。 */
  message: string;
  /** API 所在的服务唯一 ID。 */
  serviceId: string;
  /** API 所在的服务的名称。 */
  serviceName: string;
  /** API 所在的服务的描述。 */
  serviceDesc: string;
  /** API 接口唯一 ID。 */
  apiId: string;
  /** API 接口的描述。 */
  apiDesc: string;
  /** API 接口的名称。 */
  apiName: string;
  /** 创建时间。按照 ISO8601 标准表示，并且使用 UTC 时间。格式为：YYYY-MM-DDThh:mm:ssZ。 */
  createdTime: string;
  /** 最后修改时间。按照 ISO8601 标准表示，并且使用 UTC 时间。格式为：YYYY-MM-DDThh:mm:ssZ。 */
  modifiedTime: string;
  /** API 的前端配置字典。 */
  requestConfig: any[];
  /** of Arrays   API 的前端参数数组。 */
  requestParameters: any[];
  /** API 的后端服务类型，现在支持三种：HTTP，MOCK，SCF */
  serviceType: string;
  /** API 的后端服务超时时间，单位是 S。 */
  serviceTimeout: number;
  /** API 的后端配置字典，只有后端服务类型是 HTTP 时才有此出参。 */
  serviceConfig: any[];
  /** of Arrays   API 的后端服务参数数组。只有serviceType是 HTTP 才有此出参。 */
  serviceParameters: any[];
  /** of Arrays   API 的后端服务常量参数数组。只有 serviceType 是 HTTP 才会有此参数。 */
  constantParameters: any[];
  /** API 的后端 Mock 返回信息。只有 serviceType 是 Mock 才有此出参。 */
  serviceMockReturnMessage: string;
  /** API 的后端 Scf 函数名称。只有 serviceType是Scf 才有此出参。 */
  serviceScfFunctionName: string;
  /** 是否需要签名认证，TRUE 表示需要，FALSE 表示不需要。 */
  authRequired: string;
  /** 是否需要开启跨域，TRUE 表示需要，FALSE 表示不需要。 */
  enableCORS: string;
  /** 自定义响应配置返回类型，现在只支持 HTML、JSON、TEST、BINARY、XML。 */
  responseType: string;
  /** 自定义响应配置成功响应示例。 */
  responseSuccessExample: string;
  /** 自定义响应配置失败响应示例。 */
  responseFailExample: string;
  /** of Arrays   自定义响应配置错误码信息。 */
  responseErrorCodes: any[];
}
