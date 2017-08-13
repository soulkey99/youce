"use strict";
/**
 * Created by MengLei on 2017-03-12.
 */

/**
 * 根据ID获取一个练习的记录
 * @param id
 * @returns {Promise.<Query>}
 */
exports.getExerciseById = async(id) => {
    return await model.Exercise.findById(id);
};

/**
 * 根据id获取题库记录
 * @param id
 * @returns {Promise.<Query>}
 */
exports.getEStoreById = async(id) => {
    return await model.EStore.findById(id);
};

/**
 * 根据条件获取练习的列表
 * @param param
 * @returns {Promise.<QueryCursor|Array|*|{}>}
 */
exports.getList = async(param) => {
    let query = {};
    let start = 0;
    let count = Number.parseInt(param.limit || '10');
    if (param.start) {
        start = Number.parseInt(param.start) - 1;
    }
    if (start < 0) {
        start = 0;
    }
    if (param.userID) {
        query['userID'] = param.userID;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    if (param.status) {
        query['status'] = param.status.split(',');
    }
    let res = await model.Exercise.find(query).sort({createdAt: -1}).skip(start).limit(count);
    return res.map(i => i.toListItem());
};

/**
 * 根据年级学科创建一个新的练习
 * @param info = {userID: '', subject: '', grade: ''}
 * @returns {Promise.<Promise|*>}
 */
exports.createNewExercise = async(info) => {
    let e = new (model.Exercise)();
    await model.Exercise.update({userID: info.userID, status: 'pending'}, {$set: {status: 'cancel'}});
    e.userID = info.userID;
    e.grade = info.grade;
    e.subject = info.subject;
    let estore = await model.EStore.findOne({grade: info.grade, subject: info.subject});
    e.estore_id = estore.estore_id;
    e.questions = estore.questions.map(item => item.q_id);
    return await e.save();
};

/**
 * 获取下一道未作答的题目ID
 * @param e_id
 * @returns {Promise.<*>}
 */
exports.nextQuestion = async(e_id) => {
    let e = await model.Exercise.findById(e_id);
    if (e.status == 'finished') {
        return "";
    }
    let es = await model.EStep.findOne({e_id: e_id}).sort({createdAt: -1});
    if (!es) {
        return e.questions[0];
    }
    for (let i = 0; i < e.questions.length - 1; i++) {
        if (e.questions[i].toString() == es.q_id.toString()) {
            return e.questions[i + 1];
        }
    }
    await e.calculate();
    await model.Exercise.findByIdAndUpdate(e_id, {$set: {status: 'finished'}}, {new: true});
    return "";
};

/**
 * 答题
 * @param param = {userID: '', e_id: '', q_id: '', choice_id: ''}
 * @returns {Promise.<Promise|*>}
 */
exports.qCheck = async(param) => {
    let q = await model.Question.findById(param.q_id);
    let e = await model.Exercise.findById(param.e_id);
    if (e.status == 'finished') {
        throw new BusiError(904, "该练习已经结束");
    }
    let estore = await model.EStore.findById(e.estore_id);
    let es = await model.EStep.findOne({userID: param.userID, e_id: param.e_id, q_id: param.q_id});
    if (!es) {
        es = new (model.EStep)();
        es.userID = param.userID;
        es.e_id = param.e_id;
        es.q_id = param.q_id;
    }
    es.choice_id = param.choice_id;
    es.correct = !!q.choice.id(param.choice_id).correct;
    for (let i = 0; i < estore.questions.length; i++) {
        if (estore.questions[i].q_id.toString() == q.q_id) {
            es.score = es.correct ? estore.questions[i].score : 0;
        }
    }
    for (let i = 0; i < e.questions.length; i++) {
        if (param.q_id == e.questions[i].toString()) {
            if (i == e.questions.length - 1) { //本次练习结束，可以开始计算结果了
                await e.calculate();
                e.status = 'finished';
                await e.save();
            }
        }
    }
    return await es.save();
};

/**
 * 历史测试的试卷分析列表
 * @param param = {start: '', limit: '', grade: '', subject: ''}
 * @returns {Promise.<Array>}
 */
exports.analysisList = async function (param) {
    let query = {status: 'finished'};
    let start = 0;
    let count = Number.parseInt(param.limit || '10');
    if (param.start) {
        start = Number.parseInt(param.start) - 1;
    }
    if (start < 0) {
        start = 0;
    }
    if(param.userID){
        query['userID'] = param.userID;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    let res = await model.Exercise.find(query).sort({createdAt: -1}).skip(start).limit(count);
    let list = [];
    for (let i = 0; i < res.length; i++) {
        let estore = await model.EStore.findById(res[i].estore_id);
        let item = estore.toInfo().info.toObject();
        item.e_id = res[i].e_id;
        item.grade = res[i].grade;
        item.subject = res[i].subject;
        list.push(item);
    }
    return list;
};

/**
 * 获取成绩分析列表
 * @param param = {start: '', limit: '', grade: '', subject: ''}
 * @returns {Promise.<Array>}
 */
exports.resultList = async(param) => {
    let query = {status: 'finished'};
    let start = 0;
    let count = Number.parseInt(param.limit || '10');
    if (param.start) {
        start = Number.parseInt(param.start) - 1;
    }
    if (start < 0) {
        start = 0;
    }
    if(param.userID){
        query['userID'] = param.userID;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    let res = await model.Exercise.find(query).sort({createdAt: -1}).skip(start).limit(count);
    let list = [];
    for (let i = 0; i < res.length; i++) {
        let estore = await model.EStore.findById(res[i].estore_id);
        let item = {
            e_id: res[i].e_id,
            grade: res[i].grade,
            subject: res[i].subject,
            score: res[i].score,
            average_score: estore.average_score,
            difficulty_list: res[i].difficulty_list,
            compare_list: estore.compare_list
        };
        list.push(item);
    }
    return list;
};

/**
 * 获取能力雷达列表
 * @param param = {start: '', limit: '', grade: '', subject: ''}
 * @returns {Promise.<QueryCursor|*|{}|Array>}
 */
exports.skillList = async(param) => {
    let query = {status: 'finished'};
    let start = 0;
    let count = Number.parseInt(param.limit || '10');
    if (param.start) {
        start = Number.parseInt(param.start) - 1;
    }
    if (start < 0) {
        start = 0;
    }
    if(param.userID){
        query['userID'] = param.userID;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    let res = await model.Exercise.find(query).sort({createdAt: -1}).skip(start).limit(count);
    return res.map(i => ({
        e_id: i.e_id,
        grade: i.grade,
        subject: i.subject,
        score: i.score,
        list: i.toObject().skill_list
    }));
};

/**
 * 获取知识点分析列表
 * @param param = {start: '', limit: '', grade: '', subject: ''}
 * @returns {Promise.<QueryCursor|*|{}|Array>}
 */
exports.pointList = async(param) => {
    let query = {status: 'finished'};
    let start = 0;
    let count = Number.parseInt(param.limit || '10');
    if (param.start) {
        start = Number.parseInt(param.start) - 1;
    }
    if (start < 0) {
        start = 0;
    }
    if(param.userID){
        query['userID'] = param.userID;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    let res = await model.Exercise.find(query).sort({createdAt: -1}).skip(start).limit(count);
    return res.map(i => ({
        e_id: i.e_id,
        grade: i.grade,
        subject: i.subject,
        score: i.score,
        list: i.toObject().point_list
    }));
};




