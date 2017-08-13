"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

mongoose.connect(config.db, err=> {
    if (err) {
        console.error(`connect to mongodb error: ${err.message}`);
        process.exit(1);
    }
});

mongoose.Promise = require('bluebird');

walkdir(__dirname).forEach(item=> {
    if (path.extname(item) == '.js' && path.basename(item) != 'index.js' && path.basename(item) != 'baseModel.js') {
        require(item);
    }
});

module.exports = mongoose.models;

//遍历指定路径
function walkdir(pa) {
    pa = path.resolve(pa);
    let list = [];
    walk(pa);
    function walk(pa) {
        let s = fs.lstatSync(pa);
        if (!s.isDirectory()) {
            return list.push(pa);
        }
        fs.readdirSync(pa).forEach(item=> {
            walk(path.join(pa, item));
        });
    }

    return list;
}


