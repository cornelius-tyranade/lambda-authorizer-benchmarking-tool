'use strict'

exports.handler = async (event, context) => ({
    "statusCode": 200,
    "body": JSON.stringify(event)
});
