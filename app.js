// app.js
const Koa = require('koa');
const session = require('koa-session');
var Pug = require('koa-pug');
const app = new Koa();
const router = require('./routes/index.js');
const koastatic = require('koa-static');
var bodyParser = require('koa-body');
const db = require('./models');
const sass = require('./configs/sass.js');
const path = require('path');
const {authenticate, errorHandler} = require('./configs/authenticate');

app.keys = ['secret', 'key'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(router.allowedMethods());

app.use(bodyParser({
   multipart: true,
   urlencoded: true
}));

app.keys = ['Shh, its a secret!'];

app.use(session(CONFIG, app));
// or if you prefer all default config, just use => app.use(session(app));

app.use(async (ctx, next) => {
  if (ctx.request.path.indexOf("assets") < 0) {
    const segments = ctx.request.path.split("/");
    console.log(`Segments...`, segments);
    if (segments.length > 1) {
      ctx.state.activePage = segments[1];
    } else {
      ctx.state.activePage = "";
    }
  }

  await next();
})

app.use(authenticate);
app.use(errorHandler);

new Pug({
  viewPath: path.resolve(__dirname, './views'),
  basedir: path.resolve(__dirname, './views'),
  app: app
})

app.use(sass);
app.use(koastatic(__dirname + '/public'));
app.use(router.routes());

db.sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('  App is running at https://localhost:3000');
      console.log('  Press CTRL-C to stop\n');
    });
  });