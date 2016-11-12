## Deploy to AWS Lambda

### Create a Lambda Function

Go to [AWS Lambda](https://console.aws.amazon.com/lambda) and create a `alexa-artsy` function with a new IAM role, `alexa-artsy`.

The `alexa-artsy` role is used in [project.json](project.json).

### Install Apex

Install [Apex](https://github.com/apex/apex).

```
curl https://raw.githubusercontent.com/apex/apex/master/install.sh | sh
```

### Configure AWS

Install [awscli](https://github.com/aws/aws-cli).

```
brew install awscli
```

Configure AWS with `aws configure`.

```
$ aws configure
AWS Access Key ID [None]: ...
AWS Secret Access Key [None]: ...
Default region name [us-east-1]: us-east-1
Default output format [json]: json
```

### Updated Depenencies

Install dependent packages and export schema and utterances.

```
make build
```

### Deploy to Lambda

```
$ make deploy
  ...
   • creating function         env= function=artsy
   • created alias current     env= function=artsy version=1
   • function created          env= function=artsy name=alexa-artsy_artsy version=1
```

### Triggers

Go to the Lambda function and choose _Triggers_. Add an `Alexa Skills Kit` trigger or you'll get an obscure `Please make sure that "Alexa Skills Kit" is selected for the event source type of arn:...` error.

### Test

```
apex invoke artsy < test/functions/artsy/LaunchRequest.json
```

This should return a welcome message.

```json
{
  "version":"1.0",
  "sessionAttributes":{},
  "response":{
    "shouldEndSession":true,
    "outputSpeech":{
      "type":"SSML",
      "ssml":"<speak>Welcome to Artsy!</speak>"
    }
  }
}
```

### Production Deployment

You need Artsy Alexa `project.production.json` and access to the Artsy AWS infrastructure. If you work at Artsy, you will find it in 1Password in the Engineering vault under `Artsy Alexa Lambda project.production.json`.

```
make production-deploy
```

