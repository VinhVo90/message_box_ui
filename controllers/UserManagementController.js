const userManagementService = require('../services/UserManagementService');
const { USER_PERMISSION } = require('../configs/constants');

const getIndex = async (ctx) => {
  const model = {
    title: 'User Management'
  };

  ctx.state.commonData = {
    userType: Object.keys(USER_PERMISSION)
  }

  await ctx.render('user_management/index', model);
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

const getUserHistory = async (ctx) => {
  await userManagementService.getUserHistory(ctx);
}



module.exports = {
  getIndex,
  getUsers,
  saveUsers,
  getGroups,
  saveGroups,
  getUserHistory
}