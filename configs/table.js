/* Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved. */
const Sequelize = require('sequelize-oracle')

/**FOR TABLE  TASK_GROUP*/
const TASK_GROUP_NM = 'TASK_GROUP';

const TASK_GROUP_COL_TYPE = {
  GROUP_ID: { type: Sequelize.STRING },
  TASK_ID: { type: Sequelize.STRING },
  CONFIG_PATH: { type: Sequelize.STRING },
  TASK_DESC: { type: Sequelize.STRING }
};

const TASK_GROUP_COL_DEFINE = {
  GROUP_ID: 'GROUP_ID',
  TASK_ID: 'TASK_ID',
  CONFIG_PATH: 'CONFIG_PATH',
  TASK_DESC: 'TASK_DESC'
};

/**FOR TABLE  TRANSACTION*/
const TRANSACTION_NM = 'TRANSACTION';

const TRANSACTION_COL_TYPE = {
  SEQ: Sequelize.BIGINT,
  TASK_ID: Sequelize.STRING,
  IN_PATH: Sequelize.STRING,
  IN_SIZE: Sequelize.FLOAT,
  IN_TIME: Sequelize.STRING,
  OUT_PATH: Sequelize.STRING,
  OUT_SIZE: Sequelize.FLOAT,
  OUT_TIME: Sequelize.STRING
};

const TRANSACTION_COL_DEFINE = {
  SEQ: 'SEQ',
  TASK_ID: 'TASK_ID',
  IN_PATH: 'IN_PATH',
  IN_SIZE: 'IN_SIZE',
  IN_TIME: 'IN_TIME',
  OUT_PATH: 'OUT_PATH',
  OUT_SIZE: 'OUT_SIZE',
  OUT_TIME: 'OUT_TIME'
};

module.exports = {
  TASK_GROUP_NM ,
  TASK_GROUP_COL_TYPE,
  TASK_GROUP_COL_DEFINE,
  TRANSACTION_NM,
  TRANSACTION_COL_TYPE,
  TRANSACTION_COL_DEFINE
};