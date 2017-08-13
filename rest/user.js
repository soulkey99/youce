"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
const request = require('request');

//登陆
exports.login = async(ctx, next) => {
    let body = ctx.request.body;
    // let res = await(httpGet(`http://yxjh.sywangda.net/yxjh/pay.action?userid=${body.userid}&token=${body.token}&category=${body.category}`));
    let res = await httpGet('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=218.4.255.255');
    //fake login in debug mode, login success
    if (!body.userid || !body.token) {
        return result(ctx, {code: 904, msg: '缺少userid或者token参数！'});
    }
    let user = await proxy.User.getUserBy3rdId(body.userid);
    if (!user) {
        user = await proxy.User.newUserBy3rdId(body.userid);
    }
    ctx.session.user = user.toInfo();
    ctx.session.userID = user.userID;
    result(ctx, {code: 900, info: user.toInfo()});
};

//获取用户信息
exports.getUserInfo = async(ctx, next) => {
    let userID = ctx.session.userID;
    let user = await proxy.User.getUserById(userID);
    return result(ctx, {code: 900, info: user.toInfo()});
};

//用户注销
exports.logout = async(ctx, next) => {
    ctx.session = {};
    return result(ctx, {code: 900});
};

//promisify request get method
function httpGet(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (err, response, body) => {
            if (err) {
                return reject(err);
            }
            resolve(body);
        });
    });
}