"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
const Router = require('koa-router')({prefix: '/admin/rest'});

module.exports = Router
    .get('/hello', (ctx, next) => {
        ctx.body = 'admin hello';
    });

