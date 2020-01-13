# pilde-napander-append-joke

## A Lambda function that appends a row to a Google Sheet from a HTTP POST request.

To deploy:

Set your oauth key in the env variable GOOGLE_AUTH.
Set your google sheet id in the env variable SPREADSHEET_ID.

Then run:
```
cd blueprint
npm install googleapis google-auth-library
zip -r ../blueprint.zip *
```

Use the outputted zip as AWS Lambda blueprint.