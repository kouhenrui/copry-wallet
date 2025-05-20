import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("exam")
export class Exam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
    comment: "考试标题",
  })
  title: string;

  @Column({ type: "text", nullable: true, comment: "考试说明/描述" })
  description: string;

  @Column({  nullable: false, comment: "考试开始时间" })
  startTime: Date;

  @Column({  nullable: false, comment: "考试结束时间" })
  endTime: Date;

  @Column({ type: "int", nullable: false, comment: "考试总时长（分钟）" })
  duration: number;

  @Column({
    type: "int",
    nullable: true,
    default: 1,
    comment: "考试次数 默认一次",
  })
  times: number;

  @Column({ type: "int", nullable: false, comment: "发布者ID（教师ID）" })
  createdBy: number;

  @Column({ type: "int", nullable: true, comment: "更新人员" })
  updatedBy: number;

  @Column({
    type: "int",
    default: 0,
    comment: "是否发布：0-未发布 1-已发布",
  })
  isPublished: boolean;

  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, comment: "软删除时间" })
  deletedAt?: Date | null;
}
