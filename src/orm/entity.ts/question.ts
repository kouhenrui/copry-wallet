import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("question")
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
    comment: "题目标题",
  })
  title: string;

  @Column({
    type: "text",
    nullable: true,
    comment: "图片",
  })
  img?: string | null;

  @Column({
    type: "int",
    // enum: ["single", "multiple", "true_false", "fill_blank", "short_answer"],
    nullable: false,
    comment: "题型：0 单选/ 1多选/ 2判断/ 3填空/ 4简答",
  })
  type: number;

  @Column({
    type: "int",default: 0,
    comment: "难度：0简单/ 1中等/ 2困难",
  })
  difficulty: number;
  
  @Column({
    type: "json",
    nullable: true,
    comment: "选项（JSON格式存储），填空题或简答题可为空",
  })
  options?: string[] | null;

  @Column({
    type: "text",
    nullable: true,
    comment: "标准答案，支持多选，JSON字符串或直接文本",
  })
  answer?: string;

  @Column({ type: "int", nullable: false, comment: "本题分数" })
  score: number;

  @Column({ type: "int", nullable: false, default: 1, comment: "状态" })
  status: boolean;

  @Column({ type: "int", nullable: false, comment: "创建人ID（教师ID）" })
  createdBy: number;

  @Column({ type: "int", nullable: true, comment: "更新人员" })
  updatedBy: number;

  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, comment: "软删除时间" })
  deletedAt?: Date | null;
}
