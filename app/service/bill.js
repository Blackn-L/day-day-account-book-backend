const Service = require("egg").Service;

class BillService extends Service {
  // 增加账单
  async addBill(bill) {
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
  async getBillList(id) {
    const { ctx, app } = this;
    const QUERY_STR = "id, pay_type, amount, date, type_id, type_name, remark";
    let sql = `select ${QUERY_STR} from bill where user_id = ${id}`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 获取账单详情
  async getDetail(id, user_id) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.get("bill", { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = BillService;
