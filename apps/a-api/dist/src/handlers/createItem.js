"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const ddb_1 = require("../lib/ddb");
const response_1 = require("../lib/response");
const zod_1 = require("zod");
const logger_1 = require("../lib/logger");
const schema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    amount: zod_1.z.number().positive(),
});
const handler = async (event) => {
    if (!event.body)
        return (0, response_1.badRequest)('Missing body');
    const parsed = schema.safeParse(JSON.parse(event.body));
    if (!parsed.success)
        return (0, response_1.badRequest)('Invalid input');
    const userId = event.requestContext?.authorizer?.claims?.sub ?? 'local-user';
    const itemId = crypto.randomUUID();
    const item = {
        pk: `USER#${userId}`,
        sk: `ITEM#${itemId}`,
        ...parsed.data,
        createdAt: new Date().toISOString(),
    };
    (0, logger_1.log)('createItem', item);
    await ddb_1.ddb.send(new lib_dynamodb_1.PutCommand({
        TableName: ddb_1.TABLE_NAME,
        Item: item,
    }));
    return (0, response_1.ok)(item);
};
exports.handler = handler;
