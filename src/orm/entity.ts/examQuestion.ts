import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("exam_question")
export class ExamQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false, comment: "考试ID" })
  examId: number;

  @Column({ type: "int", nullable: false, comment: "题目ID" })
  questionId: number;

  @Column({ type: "int", nullable: false, default: 0, comment: "题目排序位置" })
  order: number;

  @Column({ type: "int", nullable: false, default: 1, comment: "试题状态" })
  status: boolean;

  @CreateDateColumn({ comment: "添加时间" })
  createdAt: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
