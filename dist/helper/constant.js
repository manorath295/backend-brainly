"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secret = void 0;
exports.genrate = genrate;
exports.secret = "secondbrain";
function genrate(len) {
    const provided = "abcdefghijklmnopqrstuvwxyz";
    const length = provided.length;
    let hash = "";
    for (let i = 0; i < len; i++) {
        hash += provided[Math.floor(Math.random() * length)];
    }
    // console.log(hash)
    return hash;
}
