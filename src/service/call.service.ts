import { logger } from "../util/log";
const got = require("got");
class CallService {
  async randomImg() {
    try {
      const res = await got("https://api.shanrenyi.top/img").json();
      logger().info({ event: "请求回调", message: JSON.stringify(res) });
      const imgUrl=res.image_url
      const img=imgUrl.split(' ')
      return img[1];
    } catch (err) {
      throw err;
    }
  }
}
export default new CallService();
