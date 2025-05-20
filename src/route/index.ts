import Router from "koa-router";
import AuthController from "../controller/auth";
import ExamController from "../controller/exam";
import ExportController from "../controller/export";
import { CustomError } from "../util/error";
import {
  capychaMiddleware,
  circuitBreakerMiddleware,
  rateLimitMiddleware,
} from "../middleware/limit.middleware";
import { ValidationMiddleware } from "../middleware/logger.middleware";
import { CreateUserDto } from "../dto/auth.dto";
import koaBody from "koa-body";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto"; // Node 16+
import { Context } from "koa";
// import walletRoutes from "./wallet.routes";
// import transactionRoutes from "./transaction.routes";
// import authRoutes from "./auth.routes";
const uploadDir = path.join(__dirname, "../public");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const router = new Router({ prefix: "/api/v1" });
// const authRouter = new Router({ prefix: "/auth" });
// router.use("/wallet", walletRoutes.routes());
// router.use("/tx", transactionRoutes.routes());
router.post("/register", AuthController.register); //注册
router.post("/create/role", AuthController.createRole); //创建角色
router.delete("/delete/role", AuthController.deleteRole); //删除角色
router.get("/get/roles", AuthController.findAllRoles); //获取所有角色
router.get("/get/role", AuthController.findOneRole); //获取单个角色
router.put("/update/role", AuthController.updateRole); //更新角色
router.patch("/recover/role", AuthController.recoverRole); //恢复角色

router.get("/get/roles/permissions", AuthController.findRolesPermissions); //获取所有角色权限
router.get("/get/role/permissions", AuthController.findRolePermissions);
router.get("/get/all/roles", AuthController.getAllRoles);

router.post("/auth/login", AuthController.login); //登录
router.get("/auth/info", AuthController.info); //获取用户信息
router.post("/auth/refresh", AuthController.refresh); //刷新token
router.get("/logout", AuthController.logout); //退出登录
router.get("/captcha", capychaMiddleware, AuthController.captcha); //获取验证码

router.get("/cabinet/list", AuthController.cabinetList);

//题库crud
//试题详情
router.get("/question/detail", ExamController.detailQuestion);
//试题列表
router.get("/question/list", ExamController.listQuestion);
//创建试题
router.post("/question/create", ExamController.createQuestion);
//更新试题
router.put("/question/update", ExamController.updateQuestion);
//删除试题
router.delete("/question/delete", ExamController.deleteQuestion);
//恢复试题
router.patch("/question/recover", ExamController.recoverQuestion);

//考试crud
//考试列表
router.get("/exam/list", ExamController.listExam);
//考试详情
router.get("/exam/detail", ExamController.detailExam);
//创建考试
router.post("/exam/create", ExamController.createExam);
//更新考试
router.put("/exam/update", ExamController.updateExam);
//删除考试
router.delete("/exam/delete", ExamController.deleteExam);
//恢复考试
router.patch("/exam/recover", ExamController.recoverExam);
//	发布考试
router.patch("/exam/publish", ExamController.publish);
//取消发布考试：
router.patch("/exam/unpublish", ExamController.unpublish);

//考试和试题关联
router.post("/exam/link/questions", ExamController.linkQuestions);
//删除考试和试题关联
router.put("/exam/questions", ExamController.deleteExamQuestions);
//获取考试下的试题
router.get("/exam/questions", ExamController.getExamQuestions);

router.get("/exam/post", ExportController.exportExam);

router.get("/export/questions", ExportController.exportQuestions);

router.post(
  "/exam/import",
  koaBody({
    multipart: true,
    formidable: {
      uploadDir,
      keepExtensions: true,
      onFileBegin: (name, file) => {
        const ext = path.extname(file.originalFilename || "").toLowerCase();
        if (ext !== ".xlsx") {
          throw new CustomError("只允许上传Excel类型文件");
        }
        const newName = `${Date.now()}-${randomUUID()}${ext}`;
        file.filepath = path.join(uploadDir, newName);
        file.newFilename = newName; // 可用于后续逻辑
      },
    },
  }),
  ExportController.importExam
);
router.post(
  "/upload/file",
  koaBody({
    multipart: true,
    formidable: {
      uploadDir,
      keepExtensions: true,
      onFileBegin: (name, file) => {
        const ext = path.extname(file.originalFilename || "").toLowerCase();
        const newName = `${Date.now()}-${randomUUID()}${ext}`;
        file.filepath = path.join(uploadDir, newName);
        file.newFilename = newName; // 可用于后续逻辑
      },
    },
  }),
  async (ctx: Context) => {
    ctx.body = "success";
  }
);
//考生作答crud
//提交答卷
router.post("/exam/answer/submit", ExamController.examSubmit);
//学生查询答题分数
router.get("/exam/answers", ExamController.answers);
//教师批阅简答题
router.patch("/exam/answer/mark", ExamController.mark);
//查看考试答题统计
router.get("/exam/answer/statistics", ExamController.statistics);

//日志
router.get("/log/list", AuthController.logList);

router.get("/log/detail", AuthController.logDetail);

router.get(
  "/random/img",
  rateLimitMiddleware({ tokensPerInterval: 10, interval: 1000 }),
  AuthController.randomImg
);
//测试
router.get("/error", async (ctx) => {
  try {
    throw new CustomError("这是业务错误,不是系统的错误");
  } catch (error: unknown) {
    throw error;
  }
});
router.get(
  "/test/limit",
  rateLimitMiddleware({ tokensPerInterval: 1, interval: 1000 }), //接口限流
  async (ctx) => {
    ctx.body = "success";
  }
);
//模拟熔断服务
router.get(
  "/test/rongduan",
  circuitBreakerMiddleware(async (ctx) => {
    // 模拟错误率
    let random = Math.random();
    if (random < 0.5) throw new Error("模拟服务错误");
    return { message: "成功调用服务" };
  })
);
router.get("/system/error", async (ctx) => {
  throw new Error("这是系统错误,不是业务的错误");
});
router.post("/test/dto", ValidationMiddleware(CreateUserDto), async (ctx) => {
  const body = ctx.request.body as CreateUserDto;
  ctx.body = body;
});
router.get("/", async (ctx) => {
  ctx.body = {
    message: "success",
  };
});
export default router;
