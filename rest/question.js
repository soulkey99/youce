"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */

//根据问题ID获取问题内容
exports.getQuestion = async(ctx, next) => {
    let q_id = ctx.params['q_id'];
    let q = await proxy.Question.getQuestionById(q_id);
    if (!q) {
        return await next();
    }
    return result(ctx, {code: 900, info: q.toInfo()});
};





