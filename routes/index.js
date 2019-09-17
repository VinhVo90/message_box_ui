const Router = require('koa-router');
const router = new Router();
const HomeController = require('../controllers/HomeController');
const loginController =  require('../controllers/LoginController');
const userManagementController = require('../controllers/UserManagementController');

router.get('/', async ctx => {
  HomeController.getIndex(ctx);
})

router.get('/login', loginController.getIndex);
router.post('/api/getUserinfo', loginController.getUserInfo);

router.get('/user_management', userManagementController.getIndex);
router.post('/api/getUsers', userManagementController.getUsers);
router.post('/api/saveUsers', userManagementController.saveUsers);
router.post('/api/getGroups', userManagementController.getGroups);
router.post('/api/saveGroups', userManagementController.saveGroups);

module.exports = router;