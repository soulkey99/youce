"use strict";
/**
 * Created by MengLei on 2017-03-12.
 */

const mongoose = require('mongoose');
const BaseModel = require('./baseModel');
const Schema = mongoose.Schema;

//练习中的步骤
let EStepSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    userID: {type: Schema.Types.ObjectId, required: true},
    e_id: {type: Schema.Types.ObjectId, required: true},
    q_id: {type: Schema.Types.ObjectId, required: true},
    choice_id: {type: Schema.Types.ObjectId, required: true},
    score: {type: Number, required: true},
    correct: {type: Boolean, required: true},
}, {timestamps: 1, read: 'sp', id: false});

//一次练习
let ResultSchema = new Schema({  //难度结果model
    difficulty: {type: Number, default: 0},  //难度
    quantity: {type: Number, default: 0},   //题目数
    score: {type: Number, default: 0},   //得分
    correct: {type: Number, default: 0}   //正确数
}, {_id: false});
let PointItemSchema = new Schema({   //知识点结果model
    point_id: {type: String},
    grade: {type: String, required: true},
    subject: {type: String, required: true},
    type: {type: String},
    content: {type: String},
    remark: {type: String},
    parent_id: {type: String},
    group: {type: String},
    root_id: {type: String},
    sub_id: {type: String},
    seq: {type: Number},
    quantity: {type: Number},
    correct: {type: Number},
    total_score: {type: Number},
    difficulty: {type: Number},
    score: {type: Number},
    exam_score: {type: Number}
}, {_id: false});
let SkillItemSchema = new Schema({   //技能结果model
    skill_id: {type: String},
    grade: {type: String, required: true},
    subject: {type: String, required: true},
    content: {type: String},
    remark: {type: String},
    quantity: {type: Number},
    correct: {type: Number},
    total_score: {type: Number},
    score: {type: Number},
    difficulty: {type: Number},
    current: {type: Number},
    suggest: {type: Number},
    time: {type: Number},
    key: {type: String}
}, {_id: false});
let ExerciseSchema = new Schema({  //一次练习
    _id: {type: Schema.Types.ObjectId},
    userID: {type: Schema.Types.ObjectId, required: true},
    grade: {type: String, required: true},
    subject: {type: String, required: true},
    estore_id: {type: Schema.Types.ObjectId, required: true},
    questions: {type: [Schema.Types.ObjectId], default: []}, //本次练习需要作答的题目列表
    status: {type: String, default: 'pending'},
    score: {type: Number, default: 0},
    difficulty_list: {
        type: [ResultSchema],
        default: [
            {difficulty: 1, quantity: 0, score: 0, correct: 0},
            {difficulty: 2, quantity: 0, score: 0, correct: 0},
            {difficulty: 3, quantity: 0, score: 0, correct: 0},
            {difficulty: 4, quantity: 0, score: 0, correct: 0}
        ]
    },
    point_list: {type: [PointItemSchema], default: []},
    skill_list: {type: [SkillItemSchema], default: []}
}, {timestamps: 1, read: 'sp', id: false});

let EStoreItemSchema = new Schema({  //题库题目item
    q_id: {type: Schema.Types.ObjectId, required: true},
    score: {type: Number, required: true}
}, {id: false});
let EStorePointItemSchema = new Schema({   //知识点item
    point_id: {type: Schema.Types.ObjectId, required: true},
    content: {type: String},
    total: {type: Number, default: 0}
});
let EStoreInfoSchema = new Schema({   //题库题目整体信息(试卷分析)
    total_score: {type: Number, required: true},
    point_quantity: {type: Number, required: true},
    coverage: {type: Number, required: true},
    total_difficulty: {type: Number, required: true},
    point: {type: [EStorePointItemSchema], default: []},
    history_point: {type: [EStorePointItemSchema], default: []}
});
let CompareListItemSchema = new Schema({
    type: {type: String, required: true},
    list: {
        type: [new Schema({difficulty: {type: Number, required: true}, rate: {type: Number, required: true}})],
        default: []
    }
});
let EStoreSchema = new Schema({   //练习题库
    _id: {type: Schema.Types.ObjectId},
    grade: {type: String, required: true},
    subject: {type: String, required: true},
    average_score: {type: Number, required: true},
    questions: {type: [EStoreItemSchema], default: []},
    info: {type: EStoreInfoSchema, required: true},  //试卷分析记录
    compare_list: {type: [CompareListItemSchema], default: []},   //对照组成绩情况
    valid: {type: Boolean, default: true}
}, {timestamps: 1, read: 'sp', id: false, _id: false});

