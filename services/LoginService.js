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
    ctx.body = result;
  });
}

module.exports = {
  getUserInfo
}