"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */


exports.getExerciseList = async(ctx, next) => {
    let list = await proxy.Exercise.getList(Object.assign({}, ctx.query, {userID: ctx.session.userID}));
    return result(ctx, {code: 900, list});
};

//获取一个练习的信息
exports.getExercise = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (!e) {
        await next();
    }
    return result(ctx, {code: 900, info: e.toInfo()});
};

//开始一个新的练习
exports.newExercise = async(ctx, next) => {
    let body = ctx.request.body;
    let info = {
        userID: ctx.session.userID,
        grade: body.grade,
        subject: body.subject,
    };
    if (!body.grade) {
        return result(ctx, {code: 904, msg: '缺少grade参数！'})
    }
    if (!body.subject) {
        return result(ctx, {code: 904, msg: '缺少subject参数！'});
    }
    let e = await proxy.Exercise.createNewExercise(info);
    return result(ctx, {code: 900, e_id: e.e_id});
};

//获取练习下一道题
exports.getNextQuestion = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let q_id = await proxy.Exercise.nextQuestion(e_id);
    return result(ctx, {code: 900, q_id});
};

//答题
exports.check = async(ctx, next) => {
    let body = ctx.request.body;
    let param = {
        userID: ctx.session.userID,
        e_id: ctx.params['e_id'],
        q_id: body.q_id,
        choice_id: body.choice_id
    };
    if (!validator.isMongoId(param.e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    if (!validator.isMongoId(body.q_id)) {
        return result(ctx, {code: 904, msg: 'q_id格式错误！'});
    }
    if (!validator.isMongoId(body.choice_id)) {
        return result(ctx, {code: 904, msg: 'choice_id格式错误！'});
    }
    await proxy.Exercise.qCheck(param);
    result(ctx, {code: 900})
};

//获取试卷分析列表
exports.getAnalysisList = async(ctx, next) => {
    let list = await proxy.Exercise.analysisList(Object.assign({}, ctx.query, {userID: ctx.session.userID}));
    return result(ctx, {code: 900, list});
};

//获取试卷分析
exports.getAnalysis = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (e.status != 'finished') {
        return result(ctx, {code: 904, msg: '本次练习尚未完成，无法操作！'});
    }
    let estore = await proxy.Exercise.getEStoreById(e.estore_id);
    return result(ctx, {
        code: 900,
        info: Object.assign({}, estore.toInfo().info.toJSON(), {total_question: estore.questions.length}, {score: e.score})
    });
};

//获取试卷分析列表
exports.getResultList = async(ctx, next) => {
    let list = await proxy.Exercise.resultList(Object.assign({}, ctx.query, {userID: ctx.session.userID}));
    return result(ctx, {code: 900, list});
};

//获取成绩分析
exports.getResult = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (e.status != 'finished') {
        return result(ctx, {code: 904, msg: '本次练习尚未完成，无法操作！'});
    }
    let estore = await proxy.Exercise.getEStoreById(e.estore_id);
    let info = {
        score: e.score,
        average_score: estore.average_score,
        difficulty_list: e.difficulty_list,
        compare_list: estore.compare_list
    };
    return result(ctx, {code: 900, info});
};

