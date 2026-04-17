import Router from "koa-router";
import AuthController from "../controller/auth";
import ExamController from "../controller/exam";
import ExportController from "../controller/export";
import { CustomError } from "../util/error";
import {
  captchaMiddleware,
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
import { logger } from "../util/log";
import { generateVersionPrefix } from "../util/crypto";
const uploadDir = path.join(__dirname, "../public");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const router = new Router({ prefix: generateVersionPrefix() });

/**
 * @swagger
 * /register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account
 *               - password
 *               - id
 *               - code
 *             properties:
 *               account:
 *                 type: string
 *                 description: 账号
 *               password:
 *                 type: string
 *                 description: 密码（至少6位）
 *               id:
 *                 type: string
 *                 description: 验证码ID
 *               code:
 *                 type: string
 *                 description: 验证码
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: 注册失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", AuthController.register); //注册

/**
 * @swagger
 * /create/role:
 *   post:
 *     summary: 创建角色
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *               description:
 *                 type: string
 *                 description: 角色描述
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/create/role", AuthController.createRole); //创建角色

/**
 * @swagger
 * /delete/role:
 *   delete:
 *     summary: 删除角色
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete("/delete/role", AuthController.deleteRole); //删除角色

/**
 * @swagger
 * /get/roles:
 *   get:
 *     summary: 获取所有角色
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/get/roles", AuthController.findAllRoles); //获取所有角色

/**
 * @swagger
 * /get/role:
 *   get:
 *     summary: 获取单个角色
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/get/role", AuthController.findOneRole); //获取单个角色

/**
 * @swagger
 * /update/role:
 *   put:
 *     summary: 更新角色
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: 角色ID
 *               name:
 *                 type: string
 *                 description: 角色名称
 *               description:
 *                 type: string
 *                 description: 角色描述
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put("/update/role", AuthController.updateRole); //更新角色

/**
 * @swagger
 * /recover/role:
 *   patch:
 *     summary: 恢复角色
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 恢复成功
 */
router.patch("/recover/role", AuthController.recoverRole); //恢复角色

/**
 * @swagger
 * /get/roles/permissions:
 *   get:
 *     summary: 获取所有角色权限
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/get/roles/permissions", AuthController.findRolesPermissions); //获取所有角色权限

/**
 * @swagger
 * /get/role/permissions:
 *   get:
 *     summary: 获取单个角色权限
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/get/role/permissions", AuthController.findRolePermissions);

/**
 * @swagger
 * /get/all/roles:
 *   get:
 *     summary: 获取所有角色（包含权限信息）
 *     tags: [角色管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/get/all/roles", AuthController.getAllRoles);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account
 *               - password
 *               - method
 *               - id
 *               - code
 *             properties:
 *               account:
 *                 type: string
 *                 description: 账号/手机号/邮箱
 *               password:
 *                 type: string
 *                 description: 密码
 *               method:
 *                 type: string
 *                 enum: [account, phone, email]
 *                 description: 登录方式
 *               id:
 *                 type: string
 *                 description: 验证码ID
 *               code:
 *                 type: string
 *                 description: 验证码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT令牌
 *                 etime:
 *                   type: number
 *                   description: 过期时间（时间戳）
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/auth/login", AuthController.login); //登录
/**
 * @swagger
 * /auth/info:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/auth/info", AuthController.info); //获取用户信息
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 刷新Token
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *     responses:
 *       200:
 *         description: 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 新的JWT令牌
 *                 etime:
 *                   type: number
 *                   description: 过期时间
 */
router.post("/auth/refresh", AuthController.refresh); //刷新token

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: 退出登录
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: logout success
 */
router.get("/logout", AuthController.logout); //退出登录
/**
 * @swagger
 * /captcha:
 *   get:
 *     summary: 获取验证码
 *     tags: [认证]
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 验证码ID
 *                 base64:
 *                   type: string
 *                   description: 验证码图片（base64格式）
 */
router.get("/captcha", captchaMiddleware, AuthController.captcha); //获取验证码

/**
 * @swagger
 * /cabinet/list:
 *   get:
 *     summary: 获取文件柜列表
 *     tags: [文件管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/cabinet/list", AuthController.cabinetList);

//题库crud
/**
 * @swagger
 * /question/detail:
 *   get:
 *     summary: 获取试题详情
 *     tags: [题库管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 试题ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/question/detail", ExamController.detailQuestion);
//试题列表
/**
 * @swagger
 * /question/list:
 *   get:
 *     summary: 获取试题列表
 *     tags: [题库管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
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
/**
 * @swagger
 * /exam/list:
 *   get:
 *     summary: 获取考试列表
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get("/exam/list", ExamController.listExam);
/**
 * @swagger
 * /exam/detail:
 *   get:
 *     summary: 获取考试详情
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/exam/detail", ExamController.detailExam);
/**
 * @swagger
 * /exam/create:
 *   post:
 *     summary: 创建考试
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 考试标题
 *               description:
 *                 type: string
 *                 description: 考试描述
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *     responses:
 *       200:
 *         description: 创建成功
 */
router.post("/exam/create", ExamController.createExam);
/**
 * @swagger
 * /exam/update:
 *   put:
 *     summary: 更新考试
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: 考试ID
 *               title:
 *                 type: string
 *                 description: 考试标题
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put("/exam/update", ExamController.updateExam);
/**
 * @swagger
 * /exam/delete:
 *   delete:
 *     summary: 删除考试
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete("/exam/delete", ExamController.deleteExam);
/**
 * @swagger
 * /exam/recover:
 *   patch:
 *     summary: 恢复考试
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 恢复成功
 */
router.patch("/exam/recover", ExamController.recoverExam);
/**
 * @swagger
 * /exam/publish:
 *   patch:
 *     summary: 发布考试
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 发布成功
 */
router.patch("/exam/publish", ExamController.publish);
/**
 * @swagger
 * /exam/unpublish:
 *   patch:
 *     summary: 取消发布考试
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 取消发布成功
 */
router.patch("/exam/unpublish", ExamController.unpublish);

//考试和试题关联
/**
 * @swagger
 * /exam/link/questions:
 *   post:
 *     summary: 关联考试和试题
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - questionIds
 *             properties:
 *               examId:
 *                 type: string
 *                 description: 考试ID
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 试题ID数组
 *     responses:
 *       200:
 *         description: 关联成功
 */
router.post("/exam/link/questions", ExamController.linkQuestions);
/**
 * @swagger
 * /exam/questions:
 *   put:
 *     summary: 删除考试和试题关联
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - questionIds
 *             properties:
 *               examId:
 *                 type: string
 *                 description: 考试ID
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 试题ID数组
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.put("/exam/questions", ExamController.deleteExamQuestions);
/**
 * @swagger
 * /exam/questions:
 *   get:
 *     summary: 获取考试下的试题
 *     tags: [考试管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/exam/questions", ExamController.getExamQuestions);

/**
 * @swagger
 * /exam/post:
 *   get:
 *     summary: 导出考试
 *     tags: [导出导入]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/exam/post", ExportController.exportExam);

/**
 * @swagger
 * /export/questions:
 *   get:
 *     summary: 导出试题
 *     tags: [导出导入]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export/questions", ExportController.exportQuestions);

/**
 * @swagger
 * /exam/import:
 *   post:
 *     summary: 导入考试（Excel文件）
 *     tags: [导出导入]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel文件（.xlsx格式）
 *     responses:
 *       200:
 *         description: 导入成功
 */
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
/**
 * @swagger
 * /upload/file:
 *   post:
 *     summary: 上传文件
 *     tags: [文件管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 */
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
/**
 * @swagger
 * /exam/answer/submit:
 *   post:
 *     summary: 提交答卷
 *     tags: [考试作答]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - answers
 *             properties:
 *               examId:
 *                 type: string
 *                 description: 考试ID
 *               answers:
 *                 type: array
 *                 description: 答案列表
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       200:
 *         description: 提交成功
 */
router.post("/exam/answer/submit", ExamController.examSubmit);
/**
 * @swagger
 * /exam/answers:
 *   get:
 *     summary: 学生查询答题分数
 *     tags: [考试作答]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/exam/answers", ExamController.answers);
/**
 * @swagger
 * /exam/answer/mark:
 *   patch:
 *     summary: 教师批阅简答题
 *     tags: [考试作答]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answerId
 *               - score
 *             properties:
 *               answerId:
 *                 type: string
 *                 description: 答案ID
 *               score:
 *                 type: number
 *                 description: 得分
 *               comment:
 *                 type: string
 *                 description: 评语
 *     responses:
 *       200:
 *         description: 批阅成功
 */
router.patch("/exam/answer/mark", ExamController.mark);
/**
 * @swagger
 * /exam/answer/statistics:
 *   get:
 *     summary: 查看考试答题统计
 *     tags: [考试作答]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: 考试ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/exam/answer/statistics", ExamController.statistics);

//日志
/**
 * @swagger
 * /log/list:
 *   get:
 *     summary: 获取日志列表
 *     tags: [日志管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/log/list", AuthController.logList);

/**
 * @swagger
 * /log/detail:
 *   get:
 *     summary: 获取日志详情
 *     tags: [日志管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 日志ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get("/log/detail", AuthController.logDetail);

/**
 * @swagger
 * /random/img:
 *   get:
 *     summary: 获取随机图片
 *     tags: [工具]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get(
  "/random/img",
  rateLimitMiddleware({ tokensPerInterval: 10, interval: 1000 }),
  AuthController.randomImg
);
//测试
/**
 * @swagger
 * /error:
 *   get:
 *     summary: 测试业务错误
 *     tags: [测试]
 *     responses:
 *       400:
 *         description: 业务错误示例
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/error", async (ctx) => {
  try {
    throw new CustomError("这是业务错误,不是系统的错误");
  } catch (error: unknown) {
    throw error;
  }
});
/**
 * @swagger
 * /test/limit:
 *   get:
 *     summary: 测试接口限流
 *     tags: [测试]
 *     responses:
 *       200:
 *         description: 成功
 *       429:
 *         description: 请求过于频繁
 */
router.get(
  "/test/limit",
  rateLimitMiddleware({ tokensPerInterval: 1, interval: 1000 }), //接口限流
  async (ctx) => {
    ctx.body = "success";
  }
);
/**
 * @swagger
 * /test/rongduan:
 *   get:
 *     summary: 测试熔断器
 *     tags: [测试]
 *     responses:
 *       200:
 *         description: 成功
 *       500:
 *         description: 服务错误（模拟）
 */
router.get(
  "/test/rongduan",
  circuitBreakerMiddleware(async (ctx) => {
    try {
          // 模拟错误率
    let random = Math.random();
    if (random < 0.5) throw new Error("模拟服务错误");
    // return { message: "成功调用服务" };
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await res.json();
    return data;
    } catch (error:any) {
      logger().error({ event: "熔断器error", error:error.message });
      throw error;
    }

  })
);
/**
 * @swagger
 * /system/error:
 *   get:
 *     summary: 测试系统错误
 *     tags: [测试]
 *     responses:
 *       500:
 *         description: 系统错误示例
 */
router.get("/system/error", async (ctx) => {
  throw new Error("这是系统错误,不是业务的错误");
});
/**
 * @swagger
 * /test/dto:
 *   post:
 *     summary: 测试DTO验证
 *     tags: [测试]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - confirmPassword
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *               confirmPassword:
 *                 type: string
 *                 description: 确认密码
 *     responses:
 *       200:
 *         description: 验证通过
 *       400:
 *         description: 验证失败
 */
router.post("/test/dto", ValidationMiddleware(CreateUserDto), async (ctx) => {
  const body = ctx.request.body as CreateUserDto;
  ctx.body = body;
});
/**
 * @swagger
 * /:
 *   get:
 *     summary: 根路径
 *     tags: [系统]
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 */
router.get("/", async (ctx) => {
  ctx.body = {
    message: "success",
  };
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 健康检查
 *     tags: [系统]
 *     responses:
 *       200:
 *         description: 服务正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 */
router.get('/health',async (ctx:Context)=>{
  ctx.body = {
    message: "success",
  };
})
export default router;
