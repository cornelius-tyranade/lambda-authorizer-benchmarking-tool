'use strict';

exports.handler = function (event, context, callback) {
    var queryStringParameters = event.queryStringParameters;

    if (queryStringParameters.QueryString1 === "queryValue1") {
        callback(null, generateAllow('user:test', event.methodArn));
    }
    callback("Unauthorized");
}

// Helper function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource) {
    // Required output:
    var authResponse = {};
    authResponse.principalId = principalId;

    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "This is Lambda Request Authoriser (Node)",
        "booleanKey": true
    };
    return authResponse;
}

var generateAllow = function (principalId, resource) {
    return generatePolicy(principalId, 'Allow', resource);
}