EStepSchema.plugin(BaseModel);
ExerciseSchema.plugin(BaseModel);
EStoreSchema.plugin(BaseModel);

EStoreSchema.virtual('step_id').get(function () {
    return this._id.toString()
});

ExerciseSchema.virtual('e_id').get(function () {
    return this._id.toString();
});

EStoreSchema.virtual('estore_id').get(function () {
    return this._id.toString();
});

ExerciseSchema.method('calculate', async function () {
    let steps = await model.EStep.find({e_id: this.e_id});
    this.difficulty_list = [
        {difficulty: 1, quantity: 0, score: 0, correct: 0},
        {difficulty: 2, quantity: 0, score: 0, correct: 0},
        {difficulty: 3, quantity: 0, score: 0, correct: 0},
        {difficulty: 4, quantity: 0, score: 0, correct: 0}
    ];
    this.point_list = [];
    this.skill_list = [];
    this.score = 0;

    let point_obj = {};
    let skill_obj = {};
    for (let i = 0; i < steps.length; i++) {    //进行成绩分析，统计总得分以及各个难度题目的数量及得分情况
        let q = await model.Question.findById(steps[i].q_id);
        for (let j = 0; j < this.difficulty_list.length; j++) {
            if (q.difficulty == this.difficulty_list[j].difficulty) {
                this.difficulty_list[j].difficulty++;
                this.difficulty_list[j].score += q.score;
                stat(q);  //统计数据
                if (steps[i].correct) {
                    this.difficulty_list[i].correct++;
                    this.score += q.score;
                    calc(q);  //计算正确题目的数据
                }
            }
        }
    }
    function stat(q) {
        for (let i = 0; i < q.point.length; i++) {
            if (!point_obj[q.point[i].toString()]) {
                point_obj[q.point[i].toString()] = {quantity: 0, correct: 0, total_score: 0, score: 0};
            }
            point_obj[q.point[i].toString()].quantity++;
            point_obj[q.point[i].toString()].total_score += q.score;
        }
        for (let i = 0; i < q.skill.length; i++) {
            if (!skill_obj[q.skill[i].toString()]) {
                skill_obj[q.skill[i].toString()] = {quantity: 0, correct: 0, total_score: 0, score: 0};
            }
            skill_obj[q.skill[i].toString()].quantity++;
            skill_obj[q.skill[i].toString()].total_score += q.score;
        }
    }

    function calc(q) {
        for (let i = 0; i < q.point.length; i++) {
            if (!point_obj[q.point[i].toString()]) {
                point_obj[q.point[i].toString()] = {quantity: 0, correct: 0, total_score: 0, score: 0};
            }
            point_obj[q.point[i].toString()].correct++;
            point_obj[q.point[i].toString()].score += q.score;
        }
        for (let i = 0; i < q.skill.length; i++) {
            if (!skill_obj[q.skill[i].toString()]) {
                skill_obj[q.skill[i].toString()] = {quantity: 0, correct: 0, total_score: 0, score: 0};
            }
            skill_obj[q.skill[i].toString()].correct++;
            skill_obj[q.skill[i].toString()].score += q.score;
        }
    }

    let points = await model.Point.find({grade: this.grade, subject: this.subject});
    let point_list = points.map(i => {
        let item = i.toInfo();
        item.quantity = 0;
        item.correct = 0;
        item.total_score = 0;
        item.score = 0;
        return item;
    });
    for (let i = 0; i < point_list.length; i++) {
        if (point_obj[point_list[i].point_id]) {
            if (point_list[i].type == 'item') {
                point_list[i].quantity = point_obj[point_list[i].point_id].quantity;
                point_list[i].correct = point_obj[point_list[i].point_id].correct;
                point_list[i].total_score = point_obj[point_list[i].point_id].total_score;
                point_list[i].score = point_obj[point_list[i].point_id].score;
            }
            for (let j = 0; j < point_list.length; j++) {
                if (point_list[i].root_id == point_list[j].point_id) {
                    point_list[j].quantity += point_list[i].quantity;
                    point_list[j].correct += point_list[i].correct;
                    point_list[j].total_score += point_list[i].total_score;
                    point_list[j].score += point_list[i].score;
                }
                if (point_list[i].sub_id == point_list[j].point_id) {
                    point_list[j].quantity += point_list[i].quantity;
                    point_list[j].correct += point_list[i].correct;
                    point_list[j].total_score += point_list[i].total_score;
                    point_list[j].score += point_list[i].score;
                }
            }
        }
    }
    this.point_list = point_list;
    let skills = await model.Skill.find({grade: this.grade, subject: this.subject});
    let skill_list = skills.map(i => {
        let item = i.toInfo();
        item.quantity = 0;
        item.correct = 0;
        item.total_score = 0;
        item.score = 0;
        item.suggest = 0;
        item.time = 0;
        return item;
    });
    for (let i = 0; i < skill_list.length; i++) {
        if (skill_obj[skill_list[i].skill_id]) {
            skill_list[i].quantity = skill_obj[skill_list[i].skill_id].quantity;
            skill_list[i].correct = skill_obj[skill_list[i].skill_id].correct;
            skill_list[i].total_score = skill_obj[skill_list[i].skill_id].total_score;
            skill_list[i].score = skill_obj[skill_list[i].skill_id].score;
            if (skill_list[i].quantity != 0) {
                let current = Number.parseInt((skill_list[i].correct / skill_list[i].quantity * 100).toFixed(0));
                if (current > 80) {
                    skill_list[i].key = skill_list[i].key4;
                } else if (current > 60) {
                    skill_list[i].key = skill_list[i].key3;
                } else if (current > 40) {
                    skill_list[i].key = skill_list[i].key2;
                } else {
                    skill_list[i].key = skill_list[i].key1;
                }
                skill_list[i].suggest = current * (1 + skill_list[i].difficulty / 4);
                if (skill_list[i].suggest > 100) {
                    skill_list[i].suggest = 100;
                }
                skill_list[i].current = current;
                skill_list[i].time = skill_list[i].suggest - current;
            }
        }
    }
    this.skill_list = skill_list;
    return await this.save();
});

