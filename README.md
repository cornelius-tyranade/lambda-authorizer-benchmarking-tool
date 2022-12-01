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

## Installation

**BEFORE INSTALATION:** Please read the [prerequisites](#prerequisites)

The first step is to clone this repo locally:

```sh
$ git clone https://github.com/cornelius-tyranade/lambda-authorizer-benchmarking-tool.git
```

The NodeJS application dependencies need to be installed and set up as follows:

```sh
$ npm install
```

## Dependencies

Syalala

## Usage

### Option Help

```
$ node labt -h

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

```sh
$ node labt -c
```

### Option Deploy

```sh
$ node labt -d
```

### Option Test

```sh
$ node labt -t
```

### Option Report

```sh
$ node labt -r
```

### Option Logs Insight

```sh
$ node labt -li
```

### Combination of Options

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

[ISC](LICENSE.md)
