const userManagementService = require('../services/UserManagementService');

const getIndex = async (ctx) => {
  await ctx.render('user_management/index');
}

const getUsers = async (ctx) => {
  await userManagementService.getUsers(ctx);
}

const saveUsers = async (ctx) => {
  await userManagementService.saveUsers(ctx);
}

const getGroups = async (ctx) => {
  await userManagementService.getGroups(ctx);
}

const saveGroups = async (ctx) => {
  await userManagementService.saveGroups(ctx);
}

module.exports = {
  getIndex,
  getUsers,
  saveUsers,
  getGroups,
  saveGroups
}