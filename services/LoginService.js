const models = require('../models');
const Sequelize = require('sequelize-oracle');

const getUserInfo = async function (ctx) {
  const { username, password } = ctx.request.body.params;

  let query = `
  select * from "users"
  where "username" = '${username}'
    and "password" = '${password}'
  `;
 
  await models.sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT
  }).then(result => {
    if (result.length > 0) {
      ctx.cookies.set('username', username, {httpOnly: true});
      ctx.session.username = username;
      ctx.response.redirect('/user_management');
    } else {
      ctx.body = result;
    }
  });
}

module.exports = {
  getUserInfo
}