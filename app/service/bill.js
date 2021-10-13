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
}

module.exports = BillService;
