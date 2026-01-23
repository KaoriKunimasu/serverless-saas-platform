"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const ddb_1 = require("../lib/ddb");
const response_1 = require("../lib/response");
const logger_1 = require("../lib/logger");
const handler = async (event) => {
    const userId = event.requestContext?.authorizer?.claims?.sub ?? 'local-user';
    const pk = `USER#${userId}`;
    const result = await ddb_1.ddb.send(new lib_dynamodb_1.QueryCommand({
        TableName: ddb_1.TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': pk,
            ':sk': 'ITEM#',
        },
    }));
    (0, logger_1.log)('listItems', { count: result.Count });
    return (0, response_1.ok)(result.Items ?? []);
};
exports.handler = handler;
