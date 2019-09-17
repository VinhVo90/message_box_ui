const SenderService = require('../services/SenderService');
const fs = require('fs');
const path = require('path');

const getIndex = async (ctx) => {
  await ctx.render('sender/index');
}

const searchMessageTransaction = async (ctx) => {
  await SenderService.searchMessageTransaction(ctx);
}

const sendMessage = async (ctx) => {
  await SenderService.sendMessage(ctx);
}

module.exports = {
  getIndex,
  searchMessageTransaction,
  sendMessage
}