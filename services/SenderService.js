const models = require('../models');
const Sequelize = require('sequelize-oracle')
const axios = require('axios');
const CONSTANT = require('../configs/constants');
const oracledb = require('oracledb');
oracledb.fetchAsString = [oracledb.CLOB];

/**search message by send_time, recv_time, message name, group, recipient */
const searchMessageTransaction = async (ctx) => {
  let searchData = ctx.request.body;

  let query = `SELECT t.TX_ID, t.SENDER_ID, t.RECIPIENT_ID, t.GROUP_ID, t.MSG_ID, t.SEND_TIME, t.RECV_TIME, m.NAME, m.CONTENT
              FROM transactions t, messages m
              WHERE t.msg_id = m.msg_id`
  
  if (searchData.sendTime != null) {
    query += ` AND t.SEND_TIME BETWEEN :sendTimeFrom AND :sendTimeTo`;
  }
  if (searchData.recvTime != null) {
    query += ` AND t.RECV_TIME BETWEEN :recvTimeFrom AND :recvTimeTo`;
  }
  if (searchData.recipient != '') {
    query += ` AND t.RECIPIENT_ID = :recipient`;
  }
  if (searchData.group != '') {
    query += ` AND t.GROUP_ID = :group`;
  }
  if (searchData.messageName != '') {
    query += ` AND m.NAME = :messageName`;
  }
 
  await models.sequelize.query(query, {
    replacements: searchData,
    type: Sequelize.QueryTypes.SELECT
  }).then(async (result) => {
    ctx.body = result;
  })
}

const sendMessage = async (ctx) => {
  let formData = ctx.request.body;
  let sender = formData['sender'];
  let recipient = formData['recipient'];
  let group = formData['group'];
  let messageData = {name : formData['NAME'], content : formData['CONTENT'], authInfo : ''};

  await axios.post(`${CONSTANT.API_SERVER}/msgbox/${sender}/send/${recipient}/${group}`, messageData)
      .then((response) => {
        ctx.body = response;
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