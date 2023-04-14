/* eslint-disable no-unused-vars */

let eye = false

// eslint-disable-next-line no-unused-vars
function seeP () {
  const input = document.getElementById('firstP')
  const see = document.getElementById('seeP')
  changing(input, see)
}
function seeCP () {
  const input = document.getElementById('secondCP')
  const see = document.getElementById('seeCP')
  changing(input, see)
}
function changing (input, see) {
  if (eye) {
    input.type = 'password'
    eye = false
    see.style.color = 'gray'
  } else {
    input.type = 'text'
    eye = true
    see.style.color = 'black'
  }
}
// validation of signup page

function checkUsername () {
  const usernameEl = document.getElementById('fname').value
  const firstNameErr = document.getElementById('fNameErr')

  let valid = false

  const min = 3
  const max = 10

  const username = usernameEl

  if (!length(username)) {
    firstNameErr.innerHTML = 'Username cannot be blank.'
  } else if (!limit(username.length, min, max)) {
    firstNameErr.innerHTML = `First name must be between ${min} and ${max} characters.`
  } else {
    firstNameErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkLastUsername () {
  const usernameEl = document.getElementById('lname').value
  const firstNameErr = document.getElementById('lNameErr')

  let valid = false

  const min = 3
  const max = 10

  const username = usernameEl

  if (!length(username)) {
    firstNameErr.innerHTML = 'Username cannot be blank.'
  } else if (!limit(username.length, min, max)) {
    firstNameErr.innerHTML = `Last name must be between ${min} and ${max} characters.`
  } else {
    firstNameErr.innerHTML = ''
    valid = true
  }
  return valid
}

const checkEmail = () => {
  const emailEl = document.getElementById('lemail')
  const emailErr = document.getElementById('emailErr')
  let valid = false
  const email = emailEl.value.trim()
  if (!length(email)) {
    emailErr.innerHTML = 'Email cannot be blank.'
    return false
  } else if (!isEmailValid(email)) {
    emailErr.innerHTML = 'Email is not valid.'
    return false
  } else {
    emailErr.innerHTML = ''
    valid = true
  }
  return valid
}
const checkPhoneNumber = () => {
  const phoneNumberEl = document.getElementById('PNumber')
  const PNumberErr = document.getElementById('PNumberErr')
  let valid = false
  const PNumber = phoneNumberEl.value.trim()
  if (!length(PNumber)) {
    PNumberErr.innerHTML = 'Phone number cannot be blank'
    return false
  } else if (!isANumber(PNumber)) {
    PNumberErr.innerHTML = 'Phone number must contain 10 digits only'
    return false
  } else {
    PNumberErr.innerHTML = ''
    valid = true
  }
  return valid
}
const checkPassword = () => {
  const passwordEl = document.getElementById('firstP')
  const passwordErr = document.getElementById('passwordErr')
  let valid = false
  const password = passwordEl.value.trim()
  if (!length(password)) {
    passwordErr.innerHTML = 'Password must contain at least one digit and one capital letter and in the length of 8 -9 characters'
    return false
  } else {
    passwordErr.innerHTML = ''
    valid = true
  }
  return valid
}

const isEmailValid = (email) => {
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

const length = value => value !== ''
const limit = (length, min, max) => !(length < min || length > max)

const isANumber = (value) => {
  if (value.match(/^\d{10}$/)) {
    return true
  } else {
    return false
  }
}
const isPassword = (value) => {
  if (value.match(/^(?=.*\d)(?=.*[A-Z]).{8,9}$/)) {
    return true
  } else {
    return false
  }
}
function signUpSubmitCheck () {
  const submitErr = document.getElementById('submitErr')
  const isUsernameValid = checkUsername()
  const isLastUsernameValid = checkLastUsername()
  const isEmailValid = checkEmail()
  const isPasswordValid = checkPassword()
  const isPhoneNumberValid = checkPhoneNumber()
  const isFormValid = isUsernameValid && isLastUsernameValid &&
  isEmailValid && isPasswordValid && isPhoneNumberValid
  if (!isFormValid) {
    submitErr.innerHTML = 'Clear the errors'
    setTimeout(showSubmitErr, 2000)
    return false
  }
}
function showSubmitErr () {
  const submitErr = document.getElementById('submitErr')
  submitErr.innerHTML = ''
}

function deleteConfirm (id) {
  swal({
    title: 'Are you sure?',
    text: 'Once deleted, you will not be able to recover this data!',
    icon: 'warning',
    buttons: true,
    dangerMode: true
  })
    .then(async (willDelete) => {
      if (willDelete) {
        await swal('Selected coupon has been deleted!', { icon: 'success' })
        deleteCoupon(id)
      } else {
        swal('Deletion has been canceled!')
      }
    })
} function deleteCoupon (id) {
  console.log('ajax called')
  $.ajax({
    url: '/admin/delete-coupon/' + id,
    type: 'get',
    success: (response) => { if (response.status) { location.reload() } }
  })
}
function logOutConfirm (id) {
  swal({
    title: 'Are you sure?',
    icon: 'warning',
    buttons: true,
    dangerMode: true
  }).then((value) => {
    if (value) {
      $.ajax({
        url: '/logout',
        type: 'get',
        success: (response) => {
          if (response.status) {
            location.replace('/')
          }
        }
      })
    }
  })
}
