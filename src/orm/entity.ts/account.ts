import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
@Entity("account")
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  userName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  salt: string;

  @Column({ type: "int", comment: "角色ID", nullable: true })
  role: number;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "varchar", nullable: true })
  avatar: string;

  @Column({ type: "varchar", nullable: true })
  idCard: string;

  @Column({ type: "varchar", nullable: true })
  nickName: string;

  @Column({ type: "int", default: 1, comment: "状态" })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
