"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret); // 传入加密字符串
  router.post("/ab/user/register", controller.user.register); // 注册
  router.post("/ab/user/login", controller.user.login); // 登录
  router.get("/ab/user/get", _jwt, controller.user.get_user_info); // 获取用户信息
  router.post("/ab/user/edit", _jwt, controller.user.edit); // 编辑用户信息
  router.post("/ab/bill/add", _jwt, controller.bill.add); // 增加账单
  router.get("/ab/bill/list", _jwt, controller.bill.list); // 获取账单列表
  router.get("/ab/bill/detail", _jwt, controller.bill.detail); // 获取账单详情
  router.post("/ab/bill/update", _jwt, controller.bill.update); // 更新账单
  router.get("/ab/bill/delete", _jwt, controller.bill.delete); // 删除账单
  router.get("/ab/bill/date", _jwt, controller.bill.date); // 获取整月账单统计数据
};
