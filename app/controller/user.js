const BaseController = require("./BaseController");
const default_avatar =
  "https://cdn.jsdelivr.net/gh/Blackn-L/Picture/blog/20211003210108.png";
class UserController extends BaseController {
  // 注册
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

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
        avatar: default_avatar,
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
      const user_info = await ctx.service.user.getUserByName(decode.username);
      this.success(user_info, "获取用户信息成功");
    } catch (error) {
      this.serviceError();
    }
  }

  // 编辑用户信息
  async edit() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const { signature = "" } = ctx.request.body;
    try {
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_info = await ctx.service.user.getUserByName(decode.username);
      if (!user_info) return;
      const result = await ctx.service.user.edit({
        ...user_info,
        signature,
      });
      const data = {
        id: user_info.id,
        username: user_info.username,
        signature,
      };
      this.success(data, "编辑用户信息成功");
    } catch (error) {
      this.serviceError();
    }
  }
}

module.exports = UserController;
