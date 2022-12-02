# Lambda Authorizer Benchmarking Tool

> The purpose of this application is to calculate the performance of Lambda Authorizer-enabled serverless functions. It was created as part of the MSc in Cloud Computing Research Project at the National College of Ireland.

## Prerequisites

[NodeJS](http://nodejs.org/) and [NPM](https://npmjs.org/) are required for this project. The installation of them is straightforward. Try running the following command to determine whether they are installed.

```sh
$ npm -v && node -v
8.19.2
v18.11.0
```

The next step is to install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). Make sure the [AWS CLI profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) is configured with an active AWS account. Verify their installations by running the command below.

```sh
$ aws --version && sam --version
aws-cli/2.8.5
SAM CLI, version 1.60.0
```

In order to use perform benchmarking process, the user must install some other programming language runtimes: [Python 3.9](https://realpython.com/installing-python/), [Go 1.x](https://go.dev/doc/install) & [Java 11](https://docs.oracle.com/en/java/javase/11/install/overview-jdk-installation.html). In addition to Java, the user needs to install [Maven](https://maven.apache.org/install.html) as well. Run the command below to verify it.

```sh
$ python --version && go version
Python 3.9.14
go1.19.2

$ java -version && mvn -version
openjdk64-11.0.11
Apache Maven 3.8.6
```

## Table of Contents

- [Project Name](#lambda-authorizer-benchmarking-tool)
  - [Prerequisites](#prerequisites)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Installation](#installation)
    - [Dependencies](#dependencies)
  - [Usage](#usage)
    - [Option Help](#option-help)
    - [Option Clean](#option-clean)
    - [Option Deploy](#option-deploy)
    - [Option Test](#option-test)
    - [Option Report](#option-report)
    - [Option Logs Insight](#option-logs-insight)
    - [Combination of Options](#combination-of-options)
  - [Configurations](#configurations)
    - [Artillery](#artillery)
      - [Templates](#templates)
    - [Logs Insight](#logs-insight)
  - [Reports](#reports)
    - [Artillery](#artillery-1)
    - [Logs Insight](#logs-insight-1)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

For development and testing purposes, follow these instructions to get the project up and running on the local machine.

## Development Environment

The author's machine and system are described below.

<img src="images/mac-profile.png" alt="mac_profile" width="400"/>

```sh
$ system_profiler SPSoftwareDataType
System Software Overview:

      System Version: macOS 13.0 (22A380)
      Kernel Version: Darwin 22.1.0
      Boot Volume: Macintosh HD
      Boot Mode: Normal
      Secure Virtual Memory: Enabled
      System Integrity Protection: Enabled
```

## Installation

**BEFORE INSTALATION:** Please read the [prerequisites](#prerequisites).

The first step is to clone this repo locally:

```sh
$ git clone https://github.com/cornelius-tyranade/lambda-authorizer-benchmarking-tool.git
$ cd lambda-authorizer-benchmarking-tool
```

### Dependencies

The [package.json](package.json) file contains a list of dependencies that will be installed. Below are the dependencies used short explanation and the source of each dependency:

1. [Artillery.](https://www.npmjs.com/package/artillery) Perform multiple performance tests quickly.
2. [Command-exists-promise.](https://www.npmjs.com/package/command-exists-promise) Verify if a specific command exists in the system.
3. [Commander.](https://www.npmjs.com/package/commander) Quick solution for NodeJs command-line interfaces.
4. [Config.](https://www.npmjs.com/package/config) Simple key-values file configuration manager.
5. [Replace-in-file.](https://www.npmjs.com/package/replace-in-file) Replace text synchronously in one or more files.
6. [ShellJS.](https://www.npmjs.com/package/shelljs) Call shell commands in NodeJs application.

The NodeJS application dependencies need to be installed and set up as follows:

```sh
$ npm install
```

## Usage

### Option Help

This option explains what feature options are available in the Lambda Authorizer Benchmarking Tool.

```
$ node labt -h
Usage: labt [options]

===================================
Lambda Authorizer Benchmarking Tool
===================================

Options:
  -v, --version                        display version
  -c, --clean                          remove current stack if exist
  -d, --deploy                         start the deployment process
  -t, --test [identifers...]           start the performance test
  -r, --report [identifers...]         generate Artillery performance test report in HTML
  -li, --logs-insight [identifers...]  generate AWS CloudWatch logs insight query result in JSON
  -h, --help                           display help for command
```

### Option Clean

This option is used to erase the current stack installed in the Lambda application.

```sh
$ node labt -c
```

It also logs the erasing process into `serverless-apps-builder/logs` folder as [stage_delete.txt](serverless-apps-builder/logs/stage_delete.txt).

<img src="images/stage-delete.png" alt="stage_delete" width="500"/>

### Option Deploy

This option deploys all scenarios according to what is written in the template.yaml after building the scenarios code.

```sh
$ node labt -d
```

Upon completion, each scenario's URLs and identifiers are extracted into [urls.json](serverless-apps-builder/logs/urls.json) and [identifiers.json](serverless-apps-builder/logs/identifiers.json), respectively.

<img src="images/identifiers.png" alt="identifiers" width="220"/>

<img src="images/urls.png" alt="urls" width="720" />

Also, [stage_build.txt](serverless-apps-builder/logs/stage_build.txt) and [stage_deploy.txt](serverless-apps-builder/logs/stage_deploy.txt) log files are generated during this process.

<img src="images/stage-build.png" alt="stage_build" width="500"/>

<img src="images/stage-deploy.png" alt="stage_deploy" width="700"/>

### Option Test

This option instructs the system to run performance testing repeatedly for a certain duration. The duration and rate of performance testing can be set from within the [default.json](config/default.json) file in the config folder. As an example, the duration and rate values are ten. The system will call the function ten times a second for ten seconds.

```sh
$ node labt -t
$ node labt -t "tokenAuthorizerPython"
$ node labt -t "requestAuthorizerPython" "tokenAuthorizerPython"
```

The output of this process is placed in the `outputs/artillery` folder in JSON form. For instance, [requestAuthorizerGo.json](outputs/artillery/requestAuthorizerGo.json).

<img src="images/artillery-json.png" alt="artillery_json" width="340"/>

### Option Report

Using this option, it will generate an HTML report using the JSON file in `outputs/artillery`.

```sh
$ node labt -r
$ node labt -r "tokenAuthorizerNode"
$ node labt -r "requestAuthorizerNode" "tokenAuthorizerNode"
```

For generation result example is [requestAuthorizerGo.json.html](outputs/artillery/requestAuthorizerGo.json.html).

<img src="images/artillery-html-1.png" alt="artillery_html_1" width="700"/>

<img src="images/artillery-html-2.png" alt="artillery_html_2" width="700"/>

### Option Logs Insight

The AWS CloudWatch logs record each function' activities when the user run performance tests. This option queries several important output parameters from logs, such as init/cold duration, warm duration, and also memory used. The results of this output are placed in the `outputs/logs_insight folder`.

```sh
$ node labt -li
$ node labt -li "tokenAuthorizerGo"
$ node labt -li "tokenAuthorizerGo" "tokenAuthorizerJava"
```

Two files are generated as a result. One contains the [query identifier](outputs/logs_insight/query_id_overview.json), and the other contains the [results](outputs/logs_insight/query_result_overview.json). Below is a sample of the Logs Insight query:

<img src="images/li-query-id.png" alt="logs_insight_query_id" width="350"/>

<img src="images/li-query-result.png" alt="logs_insight_query_result" width="280"/>

### Combination of Options

This application can accept flag combinations of more than one input. With the following command, the application do a clean deployment, then run the test and create an HTML report, as well as generate the results of a Logs Insight query.

```sh
$ node labt -c -d -t -r -li
```

## Configurations

### Artillery

#### Templates

### Logs Insight

## Reports

### Artillery

### Logs Insight

## Authors

- **Cornelius** - _Initial work_ - [cornelius-tyranade](https://github.com/cornelius-tyranade)

## License

[Attribution-NonCommercial-ShareAlike 3.0 Ireland](LICENSE.md)
