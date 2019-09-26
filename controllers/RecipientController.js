const RecipientService = require('../services/RecipientService');

const getIndex = async (ctx) => {
  await ctx.render('recipient/index');
}

const searchMessageTransaction = async (ctx) => {
  await RecipientService.searchMessageTransaction(ctx);
}

const markAsRead = async (ctx) => {
  await RecipientService.markAsRead(ctx);
}

const readMessage = async (ctx) => {
  await RecipientService.readMessage(ctx);
}

module.exports = {
  getIndex,
  searchMessageTransaction,
  markAsRead,
  readMessage
}