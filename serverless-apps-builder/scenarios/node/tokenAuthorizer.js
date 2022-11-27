'use strict';

exports.handler = function (event, context, callback) {
    var user = 'user:test'
    var token_name = 'authorizationToken'
    var token = event[token_name];

    switch (token) {
        case 'Bearer allow':
            console.log('Returning Allow');
            callback(null, generatePolicy(user, 'Allow', event.methodArn));
            break;
        case 'unauthorized':
            console.log('Returning Unauthorized');
            callback("Unauthorized"); // Return a 401 Unauthorized response
            break;
        default:
            console.log('Returning Error');
            callback("Error: Invalid token"); // Return a 500 Invalid token response
    }
};

// Help function to generate an IAM policy
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
        "stringKey": "This is Lambda Token Authoriser (Node)",
        "authorizerTimestamp": +new Date
    };
    return authResponse;
}