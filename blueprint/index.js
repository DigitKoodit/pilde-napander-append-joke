const { google } = require('googleapis');
const { auth } = require('google-auth-library');

const sheets = google.sheets({ version:'v4' });

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/spreadsheets'];
const { GOOGLE_AUTH, SPREADSHEET_ID } = process.env;

async function authenticate() {
  if (!GOOGLE_AUTH) {
    throw new Error('Auth env is missing.');
  }
  const keys = JSON.parse(GOOGLE_AUTH);
  const client = auth.fromJSON(keys);
  client.scopes = SCOPES;
  const url = `https://www.googleapis.com/dns/v1/projects/${keys.project_id}`;
  const res = await client.request({ url });
  console.log(res.data);
  return client;
}

exports.handler = (event, context, callback) => {
  authenticate()
    .then((auth) => {
      const body = {
        values: [event]
      };

      sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: SPREADSHEET_ID,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        resource: body
      }, (err, result) => {
        if(err) {
          console.log(err)
          callback({
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
              'Access-Control-Allow-Headers': 'Authorization'
            },
            body: JSON.stringify({
              message: err
            })
          });
        } else {
          console.log('Appended cells successfully.');
          callback(null, {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
              'Access-Control-Allow-Headers': 'Authorization'
            },
            body: JSON.stringify({
              message: 'OK'
            })
          });
        }
      });
    });
};