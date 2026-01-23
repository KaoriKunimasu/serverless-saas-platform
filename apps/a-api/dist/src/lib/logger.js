"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const log = (message, data) => {
    console.log(JSON.stringify({ message, data }));
};
exports.log = log;
