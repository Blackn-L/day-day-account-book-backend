module.exports = (secret) => {
  return async function jwtErr(ctx, next) {
    const token = ctx.request.header.authorization;
    let decode;
    if (token) {
      try {
        // 解析失败就报错
        decode = await ctx.app.jwt.verify(token, secret);
        await next();
      } catch (error) {
        console.log("error", error);
        ctx.status = 200;
        ctx.body = {
          code: 401,
          message: "token已过期，请重新登录",
        };
        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        message: "token不存在",
      };
      return;
    }
  };
};
