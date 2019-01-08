// Auto-generate by tencentcloud-sdk-ts-generator
// Visit: https://github.com/cyrilluce/tencentcloud-sdk-ts-generator

export interface CreateFunctionRequest{
  /**  创建的函数名称，函数名称支持26个英文字母大小写、数字、连接符和下划线，第一个字符只能以字母开头，最后一个字符不能为连接符或者下划线，名称长度2-60  */
  FunctionName: string
  /**  函数的代码. 注意：不能同时指定Cos与ZipFile  */
  Code: Code
  /**  函数处理方法名称，名称格式支持 "文件名称.方法名称" 形式，文件名称和函数名称之间以"."隔开，文件名称和函数名称要求以字母开始和结尾，中间允许插入字母、数字、下划线和连接符，文件名称和函数名字的长度要求是 2-60 个字符  */
  Handler: string
  /**  函数描述,最大支持 1000 个英文字母、数字、空格、逗号、换行符和英文句号，支持中文  */
  Description: string
  /**  函数运行时内存大小，默认为 128M，可选范围 128MB-1536MB，并且以 128MB 为阶梯  */
  MemorySize: number
  /**  函数最长执行时间，单位为秒，可选值范围 1-300 秒，默认为 3 秒  */
  Timeout: number
  /**  函数的环境变量  */
  Environment: Environment
  /**  函数运行环境，目前仅支持 Python2.7，Python3.6，Nodejs6.10， PHP5， PHP7，Golang1 和 Java8，默认Python2.7  */
  Runtime: string
  /**  函数的私有网络配置  */
  VpcConfig: VpcConfig
}

export interface DeleteFunctionRequest{
  /**  要删除的函数名称  */
  FunctionName: string
}

export interface GetFunctionRequest{
  /**  需要获取详情的函数名称  */
  FunctionName: string
  /**  函数的版本号  */
  Qualifier?: string
  /**  是否显示代码, TRUE表示显示代码，FALSE表示不显示代码,大于1M的入口文件不会显示  */
  ShowCode?: string
}

export interface Environment{
  /**  环境变量数组  */
  Variables: Variable[]
}

export interface Trigger{
  /**  触发器最后修改时间  */
  ModTime: string
  /**  触发器类型  */
  Type: string
  /**  触发器详细配置  */
  TriggerDesc: string
  /**  触发器名称  */
  TriggerName: string
  /**  触发器创建时间  */
  AddTime: string
}

