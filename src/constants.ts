export const PROVIDER_NAME = "tencent";

// 当文件小于多少字节时，直接提交而不经过cos，现有的HmacSHA256只支持1MB
// 考虑到base64会扩大到4/3，所以这里要扩充一下，暂定0.7吧，扩展后成为0.93MB
export const MAX_DIRECTLY_POST_PACKAGE_SIZE = 1 * 1024 * 1024 * 0.7;
// 用户用于scf代码上传的cos bucket
export const SCF_BUCKET_NAME = 'scf-deployment'

// cos角色授权策略
export const SCF_CAM_POLICY_COS = 'QcloudCOSFullAccess'
// apigateway角色授权策略
export const SCF_CAM_POLICY_APIGATEWAY = 'QcloudAPIGWFullAccess'