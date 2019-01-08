import APIv2 from "../APIv2";

export default class CamAPI extends APIv2 {
  get serviceType() {
    return "apigateway";
  }
  policyAttached = new Map<string, Promise<any>>();
  async CreateRole(params: CreateRoleRequest): Promise<CreateRoleResponse> {
    return this.request(`CreateRole`, params);
  }
  async GetRole(params: GetRoleRequest): Promise<GetRoleResponse> {
    return this.request(`GetRole`, params);
  }
  async AttachRolePolicy(
    params: AttachRolePolicyRequest
  ): Promise<AttachRolePolicyResponse> {
    return this.request(`AttachRolePolicy`, params);
  }
  async ListAttachedRolePolicies(
    params: ListAttachedRolePoliciesRequest
  ): Promise<ListAttachedRolePoliciesResponse> {
    return this.request(`ListAttachedRolePolicies`, params);
  }

  // ---------- 角色授权内容 ------------
  /**
   *
   * @param policy
   * @param strict 表示是否进行严格检查，默认为false。非严格检查时，GetRole失败会静默，认为角色授权已经好了。
   */
  async assureScfPolicy(policy: string, strict = false) {
    if (!this.policyAttached.has(policy)) {
      this.policyAttached.set(
        policy,
        this.assureCamRolePolicy(
          "SCF_QcsRole",
          policy,
          {
            qcs: ["qcs::cam::uin/3167904327:root"]
          },
          strict
        )
      );
    }
    return await this.policyAttached.get(policy);
  }
  /** 复合接口 */
  async assureCamRolePolicy(
    roleName: string,
    policyName: string,
    principal: any,
    strict: boolean
  ) {
    let isCreateAndAttach = false;
    const debug = (str: string) => {
      if (strict) {
        return this.provider.log(str);
      }
      return this.provider.debug(str);
    };

    // 判断是否已经创建过角色
    let hasCreateRole = await this.checktUserIsCreateRole(roleName, strict);
    if (hasCreateRole === null) {
      return;
    }
    if (!hasCreateRole) {
      debug(`创建CAM角色 ${roleName}`);
      // 如果没有创建过，则去创建一个角色，再绑定策略
      let roleId = await this.createRole(roleName, principal);
      if (roleId) {
        hasCreateRole = true;
      }
    }

    if (hasCreateRole) {
      // 判断是否已经绑定了策略
      let hasAttachRolePolicies = await this.checkUserIsAttachRolePolicies(
        roleName,
        policyName
      );
      if (!hasAttachRolePolicies) {
        debug(`绑定策略 ${policyName} 到CAM角色 ${roleName}`);
        // 如果没有绑定过策略，则去绑定策略
        let attachRole = await this.attachPolicyForRole(roleName, policyName);
        if (attachRole) {
          isCreateAndAttach = true;
        }
      } else {
        isCreateAndAttach = true;
      }
    }
    debug(`CAM角色 ${roleName} 与策略 ${policyName} 检查完成`);

    return isCreateAndAttach;
  }
  /**
   * 判断某个用户是否已经创建过相关的角色
   */
  private async checktUserIsCreateRole(roleName: string, strict: boolean) {
    try {
      let response = await this.GetRole({
        roleName
      });

      if (response.code === 0) {
        return true;
      }
    } catch (error) {
      if (
        error.code === 4000 &&
        error.data.codeDesc === "InvalidParameter.role.NotExist"
      ) {
        return false;
      }
      // 协作者无法创建角色
      if (error.code === 4103) {
        const errorMessage = `提示：当前SecretId为子帐户，无法验证并自动创建scf角色授权。如果提示cos或API Gateway资源访问未授权，请换主帐号执行一次发布以便初始化。`;
        if (strict) {
          throw this.provider.makeError(errorMessage);
        }
        this.provider.log(errorMessage);
        return null;
      }
      throw error;
    }
  }
  /**
   * 判断某个用户是否已经创建过相关的策略
   * @api ListAttachedRolePolicies
   * @param roleName: string
   * @param page: num
   * @param rp: num
   *
   * @return totalNum: int
   *         list: array
   */
  private async checkUserIsAttachRolePolicies(
    roleName: string,
    policyName: string
  ) {
    // tipErr 是为了在qcconsole 代理层那一块对错误不进行处理，不把错误暴露出来
    let params = {
      roleName,
      page: 1,
      rp: 20
    };

    let response = await this.ListAttachedRolePolicies(params);

    let hasAttachPolicy = false;

    if (response.code === 0) {
      response.data.list.forEach(item => {
        if (item.policyName === policyName) {
          hasAttachPolicy = true;
        }
      });
    }

    return hasAttachPolicy;
  }
  /**
   * 用户创建某角色
   * @api CreateRole
   * @param roleName: string
   * @param policyDocument: string
   *
   * @return roleId: string
   */
  private async createRole(roleName: string, principal: any) {
    let policyDocument = {
      version: "2.0",
      statement: [
        {
          action: "sts:AssumeRole",
          effect: "allow",
          principal: principal
        }
      ]
    };

    let params = {
      roleName,
      policyDocument: JSON.stringify(policyDocument)
    };

    let response = await this.CreateRole(params);

    if (response.code === 0) {
      return response.data.roleId;
    }
  }
  /**
   * 用户根据roleName和 policy进行bangding
   */
  private async attachPolicyForRole(roleName: string, policyName: string) {
    let params = {
      roleName,
      policyName
    };

    try {
      let response = await this.AttachRolePolicy(params);

      if (response.code === 0) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}

export interface CreateRoleRequest {
  /** 角色的信任策略 */
  policyDocument: string;
  /** 角色描述 */
  description?: string;
  /** 角色名 */
  roleName: string;
}
export interface CreateRoleResponse {
  /** 公共错误码，0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  data: {
    /** 角色 ID */
    roleId: string;
  };
}

export interface GetRoleRequest {
  /** 角色 ID，用于指定角色，入参 roleId 与 roleName 二选一 */
  roleId?: string;
  /** 角色名，用于指定角色，入参 roleId 与 roleName 二选一 */
  roleName?: string;
}
export interface GetRoleResponse {
  /** 公共错误码，0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  /** 角色 ID */
  roleId: string;
  /** 角色名 */
  roleName: string;
  /** 角色信任策略 */
  policyDocument: string;
  /** 角色描述 */
  description: string;
  /** 角色创建时间 */
  addTime: string;
  /** 角色最近修改时间 */
  updateTime: string;
}

export interface AttachRolePolicyRequest {
  /** 策略 ID，入参 policyId 与 policyName 二选一 */
  policyId?: number;
  /** 策略名，入参 policyId 与 policyName 二选一 */
  policyName?: string;
  /** 角色 ID，用于指定角色，入参 roleId 与 roleName 二选一 */
  roleId?: string;
  /** 角色名，用于指定角色，入参 roleId 与 roleName 二选一 */
  roleName?: string;
}
export interface AttachRolePolicyResponse {
  /** 公共错误码，0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  /** 模块错误信息描述，与接口相关。 */
  message: string;
  /** 英文错误描述 */
  codeDesc: string;
}

export interface ListAttachedRolePoliciesRequest {
  /** 角色 ID。用于指定角色，入参 roleId 与 roleName 二选一 */
  roleId?: string;
  /** 角色名。用于指定角色，入参 roleId 与 roleName 二选一 */
  roleName?: string;
  /** 页码，从 1 开始。默认值是 1 */
  page?: number;
  /** 每页大小。默认值是 20 */
  rp?: number;
  /** 取值 User 表示只查询自定义策略，QCS 表示只查询预设策略，不传表示查询关联的所有策略*/
  policyType?: string;
}
export interface ListAttachedRolePoliciesResponse {
  /** 公共错误码，0 表示成功，其他值表示失败。详见错误码页面的 公共错误码。 */
  code: number;
  data: {
    /** 策略总数 */
    totalNum: number;
    /** 策略数组，数组每个成员包括以下字段： */
    list: Policy[];
  };
}

export interface Policy {
  /** 策略 ID */
  policyId: string;
  /** 策略名 */
  policyName: string;
  /** 策略创建时间 */
  addTime: string;
  /** 策略描述 */
  description: string;
  /** 1 表示按业务权限创建的策略，其他值表示可以查看策略语法和通过策略语法更新策略 */
  createMode: number;
}
