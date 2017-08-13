"use strict";
/**
 * Created by MengLei on 2017-03-08.
 */
/**
 * 记录HTTP Log
 * @param param = {userID: '', reqHeader: '', method: '', reqPath: '', reqParams: '', reqQuery: '', reqBody: '', resHeader: '', resStatus: '', resBody: ''}
 */
exports.httpLog = function (param) {
    let log = new (model.HttpLog)();
    if (param.userID) {
        log.userID = param.userID;
    }
    log.reqIP = param.reqIP;
    log.reqHeader = param.reqHeader;
    log.method = param.method;
    log.reqPath = param.reqPath;
    log.reqParams = param.reqParams;
    log.reqQuery = param.reqQuery;
    log.reqBody = param.reqBody;
    log.resHeader = param.resHeader;
    log.resStatus = param.resStatus;
    log.resBody = param.resBody;
    log.save(err=> {
        if (err) {
            //
        }
    });
};


/**
 * 记录用户行为Log
 * @param info = {userID: '', action: '', content: {}}
 */
exports.userLog = function (info) {
    let log = new (model.UserLog)();
    log.userID = info.userID;
    log.action = info.action;
    log.content = info.content;
    if (log.content.ip) {
        let str = log.content.ip;
        if (/^(?:(?:[0-9a-fA-F:]){1,4}(?:(?::(?:[0-9a-fA-F]){1,4}|:)){2,7})+/g.test(str)) {
            log.content.ip = str.slice(str.lastIndexOf(':') + 1, str.length);
        }
    }
    log.save();
};