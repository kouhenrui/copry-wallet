import { Account } from "./account";
import { Config } from "./config";
import { Exam } from "./exam";
import { ExamAnswer } from "./examAnswer";
import { ExamQuestion } from "./examQuestion";
import { Log } from "./log";
import { Question } from "./question";
import { RefreshToken } from "./refreshToken";
import { Role } from "./role";
// 这里将来还可以添加更多实体
export const entityList = [
  Role,
  Account,
  ExamQuestion,
  ExamAnswer,
  Exam,
  Config,
  Question,
  Log,
  RefreshToken,
];

