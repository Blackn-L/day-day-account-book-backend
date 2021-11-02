const Controller = require("egg").Controller;
const moment = require("moment");
class BillController extends Controller {
  // 新增账单
  async addBill() {
    const { ctx, app } = this;
    const {
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = "",
    } = ctx.request.body;

    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        message: "参数错误",
        data: null,
      };
      return;
    }
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    const user_id = decode.id;
    try {
      await ctx.service.bill.addBill({
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        message: "新增成功",
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        message: "系统错误",
        data: null,
      };
    }
  }

  // 搜索账单
  async getBill() {
    const { ctx, app } = this;
    const { date, page = 1, page_size = 5, type_id = "all" } = ctx.query;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const list = await ctx.service.bill.getBillList(user_id);
      // 过滤出月份和类型所对应的账单列表
      const _list = list.filter((item) => {
        if (type_id != "all") {
          return (
            moment(Number(item.date)).format("YYYY-MM") == date &&
            type_id == item.type_id
          );
        }
        return moment(Number(item.date)).format("YYYY-MM") == date;
      });
      // 格式化数据
      let listMap = _list
        .reduce((curr, item) => {
          // curr 默认初始值是一个空数组 []
          // 把第一个账单项的时间格式化为 YYYY-MM-DD
          const date = moment(Number(item.date)).format("YYYY-MM-DD");
          // 如果能在累加的数组中找到当前项日期 date，那么在数组中的加入当前项到 bills 数组。
          if (curr?.findIndex((item) => item.date == date) > -1) {
            const index = curr.findIndex((item) => item.date == date);
            curr[index].bills.push(item);
          }
          // 如果在累加的数组中找不到当前项日期的，那么再新建一项。
          if (curr?.findIndex((item) => item.date == date) == -1) {
            curr.push({
              date,
              bills: [item],
            });
          }
          // 如果 curr 为空数组，则默认添加第一个账单项 item ，格式化为下列模式
          if (!curr.length) {
            curr.push({
              date,
              bills: [item],
            });
          }
          return curr;
        }, [])
        .sort((a, b) => moment(b.date) - moment(a.date)); // 时间顺序为倒叙，时间约新的，在越上面
    } catch (error) {}
  }

  // 获取账单详情
  async getDetail() {
    const { ctx, app } = this;
    // 获取账单 id 参数
    const { id = "" } = ctx.query;
    // 获取用户 user_id
    let user_id;
    const token = ctx.request.header.authorization;
    // 获取当前用户信息
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    user_id = decode.id;
    // 判断是否传入账单 id
    if (!id) {
      ctx.body = {
        code: 500,
        message: "订单id不能为空",
        data: null,
      };
      return;
    }

    try {
      // 从数据库获取账单详情
      const detail = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        message: "请求成功",
        data: detail,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        message: "系统错误",
        data: null,
      };
    }
  }

  // 更新账单
  async updateBill() {}
}

module.exports = BillController;
