const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require("fs");
const shell = require('shelljs');
const config = require('config');
const replace = require('replace-in-file');

// Global const
const program = new Command();
const artilleryDuration = config.get('artillery.duration');
const artilleryRate = config.get('artillery.rate');
const logsInsightTimeRange = config.get('logsInsight.timeRange');

// Initialize program
program
    .name('labt')
    .description('===================================\nLambda Authorizer Benchmarking Tool\n===================================')
    .version('0.0.1', '-v, --version', 'display version')
    .option('-c, --clean', 'remove current stack if exist')
    .option('-d, --deploy', 'start the deployment process')
    .option('-t, --test', 'start the performance test')
    .option('-r, --report', 'generate Artillery performance test report in HTML')
    .option('-li, --logs-insight', 'generate AWS CloudWatch logs insight query result in JSON');

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

function doOptionTest(isTest) {
    if (isTest) {
        let urlsJson = null;
        let identifiersJson = null;

        try {
            let urlsString = fs.readFileSync("serverless-apps-builder/logs/urls.json");
            urlsJson = JSON.parse(urlsString);

            let identifiersString = fs.readFileSync("serverless-apps-builder/logs/identifiers.json");
            identifiersJson = JSON.parse(identifiersString);
        } catch (err) {
            console.log(err);
            return;
        }
        copyArtilleryTemplate(urlsJson, identifiersJson);
        replaceArtilleryTemplate(urlsJson, identifiersJson);
        runArtilleryTest(urlsJson, identifiersJson);
    }
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
                console.log('Error: copy Artillery template failed');
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
    }
}

function runArtilleryTest(urls, identifiers) {
    for (let i = 0; i < urls.length; i++) {
        let identifier = identifiers[i];
        executeShell('artillery run config/artillery/' + identifier + '.yml --output outputs/artillery/' + identifier + '.json', 'Error: Artillery test run failed')
    }
}

function doOptionLogsInsight(isLogsInsight) {
    if (isLogsInsight) {

    }
}