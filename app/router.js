"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret); // 传入加密字符串
  router.post("/api/user/register", controller.user.register); // 注册
  router.post("/api/user/login", controller.user.login); // 登录
  router.get("/api/user/get_userinfo", _jwt, controller.user.getUserInfo); // 获取用户信息
  router.post("/api/user/edit_userinfo", _jwt, controller.user.editUserInfo); // 编辑用户信息
};
