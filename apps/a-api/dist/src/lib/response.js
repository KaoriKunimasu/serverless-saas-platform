"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badRequest = exports.ok = void 0;
const ok = (body) => ({
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});
exports.ok = ok;
const badRequest = (message) => ({
    statusCode: 400,
    body: JSON.stringify({ message }),
});
exports.badRequest = badRequest;
