const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require("fs");
const config = require('config');
const replace = require('replace-in-file');
const shell = require('shelljs');

// Global const
const program = new Command();
const artilleryDuration = config.get('artillery.duration');
const artilleryRate = config.get('artillery.rate');
const logsInsightTimeRange = config.get('logsInsight.timeRange');
const waitTimeQuery = config.get('logsInsight.waitTimeQuery');

// Initialize program
program
    .name('labt')
    .description('===================================\nLambda Authorizer Benchmarking Tool\n===================================')
    .version('1.0.0', '-v, --version', 'display version')
    .option('-c, --clean', 'remove current stack if exist')
    .option('-d, --deploy', 'start the deployment process')
    .option('-t, --test [identifers...]', 'start the performance test')
    .option('-r, --report [identifers...]', 'generate Artillery performance test report in HTML')
    .option('-li, --logs-insight [identifers...]', 'generate AWS CloudWatch logs insight query result in JSON');

program.parse(process.argv);

const options = program.opts();

// Check required system application
checkSystemApplication('aws', 'AWS CLI is required for this script.')
checkSystemApplication('sam', 'AWS SAM is required for this script.')
checkSystemApplication('artillery', 'Artillery Framework is required for this script.')

// Option clean
doOptionClean(options.clean);

//Option deploy
doOptionDeploy(options.deploy);

//Option test
doOptionTest(options.test);

//Option report
doOptionReport(options.report);

//Option logs insight
doOptionLogsInsight(options.logsInsight);

/* 
    ======================
    Helper methods section 
    ======================
*/

function checkSystemApplication(appName, errorMessage) {
    if (!shell.which(appName)) {
        shell.echo(errorMessage);
        shell.exit(1);
    }
}

function executeShell(command, errorMessage) {
    if (shell.exec(command).code !== 0) {
        shell.echo(errorMessage);
        shell.exit(1);
    }
}

function doOptionClean(isClean) {
    if (isClean) {
        executeShell('cd serverless-apps-builder && sam delete --no-prompts > logs/stage_delete.txt', 'Error: SAM delete failed');
    }
}

function doOptionDeploy(isDeploy) {
    if (isDeploy) {
        executeShell('cd serverless-apps-builder && sam build > logs/stage_build.txt', 'Error: SAM build failed');
        executeShell('cd serverless-apps-builder && sam deploy --no-confirm-changeset > logs/stage_deploy.txt', 'Error: SAM deploy failed');
        executeShell('aws cloudformation describe-stacks --stack-name lambda-authorizer-benchmarking-tool --query \'Stacks[0].Outputs[].OutputValue\' --output json > serverless-apps-builder/logs/urls.json', 'Error: AWS CLI describe stacks for URLS failed');
        executeShell('aws cloudformation describe-stacks --stack-name lambda-authorizer-benchmarking-tool --query \'Stacks[0].Outputs[].OutputKey\' --output json > serverless-apps-builder/logs/identifiers.json', 'Error: AWS CLI describe stacks for identifiers failed');
    }
}

function doOptionTest(inputParam) {
    if (inputParam) {
        let { urlsJson, identifiersJson } = getUrlsAndIdentifiersJSON(inputParam);;
        copyArtilleryTemplate(urlsJson, identifiersJson);
        replaceArtilleryTemplate(urlsJson, identifiersJson);
        runArtilleryTest(urlsJson, identifiersJson);
    }
}

function getUrlsAndIdentifiersJSON(inputParam) {
    let urlsJson = null;
    let identifiersJson = null;
    let inputParamValues = isIterable(inputParam) ? [...inputParam] : null;
    let urlsJsonTemp = [];
    let identifiersJsonTemp = [];

    try {
        let urlsString = fs.readFileSync("serverless-apps-builder/logs/urls.json");
        urlsJson = JSON.parse(urlsString);

        let identifiersString = fs.readFileSync("serverless-apps-builder/logs/identifiers.json");
        identifiersJson = JSON.parse(identifiersString);

        if (inputParamValues) {
            for (let i = 0; i < identifiersJson.length; i++) {
                if (inputParamValues.includes(identifiersJson[i])) {
                    urlsJsonTemp.push(urlsJson[i]);
                    identifiersJsonTemp.push(identifiersJson[i]);
                }
            }
            urlsJson = [...urlsJsonTemp];
            identifiersJson = [...identifiersJsonTemp];
        }
    } catch (err) {
        console.error('Error: parse urls.json and identifers.json failed');
        throw err;
    }

    return {
        'urlsJson': urlsJson,
        'identifiersJson': identifiersJson
    }
}

function isIterable(object) {
    if (object == null) {
        return false;
    }
    return typeof object[Symbol.iterator] === 'function';
}

function copyArtilleryTemplate(urls, identifiers) {
    for (let i = 0; i < urls.length; i++) {
        let identifer = identifiers[i];
        let sourceFile = 'config/templates/artillery_request.yml';
        let destinationFile = 'config/artillery/' + identifer + '.yml';

        if (identifer.startsWith('token')) {
            sourceFile = 'config/templates/artillery_token.yml';
        }

        fs.copyFile(sourceFile, destinationFile, (err) => {
            if (err) {
                console.error('Error: copy Artillery template failed');
                throw err;
            }
        });
    }
}

