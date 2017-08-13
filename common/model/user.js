"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    ext_id: {type: String, required: true},
    school_id: {type: Schema.Types.ObjectId},
    school_name: {type: String},
    grade: {type: String},
    subject: {type: String}
}, {timestamps: 1, read: 'sp'});

UserSchema.plugin(BaseModel);

UserSchema.virtual('userID').get(function () {
    return this._id.toString();
});

UserSchema.method('toInfo', function () {
    return {
        userID: this._id.toString(),
        ext_id: this.ext_id
    }
});

UserSchema.index({ext_id: 1});

mongoose.model('User', UserSchema, 'users');
