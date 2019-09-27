const models = require('../models');
const Sequelize = require('sequelize-oracle')
const axios = require('axios');
const CONSTANT = require('../configs/constants');
const oracledb = require('oracledb');
oracledb.fetchAsString = [oracledb.CLOB];

/**search message by send_time, recv_time, message name, group, recipient */
const searchMessageTransaction = async (ctx) => {
  const user = ctx.state.user;
  let searchData = ctx.request.body;
  searchData['sender'] = user['USER_ID'];

  let query = `SELECT t.TX_ID, t.SENDER_ID, t.RECIPIENT_ID, t.GROUP_ID, t.MSG_ID, t.SEND_TIME, t.RECV_TIME, m.NAME, m.CONTENT
              FROM transactions t, messages m
              WHERE t.msg_id = m.msg_id
              AND t.SENDER_ID = :sender`;
  
  if (searchData.sendTime != null) {
    query += ` AND t.SEND_TIME BETWEEN :sendTimeFrom AND :sendTimeTo`;
  }
  if (searchData.recvTime != null) {
    query += ` AND t.RECV_TIME BETWEEN :recvTimeFrom AND :recvTimeTo`;
  }
  if (searchData.recipient != '') {
    searchData.recipient = `%${searchData.recipient}%`;
    query += ` AND t.RECIPIENT_ID LIKE :recipient`;
  }
  if (searchData.group != '') {
    searchData.group = `%${searchData.group}%`;
    query += ` AND t.GROUP_ID LIKE :group`;
  }
  if (searchData.messageName != '') {
    searchData.messageName = `%${searchData.messageName}%`;
    query += ` AND m.NAME LIKE :messageName`;
  }

  query += ` ORDER BY t.SEND_TIME DESC`;

  await models.sequelize.query(query, {
    replacements: searchData,
    type: Sequelize.QueryTypes.SELECT
  }).then(async (result) => {
    ctx.body = result;
  })
}

const sendMessage = async (ctx) => {
  const user = ctx.state.user;
  const formData = ctx.request.body;
  const sender = user['USER_ID'];
  const recipient = formData['recipient'];
  const group = formData['group'];
  const messageData = {name : formData['fileName'], content : formData['fileContent'], authInfo : ''};

  await axios.post(`${CONSTANT.API_SERVER}/msgbox/${sender}/send/${recipient}/${group}`, messageData)
      .then((response) => {
        ctx.body = response.data;
      })
      .catch((error) => {
        ctx.body = {
          error : error.response.status,
          data : error.response.data
        };
      });
}

module.exports = {
  searchMessageTransaction,
  sendMessage
}