import { Context } from "koa";
import { logger } from "../util/log";
import { examService } from "../service/exam.service";
import {
  CreateExamDto,
  CreateQuestionDto,
  ExamSubmitDto,
  LinkQuestionsDto,
  MarkDto,
  UpdateExamDto,
  UpdateQuestionDto,
} from "../dto/exam";
class ExamController {
  async detailQuestion(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.detailQuestion(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam detail controller error", error });
      throw error;
    }
  }
  async listQuestion(ctx: Context) {
    try {
      const { page, pageSize, title } = ctx.query;
      const body = {
        page,
        pageSize,
        title,
      };
      const res = await examService.listQuestion(body);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam list controller error", error });
      throw error;
    }
  }
  async createQuestion(ctx: Context) {
    try {
      const body = ctx.request.body as CreateQuestionDto;
      const user_id = ctx.state.account.id;
      const res = await examService.createQuestion(body, user_id);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam create controller error", error });
      throw error;
    }
  }
  async updateQuestion(ctx: Context) {
    try {
      const body = ctx.request.body as UpdateQuestionDto;
      const res = await examService.updateQuestion(body);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam update controller error", error });
      throw error;
    }
  }
  async deleteQuestion(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.deleteQuestion(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam delete controller error", error });
      throw error;
    }
  }

  async listExam(ctx: Context) {
    try {
      const { page, pageSize, title } = ctx.query;
      const body = {
        page,
        pageSize,
        title,
      };
      const res = await examService.listExam(body);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam list controller error", error });
      throw error;
    }
  }

  async detailExam(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.detailExam(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam detail controller error", error });
      throw error;
    }
  }

  async createExam(ctx: Context) {
    try {
      const body = ctx.request.body as CreateExamDto;
      const user_id = ctx.state.account.id;
      const res = await examService.createExam(body, user_id);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam create controller error", error });
      throw error;
    }
  }

  async updateExam(ctx: Context) {
    try {
      const body = ctx.request.body as UpdateExamDto;
      const user_id = ctx.state.account.id;
      const res = await examService.updateExam(body, user_id);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam update controller error", error });
      throw error;
    }
  }

  async deleteExam(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.deleteExam(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam delete controller error", error });
      throw error;
    }
  }

  async recoverExam(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.recoverExam(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam recover controller error", error });
      throw error;
    }
  }

  async publish(ctx: Context) {
    try {
      const id = ctx.query.id;
      const user_id = ctx.state.account.user_id;
      const res = await examService.publish(Number(id), user_id);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam publish controller error", error });
      throw error;
    }
  }
  async unpublish(ctx: Context) {
    try {
      const id = ctx.query.id;
      const user_id = ctx.state.account.id;
      const res = await examService.unpublish(Number(id), user_id);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam unpublish controller error", error });
      throw error;
    }
  }

  async linkQuestions(ctx: Context) {
    try {
      const body = ctx.request.body as LinkQuestionsDto;
      await examService.linkQuestions(body);
      ctx.body = "关联成功";
    } catch (error: any) {
      logger().warn({ event: "exam link controller error", error });
      throw error;
    }
  }

  async recoverQuestion(ctx: Context) {
    try {
      const id = ctx.query.id;
      await examService.recoverQuestion(Number(id));
      ctx.body = "恢复成功";
    } catch (error: any) {
      logger().warn({ event: "exam recover controller error", error });
      throw error;
    }
  }

  async deleteExamQuestions(ctx: Context) {
    try {
      const body = ctx.request.body;
      const res = await examService.deleteExamQuestions(body);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam delete controller error", error });
      throw error;
    }
  }

  async getExamQuestions(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.getExamQuestions(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam get controller error", error });
      throw error;
    }
  }

  async examSubmit(ctx: Context) {
    try {
      const body = ctx.request.body as ExamSubmitDto;
      const userId = ctx.state.account.id;
      await examService.examSubmit(body, userId);
      ctx.body = "提交成功";
    } catch (error: any) {
      logger().warn({ event: "exam submit controller error", error });
      throw error;
    }
  }

  async answers(ctx: Context) {
    try {
      const id = ctx.query.id;
      const user_id = ctx.state.account.id;
      const res = await examService.answers(Number(id), Number(user_id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam answers controller error", error });
      throw error;
    }
  }

  async mark(ctx: Context) {
    try {
      const body = ctx.request.body as MarkDto;
      const res = await examService.mark(body);
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam mark controller error", error });
      throw error;
    }
  }

  async statistics(ctx: Context) {
    try {
      const id = ctx.query.id;
      const res = await examService.statistics(Number(id));
      ctx.body = res;
    } catch (error: any) {
      logger().warn({ event: "exam statistics controller error", error });
      throw error;
    }
  }

 
}

export default new ExamController();
