# package-lambda [![npm version](https://img.shields.io/npm/v/@nrfcloud/package-lambda.svg)](https://www.npmjs.com/package/@nrfcloud/package-lambda)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Package a lambda function and upload it to S3

## NPM

Usage: 

    npx @nrfcloud/package-lambda npm <S3 Bucket> <NPM Package>

Example:

```bash
% npx @nrfcloud/package-lambda npm cf-lambda-sourcecode @nrfcloud/api-persistence-event-reducer-lambda
npx: installed 129 in 7.202s
Temp dir: /tmp/tmp-6832cnu8vLNSuGuu
running: rm -r /tmp/tmp-6832cnu8vLNSuGuu/@nrfcloud ...
@nrfcloud/api-persistence-event-reducer-lambda 1.0.2
running: npm ci --ignore-scripts --only=prod ...
added 28 packages in 0.605s
running: zip -r -q /tmp/tmp-6832cnu8vLNSuGuu/api-persistence-event-reducer-lambda-1.0.2.zip ./ ...
running: aws s3 cp /tmp/tmp-6832cnu8vLNSuGuu/api-persistence-event-reducer-lambda-1.0.2.zip s3://cf-lambda-sourcecode/api-persistence-event-reducer-lambda-1.0.2.zip ...
upload: ../../../../../tmp/tmp-6832cnu8vLNSuGuu/api-persistence-event-reducer-lambda-1.0.2.zip to s3://cf-lambda-sourcecode/api-persistence-event-reducer-lambda-1.0.2.zip
```

## Local

You can also publish from a local folder.

This command expects:

 - `package.json`
 - `package-lock.json`
 - `dist/`
 
in the local folder.

Usage: 

    npx @nrfcloud/package-lambda local <S3 Bucket>

Example:

```
% npx @nrfcloud/package-lambda local cf-lambda-sourcecode
Temp dir: /tmp/tmp-206396JvbFs6flXBz
running: rm -r /tmp/tmp-206396JvbFs6flXBz/@nrfcloud ...
@nrfcloud/api-persistence-event-reducer-lambda 1.1.2
running: npm ci --ignore-scripts --only=prod ...
added 28 packages in 0.734s
running: zip -r -q /tmp/tmp-206396JvbFs6flXBz/api-persistence-event-reducer-lambda-1.1.2.zip ./ ...
running: aws s3 cp /tmp/tmp-206396JvbFs6flXBz/api-persistence-event-reducer-lambda-1.1.2.zip s3://cf-lambda-sourcecode/api-persistence-event-reducer-lambda-1.1.2.zip ...
upload: ../../../../../tmp/tmp-206396JvbFs6flXBz/api-persistence-event-reducer-lambda-1.1.2.zip to s3://cf-lambda-sourcecode/api-persistence-event-reducer-lambda-1.1.2.zip
```
