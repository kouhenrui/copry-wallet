import { getRedisService, redisClient } from "../util/redis";

import {
  ExamRepository,
  ExamQuestionRepository,
  ExamAnswerRepository,
  QuestionRepository,
  ConfigRepository,
  LogRepository,
  ExamRepo,
  ExamQuestionRepo,
  ExamAnswerRepo,
  QuestionRepo,
  ConfigRepo,
  LogRepo,
} from "../orm/repository/exam";
import { logger } from "../util/log";
import { CustomError } from "../util/error";
import { Question } from "../orm/entity.ts/question";
import {
  CreateExamDto,
  CreateQuestionDto,
  ExamSubmitDto,
  LinkQuestionsDto,
  MarkDto,
  UpdateExamDto,
  UpdateQuestionDto,
} from "../dto/exam";
import { Exam } from "../orm/entity.ts/exam";
import { Account } from "../orm/entity.ts/account";
import { AccountRepo, AccountRepository } from "../orm/repository/user";
import { ExamQuestion } from "../orm/entity.ts/examQuestion";
import { ExamAnswer } from "../orm/entity.ts/examAnswer";
import { In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { autoFormatArrayDates, autoFormatObjectDates } from "../util/crypto";
import { DefaultDataSource } from "../util/orm";
export class ExamService {
  //账号表在系统启动时注入了authService中
  private redisService: redisClient;
  private accountRepository: AccountRepo;
  private examRepository: ExamRepo;
  private examQuestionRepository: ExamQuestionRepo;
  private examAnswerRepository: ExamAnswerRepo;
  private questionRepository: QuestionRepo;
  private configRepository: ConfigRepo;
  private logRepository: LogRepo;
  constructor() {
    this.redisService = getRedisService();
    this.examRepository = ExamRepository;
    this.examQuestionRepository = ExamQuestionRepository;
    this.examAnswerRepository = ExamAnswerRepository;
    this.questionRepository = QuestionRepository;
    this.configRepository = ConfigRepository;
    this.logRepository = LogRepository;
    this.accountRepository = AccountRepository;
  }

  //获取考试列表
  async getExamList(id: number) {
    try {
    } catch (error: any) {
      logger().warn({ event: "exam detail service error", error });
      throw error;
    }
  }

  //question crud
  async detailQuestion(id: number) {
    try {
      const questionDetail = await this.questionRepository.findOneBy({ id });
      if (!questionDetail) throw new CustomError("question not found");
      autoFormatObjectDates(questionDetail); //自动格式化时间
      return questionDetail;
    } catch (error: any) {
      logger().warn({ event: "exam detail service error", error });
      throw error;
    }
  }
  async listQuestion(body: any) {
    try {
      const questionList = await this.questionRepository.paginate(body);
      autoFormatArrayDates(questionList.list);
      return questionList;
    } catch (error: any) {
      logger().warn({ event: "exam list service error", error });
      throw error;
    }
  }
  async createQuestion(body: CreateQuestionDto, user_id: number) {
    try {
      const { title, type, options, answer, score, img } = body;
      // 可以继续补充校验，例如标题不能为空
      if (!title || title.trim() === "") {
        throw new Error("题目标题不能为空");
      }
      if (score < 0) throw new CustomError("分数不能小于0");
      if (
        (type == 0 || type == 1 || type == 2) &&
        options &&
        options.length < 1
      )
        throw new CustomError("选项不能为空");

      const newQuestion = new Question();
      newQuestion.title = title;
      newQuestion.type = type;
      newQuestion.options = options || null;
      newQuestion.answer = JSON.stringify(answer);
      newQuestion.score = score;
      newQuestion.img = img || null;
      newQuestion.createdBy = user_id;
      return await this.questionRepository.create(newQuestion);
    } catch (error: any) {
      logger().warn({ event: "exam create service error", error });
      throw error;
    }
  }
  async updateQuestion(body: UpdateQuestionDto) {
    try {
      const { id, data } = body;
      await this.questionRepository.findOneBy({ id });
      return await this.questionRepository.update(id, data);
    } catch (error: any) {
      logger().warn({ event: "exam update service error", error });
      throw error;
    }
  }
  async deleteQuestion(id: number) {
    try {
      await this.questionRepository.findOneBy({ id });
      return await this.questionRepository.softDelete(id);
    } catch (error: any) {
      logger().warn({ event: "exam delete service error", error });
      throw error;
    }
  }

  async listExam(body: any) {
    try {
      const examList = await this.examRepository.paginate(body);
      autoFormatArrayDates(examList.list);
      return examList;
    } catch (error: any) {
      logger().warn({ event: "exam list service error", error });
      throw error;
    }
  }
  async detailExam(id: number) {
    try {
      const examDetail = await this.examRepository.findOneBy({ id });
      if (!examDetail) throw new CustomError("exam not found");
      autoFormatObjectDates(examDetail);
      return examDetail;
    } catch (error: any) {
      logger().warn({ event: "exam detail service error", error });
      throw error;
    }
  }

  async createExam(body: CreateExamDto, user_id: number) {
    try {
      const { title, description, startTime, endTime, duration } = body;
      const exam = await this.examRepository.findOneBy({ title });
      if (exam) throw new CustomError("考试名称已存在");
      const now = new Date();
      const start = new Date(startTime);
      let end = new Date(startTime);
      let finalDuration: number = 0;
      if (start < now) throw new CustomError("开始时间不能小于当前时间");
      if (endTime) {
        if (new Date(endTime) < start)
          throw new CustomError("结束时间不能小于开始时间");
        end = new Date(endTime);
        finalDuration = start.getDate() - start.getDate();
      } else {
        switch (body.type) {
          case 0: //天
            end.setDate(start.getDate() + duration!);
            finalDuration = duration!;
            break;
          case 1: //周
            end.setDate(start.getDate() + 7 * duration!);
            finalDuration = 7 * duration!;
            break;
          case 2: //月
            end.setMonth(start.getDate() + duration! * 30);
            finalDuration = 30 * duration!;
            break;
        }
      }
      const newExam = new Exam();
      newExam.title = title;
      newExam.description = description;
      newExam.startTime = startTime;
      newExam.endTime = end;
      newExam.duration = finalDuration;
      newExam.createdBy = user_id;
      await this.examRepository.create(newExam);
      return "新增成功";
    } catch (error: any) {
      logger().warn({ event: "exam create service error", error });
      throw error;
    }
  }

  async updateExam(body: UpdateExamDto, user_id: number) {
    try {
      const { id, data } = body;
      const { title, description, startTime, endTime, duration, type } = data;
      await this.examRepository.findOneBy({ id });
      let start = new Date();
      let end: Date = new Date();
      let finalDuration: number = 0;
      if (startTime && duration && type) {
        start = new Date(startTime);
        end = new Date(startTime);
        switch (type) {
          case 0: //天
            end.setDate(start.getDate() + duration!);
            finalDuration = duration!;
            break;
          case 1: //周
            end.setDate(start.getDate() + 7 * duration!);
            finalDuration = 7 * duration!;
            break;
          case 2: //月
            end.setMonth(start.getDate() + duration! * 30);
            finalDuration = 30 * duration!;
            break;
        }
      }
      const updateExam = new Exam();
      if (title) updateExam.title = title;
      if (startTime) updateExam.startTime = start;
      if (description) updateExam.description = description;
      if (duration && type) {
        updateExam.duration = finalDuration;
        updateExam.endTime = end;
      }
      updateExam.updatedBy = user_id;
      await this.examRepository.update(id, updateExam);
      return "修改成功";
    } catch (error: any) {
      logger().warn({ event: "exam update service error", error });
      throw error;
    }
  }

  async deleteExam(id: number) {
    try {
      await this.examRepository.findOneBy({ id });
      await this.examRepository.softDelete(id);
      return "删除成功";
    } catch (error: any) {
      logger().warn({ event: "exam delete service error", error });
      throw error;
    }
  }

  async recoverExam(id: number) {
    try {
      await this.examRepository.findWithDeleted(id);
      await this.examRepository.restore(id);
      return "恢复成功";
    } catch (error: any) {
      logger().warn({ event: "exam recover service error", error });
      throw error;
    }
  }
  async publish(id: number, user_id: number) {
    try {
      await this.examRepository.findOneBy({ id });
      await this.examRepository.update(id, {
        isPublished: true,
        updatedBy: user_id,
      });
      return "发布成功";
    } catch (error: any) {
      logger().warn({ event: "exam publish service error", error });
      throw error;
    }
  }
  async unpublish(id: number, user_id: number) {
    try {
      await this.examRepository.findOneBy({ id });
      await this.examRepository.update(id, {
        isPublished: false,
        updatedBy: user_id,
      });
      return "操作成功";
    } catch (error: any) {
      logger().warn({ event: "exam unpublish service error", error });
      throw error;
    }
  }

  async linkQuestions(body: LinkQuestionsDto) {
    const queryRunner = DefaultDataSource.createQueryRunner(); // 创建 queryRunner 事务实例
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id, questionIds } = body;
      if (questionIds.length < 1) throw new CustomError("试题不为空");
      const exam = await this.examRepository.findOneBy({ id });
      if (!exam) throw new CustomError("exam not found");
      for (const e of questionIds) {
        const question = await this.questionRepository.findOneBy({ id: e });
        if (!question) throw new CustomError("question not found");
        const examQuestion = new ExamQuestion();
        examQuestion.examId = exam.id;
        examQuestion.questionId = question.id;
        await queryRunner.manager.save(ExamQuestion, examQuestion);
      }
      return "关联成功";
    } catch (error: any) {
      logger().warn({ event: "exam link service error", error });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async recoverQuestion(id: number) {
    try {
      await this.questionRepository.findOneBy({ id });
      return await this.questionRepository.restore(id);
    } catch (error: any) {
      logger().warn({ event: "exam recover service error", error });
      throw error;
    }
  }

  async deleteExamQuestions(body: any) {
    const queryRunner = DefaultDataSource.createQueryRunner(); // 创建 queryRunner 事务实例
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id, questionId } = body;
      if (questionId.length < 1) throw new CustomError("试题不可为空");
      await this.examRepository.findOneBy({ id });
      for (const e of questionId) {
        const question = await this.questionRepository.findOneBy({ id: e });
        if (!question) throw new CustomError("试题不存在");
        const examQuestion = await this.examQuestionRepository.findOneBy({
          questionId: e,
          examId: id,
        });
        if (!examQuestion) throw new CustomError("试题与考试未存在关系");
        await queryRunner.manager.remove(ExamQuestion, examQuestion);
      }
      return "删除成功";
    } catch (error: any) {
      logger().warn({ event: "exam delete service error", error });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description 获取考试下的所有试题
   * @param id {number} 考试id
   * @returns {Promise<Question[]>} 试题列表
   * @throws CustomError 试题不存在
   */
  async getExamQuestions(id: number) {
    try {
      await this.examRepository.findOneBy({ id });
      const examQuestions = await this.examQuestionRepository.findBy({
        examId: id,
      });
      if (examQuestions.length < 1) return [];
      let list = [];
      for (const e of examQuestions) {
        const question = await this.questionRepository.findOneBy({
          id: e.questionId,
        });
        if (question) {
          autoFormatObjectDates(question);
          delete question.options;
          delete question.answer;
          list.push(question);
        }
      }
      return list;
    } catch (error: any) {
      logger().warn({ event: "exam get service error", error });
      throw error;
    }
  }

  /**
   * 导出对应的试题题目,不包含答案,得分,类型,图片
   * @param id {number} 考试id
   * @returns
   */
  async exportExamQuestions(
    id: number
  ): Promise<{ exam: any; questions: any[] }> {
    try {
      const exam = await this.examRepository.findOneBy({ id });
      const examQuestions = await this.examQuestionRepository.findBy({
        examId: id,
      });
      autoFormatObjectDates(exam);
      let examInfo = {
        title: exam!.title,
        description: exam!.description,
        times: exam!.times,
        isPublished: exam!.isPublished,
        ...(exam!.duration
          ? {
              startTime: exam!.startTime,
              endTime: exam!.endTime,
              duration: exam!.duration,
            }
          : {}),
      };
      if (examQuestions.length < 1) return { exam: examInfo, questions: [] };
      let list = [];
      for (const e of examQuestions) {
        const question = await this.questionRepository.findOneBy({
          id: e.questionId,
        });
        if (question) {
          autoFormatObjectDates(question);
          let questionInfo = {
            title: question.title,
            options: JSON.stringify(question.options),
            score: question.score,
            type: question.type,
            img: question.img,
          };
          list.push(questionInfo);
        }
      }

      let exportData = {
        exam: examInfo,
        questions: list,
      };
      return exportData;
    } catch (error: any) {
      logger().warn({ event: "exam get service error", error });
      throw error;
    }
  }

  /**
   * 试卷提交
   * @param body {examId: number, questions: {questionId: number, answer: string[]}[]}
   * @param {ExamSubmitDto} id 自动判卷单选,多选和判断题目的答案
   * @returns "提交成功"
   * @throws CustomError 试卷不存在,题目不存在,超过题目次数限制,试卷未发布,试卷已结束
   */
  async examSubmit(body: ExamSubmitDto, id: number) {
    const queryRunner = DefaultDataSource.createQueryRunner(); // 创建 queryRunner 事务实例
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.accountRepository.findOneBy({ id });
      const now = new Date();
      const exam = await this.examRepository.findOne({
        where: {
          id: body.examId,
          isPublished: true,
          startTime: LessThanOrEqual(now),
          endTime: MoreThanOrEqual(now),
        },
      });
      if (!exam) throw new CustomError("考试不存在");
      if (body.questions.length > 0) {
        for (const e of body.questions) {
          // 当前题目的答题次数统计
          const prevCount = await queryRunner.manager.count(ExamAnswer, {
            where: {
              userId: body.userId,
              examId: body.examId,
              questionId: e.questionId,
            },
          });

          // 超过题目次数限制则跳过或抛错
          if (prevCount >= exam.times) {
            throw new CustomError(`题目 ${e.questionId} 已超过最大答题次数`);
          }
          let examAnswer = new ExamAnswer();
          examAnswer.questionId = e.questionId;
          examAnswer.answer = JSON.stringify(e.answer);
          examAnswer.userId = id;
          examAnswer.examId = body.examId;
          examAnswer.score = 0;
          examAnswer.isCorrect = false;
          examAnswer.times = prevCount + 1;
          const question = await this.questionRepository.findOneBy({
            id: e.questionId,
          });
          if (question && question.answer) {
            const sorted1 = [...e.answer].sort();
            const sorted2 = [...JSON.parse(question.answer)].sort();
            if (sorted1.every((value, index) => value === sorted2[index])) {
              examAnswer.score = question.score;
              examAnswer.isCorrect = true;
            }
          }
          // 用事务保存
          await queryRunner.manager.save(ExamAnswer, examAnswer);
        }
      }

      await queryRunner.commitTransaction(); // ✅ 提交事务
      return "提交成功";
    } catch (error: any) {
      logger().warn({ event: "exam submit service error", error });
      throw error;
    } finally {
      await queryRunner.release(); // 释放事务操作
    }
  }

  //查询一份试卷的总分
  async answers(id: number, user_id: number) {
    try {
      const examAnswerList = await this.examAnswerRepository.findBy({
        examId: id,
        userId: user_id,
      });
      if (examAnswerList.length < 1) throw new CustomError("考试记录不存在");
      // 结果对象
      const result: Record<number, { score: number; answers: any[] }> = {};
      for (const answer of examAnswerList) {
        const times = answer.times ?? 1; // 如果为 null，则默认设为 1
        const score = answer.score ?? 0;

        if (!result[times]) {
          result[times] = { score: 0, answers: [] };
        }
        const question = await this.questionRepository.findOneBy({
          id: answer.questionId,
        });
        let answerExam: Record<string, any> = {
          title: question?.title,
          realAnswer: question?.answer,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
        };
        result[times].score += score;
        result[times].answers.push(answerExam);
      }
      return result;
    } catch (error: any) {
      logger().warn({ event: "exam get service error", error });
      throw error;
    }
  }

  /**
   * @description 保存批改结果
   * @param body  MarkDto
   * @returns Promise<UpdateResult>
   */
  async mark(body: MarkDto) {
    let queryRunner = DefaultDataSource.createQueryRunner(); // 创建 queryRunner 事务实例
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { id, data } = body;
      if (data.length < 1) throw new CustomError("批改数据不可为空");
      for (const s of data) {
        const question = await this.questionRepository.findOneBy({
          id: s.questionId,
        });
        if (!question) throw new CustomError("试题不存在");
        const examQuestion = await this.examQuestionRepository.findOneBy({
          questionId: s.questionId,
          examId: id,
        });
        if (!examQuestion) throw new CustomError("考试关联的试题不存在");
        if (s.score > question.score)
          throw new CustomError("分数不能大于题目分数");
        let updateExamQuestion = new ExamAnswer();
        (updateExamQuestion.isCorrect = s.isCorrect),
          (updateExamQuestion.score = s.score),
          (updateExamQuestion.remark = s.remark || ""),
          await queryRunner.manager.update(
            ExamQuestion,
            id,
            updateExamQuestion
          );
      }
      return "批改成功";
    } catch (error: any) {
      logger().warn({ event: "exam update service error", error });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async statistics(id: number) {
    try {
      await this.examAnswerRepository.findOneBy({ id });
      const examAnswers = await this.examAnswerRepository.findBy({
        examId: id,
      });
      const totalScore = examAnswers.reduce((sum, e) => {
        return sum + (e.score || 0);
      }, 0);
      return {
        totalScore,
        examAnswers,
      };
    } catch (error: any) {
      logger().warn({ event: "exam get service error", error });
      throw error;
    }
  }

  async exportQuestions() {
    try {
      const questions = await this.questionRepository.find();
      return questions;
    } catch (error: any) {
      throw error;
    }
  }
}
export const examService = new ExamService();
