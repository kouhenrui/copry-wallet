import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("exam_answer")
export class ExamAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false, comment: "考试ID" })
  examId: number;

  @Column({ type: "int", nullable: false, comment: "用户ID" })
  userId: number;

  @Column({ type: "int", nullable: false, comment: "题目ID" })
  questionId: number;

  @Column({
    type: "text",
    nullable: true,
    comment: "用户提交的答案（JSON字符串或文本）",
  })
  answer: string;

  @Column({
    type: "int",
    nullable: true,
    comment: "是否正确：0-错误 1-正确",
  })
  isCorrect: boolean;

  @Column({ type: "int", nullable: true, comment: "得分" })
  score: number;

  @Column({ type: "int", nullable: true, comment: "作答次数" })
  times: number;

  @Column({ type: "int", nullable: true, default: 1, comment: "状态" })
  status: boolean;

  @Column({ type: "varchar", nullable: true, comment: "评价" })
  remark?: string;

  @CreateDateColumn({ comment: "作答时间" })
  createdAt: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
