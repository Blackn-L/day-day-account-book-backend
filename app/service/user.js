const Service = require("egg").Service;

class UserService extends Service {
  // 通过用户名获取用户信息
  async get(username) {
    const { app } = this;
    try {
      const result = await app.mysql.get("user", { username });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 注册
  async register(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert("user", params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 编辑用户信息
  async edit(user_info) {
    const { app } = this;
    try {
      const result = await app.mysql.update(
        "user",
        { ...user_info },
        { id: user_info.id }
      );
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = UserService;
