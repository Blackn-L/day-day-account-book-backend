const Controller = require("egg").Controller;
const dayjs = require("dayjs");
class BillController extends Controller {
  // 新增账单
  async add() {
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
      await ctx.service.bill.add({
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
        message: error,
        data: null,
      };
    }
  }

  // 获取账单列表
  async list() {
    const { ctx, app } = this;
    const { date, page = 1, page_size = 5, type_id = 0 } = ctx.query;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const list = await ctx.service.bill.list(user_id);
      // 过滤出月份和类型所对应的账单列表
      const _date = dayjs(Number(date)).format("YYYY-MM");
      const _list = list.filter((item) => {
        if (type_id != 0)
          return (
            dayjs(Number(item.date)).format("YYYY-MM") == _date &&
            type_id == item.type_id
          );
        return dayjs(Number(item.date)).format("YYYY-MM") == _date;
      });
      // 格式化数据
      let listMap = _list
        .reduce((curr, item) => {
          // curr 默认初始值是一个空数组 []
          // 把第一个账单项的时间格式化为 YYYY-MM-DD
          const date = dayjs(Number(item.date)).format("YYYY-MM-DD");
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
        .sort((a, b) => dayjs(b.date) - dayjs(a.date)); // 时间顺序为倒叙，时间约新的，在越上面
      // 分页处理，listMap 为我们格式化后的全部数据，还未分页
      const filterListMap = listMap.slice(
        (page - 1) * page_size,
        page * page_size
      );

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      let __list = list.filter(
        (item) => dayjs(Number(item.date)).format("YYYY-MM") == _date
      );
      // 累加计算支出
      let totalExpense = __list.reduce((curr, item) => {
        // type_id 为 0则全部累加，否则只累加对应类型的
        if (
          item.pay_type == 1 &&
          (!Number(type_id) || item.type_id == type_id)
        ) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 累加计算收入
      let totalIncome = __list.reduce((curr, item) => {
        // type_id 为 0则全部累加，否则只累加对应类型的
        if (
          item.pay_type == 2 &&
          (!Number(type_id) || item.type_id == type_id)
        ) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);

      // 返回数据
      ctx.body = {
        code: 200,
        message: "请求成功",
        data: {
          totalExpense, // 当月总支出
          totalIncome, // 当月总收入
          totalPage: Math.ceil(listMap.length / page_size), // 总页数
          list: filterListMap || [], // 格式化后，并且经过分页处理的数据
        },
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        message: error,
        data: null,
      };
    }
  }

  // 获取账单详情
  async detail() {
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
        message: "账单id不能为空",
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
        message: error,
        data: null,
      };
    }
  }

  // 更新账单
  async update() {
    const { ctx, app } = this;
    // 账单相关参数
    const {
      id,
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = "",
    } = ctx.request.body;
    // 都必须有值
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        message: "参数错误",
        data: null,
      };
    }

    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      user_id = decode.id;
      // 根据账单 id 和 user_id，修改账单数据
      const result = await ctx.service.bill.update({
        id, // 账单 id
        amount, // 金额
        type_id, // 消费类型 id
        type_name, // 消费类型名称
        date, // 日期
        pay_type, // 消费类型
        remark, // 备注
        user_id, // 用户 id
      });
      if (result?.affectedRows === 1) {
        ctx.body = {
          code: 200,
          message: "更新成功",
          data: null,
        };
      } else {
        ctx.body = {
          code: 500,
          message: "未找到该账单或服务器错误",
          data: null,
        };
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        message: error,
        data: null,
      };
    }
  }

  // 删除账单
  async delete() {
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
        message: "账单id不能为空",
        data: null,
      };
      return;
    }

    try {
      // 删除数据库账单详情，逻辑删除，delete_flag 置为 1
      const result = await ctx.service.bill.delete(id);
      if (result?.affectedRows === 1) {
        ctx.body = {
          code: 200,
          message: "删除成功",
          data: null,
        };
      } else {
        ctx.body = {
          code: 500,
          message: "未找到该账单或服务器错误",
          data: null,
        };
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        message: error,
        data: null,
      };
    }
  }

  // 获取月账单数据
  async date() {
    const { ctx, app } = this;
    const { date = "" } = ctx.query;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const result = await ctx.service.bill.list(user_id);
      // 根据时间参数，筛选出当月所有的账单数据
      const start = dayjs(date).startOf("month").unix() * 1000; // 选择月份，月初时间
      const end = dayjs(date).endOf("month").unix() * 1000; // 选择月份，月末时间
    } catch (error) {
      ctx.body = {
        code: 500,
        message: error,
        data: null,
      };
    }
  }
}

module.exports = BillController;
