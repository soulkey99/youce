"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
const Router = require('koa-router')({prefix: '/rest'});
// const router = new Router({prefix: '/rest'});
const user = require('./user');
const question = require('./question');
const exercise = require('./exercise');

module.exports = Router
    .get('/hello', (ctx, next) => {
        ctx.session.count = ctx.session.count == undefined ? 0 : ctx.session.count + 1;
        ctx.body = "hello koa 2";
    })
    .get('/login', user.login)
    .post('/login', user.login)
    .post('/logout', user.logout)
    .get('/info', user.getUserInfo)
    .get('/question/:q_id', question.getQuestion)
    .get('/exercise', exercise.getExerciseList)
    .post('/exercise', exercise.newExercise)
    .get('/exercise/:e_id/next', exercise.getNextQuestion)
    .post('/exercise/:e_id/check', exercise.check)
    .get('/exercise/analysis', exercise.getAnalysisList)
    .get('/exercise/:e_id/analysis', exercise.getAnalysis)
    .get('/exercise/result', exercise.getResultList)
    .get('/exercise/:e_id/result', exercise.getResult)
    .get('/exercise/:e_id/rank', exercise.getRank)
    .get('/exercise/skill', exercise.getSkillList)
    .get('/exercise/:e_id/skill', exercise.getSkill)
    .get('/exercise/point', exercise.getPointList)
    .get('/exercise/:e_id/point', exercise.getPoint)
    .get('/exercise/:e_id/pointGraph', exercise.getPointGraph)
    .get('/exercise/:e_id', exercise.getExercise)
    .get('/test', async(ctx, next) => {
        ctx.body = 'test';
        await next();
    });


