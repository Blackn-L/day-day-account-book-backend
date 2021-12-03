"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret); // 传入加密字符串
  router.post("/user/register", controller.user.register); // 注册
  router.post("/user/login", controller.user.login); // 登录
  router.get("/user/get", _jwt, controller.user.get_user_info); // 获取用户信息
  router.put("/user/edit", _jwt, controller.user.edit); // 编辑用户信息
  router.put("/user/update_password", _jwt, controller.user.updatePassword); //  更新密码
  router.post("/bill/add", _jwt, controller.bill.add); // 增加账单
  router.get("/bill/list", _jwt, controller.bill.list); // 获取账单列表
  router.get("/bill/detail", _jwt, controller.bill.detail); // 获取账单详情
  router.put("/bill/update", _jwt, controller.bill.update); // 更新账单
  router.delete("/bill/delete", _jwt, controller.bill.delete); // 删除账单
  router.get("/bill/date", _jwt, controller.bill.date); // 获取整月账单统计数据
};
