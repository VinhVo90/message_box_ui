const getIndex = async (ctx) => {
  await ctx.render('user_management/index');
}

module.exports = {
  getIndex
}