interface CreateQuestionDto {
  title: string;
  answer?: string;
  options?: string[];
  type: number; //0 单选/ 1多选/ 2判断/ 3填空/ 4简答",
  score: number;
  img?: string;
}
interface UpdateQuestionDto {
  id: number;
  data: {
    title?: string;
    answer?: string;
    options?: string[];
    type?: number; //0 单选/ 1多选/ 2判断/ 3填空/ 4简答",
    score?: number;
    img?: string;
  };
}
interface CreateExamDto {
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  type?: number; //单位 0天/ 1周/ 2月
}
interface UpdateExamDto {
  id: number;
  data: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    type?: number; //单位 0天/ 1周/ 2月
  };
}

interface LinkQuestionsDto {
  id: number;
  questionIds: number[];
}

interface ExamSubmitDto {
  examId: number;
  userId: number;
  questions: QuestionSubmitDto[];
}
interface QuestionSubmitDto {
  questionId: number;
  answer: string[];
}

interface MarkDto {
  id: number;
  data: markData[];
}

interface markData {
  questionId: number;
  answer: string;
  isCorrect: boolean;
  score: number;
  remark?: string;
}

interface PaginationDto {
  page: number;
  pageSize: number;
  title?: string;
  level?: string; //日志类型 info error
  startTime?: Date; //开始时间
  endTime?: Date; //结束时间
  method?: string; //请求方法
  path?: string; //请求路径查询
}

interface PaginationDts {
  page: number;
  pageSize: number;
  where?: any;
}
export {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateExamDto,
  UpdateExamDto,
  LinkQuestionsDto,
  ExamSubmitDto,
  MarkDto,
  PaginationDto,
  PaginationDts,
};
