const axios = require('axios');
const CONSTANT = require('../configs/constants');
const models = require('../models');
const Sequelize = require('sequelize-oracle')
const oracledb = require('oracledb');
oracledb.fetchAsString = [oracledb.CLOB];

/**search message by send_time, recv_time, message name, group, recipient */
const searchMessageTransaction = async (ctx) => {
  let searchData = ctx.request.body;
  const user = ctx.state.user;
  searchData['recipient'] = user['USER_ID'];

  let query = `SELECT t.TX_ID, t.SENDER_ID, t.RECIPIENT_ID, t.GROUP_ID, t.MSG_ID, t.SEND_TIME, t.RECV_TIME, m.NAME, m.CONTENT
              FROM transactions t, messages m
              WHERE t.msg_id = m.msg_id
              AND t.RECIPIENT_ID = :recipient`;
  
  if (searchData.sendTime != null) {
    query += ` AND t.SEND_TIME BETWEEN :sendTimeFrom AND :sendTimeTo`;
  }
  if (searchData.recvTime != null) {
    query += ` AND t.RECV_TIME BETWEEN :recvTimeFrom AND :recvTimeTo`;
  }
  if (searchData.sender != '') {
    query += ` AND t.SENDER_ID = :sender`;
  }
  if (searchData.group != '') {
    query += ` AND t.GROUP_ID = :group`;
  }
  if (searchData.messageName != '') {
    query += ` AND m.NAME = :messageName`;
  }
 
  query += ` ORDER BY t.SEND_TIME DESC`;
  
  await models.sequelize.query(query, {
    replacements: searchData,
    type: Sequelize.QueryTypes.SELECT
  }).then(async (result) => {
    ctx.body = result;
  })
}

const markAsRead = async (ctx) => {
  const user = ctx.state.user;
  const recipient = user['USER_ID'];
  const messages = ctx.request.body;
  let result = [];

  for (let i = 0; i < messages.length; i += 1) {
    let message = messages[i];
    await axios.delete(`${CONSTANT.API_SERVER}/msgbox/${recipient}/recv/${message['TX_ID']}`, {authInfo : ''})
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
  ctx.body = result;
}

const readMessage = async (ctx) => {
  const user = ctx.state.user;
  const recipient = user['USER_ID'];
  const messages = ctx.request.body;
  let result = [];

  for (let i = 0; i < messages.length; i += 1) {
    let message = messages[i];
    await axios.get(`${CONSTANT.API_SERVER}/msgbox/${recipient}/recv/${message['TX_ID']}`, {authInfo : ''})
      .catch((error) => {console.log(error)});
    let recvDate = (new Date()).getTime();
    result.push({txId : message['TX_ID'], recvDate : recvDate});
  }
  ctx.body = result;
}

module.exports = {
  searchMessageTransaction,
  markAsRead,
  readMessage
}