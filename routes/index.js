const Router = require('koa-router');
const router = new Router();
const HomeController = require('../controllers/HomeController');
const SenderController = require('../controllers/SenderController');
const loginController =  require('../controllers/LoginController');
const userManagementController = require('../controllers/UserManagementController');

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

module.exports = router;