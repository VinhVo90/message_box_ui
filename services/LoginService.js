const models = require('../models');
const Sequelize = require('sequelize-oracle');
const { USERTYPE, USER_PERMISSION } = require('../configs/constants');

const getUserInfo = async function (ctx) {
  const { username, password } = ctx.request.body.params;

  let query = `
  select * from "USER_ACCOUNTS"
  where "USER_ID" = '${username}'
    and "PASSWORD" = '${password}'
  `;
 
  await models.sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT
  }).then(result => {
    if (result.length > 0) {
      const user = result[0];
      user['type'] = user['ACCESS_CONTROL'];
      user['permission'] = USER_PERMISSION[user['type']];
      ctx.session.user = user;
      ctx.body = {authenticated : true};
    } else {
      ctx.body = result;
    }
  });
}

module.exports = {
  getUserInfo
}