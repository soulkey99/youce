/**
 * Created by MengLei on 2017-03-08.
 */
require('babel-register');
const Koa = require('koa');
const path = require('path');
const http = require('http');
const rest = require('./rest');
const admin = require('./admin');
const config = require('./config');
const convert = require('koa-convert');
const session = require('koa-generic-session');
const MongoStore = require('koa-generic-session-mongo');
const logger = require('./utils/logger').http;

const app = new Koa();

app.use(async(ctx, next) => {
    if (ctx.path.indexOf('/rest') == 0 || ctx.path.indexOf('/admin/rest') == 0) {
        try {
            await next();
        } catch (ex) {
            let info = {code: 905, msg: `服务器内部错误，${ex.message}`};
            let resCode = 500;
            if (ex.code) {
                info.code = ex.code;
                resCode = 400;
            }
            result(ctx, info, resCode);
        }
        if (!ctx.body) {
            result(ctx, {code: 911, msg: '请求的资源不存在！'}, 404);
        }
        logger.trace(`method: ${ctx.method}, status: ${ctx.status}, code: ${ctx.body.code + `${ctx.body.code != 900 ? ', msg: ' + ctx.body.msg : ''}`}, path: ${ctx.path}, has_auth: ${!!ctx.header.auth}, query: ${JSON.stringify(ctx.query)}, body: ${JSON.stringify(ctx.request.body)}`);
//db logger
//         if (!!process.env.NODE_ENV) {
        proxy.Log.httpLog({
            userID: ctx.state.userID,
            reqIP: ctx.header['x-real-ip'] || ctx.ip,
            reqHeader: ctx.header,
            method: ctx.method,
            reqPath: ctx.path,
            reqParams: ctx.params,
            reqQuery: ctx.query,
            reqBody: ctx.request.body,
            resHeader: ctx.response.header,
            resStatus: ctx.status,
            resBody: ctx.body
        });
        // }
    } else {
        logger.trace(ctx.path);
        await next();
    }
});

app.keys = ['keys', 'keykeys'];
app.use(convert(session({
    key: 'sk.youce.session',
    prefix: 'SKYouce:AppServer:Session',
    ttl: 30 * 34 * 3600 * 1000,
    rolling: true,
    store: new MongoStore({url: config.db})
})));

app.use(require('koa-static')(path.join(__dirname, 'public'))); //static path
app.use(async(ctx, next) => {  //auth control
    if (ctx.path.indexOf('/rest/login') >= 0) {
        await next();
    } else if (ctx.path.indexOf('/rest') == 0 && ctx.session.user == undefined) {
        ctx.response.redirect('/redirect.html');
        // return Promise.resolve ();
    } else if (ctx.path.indexOf('/admin/rest') == 0 && ctx.session.user == undefined) {
        ctx.response.redirect('/admin/login.html');
        // return Promise.resolve();
    } else {
        await next();
    }
    // ctx.session.user = {userID: "58c4302406b5812dd4de11eb", ext_id: "aaa"};
    // ctx.session.userID = "58c4302406b5812dd4de11eb";
});

app.use(require('koa-bodyparser')());
app.use(rest.routes());
app.use(admin.routes());


http.createServer(app.callback()).listen(config.port, '0.0.0.0', err => {
    if (err) {
        return console.log(`http server init error: ${err.message}`);
    }
    console.log(`http server listening at port: ${config.port}`);
});

process.on('SIGINT', () => {
    require('mongoose').disconnect();
    logger.fatal('server exit.');
    console.log('[FATAL] server exit.');
    process.exit(1);
});

//import some global constants
global.validator = require('validator');
global.proxy = require('./common/proxy/index');
global.result = require('./utils/result');
global.logger = require('./utils/logger').http;
class BusiError extends Error {
    constructor(code, msg) {
        super(msg);
        this.code = code;
    }
}
global.BusiError = BusiError;
