import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("log")
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
    comment: "日志级别，如info/warn/error",
  })
  level: string;

  @Column({ type: "text", nullable: false, comment: "日志内容" })
  message: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "请求路径或操作模块",
  })
  path: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "请求方法",
  })
  method: string;

  @Column({
    type: "int",
    nullable: true,
    comment: "用户ID（可为空，系统日志无用户）",
  })
  userId: number;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "角色",
  })
  role: string;

  @Column({
    type: "int",
    nullable: true,
    comment: "返回状态",
  })
  resStatus: number;

  @Column({
    type: "text",
    nullable: true,
    comment: "错误",
  })
  error?: string;

  @CreateDateColumn({ comment: "记录时间" })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