export interface InvokeResponse{
  /**  函数执行结果  */
  Result: Result
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface CreateFunctionResponse{
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface Function{
  /**  修改时间  */
  ModTime: string
  /**  创建时间  */
  AddTime: string
  /**  运行时  */
  Runtime: string
  /**  函数名称  */
  FunctionName: string
  /**  函数ID  */
  FunctionId: string
  /**  命名空间  */
  Namespace: string
}

export interface InvokeRequest{
  /**  函数名称  */
  FunctionName: string
  /**  RequestResponse(同步) 和 Event(异步)，默认为同步  */
  InvocationType?: string
  /**  触发函数的版本号  */
  Qualifier?: string
  /**  运行函数时的参数，以json格式传入，最大支持的参数长度是 1M  */
  ClientContext?: string
  /**  同步调用时指定该字段，返回值会包含4K的日志，可选值为None和Tail，默认值为None。当该值为Tail时，返回参数中的logMsg字段会包含对应的函数执行日志  */
  LogType?: string
  /**  命名空间  */
  Namespace?: string
}

export interface UpdateFunctionConfigurationRequest{
  /**  要修改的函数名称  */
  FunctionName: string
  /**  函数描述。最大支持 1000 个英文字母、数字、空格、逗号和英文句号，支持中文  */
  Description?: string
  /**  函数运行时内存大小，默认为 128 M，可选范 128 M-1536 M  */
  MemorySize?: number
  /**  函数最长执行时间，单位为秒，可选值范 1-300 秒，默认为 3 秒  */
  Timeout?: number
  /**  函数运行环境，目前仅支持 Python2.7，Python3.6，Nodejs6.10，PHP5， PHP7，Golang1 和 Java8  */
  Runtime?: string
  /**  函数的环境变量  */
  Environment?: Environment
  /**  函数的私有网络配置  */
  VpcConfig?: VpcConfig
}

export interface VpcConfig{
  /**  私有网络 的 id  */
  VpcId: string
  /**  子网的 id  */
  SubnetId: string
}

export interface ListFunctionsResponse{
  /**  函数列表  */
  Functions: Function[]
  /**  总数  */
  TotalCount: number
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface CreateTriggerResponse{
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface Result{
  /**  表示执行过程中的日志输出，异步调用返回为空  */
  Log: string
  /**  表示执行函数的返回，异步调用返回为空  */
  RetMsg: string
  /**  表示执行函数的错误返回信息，异步调用返回为空  */
  ErrMsg: string
  /**  执行函数时的内存大小，单位为Byte，异步调用返回为空  */
  MemUsage: number
  /**  表示执行函数的耗时，单位是毫秒，异步调用返回为空  */
  Duration: number
  /**  表示函数的计费耗时，单位是毫秒，异步调用返回为空  */
  BillDuration: number
  /**  此次函数执行的Id  */
  FunctionRequestId: string
  /**  0为正确，异步调用返回为空  */
  InvokeResult: number
}

export interface UpdateFunctionConfigurationResponse{
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface Filter{
  /**  filter.RetCode=not0 表示只返回错误日志，filter.RetCode=is0 表示只返回正确日志，无输入则返回所有日志。  */
  RetCode: string
}

export interface Variable{
  /**  变量的名称  */
  Key: string
  /**  变量的值  */
  Value: string
}

export interface GetFunctionResponse{
  /**  函数的最后修改时间  */
  ModTime: string
  /**  函数的代码  */
  CodeInfo: string
  /**  函数的描述信息  */
  Description: string
  /**  函数的触发器列表  */
  Triggers: Trigger[]
  /**  函数的入口  */
  Handler: string
  /**  函数代码大小  */
  CodeSize: number
  /**  函数的超时时间  */
  Timeout: number
  /**  函数的版本  */
  FunctionVersion: string
  /**  函数的最大可用内存  */
  MemorySize: number
  /**  函数的运行环境  */
  Runtime: string
  /**  函数的名称  */
  FunctionName: string
  /**  函数的私有网络  */
  VpcConfig: VpcConfig
  /**  是否使用GPU  */
  UseGpu: string
  /**  函数的环境变量  */
  Environment: Environment
  /**  代码是否正确  */
  CodeResult: string
  /**  代码错误信息  */
  CodeError: string
  /**  代码错误码  */
  ErrNo: number
  /**  函数的命名空间  */
  Namespace: string
  /**  函数绑定的角色  */
  Role: string
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface GetFunctionLogsResponse{
  /**  函数日志的总数  */
  TotalCount: number
  /**  函数日志信息  */
  Data: FunctionLog[]
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface ListFunctionsRequest{
  /**  以升序还是降序的方式返回结果，可选值 ASC 和 DESC  */
  Order?: string
  /**  根据哪个字段进行返回结果排序,支持以下字段：AddTime, ModTime, FunctionName  */
  Orderby?: string
  /**  数据偏移量，默认值为 0  */
  Offset: number
  /**  返回数据长度，默认值为 20  */
  Limit: number
  /**  支持FunctionName模糊匹配  */
  SearchKey?: string
}

export interface DeleteTriggerResponse{
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface DeleteTriggerRequest{
  /**  函数的名称  */
  FunctionName: string
  /**  要删除的触发器名称  */
  TriggerName: string
  /**  要删除的触发器类型，目前支持 cos 、cmq、 timer、ckafka 类型  */
  Type: string
  /**  如果删除的触发器类型为 COS 触发器，该字段为必填值，存放 JSON 格式的数据 {"event":"cos:ObjectCreated:*"}，数据内容和 SetTrigger 接口中该字段的格式相同；如果删除的触发器类型为定时触发器或 CMQ 触发器，可以不指定该字段  */
  TriggerDesc: string
  /**  函数的版本信息  */
  Qualifier?: string
}

export interface Code{
  /**  对象存储桶名称  */
  CosBucketName?: string
  /**  对象存储对象路径  */
  CosObjectName?: string
  /**  包含函数代码文件及其依赖项的 zip 格式文件，使用该接口时要求将 zip 文件的内容转成 base64 编码，最大支持20M  */
  ZipFile?: string
  /**  对象存储的地域，地域为北京时需要传入ap-beijing,北京一区时需要传递ap-beijing-1，其他的地域不需要传递。  */
  CosBucketRegion?: string
}

export interface UpdateFunctionCodeRequest{
  /**  函数处理方法名称。名称格式支持“文件名称.函数名称”形式，文件名称和函数名称之间以"."隔开，文件名称和函数名称要求以字母开始和结尾，中间允许插入字母、数字、下划线和连接符，文件名称和函数名字的长度要求 2-60 个字符  */
  Handler: string
  /**  要修改的函数名称  */
  FunctionName: string
  /**  对象存储桶名称  */
  CosBucketName?: string
  /**  对象存储对象路径  */
  CosObjectName?: string
  /**  包含函数代码文件及其依赖项的 zip 格式文件，使用该接口时要求将 zip 文件的内容转成 base64 编码，最大支持20M  */
  ZipFile?: string
  /**  对象存储的地域，地域为北京时需要传入ap-beijing,北京一区时需要传递ap-beijing-1，其他的地域不需要传递。  */
  CosBucketRegion?: string
}

export interface GetFunctionLogsRequest{
  /**  函数的名称  */
  FunctionName?: string
  /**  数据的偏移量，Offset+Limit不能大于10000  */
  Offset?: number
  /**  返回数据的长度，Offset+Limit不能大于10000  */
  Limit?: number
  /**  以升序还是降序的方式对日志进行排序，可选值 desc和 acs  */
  Order?: string
  /**  根据某个字段排序日志,支持以下字段：startTime、functionName、requestId、duration和 memUsage  */
  OrderBy?: string
  /**  日志过滤条件。可用来区分正确和错误日志，filter.retCode=not0 表示只返回错误日志，filter.retCode=is0 表示只返回正确日志，不传，则返回所有日志  */
  Filter?: Filter
  /**  函数的版本  */
  Qualifier?: string
  /**  执行该函数对应的requestId  */
  FunctionRequestId?: string
  /**  查询的具体日期，例如：2017-05-16 20:00:00，只能与endtime相差一天之内  */
  StartTime?: string
  /**  查询的具体日期，例如：2017-05-16 20:59:59，只能与startTime相差一天之内  */
  EndTime?: string
}

export interface CreateTriggerRequest{
  /**  新建触发器绑定的函数名称  */
  FunctionName: string
  /**  新建触发器名称。如果是定时触发器，名称支持英文字母、数字、连接符和下划线，最长100个字符；如果是其他触发器，见具体触发器绑定参数的说明  */
  TriggerName: string
  /**  触发器类型，目前支持 cos 、cmq、 timers、 ckafka类型  */
  Type: string
  /**  触发器对应的参数，如果是 timer 类型的触发器其内容是 Linux cron 表达式，如果是其他触发器，见具体触发器说明  */
  TriggerDesc: string
  /**  函数的版本  */
  Qualifier?: string
}

export interface DeleteFunctionResponse{
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export interface FunctionLog{
  /**  函数的名称  */
  FunctionName: string
  /**  函数执行完成后的返回值  */
  RetMsg: string
  /**  执行该函数对应的requestId  */
  RequestId: string
  /**  函数开始执行时的时间点  */
  StartTime: string
  /**  函数执行结果，如果是 0 表示执行成功，其他值表示失败  */
  RetCode: number
  /**  函数调用是否结束，如果是 1 表示执行结束，其他值表示调用异常  */
  InvokeFinished: number
  /**  函数执行耗时，单位为 ms  */
  Duration: number
  /**  函数计费时间，根据 duration 向上取最近的 100ms，单位为ms  */
  BillDuration: number
  /**  函数执行时消耗实际内存大小，单位为 Byte  */
  MemUsage: number
  /**  函数执行过程中的日志输出  */
  Log: string
}

export interface UpdateFunctionCodeResponse{
  /**  唯一请求ID，每次请求都会返回。定位问题时需要提供该次请求的RequestId。  */
  RequestId: string
}

export default abstract class Facade_scf{
  abstract request(action, params)
  CreateFunction(params: CreateFunctionRequest): Promise<CreateFunctionResponse>{
    return this.request('CreateFunction', params)
  }
  DeleteFunction(params: DeleteFunctionRequest): Promise<DeleteFunctionResponse>{
    return this.request('DeleteFunction', params)
  }
  GetFunction(params: GetFunctionRequest): Promise<GetFunctionResponse>{
    return this.request('GetFunction', params)
  }
  Invoke(params: InvokeRequest): Promise<InvokeResponse>{
    return this.request('Invoke', params)
  }
  UpdateFunctionConfiguration(params: UpdateFunctionConfigurationRequest): Promise<UpdateFunctionConfigurationResponse>{
    return this.request('UpdateFunctionConfiguration', params)
  }
  ListFunctions(params: ListFunctionsRequest): Promise<ListFunctionsResponse>{
    return this.request('ListFunctions', params)
  }
  DeleteTrigger(params: DeleteTriggerRequest): Promise<DeleteTriggerResponse>{
    return this.request('DeleteTrigger', params)
  }
  UpdateFunctionCode(params: UpdateFunctionCodeRequest): Promise<UpdateFunctionCodeResponse>{
    return this.request('UpdateFunctionCode', params)
  }
  GetFunctionLogs(params: GetFunctionLogsRequest): Promise<GetFunctionLogsResponse>{
    return this.request('GetFunctionLogs', params)
  }
  CreateTrigger(params: CreateTriggerRequest): Promise<CreateTriggerResponse>{
    return this.request('CreateTrigger', params)
  }
}

