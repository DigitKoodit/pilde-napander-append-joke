const { handler } = require('.')

const correctData = {
  joke: 'Vitsi',
  email: 'example@example.com',
  guild: 'Digit',
  isFuksi: true
}
handler(correctData, null, res => console.log('RESPONSE', res))

// const emptyFields = {
//   joke: '',
//   email: '',
//   guild: '',
//   isFuksi: '',
// }
// handler(emptyFields, null, res => console.log('RESPONSE', res))

// const nullFields = {
//   joke: null,
//   email: null,
//   guild: null,
//   isFuksi: null,
// }
// handler(nullFields, null, res => console.log('RESPONSE', res))

// const invalidTypes = {
//   joke: 1,
//   email: 1,
//   guild: 1,
//   isFuksi: 1,
// }
// handler(invalidTypes, null, res => console.log('RESPONSE', res))
