import { DataSource } from "typeorm";
import { env } from "./env";
import { CasbinRule } from "typeorm-adapter";
import { logger } from "./log";
import { entityList } from "../orm/entity.ts";

//配置mysql default连接参数
export const DefaultDataSource = new DataSource({
  type: "mysql",
  name: env.mysql.default.name,
  host: env.mysql.default.host,
  port: env.mysql.default.port,
  username: env.mysql.default.username,
  password: env.mysql.default.password,
  database: env.mysql.default.database,
  synchronize: true, //是否开启自动迁移表结构,正式环境需要关闭
  logging: false, //是否开启日志
  entities: entityList, //定义的实体表结构,迁移的表
  migrations: [], //生产环境配置指定数据库迁移文件（用于版本控制数据库结构）。
  subscribers: [], //监听实体生命周期事件，例如创建、更新、删除时执行逻辑。
  extra: {
    //池化连接配置
    connectionLimit: 20,
  },
});

//配置Postgres default连接参数
export const DefaultPGDataSource = new DataSource({
  type: "postgres",
  name: env.postgre.default.name,
  host: env.postgre.default.host,
  port: env.postgre.default.port,
  username: env.postgre.default.username,
  password: env.postgre.default.password,
  database: env.postgre.default.database,
  synchronize: true,
  logging: false,
  entities: entityList, //[User],
  migrations: [],
  subscribers: [],
  extra: {
    //池化连接配置
    connectionLimit: 20,
  },
});

//配置mysql logDB连接参数
export const LogDataSource = new DataSource({
  type: "mysql",
  name: env.mysql.logDB.name,
  host: env.mysql.logDB.host, //"localhost",
  port: env.mysql.logDB.port, //3306,
  username: env.mysql.logDB.username, //"root",
  password: env.mysql.logDB.password, //"password",
  database: env.mysql.logDB.database, //"crypto_wallet",
  synchronize: true,
  logging: true,
  entities: [], //[User],
  migrations: [],
  subscribers: [],
  extra: {
    connectionLimit: 20,
  },
});

//配置Postgres logDB连接参数
export const LogPGDataSource = new DataSource({
  type: "postgres",
  name: env.postgre.logDB.name,
  host: env.postgre.logDB.host, //"localhost",
  port: env.postgre.logDB.port, //3306,
  username: env.postgre.logDB.username, //"root",
  password: env.postgre.logDB.password, //"password",
  database: env.postgre.logDB.database, //"crypto_wallet",
  synchronize: true,
  logging: true,
  entities: [], //[User],
  migrations: [],
  subscribers: [],
  extra: {
    connectionLimit: 20,
  },
});

//配置mysql casbin连接参数
export const casbinDataSource = new DataSource({
  type: "mysql",
  host: env.casbin.host, //"localhost",
  port: Number(env.casbin.port), //3306,
  username: env.casbin.username, //"root",
  password: env.casbin.password, //"password",
  database: env.casbin.database, //"crypto_wallet",
  synchronize: true,
  entities: [CasbinRule],
  extra: {
    connectionLimit: 20,
  },
});

//配置Postgres casbin连接参数
export const casbinDataSourcePostgre = new DataSource({
  type: "postgres",
  host: env.casbin_postgre.host, //"localhost",
  port: Number(env.casbin_postgre.port), //3306,
  username: env.casbin_postgre.username, //"root",
  password: env.casbin_postgre.password, //"password",
  database: env.casbin_postgre.database, //"crypto_wallet",
  synchronize: true, //自动迁移实体
  logging: false,
  entities: [CasbinRule], //[User],
  migrations: [],
  subscribers: [],
  extra: {
    connectionLimit: 20,
  },
});


//在mysql自动迁移建表
export const initMySQL = async () => {
  try {
    await DefaultDataSource.initialize();
    logger().info({ event: "mysql connected", message: "🟢 MySQL connected" });
  } catch (err: any) {
    logger().error({ event: "mysql connection error ❌", error: err.message });
    process.exit(1);
  }
};

//在postgres自动迁移建表
export const initPostgre = async () => {
  try {
   
    await DefaultPGDataSource.initialize();
    // await LogDataSource.initialize();
    logger().info({
      event: "postgre connected",
      message: "🟢 postgre connected",
    });
  } catch (err: any) {
    logger().error({
      event: "postgre connection error ❌",
      error: err.message,
    });
    console.error("❌ casbin connection error", err);
    process.exit(1);
  }
};