ExerciseSchema.method('toInfo', function () {
    return {
        e_id: this._id.toString(),
        userID: this.userID.toString(),
        grade: this.grade,
        subject: this.subject,
        estore_id: this.estore_id.toString(),
        questions: this.questions,
        status: this.status,
        score: this.score,
        creatdAt: this.creatdAt
    }
});

ExerciseSchema.method('toListItem', function () {
    return {
        e_id: this._id.toString(),
        estore_id: this.estore_id.toString(),
        grade: this.grade,
        subject: this.subject,
        status: this.status,
        score: this.score,
        createdAt: this.createdAt
    }
});

EStoreInfoSchema.method('toInfo', function () {
    return {
        total_score: this.total_score,
        point_quantity: this.point_quantity,
        coverage: this.coverage,
        total_difficulty: this.total_difficulty,
        point: this.point,
        history_point: this.history_point
    }
});

EStoreSchema.method('toInfo', function () {
    return {
        estore_id: this._id.toString(),
        grade: this.grade,
        subject: this.subject,
        average_score: this.average_score,
        info: this.info,
        compare_list: this.compare_list
    };
});

mongoose.model('EStep', EStepSchema, 'estep');
mongoose.model('Exercise', ExerciseSchema, 'exercise');
mongoose.model('EStore', EStoreSchema, 'estore');
