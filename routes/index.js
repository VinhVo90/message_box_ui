const Router = require('koa-router');
const router = new Router();
const HomeController = require('../controllers/HomeController');
const UserManagement = require('../controllers/UserManagementController');
const SenderController = require('../controllers/SenderController');
const RecipientController = require('../controllers/RecipientController');

router.get('/', async ctx => {
  HomeController.getIndex(ctx);
})

router.get('/user_management', async ctx => {
  await UserManagement.getIndex(ctx);
})

router.get('/sender', async ctx => {
  await SenderController.getIndex(ctx);
})

router.post('/sender/search-message-transaction', async ctx => {
  await SenderController.searchMessageTransaction(ctx);
})

router.post('/sender/send-message', async ctx => {
  await SenderController.sendMessage(ctx);
})

router.get('/recipient', async ctx => {
  await RecipientController.getIndex(ctx);
})

router.post('/recipient/search-message-transaction', async ctx => {
  await RecipientController.searchMessageTransaction(ctx);
})

module.exports = router;