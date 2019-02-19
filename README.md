# serverless-tencent-scf

This plugin enables [Tencent SCF (Serverless Cloud Function)] (https://cloud.tencent.com/product/scf) support for [Serverless Framework] (https://github.com/serverless/serverless).

*Read this in other languages: [English](README.md), [简体中文](README.zh-hans.md)*

## Getting started

### Pre-requisites

- Node.js v8.x+
- Serverless CLI v1.35.0+ (install via `npm i -g serverless`)
- Qcloud account
  - APPID
  - SecretId
  - SecretKey

###example

The project file structure is similar to this:

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
  credentials: ~/.tencentcloud/credentials.ini # must provide absolute path

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
For more examples of trigger configuration, please refer to [example/serverless.yml](example/serverless.yml)

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

API key configuration `credentials.ini`:

```ini
[default]
Tencent_secret_id=AKIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Tencent_secret_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Tencent_app_id=1251******
```

**This file contains sensitive information, please do not put it in the project directory**, it is recommended to put it in your personal directory and configure it to provider.credentials with an absolute path.

If you do not configure `provider.credentials`, the default credential configuration of [tencentcli] (https://github.com/TencentCloud/tencentcloud-cli) will be used, but some features cannot work because there is no `APPID`, see FAQ.

The following is the access to each information.

- The `tencent_secret_id` and `tencent_secret_key` cloud API keys can be queried in [Tencent Cloud-API Key Management] (https://console.cloud.tencent.com/cam/capi). If not, please create a new one.
- `tencent_app_id` The APPID of Tencent Cloud account can be found in [Tencent Cloud-Account Center] (https://console.cloud.tencent.com/developer)

### Development & Publishing
- Initial Tencent SCF plugin:

  ```console
  serverless plugin install --name serverless-tencent-scf
  ```

- Deploy or update scf to Tencent Cloud:

  ```console
  serverless deploy
  ```

  TIP: The command `sls` is shortcut of `serverless`, so you can simply use `sls deploy`

- Removed from Tencent Cloud scf:

  ```console
  serverless remove
  ```

- Remote call

  ```console
  serverless invoke -f hello
  ```

- Log query

  ```console
  serverless logs -f hello
  ```

## FAQ

### APPID

In the example `provider.credentials` is additionally configured with `tencent_app_id`, which is optional and only required by some functions.

Here are the features that need to use APPID

- Release package file larger than 10MB

If not configured, an error will be displayed when performing the above functions.

### cos Authorization

When the package file is larger than 10MB, it will upload package via user's own cos. The upload operation requires the account to have the read and write permissions of the transfer bucket (`scf-deployment`). If you are using sub-account, you can login owner account [associate CAM policy] (https://cloud.tencent.com/document/product/436/11714) to sub-account

Of course you can also do [more precise CAM authorization] (https://cloud.tencent.com/document/product/598/11084)

### Role Authorization

Here are the features that need to grant permissions to the scf role.

- [Cloud Object Storage - cos] (https://console.cloud.tencent.com/cos)

  - When the package file is larger than 10MB, it will upload package file via cos, and scf needs to access the user-uploaded package file.
  - cos trigger

- [API Gateway - API Gateway] (https://console.cloud.tencent.com/apigateway)
  - API Gateway Trigger

Usually it is automate authorized by the tool, but if you are using a sub-account secret key, and the current cloud account does not have initial role creation and authorization, and there is no permission to perform initial operations, an error will be reported.

You can use the primary account to execute `serverless tencent initcam`, which will initialize the role authorization, so that scf can access other business resources (such as object storage, API gateway, etc.)

Visit [Tencent Cloud - Access Management - Roles] (https://console.cloud.tencent.com/cam/role) to view the strategy that the scf role (`SCF_QcsRole`) is bound to.

### proxy

To use a proxy, configure the `https_proxy` environment variable