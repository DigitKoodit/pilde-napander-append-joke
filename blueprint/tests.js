const { handler } = require('.')

const correctData = {
  body: {
    joke: 'Vitsi',
    email: 'example@example.com',
    guild: 'Digit',
    isFuksi: true
  }
}
handler(correctData)
.then(res => console.log(res))
.catch(res => console.log(res))

// const emptyFields = {
//   body: {
//     joke: '',
//     email: '',
//     guild: '',
//     isFuksi: '',
//   }
// }
// handler(emptyFields)
// .then(res => console.log(res))
// .catch(res => console.log(res))

// const nullFields = {
//   body: {
//     joke: null,
//     email: null,
//     guild: null,
//     isFuksi: null,
//   }
// }
// handler(nullFields)
// .then(res => console.log(res))
// .catch(res => console.log(res))

// const invalidTypes = {
//   body: {
//     joke: 1,
//     email: 1,
//     guild: 1,
//     isFuksi: 1,
//   }
// }
// handler(invalidTypes)
// .then(res => console.log(res))
// .catch(res => console.log(res))
