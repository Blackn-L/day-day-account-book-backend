const Controller = require("egg").Controller;
class BillController extends Controller {
  success(data = null, message = "请求成功", code = 200) {
    this.ctx.body = {
      code,
      message,
      data,
    };
  }
  paramsError(message = "参数错误", code = 400) {
    this.ctx.body = {
      code,
      message,
    };
  }
  serviceError(message = "服务器内部错误", code = 500) {
    this.ctx.body = {
      code,
      message,
    };
  }
}
module.exports = BillController;
