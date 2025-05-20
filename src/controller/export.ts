import { Context } from "koa";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { examService } from "../service/exam.service";
import { logger } from "../util/log";
import { autoFormatObjectDates } from "../util/crypto";
import { CustomError } from "../util/error";
class ExportController {
  /**
   * 导出考试的试题
   * @param id {number} 考试id
   * @returns {Promise<void>}
   * @throws CustomError 试题不存在
   */
  async exportExam(ctx: Context): Promise<void> {
    try {
      const examId = Number(ctx.request.query.id);
      const examQuestions = await examService.exportExamQuestions(examId);
      const { exam, questions } = examQuestions;
      console.log(exam, questions);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(exam.title);

      // 添加表头
      worksheet.columns = [
        { header: "题目", key: "title", width: 30 },
        { header: "选择", key: "options", width: 30 },
        { header: "得分", key: "score", width: 10 },
        { header: "类型", key: "type", width: 10 },
        { header: "图片", key: "img", width: 30 },
      ];

      // 添加数据行
      for (const q of questions) {
        worksheet.addRow({
          title: q.title,
          options: JSON.stringify(q.options),
          score: q.score,
          type: q.type,
          img: q.img,
        });
      }

      // 设置响应头并发送文件
      ctx.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      ctx.set(
        "Content-Disposition",
        `attachment; filename=${new Date().getTime()}.xlsx`
      );

      const buffer = await workbook.xlsx.writeBuffer();
      ctx.body = buffer;
      // const id = ctx.request.query.id;
      // const examQuestions = await examService.exportExamQuestions(Number(id));
      // logger().info({
      //   event: "导出数据",
      //   message: `${JSON.stringify(examQuestions)}`,
      // });

      // console.dir(examQuestions);
      // const worksheet = XLSX.utils.json_to_sheet(examQuestions.questions);
      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // const buffer = XLSX.write(workbook, {
      //   type: "buffer",
      //   bookType: "xlsx",
      // });

      // ctx.set(
      //   "Content-Type",
      //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      // );
      // ctx.set("Content-Disposition", 'attachment; filename="data.xlsx"');
      // ctx.state.skipFormat = true; //跳过格式化返回
      // ctx.body = buffer;
    } catch (error: any) {
      throw error;
    }
  }

  async exportQuestions(ctx: Context): Promise<void> {
    try {
      const examQuestions = await examService.exportQuestions();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("questions");

      // 添加表头
      worksheet.columns = [
        { header: "题目", key: "title", width: 30 },
        { header: "选择", key: "options", width: 30 },
        { header: "得分", key: "score", width: 10 },
        { header: "类型", key: "type", width: 10 },
        { header: "图片", key: "img", width: 30 },
      ];

      // 添加数据行
      for (const q of examQuestions) {
        let type: string = "";
        switch (q.type) {
          case 0:
            type = "单选";
            break;
          case 1:
            type = "多选";
            break;
          case 2:
            type = "判断";
            break;
          case 3:
            type = "填空";
            break;
          case 4:
            type = "简答";
            break;
        }
        worksheet.addRow({
          title: q.title,
          options: JSON.stringify(q.options),
          score: q.score,
          type: type,
          img: q.img,
        });
      }

      // 设置响应头并发送文件
      ctx.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      ctx.set(
        "Content-Disposition",
        `attachment; filename=${new Date().getTime()}.xlsx`
      );
      const buffer = await workbook.xlsx.writeBuffer();
      ctx.body = buffer;
    } catch (error: any) {
      throw error;
    }
  }
  /**
   * Handles the import of exam data from an uploaded Excel file.
   * Expects a file to be uploaded as part of the request.
   * Parses the first sheet of the Excel file and converts it to JSON format.
   * Sets the parsed data as the response body.
   *
   * @param ctx - Koa context object containing the request and response.
   * @throws CustomError if no file is uploaded or if an error occurs during processing.
   */

  async importExam(ctx: Context) {
    try {
      const file = ctx.request.files?.file;
      if (!file || Array.isArray(file)) {
        throw new CustomError("请上传文件");
      }
      const filepath = file.filepath;
      const workbook = XLSX.readFile(filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      ctx.body = jsonData;
    } catch (error: any) {
      throw error;
    }
  }
}

export default new ExportController();
