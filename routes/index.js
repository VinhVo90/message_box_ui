const Router = require('koa-router');
const router = new Router();
const HomeController = require('../controllers/HomeController');
const SenderController = require('../controllers/SenderController');
const loginController =  require('../controllers/LoginController');
const userManagementController = require('../controllers/UserManagementController');
const RecipientController = require('../controllers/RecipientController');

router.get('/', HomeController.getIndex);

router.get('/login', loginController.getIndex);
router.post('/api/getUserinfo', loginController.getUserInfo);

router.get('/user_management', userManagementController.getIndex);
router.post('/api/getUsers', userManagementController.getUsers);
router.post('/api/saveUsers', userManagementController.saveUsers);
router.post('/api/getGroups', userManagementController.getGroups);
router.post('/api/saveGroups', userManagementController.saveGroups);
router.post('/api/getUserHistory', userManagementController.getUserHistory);

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

router.post('/recipient/mark-as-read', async ctx => {
  await RecipientController.markAsRead(ctx);
})

router.post('/recipient/read-message', async ctx => {
  await RecipientController.readMessage(ctx);
})

router.get('/403', async ctx => {
  await ctx.render('forbidden');
})

router.get('/404', async ctx => {
  await ctx.render('notFound');
})

module.exports = router;