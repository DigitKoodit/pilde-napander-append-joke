const gSheets = require('@googleapis/sheets')
const auth = require('google-auth-library')
const yup = require('yup')

const { SPREADSHEET_ID, API_KEY } = process.env
const PATH_CREDENTIALS = './credentials.json'

exports.handler = async (event) => {
  let errors = []
  if(!SPREADSHEET_ID) {
    errors.push('Missing SPREADSHEET_ID env variable')
  }
  if(!API_KEY) {
    errors.push(`Missing API_KEY env variable`)
  }

  try {
    if(errors.length) {
      throw new Error(errors.join('\n'))
    }
    if(!event.body) {
      throw new Error('No request body')
    }

    const sanitized = await validate(event.body)
    const columns = parseToSheets(sanitized)
    await appendSheet(columns)
    return parseResponse('OK')
  } catch(error) {
    return parseResponse(error, true)
  }
}

const parseResponse = (data, isError) => {
  const body = data instanceof Error
    ? { message: data.message, ...data }
    : { data }

  return {
    statusCode: isError ? 400 : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT ',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

// Validation
const getTypeString = type => {
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
    min: '${path} pitää olla vähintään ${min}',
    max: '${path} saa olla enintään ${max}'
  },
  string: {
    length: '${path} pitää olla ${length} merkkiä pitkä',
    min: '${path} pitää olla vähintään ${min} merkkiä pitkä',
    max: '${path} saa olla enintään ${max} merkkiä pitkä',
    matches: '${path} pitää olla seuraavaa muotoa: "${regex}"',
    email: '${path} pitää olla sähköpostimuotoa',
  },
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
    joke: yup.string().defined().trim().min(1).max(3000).label('Vitsi').required(),
    email: yup.string().defined().email().max(100).label('Sähköpostiosoite'),
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
  const credentials = require(PATH_CREDENTIALS)
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
    }, (err, result) => {
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