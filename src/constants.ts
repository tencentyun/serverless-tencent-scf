export const PROVIDER_NAME = "tencent";

// 当文件小于多少字节时，直接提交而不经过cos
export const MAX_DIRECTLY_POST_PACKAGE_SIZE = 10 * 1024 * 1024;
// 用户用于scf代码上传的cos bucket
export const SCF_BUCKET_NAME = 'serverless-cloud-function-deployment'

// cos角色授权策略
export const SCF_CAM_POLICY_COS = 'QcloudCOSFullAccess'
// apigateway角色授权策略
export const SCF_CAM_POLICY_APIGATEWAY = 'QcloudAPIGWFullAccess'