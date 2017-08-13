"use strict";
/**
 * Created by MengLei on 2017-03-12.
 */
const proxy = require('./proxy');

async function exec() {
    let es = await proxy.Exercise.getEStoreById("58c54b7ace0e892e1007dd1b");
    console.log(es);
}


exec();