"use strict";
/**
 * Created by MengLei on 2017-03-12.
 */

/**
 * 根据问题ID获取问题内容
 * @param id
 * @returns {Promise.<Query>}
 */
exports.getQuestionById = async(id) => {
    return await model.Question.findById(id);
};

