const RecipientService = require('../services/RecipientService');
const fs = require('fs');
const path = require('path');

const getIndex = async (ctx) => {
  await ctx.render('recipient/index');
}

const searchMessageTransaction = async (ctx) => {
  await RecipientService.searchMessageTransaction(ctx);
}

const markAsRead = async (ctx) => {
  await RecipientService.markAsRead(ctx);
}

module.exports = {
  getIndex,
  searchMessageTransaction,
  markAsRead
}