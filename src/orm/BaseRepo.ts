import { ObjectLiteral, Repository } from "typeorm";
import { DefaultDataSource, DefaultPGDataSource, LogDataSource } from "../util/orm";
import { CustomError } from "../util/error";
import { PaginationDts } from "../dto/exam";

export class BaseRepo<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(dbName: string, entity: any) {
    switch (dbName) {
      case DefaultDataSource.name:
        this.repository = DefaultDataSource.getRepository<T>(entity);
        break;
      case DefaultPGDataSource.name:
        this.repository = DefaultPGDataSource.getRepository<T>(entity);
    }
  }
  async query(query: string) {
    return await this.repository.query(query);
  }
  async create(data: any) {
    return await this.repository.save(data);
  }

  async find(option?: any) {
    return await this.repository.find(option);
  }
  async findOneBy(condition: Partial<T>) {
    return await this.repository.findOneBy(condition);
  }

  async findOne(option?: any) {
    return await this.repository.findOne(option);
  }

  async findBy(condition: Partial<T>) {
    return await this.repository.findBy(condition);
  }

  async findAll() {
    return await this.repository.find();
  }

  async findAndCountBy(option: any) {
    return await this.repository.findAndCount(option);
  }
  async findAndCount(option?: any) {
    return await this.repository.findAndCount(option);
  }

  async update(id: number, data: Partial<T>) {
    return await this.repository.update(id, data);
  }

  async delete(id: number) {
    return await this.repository.delete(id);
  }

  async softDelete(id: number) {
    return await this.repository.softDelete(id);
  }

  async count(option?: any) {
    const where: any = { deletedAt: null, ...option };
    return await this.repository.count(where);
  }

  // 分页并计算总数
  async paginate(option: PaginationDts) {
    const page = option.page && option.page > 0 ? option.page : 1;
    const pageSize =
      option.pageSize && option.pageSize > 0 ? option.pageSize : 10;
    const skip = (page - 1) * pageSize;
    const [list, total] = await this.repository.findAndCount({
      where: option.where || {},
      skip,
      take: pageSize,
      order: { id: "DESC" } as any, // 默认按id倒序
    });
    return {
      list,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  }

  //恢复软删除
  async restore(id: number) {
    return await this.repository.restore(id);
  }
  //清除软删除
  async clear() {
    return await this.repository.clear();
  }

  //查询软删除
  async findWithDeleted(id: number) {
    const res = await this.repository.findOne({
      where: { id: id as any },
      withDeleted: true,
    });
    if (!res) throw new CustomError("not found");
    return res;
  }
}
