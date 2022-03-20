const fs = require('fs')
const gSheets = require('@googleapis/sheets')
const auth = require('google-auth-library')
const yup = require('yup')

const { SPREADSHEET_ID, API_KEY } = process.env
const PATH_CREDENTIALS = './credentials.json'

let errors = []
if(!SPREADSHEET_ID) {
  errors.push('Missing SPREADSHEET_ID env variable')
}
if(!API_KEY) {
  errors.push(`Missing API_KEY env variable`)
}
if(!fs.existsSync(PATH_CREDENTIALS)) {
  errors.push(`Missing credentials file: ${PATH_CREDENTIALS}`)
}

if(errors.length) {
  throw new Error(errors.join('\n'))
}

exports.handler = (data, context, callback) => {
  try {
    return validate(data)
      .then(sanitized => {
        const columns = parseToSheets(sanitized)
        return appendSheet(columns)
          .then(result => {
            return callback(null, parseResponse('OK'))
          })
          .catch(error => {
            return callback(parseResponse(error))
          })
      })
  } catch(error) {
    return callback(parseResponse(error))
  }
}

const parseResponse = (message, isError) => {
  return {
    statusCode: isError ? 400 : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Authorization',
      'Content-Type': 'application/json'
    },
    body: {
      message
    }
  }
}

// Validation

const getTypeString = type => {
  // eslint-disable-next-line default-case
  switch(type) {
    case 'number':
      return 'numero'
    case 'boolean':
      return 'tosi/epätosi'
    case 'string':
      return 'tekstiä'
    case 'object':
      return 'objekti'
    case 'array':
      return 'taulukko'
  }
}

/* eslint-disable no-template-curly-in-string */
yup.setLocale({
  mixed: {
    default: '${path} on virheellinen',
    required: '${path} on pakollinen kenttä',
    oneOf: '${path} pitää olla jokin seuraavista: "${values}"',
    defined: '${path} pitää olla määritetty',
    notType: ({ path, type }) => `${path} pitää olla ${getTypeString(type)}`,
  },
  number: {
    default: '${path} pitää olla numero',
    integer: '${path} pitää olla kokonaisluku',
    min: '${path} pitää olla vähintään ${min}',
    max: '${path} saa olla enintään ${max}',
    lessThan: '${path} pitää olla vähemmän kuin ${less}',
    moreThan: '${path} pitää olla enemmän kuin ${more}',
    notEqual: '${path} ei saa olla ${notEqual}',
    positive: '${path} pitää olla positiivinen numero',
    negative: '${path} pitää olla negatiivinen numero'
  },
  string: {
    length: '${path} pitää olla ${length} merkkiä pitkä',
    min: '${path} pitää olla vähintään ${min} merkkiä pitkä',
    max: '${path} saa olla enintään ${max} merkkiä pitkä',
    matches: '${path} pitää olla seuraavaa muotoa: "${regex}"',
    email: '${path} pitää olla sähköpostimuotoa',
    url: '${path} pitää olla kelvollinen URL',
    uuid: '${path} pitää olla kelvollinen UUID',
    trim: '${path} ei saa alkaa tai päättyä välilyöntiin',
    lowercase: '${path} pitää olla pienillä kirjaimilla',
    uppercase: '${path} pitää olla isoilla kirjaimilla'
  },
  object: {
    noUnknown: '${path} sisältää virheellisiä avaimia: ${unknown}'
  },
  array: {
    min: '${path} pitää sisältää vähintään ${min} kohdetta',
    max: '${path} pitää sisältää enintään ${max} kohdetta'
  }
})

const guilds = [
  'Nucleus',
  'Digit',
  'Machina',
  'Adamas',
  'Muu'
]

const schema = yup.object()
  .shape({
    joke: yup.string().defined().min(1).label('Vitsi').required(),
    email: yup.string().defined().min(3).email().label('Sähköpostiosoite'),
    guild: yup.string().defined().label('Kilta').oneOf(guilds),
    isFuksi: yup.boolean().defined().label('Olen fuksi'),
  })
const validate = event => {
  return schema.validate(event, { abortEarly: false })
}

const parseToSheets = data => {
  return [
    new Date(),
    data.joke,
    data.email,
    data.guild,
    data.isFuksi
  ]
}

const appendSheet = columns => {
  const jwt = getJwt()
  const apiKey = API_KEY
  const spreadsheetId = SPREADSHEET_ID
  const range = 'A2' // First is header
  return appendSheetRow(jwt, apiKey, spreadsheetId, range, columns)
}

const getJwt = () => {
  const credentials = require("./credentials.json")
  return new auth.JWT(
    credentials.client_email, null, credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  )
}

const appendSheetRow = (jwt, apiKey, spreadsheetId, range, row) => {
  return new Promise((resolve, reject) => {
    const sheets = gSheets.sheets({ version: 'v4' })
    sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range,
      auth: jwt,
      key: apiKey,
      valueInputOption: 'RAW',
      resource: { values: [row] }
    }, function(err, result) {
      if(err) {
        console.dir(err, { depth: null })
        reject(err)
      }
      else {
        console.log('Updated sheet: ' + result.data.updates.updatedRange)
        return resolve(result.data)
      }
    })
  })
}