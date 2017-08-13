"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */


exports.port = 8010;

//process.env.NODE_ENV = 'test';
//process.env.NODE_ENV = 'production';

exports.db = process.env.NODE_ENV == 'production' ? '' : 'mongodb://127.0.0.1:27017/by_youce_test';


