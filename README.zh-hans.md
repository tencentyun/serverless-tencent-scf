# serverless-tencent-scf

本插件提供 [Serverless Framework](https://github.com/serverless/serverless) 对 [Tencent SCF(Serverless Cloud Function)](https://cloud.tencent.com/product/scf) 的支持.

*其它语言版本: [English](README.md), [简体中文](README.zh-hans.md)*

## 开始使用

### 前置需求

- Node.js v8.x+
- Serverless CLI v1.35.0+ (通过 `npm i -g serverless` 安装)
- Qcloud 帐号
  - APPID
  - SecretId
  - SecretKey

### 示例

项目文件结构类似这样:

```
├── index.js
├── package.json
└── serverless.yml
```

`serverless.yml`:

```yaml
service: hello-world

provider:
  name: tencent
  region: ap-guangzhou
  runtime: Nodejs8.9
  stage: dev
  credentials: ~/.tencentcloud/credentials.ini # 必须提供绝对路径

plugins:
  - serverless-tencent-scf

package:
  exclude:
    - ./**
  include:
    - index.js

functions:
  hello:
    handler: index.hello
    description: hello world function
    memorySize: 128
    timeout: 3
    events:
      - timer:
          name: 5m
          cron: "*/5 * * * *"
```
更多触发器配置示例请参考[example/serverless.yml](example/serverless.yml)

`package.json`:

```json
{
  "devDependencies": {
    "serverless-tencent-scf": "*"
  }
}
```

`index.js`:

```javascript
"use strict";

exports.hello = (event, context, callback) => {
  callback(null, "Hello world!");
};
```

API 密钥配置`credentials.ini`:

```ini
[default]
tencent_secret_id=AKIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
tencent_secret_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
tencent_app_id=1251******
```

**此文件包含敏感信息，请勿放在项目目录下**，建议将它放在个人目录，并以绝对路径配置到 provider.credentials 。

如果不配置`provider.credentials`，将会使用[tencentcli](https://github.com/TencentCloud/tencentcloud-cli)的默认配置，但因为没有 APPID，所以部分功能无法使用，具体见FAQ。

以下是各信息的获取途径

- `tencent_secret_id` 及 `tencent_secret_key` 云 API 密钥，可以在 [腾讯云-API 密钥管理](https://console.cloud.tencent.com/cam/capi) 查询到。如果没有，请新建
- `tencent_app_id` 腾讯云账号的 APPID，可以在 [腾讯云-账号中心](https://console.cloud.tencent.com/developer) 查询到

### 开发&发布
- 插件初始安装:

  ```console
  serverless plugin install --name serverless-tencent-scf
  ```

- 部署或更新 scf 到腾讯云:

  ```console
  serverless deploy
  ```

  TIP: `serverless`指令可以简化为`sls`，即使用`sls deploy`发布

- 从腾讯云删除 scf:

  ```console
  serverless remove
  ```

- 远程调用

  ```console
  serverless invoke -f hello
  ```

- 日志查询

  ```console
  serverless logs -f hello
  ```

## 常见问题 FAQ

### APPID

示例中 `provider.credentials` 额外配置了 `tencent_app_id`，它不是必选项，只在部分功能下需要使用

以下是需要使用 APPID 的功能

- 大于 10MB 的包文件发布

如果未配置，则执行到以上功能时会提示错误

### cos 授权

当包文件大于 10MB 时，需要通过用户自己的 cos 上传包进行发布，上传操作需要本账号有中转 bucket(`scf-deployment`)读写权限。你可以用主账号给当前账号[绑定相关 CAM 策略](https://cloud.tencent.com/document/product/436/11714)

当然你也可以进行[更精确的 CAM 授权](https://cloud.tencent.com/document/product/598/11084)

### 角色授权

以下是需要给 scf 角色授予相关权限的功能

- [云对象存储-cos](https://console.cloud.tencent.com/cos)

  - 当包文件大于 10MB 时，会通过 cos 上传包文件进行发布，scf 需要访问用户上传的包文件
  - cos 触发器

- [API 网关-API Gateway](https://console.cloud.tencent.com/apigateway)
  - API 网关触发器

通常它是由工具自动化完成的，但如果你在使用子账号密钥，而当前云账号没有进行初始角色创建与授权，并且没有权限进行相关操作时会报错。

你可以换用主账号执行一次`serverless tencent initcam`，这样就会初始化角色授权，使得 scf 可以访问其它业务资源（如对象存储、API 网关等）

访问 [腾讯云-访问管理-角色](https://console.cloud.tencent.com/cam/role) 可以查看 scf 角色(`SCF_QcsRole`) 已绑定的策略

### 内网代理

如需使用代理，请配置 `https_proxy` 环境变量