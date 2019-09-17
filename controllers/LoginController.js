const LoginService = require('../services/LoginService')

const getIndex = async (ctx) => {
  const model = {
    title: 'Login'
  };
  await ctx.render('login/index', model);
}

const getUserInfo = async function(ctx) {

  const params = ctx.request.body.params;
  
  console.log(params);
  await LoginService.getUserInfo(ctx);
}

module.exports = {
  getIndex,
  getUserInfo
};
