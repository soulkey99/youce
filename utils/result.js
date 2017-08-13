"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
module.exports = function (ctx, content, code) {
    ctx.set('Content-Type', 'application/json;charset=UTF-8');
    ctx.set('Cache-control', 'no-cache');
    if (!code) {
        switch (content.code) {
            case 900:
                ctx.status = 200;
                break;
            case 911:
                ctx.status = 404;
                break;
            default:
                ctx.status = 400;
                break;
        }
    } else {
        ctx.status = code || 200;
    }
    // ctx.status = 200;
    // 针对iOS新需求，将所有的oss请求替换为https，安卓不变
    //if (ctx.header.platform && ctx.header.platform.toLowerCase() == 'ios') {
        //content = JSON.parse(JSON.stringify(content).replace());
   //}
    ctx.body = content;
};
