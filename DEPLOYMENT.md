## Deploy to AWS Lambda

This will create an [AWS Lambda](https://console.aws.amazon.com/lambda) function called `alexa_artsy` with a new IAM role, `alexa-artsy`. The `alexa-artsy` role is used in [project.json](project.json).

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

### Logs

If logs don't appear in CloudWatch, manually attach the following policy.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Test

```
apex invoke artsy < test/functions/artsy/fixtures/LaunchRequest.json
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
      "ssml":"<speak>Welcome to Artsy! Ask me about an artist.</speak>"
    }
  }
}
```

### Production Deployment

You need Artsy Alexa `project.production.json` and access to the Artsy AWS infrastructure. If you work at Artsy, you will find it in 1Password in the Engineering vault under `elderfield (Alexa) project.production.json`.

Make sure following environment variables are set in AWS Lambda settings:
```
ARTSY_BASE_API_URL=replace-me
ARTSY_CLIENT_ID=replace-me
ARTSY_CLIENT_SECRET=replace-me
ENV=lambda
```

Then run: 

```
make production-deploy
```

### Alexa Skill Configuration

Add the skill to [Alexa Skills](https://developer.amazon.com/edw/home.html#/skills/list).

#### Interaction Model

* Copy-paste the contents of [functions/artsy/schema.json](schema.json) into _Intent Schema_.
* Add a custom slot type called `NAME`. Paste the contents of [artists.txt](functions/artsy/data/artists.txt) and [last_names.txt](functions/artsy/data/last_names.txt) into the values box.
* Copy-paste the contents of [functions/artsy/utterances.txt](utterances.txt) into _Sample Utterances_.
