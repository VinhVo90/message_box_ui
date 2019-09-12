const Router = require('koa-router');
const router = new Router();
const HomeController = require('../controllers/HomeController');
const UserManagement = require('../controllers/UserManagementController');

router.get('/', async ctx => {
  HomeController.getIndex(ctx);
})

router.get('/user_management', async ctx => {
  await UserManagement.getIndex(ctx);
})

module.exports = router;