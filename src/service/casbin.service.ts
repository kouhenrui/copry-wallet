import { newEnforcer, Enforcer } from "casbin";
import TypeORMAdapter from "typeorm-adapter";
import path from "path";
import { casbinDataSourcePostgre } from "../util/orm";
class CasbinService {
  private enforcer: Enforcer;

  public async init() {
    const adapter = await TypeORMAdapter.newAdapter({
      connection: casbinDataSourcePostgre,
    });
    const modelPath = path.resolve(__dirname, "../../model.conf");
    this.enforcer = await newEnforcer(modelPath, adapter);
    await this.enforcer.loadPolicy();
  }

  // 1. 权限校验
  public async enforce(
    sub: string,
    obj: string,
    act: string
  ): Promise<boolean> {
    return this.enforcer.enforce(sub, obj, act);
  }

  // 2. 添加策略
  public async addPolicy(
    sub: string,
    obj: string,
    act: string
  ): Promise<boolean> {
    return this.enforcer.addPolicy(sub, obj, act);
  }

  // 3. 删除策略
  public async removePolicy(
    sub: string,
    obj: string,
    act: string
  ): Promise<boolean> {
    return this.enforcer.removePolicy(sub, obj, act);
  }

  // 4. 获取全部策略
  public async getPolicy(): Promise<string[][]> {
    return this.enforcer.getPolicy();
  }

  // 5. 按条件获取策略
  public async getFilteredPolicy(
    fieldIndex: number,
    ...values: string[]
  ): Promise<string[][]> {
    return this.enforcer.getFilteredPolicy(fieldIndex, ...values);
  }

  // 6. 为用户添加角色
  public async addRoleForUser(user: string, role: string): Promise<boolean> {
    return this.enforcer.addRoleForUser(user, role);
  }

  // 7. 删除用户的角色
  public async deleteRoleForUser(user: string, role: string): Promise<boolean> {
    return this.enforcer.deleteRoleForUser(user, role);
  }

  /**
   * 添加用户并绑定角色
   */
  public async addUserToRole(user: string, role: string) {
    await this.enforcer.addGroupingPolicy(user, role);
  }

  /**
   * 添加角色并继承 base 角色
   */
  async addRole(role: string) {
    await this.enforcer.addNamedGroupingPolicy("g2", role, "base"); // 自动继承 base
  }

  // 8. 获取用户的角色
  public async getRolesForUser(user: string): Promise<string[]> {
    return this.enforcer.getRolesForUser(user);
  }

  // 9. 获取用户所有权限
  public async getPermissionsForUser(user: string): Promise<string[][]> {
    return this.enforcer.getPermissionsForUser(user);
  }

  /** 获取某个用户或角色的所有权限（包含继承） */
  async getPermissions(roleOrUser: string) {
    return await this.enforcer.getImplicitPermissionsForUser(roleOrUser);
  }

  /** 获取某个用户或角色的直接权限（不包含继承） */
  async getDirectPermissions(roleOrUser: string) {
    return await this.enforcer.getPermissionsForUser(roleOrUser);
  }

  /** 获取某个用户拥有的所有角色（包含多级继承） */
  async getRoles(roleOrUser: string) {
    return await this.enforcer.getImplicitRolesForUser(roleOrUser);
  }

  /** 获取所有定义的角色 */
  async getAllRoles() {
    return await this.enforcer.getAllRoles();
  }

  /** 获取所有角色及其权限（包含继承） */
  async getAllRolePermissions() {
    const roles = await this.getAllRoles();
    const rolePermissions: Record<string, string[][]> = {};
    for (const role of roles) {
      rolePermissions[role] = await this.getPermissions(role);
    }
    return rolePermissions;
  }
}
const casbinService = new CasbinService();
casbinService.init();
export default casbinService;
