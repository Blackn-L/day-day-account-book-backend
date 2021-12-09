const BaseController = require("./BaseController");
const default_avatar =
  "https://cdn.jsdelivr.net/gh/Blackn-L/Picture/blog/20211208224344.png";
class UserController extends BaseController {
  // 注册
  async register() {
    const { ctx } = this;
    const { username, password, avatar = default_avatar } = ctx.request.body;

    // 账号密码为空
    if (!username || !password) {
      this.paramsError("账号/密码不能为空");
      return;
    }

    // 用户名被注册
    const user_info = await ctx.service.user.get(username);
    if (user_info?.id) {
      this.paramsError("该用户名已被注册，换一个吧");
      return;
    }
    try {
      //   注册信息写入数据库
      const result = await ctx.service.user.register({
        username,
        password,
        avatar,
      });
      if (result) {
        this.success(null, "注册成功");
      } else {
        this.serviceError("注册失败（当然我也不知道为啥失败");
      }
    } catch (error) {
      this.serviceError();
    }
  }

  // 登录
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 账号密码都要填
    if (!username || !password) {
      this.paramsError("账号/密码不能为空");
      return;
    }
    const user_info = await ctx.service.user.get(username);
    // 无该用户
    if (!user_info?.id) {
      this.paramsError("该用户不存在");

      return;
    }
    // 判断密码是否正确
    if (user_info?.password !== password) {
      this.paramsError("密码错误");
      return;
    }

    const token = app.jwt.sign(
      {
        id: user_info.id,
        username: user_info.username,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 有效期 24H
      },
      app.config.jwt.secret
    );
    this.success({ token }, "登录成功");
  }

  // 获取用户信息
  async get_user_info() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    try {
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      const user_info = await ctx.service.user.get(decode.username);
      // 只返回必须的信息
      const _data = {
        username: user_info.username,
        avatar: user_info.avatar,
        signature: user_info.signature,
      };
      this.success(_data, "获取用户信息成功");
    } catch (error) {
      console.log("error: ", error);
      this.serviceError();
    }
  }

  // 编辑用户信息
  async edit() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const { signature = "", avatar = "" } = ctx.request.body;
    try {
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_info = await ctx.service.user.get(decode.username);
      if (!user_info) return;
      const _data = {
        signature,
        avatar,
      };
      if (!signature?.trim()) delete _data.signature;
      if (!avatar?.trim()) delete _data.avatar;
      const result = await ctx.service.user.edit({
        ...user_info,
        ..._data,
      });
      if (!result) return;
      const data = {
        id: user_info.id,
        username: user_info.username,
        signature: _data.signature || user_info.signature,
        avatar: _data.avatar || user_info.avatar,
      };
      this.success(data, "编辑用户信息成功");
    } catch (error) {
      console.log("error: ", error);
      this.serviceError();
    }
  }

  // 更新密码
  async updatePassword() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const { oldPassword, newPassword } = ctx.request.body;
    try {
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_info = await ctx.service.user.get(decode.username);
      // 获取不到用户信息或者旧密码不一致
      if (!user_info) {
        this.paramsError("用户信息不存在");
        return;
      }
      // 禁止 test 修改密码
      if (user_info.username === "test") {
        this.paramsError("test 账号不允许修改密码");
        return;
      }
      if (user_info.password !== oldPassword) {
        this.paramsError("旧密码错误");
        return;
      }

      const result = await ctx.service.user.edit({
        ...user_info,
        password: newPassword,
      });
      this.success(null, "修改密码成功");
    } catch (error) {
      console.log("error: ", error);
      this.serviceError();
    }
  }
}

module.exports = UserController;
