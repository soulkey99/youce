"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */

const log4js = require('log4js');
const path = require('path');
const fs = require('co-fs-extra');

const logPath = path.join(__dirname, '../public', 'logs');
fs.ensureDirSync(logPath);

let logType = !!process.env.NODE_ENV ? 'dateFile' : 'console';

log4js.configure({
    appenders: [
        {
            type: logType,
            filename: path.join(logPath, 'http.log'),
            pattern: '_MMddhh.log',
            alwaysIncludePattern: false,
            category: 'http'
        }, {
            type: 'console',
            category: 'console'
        }
    ],
    replaceConsole: true
});

let logger = log4js.getLogger('console');
logger.http = log4js.getLogger('http');

module.exports = logger;


