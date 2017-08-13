"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */

/**
 * 根据userID获取用户记录
 * @param id
 * @returns {Promise.<Query>}
 */
exports.getUserById = async(id) => {
    return await model.User.findById(id);
};

/**
 * 根据第三方的userid获取本地数据库用户记录
 * @param id
 * @returns {Promise.<*|Query>}
 */
exports.getUserBy3rdId = async(id) => {
    return await model.User.findOne({ext_id: id});
};

/**
 * 根据第三方userid创建新用户
 * @param id
 * @returns {Promise.<Promise|*>}
 */
exports.newUserBy3rdId = async(id) => {
    let user = new (model.User)();
    user.ext_id = id;
    return await user.save();
};


