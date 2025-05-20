import {
  autoFormatArrayDates,
  autoFormatObjectDates,
  encryptPassword,
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  getCaptcha,
  getSelfSalt,
  hashPassword,
  verifyRefreshToken,
} from "../util/crypto";
import { getWebSocketService } from "../ws";
import { CustomError } from "../util/error";
import { CaptchaType } from "../util/key";
import { getRedisService, redisClient } from "../util/redis";
import {
  CaptchaDts,
  LoginDto,
  LoginDts,
  RegisterDto,
  CreateRoleDto,
  PerfectInfo,
} from "../dto/auth.dto";
import { env } from "../util/env";
import { logger } from "../util/log";
import { AccountRepository, AccountRepo } from "../orm/repository/user";
import { RoleRepository } from "../orm/repository/role"; //在使用到该服务时注入
import { LogRepo } from "../orm/repository/exam";
import { Account } from "../orm/entity.ts/account";
import { RefreshTokenRepository, LogRepository } from "../orm/repository/exam";
import { PaginationDto, PaginationDts } from "../dto/exam";
import casbinService from "./casbin.service";
class AuthService {
  private accountRepo: AccountRepo; //账号表在系统启动时注入了authService中
  private redisService: redisClient;
  private logRepo: LogRepo;
  constructor() {
    this.accountRepo = AccountRepository;
    this.logRepo = LogRepository;
    this.redisService = getRedisService();
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Returns a success message when the user is authenticated.
   * @returns string
   */
  /*******  672dc53c-77ed-4864-9f0c-4c099134e3f7  *******/
  async info(user_id: number) {
    try {
      const account = await this.accountRepo.findOneBy({ id: user_id });
      if (!account) throw new CustomError("user not found");
      autoFormatObjectDates(account);
      const role = await RoleRepository.findOneBy({ id: account.role });
      autoFormatObjectDates(role);

      let info: Record<string, any> = {
        account: account.userName,
        email: account.email,
        phone: account.phone,
        avatar: account.avatar,
        nickName: account.nickName,
        idCard: account.idCard,
        role: role ? role.name : "",
        roleDescription: role ? role.description : "",
      };
      return info;
    } catch (error: any) {
      logger().warn({ event: "auth info service error", error });
      throw error;
    }
  }

  /**
   * Verify user account and password.
   * @param account - User account.
   * @param password - User password.
   * @returns Whether the account and password are correct.
   */
  async login(body: LoginDto): Promise<LoginDts> {
    try {
      //先关掉验证验证码组件
      // if (!(await this.verifyCaptcha(body.id, body.code)))
      //   throw new CustomError("验证码错误");
      let where: any = {};
      switch (body.method) {
        case "phone":
          where.phone = body.account;
          break;
        case "email":
          where.email = body.account;
          break;
        case "account":
          where.userName = body.account;
          break;
        default:
          throw new CustomError("method error");
      }
      const account = await this.accountRepo.findOneBy(where);
      if (!account || Object.keys(account).length === 0)
        throw new CustomError("account not found");
      if (account.password !== encryptPassword(body.password, account.salt))
        throw new CustomError("password error");
      let token: string = "";
      let exptime: number = 0;
      if (
        account.accessToken &&
        account.accessToken != null &&
        account.accessToken != "" &&
        (await this.redisService.existCache(account.accessToken))
      ) {
        const jsonRes = await this.redisService.getCache(account.accessToken);
        ({ token, exptime } = JSON.parse(JSON.stringify(jsonRes)));
      }
      // 如果没有有效的 token，则重新生成
      if (!token || token === "" || !exptime || exptime === 0) {
        const accessToken = generateAccessToken();
        const role = await this.findRoleByID(account.role);
        let tokenParams = { id: account.id, role: role.name };
        ({ token, exptime } = generateToken(tokenParams));
        const refresh=generateRefreshToken({id:account.id,role:role.name});
        const {refreshToken,refreshExptime}=refresh;
        await RefreshTokenRepository.create({userId:account.id,token:refreshToken,expiredAt:refreshExptime});
        await this.redisService.set(
          accessToken,
          JSON.stringify({ token, exptime }),
          env.jwt.exptime
        );
        await this.accountRepo.update(account.id, { accessToken });
      }
      let res: LoginDts = { token, exptime };
      return res;
    } catch (error: any) {
      logger().warn({ event: "auth.service失败", error });
      throw error;
    }
  }

  /**
   * Registers a new user account.
   *
   * This function first verifies the provided captcha. If the captcha is valid,
   * it checks if an account with the given username already exists. If the user
   * does not exist, it hashes the password with a generated salt and stores the
   * new user in the repository.
   *
   * @param body - The registration details including account, password, captcha id and code.
   * @returns A success message if registration is successful.
   * @throws {CustomError} If captcha verification fails, the user already exists,
   * or any other error occurs during the registration process.
   */

  async register(body: RegisterDto) {
    try {
      // if (!(await this.verifyCaptcha(body.id, body.code)))
      //   throw new CustomError("验证码错误");
      console.log(body, "0000000");
      const user = await this.accountRepo.findOneBy({ userName: body.account });
      console.log(user, "===");
      if (user) {
        throw new CustomError("user already exists");
      }
      const salt = getSelfSalt(8);
      const hashPwd = encryptPassword(body.password, salt);
      const newAccount = new Account();
      newAccount.userName = body.account;
      newAccount.password = hashPwd;
      newAccount.salt = salt;
      await this.accountRepo.create(newAccount);
      return "register success";
    } catch (error: any) {
      logger().warn({ event: "auth register service error", error });
      throw error;
    }
  }

  async captcha(account: string): Promise<CaptchaDts> {
    try {
      if (!account) throw new CustomError("缺少参数");
      const key = `captcha:${account}`;
      if (await this.redisService.existCache(key))
        throw new CustomError("验证码已发送,请等待一分钟后再试");
      await this.redisService.set(key, "1", 60);
      const { base64, text, id } = getCaptcha(CaptchaType.ALPHANUMERIC);
      await this.redisService.set(id, text, 60);
      const result: CaptchaDts = { base64, id };
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth captcha service error", error });
      throw error;
    }
  }

  async getCaptcha(): Promise<CaptchaDts> {
    try {
      const { base64, text, id } = getCaptcha(CaptchaType.ALPHANUMERIC);
      await this.redisService.set(id, text, 60);
      const result: CaptchaDts = { base64, id };
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth captcha service error", error });
      throw error;
    }
  }

  async verifyCaptcha(id: string, text: string): Promise<boolean> {
    try {
      if (!id || !text) throw new CustomError("缺少参数");
      if (!(await this.redisService.existCache(id)))
        throw new CustomError("验证码已过期,请重试");
      const result = await this.redisService.getCache(id);
      if (result === text) return true;
      return false;
    } catch (error: any) {
      logger().warn({ event: "auth verifyCaptcha service error", error });
      throw error;
    }
  }

  async findRolesAll() {
    try {
      const result = await RoleRepository.findAndCount();
      console.log(result);
      // const res = result.filter((t) => t.name !== "super");
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth findRolesAll service error", error });
      throw error;
    }
  }
  /**
   * Create a new role in the database.
   * @param data - The role to be created.
   * @returns The newly created role.
   * @throws {CustomError} If any error occurs during the creation process.
   */
  async createRole(data: CreateRoleDto) {
    try {
      if (await RoleRepository.findOneBy({ name: data.name }))
        throw new CustomError("角色已存在");
      const result = await RoleRepository.create(data);
      await casbinService.addRole(data.name);
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth createRole service error", error });
      throw error;
    }
  }

  async deleteRole(id: number) {
    try {
      //super不可删除
      if (id === 1) throw new CustomError("该角色不可删除");
      await this.findRoleByID(id);
      const accountRole = await this.accountRepo.findBy({ role: id });
      if (accountRole.length > 0)
        throw new CustomError("该角色正在使用中,不可删除");
      await RoleRepository.softDelete(id);
      return "操作成功";
    } catch (error: any) {
      logger().warn({
        event: "删除角色service失败",
        message: JSON.stringify(error.message),
      });
      throw error;
    }
  }

  async recoverRole(id: number) {
    try {
      const role = await RoleRepository.findWithDeleted(id);
      if (!role) throw new CustomError("角色不存在");
      await RoleRepository.restore(id);
      return "操作成功";
    } catch (error: any) {
      logger().warn({
        event: "恢复角色service失败",
        message: JSON.stringify(error.message),
      });
      throw error;
    }
  }

  async findRoleByID(id: number) {
    try {
      const role = await RoleRepository.findOneBy({ id });
      if (!role || Object.keys(role).length < 1)
        throw new CustomError("role not found");
      autoFormatObjectDates(role);
      return role;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieve a user from the database by one of the following criteria.
   * @param body - The criteria to search for. If any of the following fields is
   * provided, the corresponding field in the database will be used to search
   * for the user.
   * - `account`: The username of the user.
   * - `phone`: The phone number of the user.
   * - `email`: The email address of the user.
   * - `userName`: The nickname of the user.
   * - `idCard`: The ID card number of the user.
   * @returns The user if found, otherwise an error will be thrown.
   * @throws {CustomError} If the user is not found.
   */
  async perfectInfo(body: PerfectInfo) {
    try {
      let where: any = { deletedAt: null };
      if (body.account) where.userName = body.account;
      if (body.phone) where.phone = body.phone;
      if (body.email) where.email = body.email;
      if (body.userName) where.userName = body.userName;
      if (body.idCard) where.idCard = body.idCard;
      const result = await this.accountRepo.findOneBy(where);
      if (!result || Object.keys(result).length === 0)
        throw new CustomError("账号未找到");
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth perfectInfo service error", error });
      throw error;
    }
  }

/**
 * Refreshes the user's access token using a valid refresh token.
 *
 * This function verifies the provided refresh token and checks for its validity
 * and expiry. If valid, it generates a new access token and updates the user's
 * access token in the repository and cache.
 *
 * @param body - Contains the refresh token required to generate a new access token.
 * @returns An object containing the new token and its expiry time.
 * @throws {CustomError} If the refresh token is expired or invalid, or any error occurs
 * during the token refresh process.
 */

  async refresh(body: any) {
    try {
      const { refreshToken } = body;
      const payload = verifyRefreshToken(refreshToken);
      const saved = await RefreshTokenRepository.findOneBy({
        userId: payload.id,
      });
      if (!saved || new Date(saved.expiredAt) < new Date()) {
        throw new CustomError("refresh token 已过期或无效");
      }
      const account = await this.accountRepo.findOneBy({ id: payload.id });
      const role = await RoleRepository.findOneBy({ id: account!.role });
      let tokenParams = { id: account!.id, role: role!.name };
      let accessToken = generateAccessToken();
      const { token, exptime } = generateToken(tokenParams);
      await this.redisService.set(
        accessToken,
        JSON.stringify({ token, exptime }),
        env.jwt.exptime
      );
      await this.accountRepo.update(account!.id, { accessToken });
      return { token, exptime };
    } catch (error: any) {
      logger().warn({ event: "auth refresh service error", error });
      throw error;
    }
  }
  async updateRole(body: any) {
    try {
      await this.findRoleByID(body.id);
      await RoleRepository.update(body.id, body.data);
      return "操作成功";
    } catch (error: any) {
      logger().warn({ event: "auth updateRole service error", error });
      throw error;
    }
  }

  async logList(body: any) {
    try {
      let pagination: PaginationDts = {
        page: body.page,
        pageSize: body.pageSize,
        where: {},
      };
      if (body.level) pagination.where.level = body.level;
      if (body.method) pagination.where.method = body.method;
      const result = await this.logRepo.paginate(pagination);
      autoFormatArrayDates(result.list);
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth logList service error", error });
      throw error;
    }
  }
  async logDetail(id: number) {
    try {
      const result = await this.logRepo.findOneBy({ id });
      autoFormatObjectDates(result);
      return result;
    } catch (error: any) {
      logger().warn({ event: "auth logDetail service error", error });
      throw error;
    }
  }
}

export default new AuthService();
