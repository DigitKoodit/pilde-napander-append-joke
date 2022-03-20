# Pönkeli - append-joke

## SETUP 

- Login to [Google console](https://console.cloud.google.com)
- Create or select a project
- Go to [APIs and Services](https://console.cloud.google.com/apis/credentials)
- Create new service account
- Create and download service account key as `JSON`
- Rename downloaded file to `credentials.json`
- On `APIs and Services > Credentials` create a new [API key](https://console.cloud.google.com/apis/credentials)
- Store generated key to to `.env` file with key `API_KEY`
- On Console enable `Sheets API` for the project
- Copy destination spreadsheet id from Goolgle sheet url
- Store id to `.env` file with key `SPREADSHEET_ID`
- Continue to the next section
## A Lambda function that appends a row to a Google Sheet from a HTTP POST request.

```
cd blueprint
npm install
zip -r ../blueprint.zip *
```

Use the outputted zip as AWS Lambda blueprint and add ENV variables on the console.
