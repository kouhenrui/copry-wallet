import router from "../src/route";
import app from "../src/app";
// import { CustomError } from "../src/util/error";
import Koa from "koa";
import request from "supertest";
describe("test router", () => {
  //   it("test health check", async () => {
  //       const res = await request(app.callback()).get("/api/v1/");
  //       expect(res.status).toBe(200);
  //       expect(res.body.code).toBe(0);
  //       expect(res.body.success).toBe(true);
  //   });

  // it("test custom error", async () => {
  //   const res = await request(app.callback()).get("/api/v1/error");
  //   expect(res.status).toBe(200);
  //   expect(res.body.code).toBe(-1);
  //   expect(res.body.message).toBe("CustomError:这是业务错误,不是系统的错误");
  // });

  // it("test system error", async () => {
  //   const res = await request(app.callback()).get("/api/v1/system/error");
  //   expect(res.status).toBe(500);
  //   expect(res.body.code).toBe(-1);
  //   expect(res.body.message).toBe("这是系统错误,不是业务的错误");
  // });
});