function replaceArtilleryTemplate(urls, identifiers) {
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let identifer = identifiers[i];
        let destinationFile = 'config/artillery/' + identifer + '.yml';
        let splittedUrl = url.split("v1");
        let parsedUrl = splittedUrl[0] + "v1/";
        let postfixWholeUrl = splittedUrl[1];
        let splittedPostfixUrl = postfixWholeUrl.split("?");

        if (identifer.startsWith('token')) {
            splittedPostfixUrl = postfixWholeUrl.split(" ");
        }
        postfixUrl = splittedPostfixUrl[0];
        replaceStringInFiles(destinationFile, '${endpoint}', parsedUrl);
        replaceStringInFiles(destinationFile, '${postfix-url}', postfixUrl);
        replaceStringInFiles(destinationFile, '${duration}', artilleryDuration);
        replaceStringInFiles(destinationFile, '${rate}', artilleryRate);
        replaceStringInFiles(destinationFile, '${identifier}', identifer);
    }
}

function replaceStringInFiles(destinationFile, fromValue, toValue) {
    const options = {
        files: destinationFile,
        from: fromValue,
        to: toValue,
    };

    try {
        replace.sync(options);
    } catch (error) {
        console.error('Error: replace ' + fromValue + ' to ' + toValue + ' in ' + destinationFile + ' failed');
        throw err;
    }
}

function runArtilleryTest(urls, identifiers) {
    for (let i = 0; i < urls.length; i++) {
        let identifier = identifiers[i];
        executeShell('artillery run config/artillery/' + identifier + '.yml --output outputs/artillery/' + identifier + '.json', 'Error: Artillery performance test failed')
    }
}

function doOptionReport(inputParam) {
    if (inputParam) {
        let { urlsJson, identifiersJson } = getUrlsAndIdentifiersJSON(inputParam);;
        runArtilleryReport(urlsJson, identifiersJson);
    }
}

function runArtilleryReport(urls, identifiers) {
    for (let i = 0; i < urls.length; i++) {
        let identifier = identifiers[i];
        executeShell('artillery report outputs/artillery/' + identifier + '.json', 'Error: Artillery generate report failed');
    }
}

function doOptionLogsInsight(inputParam) {
    if (inputParam) {
        let { identifiersJson } = getUrlsAndIdentifiersJSON(inputParam);;
        runAwsCloudWatchLogsInsight(identifiersJson);
    }
}

function runAwsCloudWatchLogsInsight(identifiers) {
    let identifierParams = ''
    let startTime = Math.floor(subtractMinutes(logsInsightTimeRange).getTime() / 1000)
    let endTime = Math.floor(new Date().getTime() / 1000)

    for (let i = 0; i < identifiers.length; i++) {
        let identifier = identifiers[i];
        identifierParams += "\"/aws/lambda/" + identifier + "\" ";
    }
    let commandQuery = 'aws logs start-query ' +
        '--log-group-names ' + identifierParams +
        ' --start-time ' + startTime +
        ' --end-time ' + endTime +
        ' --query-string \'filter @type=\"REPORT\"' +
        ' | fields @memorySize / 1000000 as memorySize, @memorySize / 1024 / 1024 as provisonedMemoryMB' +
        ' | filter @message like /(?i)(Init Duration)/' +
        ' | parse @message /^REPORT.*Init Duration: (?<initDuration>.*) ms.*/' +
        ' | parse @message /^REPORT.*Max Memory Used: (?<maxMemoryUsed>.*) MB*/' +
        ' | parse @message /^REPORT.*Duration: (?<duration>.*) MB*/' +
        ' | parse @log /^.*\\/aws\\/lambda\\/(?<functionName>.*)/' +
        ' | stats count() as coldStarts, avg(initDuration) as avgInitDuration, max(initDuration) as maxInitDuration,' +
        ' min(@duration) as minDuration, max(@duration) as maxDuration, min(@maxMemoryUsed / 1024 / 1024) as smallestMemoryRequestMB,' +
        ' avg(@maxMemoryUsed / 1024 / 1024) as avgMemoryUsedMB, max(@maxMemoryUsed / 1024 / 1024) as maxMemoryUsedMB,' +
        ' provisonedMemoryMB - maxMemoryUsedMB as overProvisionedMB by functionName, memorySize, provisonedMemoryMB' +
        ' | display functionName, memorySize, coldStarts, maxInitDuration, minDuration, maxDuration, smallestMemoryRequestMB, maxMemoryUsedMB, overProvisionedMB' +
        ' | sort functionName\'' +
        ' > outputs/logs_insight/query_id.json';

    executeShell(commandQuery, 'AWS CloudWatch logs insight run query failed');
    delayProgress(waitTimeQuery, "Waiting query result..");
    getLogsInsightResult();
}

function subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
}

function delayProgress(seconds, message) {
    for (let i = 0; i < seconds; i++) {
        console.log(message);
        execSync("sleep 1");
    }
}

function getLogsInsightResult() {
    try {
        let queryIdString = fs.readFileSync("outputs/logs_insight/query_id.json");
        queryIdJson = JSON.parse(queryIdString);
    } catch (err) {
        console.error('Error: parse query_id.json');
        throw err;
    }
    executeShell('aws logs get-query-results --query-id ' + queryIdJson.queryId + ' >  outputs/logs_insight/query_result.json', 'AWS CloudWatch logs insight fetch query result failed');
}