//获取排名分析
exports.getRank = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (e.status != 'finished') {
        return result(ctx, {code: 904, msg: '本次练习尚未完成，无法操作！'});
    }
    let info = {
        score: e.score,
        list: [
            {
                school_name: '辽宁省实验中学',
                math_score: 117,
                main_score: 337,
                list: [{
                    year: '2016',
                    total_score: 726,
                    admitted_students: 500
                }, {
                    year: '2015',
                    total_score: 719,
                    admitted_students: 520
                }, {
                    year: '2014',
                    total_score: 718,
                    admitted_students: 496
                }, {
                    year: '2013',
                    total_score: 722,
                    admitted_students: 514
                }, {
                    year: '2012',
                    total_score: 722,
                    admitted_students: 504
                }]
            }, {
                school_name: '东北育才中学',
                math_score: 116,
                main_score: 341,
                list: [{
                    year: '2016',
                    total_score: 721.8,
                    admitted_students: 70
                }, {
                    year: '2015',
                    total_score: 715,
                    admitted_students: 86
                }, {
                    year: '2014',
                    total_score: 714,
                    admitted_students: 56
                }, {
                    year: '2013',
                    total_score: 714,
                    admitted_students: 71
                }, {
                    year: '2012',
                    total_score: 718,
                    admitted_students: 102
                }]
            }, {
                school_name: '沈阳第二十中学',
                math_score: 115,
                main_score: 341,
                list: [{
                    year: '2016',
                    total_score: 720,
                    admitted_students: 450
                }, {
                    year: '2015',
                    total_score: 712,
                    admitted_students: 456
                }, {
                    year: '2014',
                    total_score: 696,
                    admitted_students: 408
                }, {
                    year: '2013',
                    total_score: 713,
                    admitted_students: 437
                }, {
                    year: '2012',
                    total_score: 711,
                    admitted_students: 425
                }]
            }, {
                school_name: '沈阳市第120中学',
                math_score: 114,
                main_score: 338,
                list: [{
                    year: '2016',
                    total_score: 719,
                    admitted_students: 360
                }, {
                    year: '2015',
                    total_score: 711,
                    admitted_students: 349
                }, {
                    year: '2014',
                    total_score: 694,
                    admitted_students: 328
                }, {
                    year: '2013',
                    total_score: 706,
                    admitted_students: 361
                }, {
                    year: '2012',
                    total_score: 710,
                    admitted_students: 359
                }]
            }, {
                school_name: '沈阳第一中学',
                math_score: 115,
                main_score: 327,
                list: [{
                    year: '2016',
                    total_score: 717,
                    admitted_students: 436
                }, {
                    year: '2015',
                    total_score: 709,
                    admitted_students: 416
                }, {
                    year: '2014',
                    total_score: 680,
                    admitted_students: 423
                }, {
                    year: '2013',
                    total_score: 708,
                    admitted_students: 432
                }, {
                    year: '2012',
                    total_score: 709,
                    admitted_students: 408
                }]
            }
        ]
    };
    return result(ctx, {code: 900, info});
};

//获取能力雷达列表
exports.getSkillList = async(ctx, next) => {
    let list = await proxy.Exercise.skillList(Object.assign({}, ctx.query, {userID: ctx.session.userID}));
    return result(ctx, {code: 900, list});
};

//获取能力雷达分析
exports.getSkill = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (e.status != 'finished') {
        return result(ctx, {code: 904, msg: '本次练习尚未完成，无法操作！'});
    }
    let list = e.toObject().skill_list;
    return result(ctx, {code: 900, list});
};

//获取知识点分析列表
exports.getPointList = async(ctx, next) => {
    let list = await proxy.Exercise.pointList(Object.assign({}, ctx.query, {userID: ctx.session.userID}));
    return result(ctx, {code: 900, list});
};

//获取知识点分析
exports.getPoint = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (e.status != 'finished') {
        return result(ctx, {code: 904, msg: '本次练习尚未完成，无法操作！'});
    }
    let point_list = e.toObject().point_list.filter(i => i.type == 'sub_point');
    let list = e.toObject().point_list.filter(i => i.type == 'point');
    for (let i = 0; i < list.length; i++) {
        list[i].list = [];
        for (let j = 0; j < point_list.length; j++) {
            if (list[i].point_id == point_list[j].root_id) {
                list[i].list.push(point_list[j]);
            }
        }
    }
    return result(ctx, {code: 900, list, score: e.score});
};

//获取知识点图谱
exports.getPointGraph = async(ctx, next) => {
    let e_id = ctx.params['e_id'];
    if (!validator.isMongoId(e_id)) {
        return result(ctx, {code: 904, msg: 'e_id格式错误！'});
    }
    let e = await proxy.Exercise.getExerciseById(e_id);
    if (e.status != 'finished') {
        return result(ctx, {code: 904, msg: '本次练习尚未完成，无法操作！'});
    }
    return result(ctx, {code: 900, list: e.toObject().point_list});
};

