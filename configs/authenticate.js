const _ = require('lodash');

const nonAuthorizeUrl = function(url) {
  const arrNonAuthorizeUrl = ['/api/getUserinfo', '/403', '/404', '/'];
  if (url.indexOf("assets") > 0 || arrNonAuthorizeUrl.includes(url)) {
    return true;
  }
  return false;
}

const authenticate = async function(ctx, next) {
  const requestPath = ctx.request.path;
  const user = ctx.session.user;

  if (nonAuthorizeUrl(requestPath)) {
    await next();
  }
  else if (requestPath == '/login') {
    if (typeof user != 'undefined') {
      ctx.response.redirect(user.permission[0].url);
    } else {
      await next();
    }
  }
  else {
    if (typeof user == 'undefined') {
      ctx.response.redirect('/login');
    } else {
      ctx.state.user = user;
      const segments = ctx.request.path.split("/");
      const name = segments[1];
      const permission = _.find(user['permission'], { name });
      if (typeof permission == 'undefined' && name != 'api') {
        ctx.state.forbidden = true;
      }
      await next();
    }
  }
}

let errorHandler = async function(ctx, next) {
  try {
    await next()
    const status = ctx.status || 404
    if (status == 404) {
      if (!ctx.request.path.endsWith(".map") && !ctx.request.path.endsWith(".ico")) {
        await ctx.response.redirect('/404');
      }
    } else {
      const forbidden = ctx.state.forbidden;
      if (forbidden) {
        await ctx.response.redirect('/403');
      }
    }
  } catch (err) {
    console.log(err);
    ctx.body = {error : err};
  }
}

module.exports = {
  authenticate,
  errorHandler
};