import { Context } from "koa";
import authService from "../service/auth.service";
import { CreateRoleDto, LoginDto, RegisterDto } from "../dto/auth.dto";
import { CustomError } from "../util/error";
import { logger } from "../util/log";
import casbinService from "../service/casbin.service";
import { PaginationDto } from "../dto/exam";
import callService from "../service/call.service";

class AuthController {
  async captcha(ctx: Context) {
    try {
      const result = await authService.getCaptcha();
      ctx.body = result;
    } catch (error: any) {
      logger().warn({ event: "auth captcha controller error", error });
      throw error;
    }
  }
  logout(ctx: Context) {
    try {
      ctx.body = "logout success";
    } catch (error: any) {
      logger().warn({ event: "auth logout controller error", error });
      throw error;
    }
  }
  async login(ctx: Context) {
    try {
      const body = ctx.request.body as LoginDto;
      const { token, exptime } = await authService.login(body);
      ctx.body = { token, exptime };
    } catch (error: any) {
      logger().warn({ event: "auth login controller error", error });
      throw error;
    }
  }

  async refresh(ctx: Context) {
    try {
      const body = ctx.request.body;
      const result = await authService.refresh(body);
      ctx.body = result;
    } catch (error: any) {
      logger().warn({ event: "auth refresh controller error", error });
      throw error;
    }
  }

  async register(ctx: Context) {
    try {
      const body = ctx.request.body as RegisterDto;
      const result = await authService.register(body);
      ctx.body = result;
    } catch (error: any) {
      logger().warn({ event: "auth register controller error", error });
      throw error;
    }
  }

  async info(ctx: Context) {
    try {
      const user_id = ctx.state.account.id;
      const result = await authService.info(user_id);
      ctx.body = result;
    } catch (error: any) {
      logger().warn({ event: "auth info controller error", error });
      throw error;
    }
  }
  async createRole(ctx: Context) {
    try {
      const body = ctx.request.body as CreateRoleDto;
      const res = await authService.createRole(body);
      ctx.body = res;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteRole(ctx: Context) {
    try {
      const id = ctx.query.id;
      const result = await authService.deleteRole(Number(id));
      ctx.body = result;
    } catch (error: any) {
      throw error;
    }
  }

  async recoverRole(ctx: Context) {
    try {
      const id = ctx.query.id;
      const result = await authService.recoverRole(Number(id));
      ctx.body = result;
    } catch (error: any) {
      throw error;
    }
  }

  async findAllRoles(ctx: Context) {
    try {
      ctx.body = await authService.findRolesAll();
    } catch (error: any) {
      throw error;
    }
  }

  async findOneRole(ctx: Context) {
    try {
      const id = ctx.query.id;
      const result = await authService.findRoleByID(Number(id));
      ctx.body = result;
    } catch (error: any) {
      throw error;
    }
  }

  async updateRole(ctx: Context) {
    try {
      const body = ctx.request.body;
      const result = await authService.updateRole(body);
      ctx.body = result;
    } catch (error: any) {
      throw error;
    }
  }
  async wsResponse(ctx: Context) {
    try {
      // const result = await authService.wsResponse();
      ctx.body = "result";
    } catch (error: any) {
      console.log(error);
      throw new CustomError(error.message);
    }
  }

  async cabinetList(ctx: Context) {
    try {
      ctx.body = await casbinService.getPolicy();
    } catch (error: any) {
      throw error;
    }
  }

  async logList(ctx: Context) {
    try {
      const body = ctx.query;
      ctx.body = await authService.logList(body);
    } catch (error: any) {
      throw error;
    }
  }
  async logDetail(ctx: Context) {
    try {
      const id = ctx.query.id;
      ctx.body = await authService.logDetail(Number(id));
    } catch (error: any) {
      throw error;
    }
  }
  async findRolePermissions(ctx: Context) {
    try {
      ctx.body = await casbinService.getPermissions("base1");
    } catch (error: any) {
      throw error;
    }
  }
  async findRolesPermissions(ctx: Context) {
    try {
      ctx.body = await casbinService.getPermissions("base");
    } catch (error: any) {
      throw error;
    }
  }

  async getAllRoles(ctx: Context) {
    try {
      ctx.body = await casbinService.getAllRolePermissions();
    } catch (error: any) {
      throw error;
    }
  }

  async randomImg(ctx: Context) {
    try {
      const result = await callService.randomImg();
      ctx.body = result;
    } catch (error: any) {
      throw error;
    }
  }
}
export default new AuthController();
