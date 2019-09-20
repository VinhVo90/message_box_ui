let _ = require('lodash');

let nonAuthorizeUrl = function(url) {
  let arrNonAuthorizeUrl = ['/api/getUserinfo', '/403', '/404', '/'];
  if (url.indexOf("assets") > 0 || arrNonAuthorizeUrl.includes(url)) {
    return true;
  }
  return false;
}

let authenticate = async function(ctx, next) {
  let requestPath = ctx.request.path;
  let user = ctx.session.user;

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
      if (typeof permission == 'undefined') {
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
      await ctx.response.redirect('/404');
    } else {
      const forbidden = ctx.state.forbidden;
      if (forbidden) {
        await ctx.response.redirect('/403');
      }
    }
  } catch (err) {
    await ctx.response.redirect('/404');
  }
}

module.exports = {
  authenticate,
  errorHandler
};