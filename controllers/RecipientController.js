const RecipientService = require('../services/RecipientService');

const getIndex = async (ctx) => {
  const model = {
    title: 'Receive'
  };

  await ctx.render('recipient/index', model);
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