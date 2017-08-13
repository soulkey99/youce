"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
global.model = require('./../model');

module.exports = {
    User: require('./user'),
    Exercise: require('./exercise'),
    Question: require('./question'),
    Log: require('./other/log')
};

