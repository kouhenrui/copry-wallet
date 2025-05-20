import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("config")
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    nullable: false,
    comment: "配置键名",
  })
  key: string;

  @Column({ type: "text", nullable: true, comment: "配置值" })
  value: string;

  @Column({ type: "varchar", length: 255, nullable: true, comment: "备注说明" })
  description: string;

  @Column({ type: "int", nullable: false, default: 1, comment: "状态" })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
