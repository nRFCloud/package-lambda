# package-lambda

Package a lambda function and upload it to S3

Usage: 

    npx @nrfcloud/package-lambda <S3 Bucket> <NPM Package>

Example:

```bash
% npx @nrfcloud/package-lambda cf-lambda-sourcecode @nrfcloud/api-persistence-event-reducer-lambda
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
