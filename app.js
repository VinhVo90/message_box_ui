// app.js
const Koa = require('koa');
var Pug = require('koa-pug');
const app = new Koa();
const router = require('./routes/index.js');
const koastatic = require('koa-static');
var bodyParser = require('koa-body');
const db = require('./models');
const sass = require('./configs/sass.js');
const path = require('path');

app.use(router.allowedMethods());

app.use(bodyParser({
   multipart: true,
   urlencoded: true
}));

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