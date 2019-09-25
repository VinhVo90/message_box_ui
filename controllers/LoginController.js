const LoginService = require('../services/LoginService')

const getIndex = async (ctx) => {
  const model = {
    title: 'Login'
  };
  await ctx.render('login/index', model);
}

const getUserInfo = async (ctx) => {
  await LoginService.getUserInfo(ctx);
}

const logout = async (ctx) => {
  ctx.session = null;
  ctx.body = {success : true};
}

module.exports = {
  getIndex,
  getUserInfo,
  logout
};
