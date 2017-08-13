"use strict";
/**
 * Created by MengLei on 2017-03-12.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseModel = require('../baseModel');

let SessionSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    cookie: {type: Schema.Types.Mixed},
    count: {type: Number},
    sid: {type: String},
    ttl: {type: Date}
}, {timestamps: 1, read: 'sp', id: false, autoIndex: true});

SessionSchema.plugin(BaseModel);

SessionSchema.index({ttl: 1}, {expireAfterSeconds: 3600 * 24 * 30});//一个月有效期，过后自动删除掉

mongoose.model('Session', SessionSchema, 'sessions');

