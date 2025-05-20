import { BaseRepo } from "../BaseRepo";
import { Config } from "../entity.ts/config";
import { Exam } from "../entity.ts/exam";
import { ExamAnswer } from "../entity.ts/examAnswer";
import { ExamQuestion } from "../entity.ts/examQuestion";
import { Log } from "../entity.ts/log";
import { Question } from "../entity.ts/question";
import { DefaultPGDataSource } from "../../util/orm";
import { RefreshToken } from "../entity.ts/refreshToken";

export class ExamRepo extends BaseRepo<Exam> {
  constructor() {
    super(DefaultPGDataSource.name, Exam);
  }
}

export class ExamQuestionRepo extends BaseRepo<ExamQuestion> {
  constructor() {
    super(DefaultPGDataSource.name, ExamQuestion);
  }
}

export class ExamAnswerRepo extends BaseRepo<ExamAnswer> {
  constructor() {
    super(DefaultPGDataSource.name, ExamAnswer);
  }
}
export class QuestionRepo extends BaseRepo<Question> {
  constructor() {
    super(DefaultPGDataSource.name, Question);
  }
}
export class ConfigRepo extends BaseRepo<Config> {
  constructor() {
    super(DefaultPGDataSource.name, Config);
  }
}
export class LogRepo extends BaseRepo<Log> {
  constructor() {
    super(DefaultPGDataSource.name, Log);
  }
}
export class RefreshTokenRepo extends BaseRepo<RefreshToken> {
  constructor() {
    super(DefaultPGDataSource.name, Log);
  }
}
const ExamRepository = new ExamRepo();
const ExamQuestionRepository = new ExamQuestionRepo();
const ExamAnswerRepository = new ExamAnswerRepo();
const QuestionRepository = new QuestionRepo();
const ConfigRepository = new ConfigRepo();
const LogRepository = new LogRepo();
const RefreshTokenRepository = new RefreshTokenRepo();
export {
  ExamRepository,
  ExamQuestionRepository,
  ExamAnswerRepository,
  QuestionRepository,
  ConfigRepository,
  LogRepository,
  RefreshTokenRepository,
};
