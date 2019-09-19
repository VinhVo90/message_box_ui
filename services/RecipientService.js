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
  if (searchData.sender != '') {
    query += ` AND t.SENDER_ID = :sender`;
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

module.exports = {
  searchMessageTransaction
}