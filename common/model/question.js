"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');
const Schema = mongoose.Schema;

//问题和选项都使用一个html片段来进行格式化展示，这样可以保证图文混排的展示方式比较简单
let ChoiceSchema = new Schema({
    content: {type: String, default: ''},   //选项内容
    action: {type: String},  //选项类型（next：下一题，question：提示审题，hint：弹hint字段，result：到结果页）
    correct: {type: Boolean},   //是否正确答案
    flag: {type: String, default: ''},  //标识
    hint: {type: String, default: ''},  //提示
    next: {type: Schema.Types.ObjectId}   //下一题id
});

let QuestionSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    root_id: {type: Schema.Types.ObjectId}, //如果是过程或者结论，那么它属于的题干的id，题干没有此字段
    next: {type: Schema.Types.ObjectId},    //如果是根，那么下一步要进行的题目id
    type: {type: String, default: 'root'}, //类型，question普通选择题，root分步式题干，step分步式解题步骤
    grade: {type: String, required: true},
    subject: {type: String, required: true},
    content: {type: String, default: ''},  //内容
    choice: {type: [ChoiceSchema], default: []},    //选项
    point: {type: [Schema.Types.Mixed], default: []},     //相关知识点list
    skill: {type: [Schema.Types.Mixed], default: []},       //考察技能list
    difficulty: {type: Number, default: 1},     //题目难度
    score: {type: Number, default: 0},  //题目分数
    remark: {type: String, default: ''}     //备注
}, {timestamps: 1, read: 'sp', id: false});

let SkillSchema = new Schema({   //能力
    _id: {type: Schema.Types.ObjectId},
    grade: {type: String, required: true},
    subject: {type: String, required: true},
    content: {type: String, default: ''},
    remark: {type: String, default: ''},
    difficulty: {type: Number},
    key1: {type: String},
    key2: {type: String},
    key3: {type: String},
    key4: {type: String}
}, {timestamps: 1, read: 'sp', id: false});

//知识点
let PointSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    //类型：point：一级知识点，sub_point：二级知识点，item：三级知识点，sub_item：四级知识点
    type: {type: String, enum: ['point', 'sub_point', 'item', 'sub_item'], required: true},
    grade: {type: String},
    subject: {type: String},
    content: {type: String, required: true},
    remark: {type: String, default: ''},
    parent_id: {type: Schema.Types.ObjectId},    //上级ID
    root_id: {type: Schema.Types.ObjectId},   //一级知识点ID
    sub_id: {type: Schema.Types.ObjectId},    //二级知识点ID
    group: {type: String},
    difficulty: {type: Number},   //难度
    exam_score: {type: Number},   //中考分值
    seq: {type: Number, default: 1}
}, {timestamps: 1, id: false});

QuestionSchema.plugin(BaseModel);
SkillSchema.plugin(BaseModel);
PointSchema.plugin(BaseModel);

QuestionSchema.virtual('q_id').get(function () {
    return this._id.toString()
});
SkillSchema.virtual('skill_id').get(function () {
    return this._id.toString();
});
PointSchema.virtual('point_id').get(function () {
    return this._id.toString();
});

QuestionSchema.method('toInfo', function () {
    return {
        q_id: this._id.toString(),
        grade: this.grade,
        subject: this.subject,
        content: this.content,
        choice: this.choice,
        skill: this.skill,
        point: this.point,
        difficulty: this.difficulty,
        score: this.score,
        remark: this.remark
    }
});

PointSchema.method('toInfo', function () {
    let item = {
        point_id: this.point_id,
        type: this.type,
        grade: this.grade,
        subject: this.subject,
        content: this.content,
        remark: this.remark,
        group: this.group,
        parent_id: this.parent_id ? this.parent_id.toString() : '',
        root_id: this.root_id ? this.root_id.toString() : '',
        sub_id: this.sub_id ? this.sub_id.toString() : '',
        seq: this.seq
    };
    if (item.type == 'sub_point') {
        item.difficulty = this.difficulty;
        item.exam_score = this.exam_score;
    }
    return item;
});

SkillSchema.method('toInfo', function () {
    return {
        skill_id: this.skill_id,
        grade: this.grade,
        subject: this.subject,
        content: this.content,
        remark: this.remark,
        difficulty: this.difficulty,
        key1: this.key1,
        key2: this.key2,
        key3: this.key3,
        key4: this.key4
    }
});

PointSchema.method('toPoint', async function () {
    if (this.parent_id) {
        return await getRoot(this.parent_id);
    } else {
        return this;
    }
    async function getRoot(id) {
        let p = await model.wxdemo2Point.findById(id);
        if (p.parent_id) {
            return await getRoot(p.parent_id);
        } else {
            return p;
        }
    }
});

PointSchema.method('toSubPoint', async function () {
    if (this.type == 'sub_point') {
        return this;
    } else {
        return await getSubPoint(this.parent_id);
    }
    async function getSubPoint(id) {
        let p = await model.wxdemo2Point.findById(id);
        if (p.type == 'sub_point') {
            return p;
        } else {
            return await getSubPoint(p.parent_id);
        }
    }
});

PointSchema.method('toFullSubList', async function () {
    let sub_point = await this.toSubPoint();
    return await getFullSubList();
    async function getFullSubList() {
        let list = [];
        list.push(sub_point.toInfo());
        let items = await model.wxdemo2Point.find({parent_id: sub_point.point_id});
        for (let j = 0; j < items.length; j++) {
            list.push(items[j].toInfo());
            let sub_items = await model.wxdemo2Point.find({parent_id: items[j].point_id});
            for (let k = 0; k < sub_items.length; k++) {
                list.push(sub_items[k].toInfo());
            }
        }
        return list;
    }
});

PointSchema.method('toFullList', async function () {
    let root = await this.toPoint();
    return await getFullList(root.point_id);
    async function getFullList(root_id) {
        let list = [];
        let root = await model.wxdemo2Point.findById(root_id);
        list.push(root.toInfo());
        let sub_points = await model.wxdemo2Point.find({parent_id: root.point_id});
        for (let i = 0; i < sub_points.length; i++) {
            list.push(sub_points[i].toInfo());
            let items = await model.wxdemo2Point.find({parent_id: sub_points[i].point_id});
            for (let j = 0; j < items.length; j++) {
                list.push(items[j].toInfo());
                let sub_items = await model.wxdemo2Point.find({parent_id: items[j].point_id});
                for (let k = 0; k < sub_items.length; k++) {
                    list.push(sub_items[k].toInfo());
                }
            }
        }
        return list;
    }
});

mongoose.model('Question', QuestionSchema, 'question');
mongoose.model('Skill', SkillSchema, 'skill');
mongoose.model('Point', PointSchema, 'point');

