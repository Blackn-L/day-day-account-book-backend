const Controller = require("egg").Controller;
const defaultAvatar =
  "https://cdn.jsdelivr.net/gh/Blackn-L/Picture/blog/20211003210108.png";
class UserController extends Controller {
  // 注册
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    // 账号密码为空
    if (!username || !password) {
      ctx.body = {
        code: 500,
        message: "账号/密码不能为空",
        data: null,
      };
      return;
    }

    // 用户名被注册
    const userinfo = await ctx.service.user.getUserByName(username);
    if (userinfo?.id) {
      ctx.body = {
        code: 500,
        message: "该用户名已被注册，换一个吧",
        data: null,
      };
      return;
    }

    //   注册信息写入数据库
    const result = await ctx.service.user.register({
      username,
      password,
      avatar: defaultAvatar,
    });
    if (result) {
      ctx.body = {
        code: 200,
        message: "注册成功",
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        message: "注册失败（当然我也不知道为啥失败）",
        data: null,
      };
    }
  }

  // 登录
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 账号密码都要填
    if (!username || !password) {
      ctx.body = {
        code: 500,
        message: "账号/密码不能为空",
        data: null,
      };
      return;
    }
    const userInfo = await ctx.service.user.getUserByName(username);
    // 无该用户
    if (!userInfo?.id) {
      ctx.body = {
        code: 500,
        message: "该用户不存在",
        data: null,
      };
      return;
    }
    // 判断密码是否正确
    if (userInfo?.password !== password) {
      ctx.body = {
        code: 500,
        message: "密码错误",
        data: null,
      };
      return;
    }

    const token = app.jwt.sign(
      {
        id: userInfo.id,
        username: userInfo.username,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 有效期 24H
      },
      app.config.jwt.secret
    );
    ctx.body = {
      code: 200,
      message: "登录成功",
      data: token,
    };
  }
}

module.exports = UserController;
