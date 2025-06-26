import { DataSource } from "typeorm";
import { ServerConfig } from "./env";
import { CasbinRule } from "typeorm-adapter";
import { logger } from "./log";
import { entityList } from "../orm/entity.ts";

//配置mysql default连接参数
export const DefaultDataSource = new DataSource({
  type: "mysql",
  name: ServerConfig.mysql.default.name,
  host: ServerConfig.mysql.default.host,
  port: ServerConfig.mysql.default.port,
  username: ServerConfig.mysql.default.username,
  password: ServerConfig.mysql.default.password,
  database: ServerConfig.mysql.default.database,
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
  name: ServerConfig.postgre.default.name,
  host: ServerConfig.postgre.default.host,
  port: ServerConfig.postgre.default.port,
  username: ServerConfig.postgre.default.username,
  password: ServerConfig.postgre.default.password,
  database: ServerConfig.postgre.default.database,
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
  name: ServerConfig.mysql.logDB.name,
  host: ServerConfig.mysql.logDB.host, //"localhost",
  port: ServerConfig.mysql.logDB.port, //3306,
  username: ServerConfig.mysql.logDB.username, //"root",
  password: ServerConfig.mysql.logDB.password, //"password",
  database: ServerConfig.mysql.logDB.database, //"crypto_wallet",
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
  name: ServerConfig.postgre.logDB.name,
  host: ServerConfig.postgre.logDB.host, //"localhost",
  port: ServerConfig.postgre.logDB.port, //3306,
  username: ServerConfig.postgre.logDB.username, //"root",
  password: ServerConfig.postgre.logDB.password, //"password",
  database: ServerConfig.postgre.logDB.database, //"crypto_wallet",
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
  host: ServerConfig.casbin.host, //"localhost",
  port: Number(ServerConfig.casbin.port), //3306,
  username: ServerConfig.casbin.username, //"root",
  password: ServerConfig.casbin.password, //"password",
  database: ServerConfig.casbin.database, //"crypto_wallet",
  synchronize: true,
  entities: [CasbinRule],
  extra: {
    connectionLimit: 20,
  },
});

//配置Postgres casbin连接参数
export const casbinDataSourcePostgre = new DataSource({
  type: "postgres",
  host: ServerConfig.casbin_postgre.host, //"localhost",
  port: Number(ServerConfig.casbin_postgre.port), //3306,
  username: ServerConfig.casbin_postgre.username, //"root",
  password: ServerConfig.casbin_postgre.password, //"password",
  database: ServerConfig.casbin_postgre.database, //"crypto_wallet",
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
