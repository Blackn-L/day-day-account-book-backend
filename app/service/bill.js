const Service = require("egg").Service;

class BillService extends Service {
  // 增加账单
  async add(bill) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.insert("bill", bill);
      return result;
    } catch (error) {
      console.log("error: ", error);
      return null;
    }
  }

  // 获取账单列表
  async list(id) {
    const { ctx, app } = this;
    const QUERY_STR = "id, pay_type, amount, date, type_id, type_name, remark";
    if (typeof Number(id) !== "number") return null;
    let sql = `select ${QUERY_STR} from bill where user_id = ${id} and delete_flag != 1 ORDER BY date DESC`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取账单详情
  async detail(id, user_id) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.select("bill", {
        where: { delete_flag: 0, id, user_id },
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 更新账单
  async update(params) {
    const { ctx, app } = this;
    try {
      let result = await app.mysql.update(
        "bill",
        {
          ...params,
        },
        {
          where: { delete_flag: 0, user_id: params.user_id, id: params.id },
        }
      );
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 删除账单，逻辑删除
  async delete(id) {
    console.log("id: ", id);
    const { ctx, app } = this;
    try {
      if (typeof Number(id) !== "number") return null;
      const sql = `UPDATE bill SET delete_flag = 1,delete_time=${this.app.mysql.literals.now} where id = ${id}`;
      let result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = BillService;
