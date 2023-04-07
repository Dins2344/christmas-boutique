function isEmail (email) {
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}
function isPinNumber (value) {
  if (value.match(/^\d{6}$/)) {
    return true
  } else {
    return false
  }
}
function isAddress (value) {
  if (value.match(/^[a-zA-Z0-9,]*$/)) {
    return true
  } else {
    return false
  }
}
function isMNumber (value) {
  if (value.match(/^\d{10}$/)) {
    return true
  } else {
    return false
  }
}
function isBlank (value) { return value !== '' }
function isOk (length, min, max) { return !(length < min || length > max) }
function isName (value) {
  if (value.match(/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/)) {
    return true
  } else {
    return false
  }
}
function checkFirstName () {
  const firstNameEl = document.getElementById('firstName').value
  const firstNameErr = document.getElementById('firstNameErr')
  let valid = false
  const min = 3
  const max = 15
  const firstName = firstNameEl
  if (!isBlank(firstName)) {
    firstNameErr.innerHTML = 'can not be blank'
  } else if (!isOk(firstName.length, min, max)) {
    firstNameErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isName(firstName)) {
    firstNameErr.innerHTML = 'Enter valid name'
    return false
  } else {
    firstNameErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkSurName () {
  const surNameEl = document.getElementById('surName').value
  const surNameErr = document.getElementById('surNameErr')
  let valid = false
  const min = 3
  const max = 15
  const surName = surNameEl
  if (!isBlank(surName)) {
    surNameErr.innerHTML = 'can not be blank'
  } else if (!isOk(surName.length, min, max)) {
    surNameErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isName(surName)) {
    surNameErr.innerHTML = 'Enter valid name'
    return false
  } else {
    surNameErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkMobileNo () {
  const mobNumberEl = document.getElementById('mobNumber').value
  const mobNumberErr = document.getElementById('mobNumberErr')
  let valid = false

  const mobNumber = mobNumberEl
  if (!isBlank(mobNumber)) {
    mobNumberErr.innerHTML = 'can not be blank'
  } else if (!isMNumber(mobNumber)) {
    mobNumberErr.innerHTML = 'Enter valid number'
    return false
  } else {
    mobNumberErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkAddressOne () {
  const lineOneEl = document.getElementById('lineOne').value
  const lineOneErr = document.getElementById('lineOneErr')
  let valid = false
  const min = 8
  const max = 80
  const lineOne = lineOneEl
  if (!isBlank(lineOne)) {
    lineOneErr.innerHTML = 'can not be blank'
  } else if (!isOk(lineOne.length, min, max)) {
    lineOneErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isAddress(lineOne)) {
    lineOneErr.innerHTML = 'Enter valid address'
    return false
  } else {
    lineOneErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkAddressTwo () {
  const lineTwoEl = document.getElementById('lineTwo').value
  const lineTwoErr = document.getElementById('lineTwoErr')
  let valid = false
  const min = 8
  const max = 80
  const lineTwo = lineTwoEl
  if (!isBlank(lineTwo)) {
    lineTwoErr.innerHTML = 'can not be blank'
  } else if (!isOk(lineTwo.length, min, max)) {
    lineTwoErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isAddress(lineTwo)) {
    lineTwoErr.innerHTML = 'Enter valid address'
    return false
  } else {
    lineTwoErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkPostOffice () {
  const postOfficeEl = document.getElementById('postOffice').value
  const postOfficeErr = document.getElementById('postOfficeErr')
  let valid = false
  const min = 3
  const max = 20
  const postOffice = postOfficeEl
  if (!isBlank(postOffice)) {
    postOfficeErr.innerHTML = 'can not be blank'
  } else if (!isOk(postOffice.length, min, max)) {
    postOfficeErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isName(postOffice)) {
    postOfficeErr.innerHTML = 'Enter valid address'
    return false
  } else {
    postOfficeErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkAreaName () {
  const areaEl = document.getElementById('area').value
  const areaErr = document.getElementById('areaErr')
  let valid = false
  const min = 3
  const max = 20
  const area = areaEl
  if (!isBlank(area)) {
    areaErr.innerHTML = 'can not be blank'
  } else if (!isOk(area.length, min, max)) {
    areaErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isName(area)) {
    areaErr.innerHTML = 'Enter valid address'
    return false
  } else {
    areaErr.innerHTML = ''
    valid = true
  }
  return valid
}
function addressCheckEmail () {
  const emailEl = document.getElementById('emailId').value
  const emailErr = document.getElementById('emailErr')
  let valid = false
  const min = 3
  const max = 20
  const email = emailEl
  if (!isBlank(email)) {
    emailErr.innerHTML = 'can not be blank'
  } else if (!isOk(email.length, min, max)) {
    emailErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isEmail(email)) {
    emailErr.innerHTML = 'Email is not valid.'
    return false
  } else {
    emailErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCountry () {
  const countryEl = document.getElementById('country').value
  const countryErr = document.getElementById('countryErr')
  let valid = false
  const min = 3
  const max = 12
  const country = countryEl
  if (!isBlank(country)) {
    countryErr.innerHTML = 'can not be blank'
  } else if (!isOk(country.length, min, max)) {
    countryErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isName(country)) {
    countryErr.innerHTML = 'Enter valid name'
    return false
  } else {
    countryErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkState () {
  const stateNameEl = document.getElementById('stateName').value
  const stateErr = document.getElementById('stateErr')
  let valid = false
  const min = 3
  const max = 12
  const stateEl = stateNameEl
  if (!isBlank(stateEl)) {
    stateErr.innerHTML = 'can not be blank'
  } else if (!isOk(stateEl.length, min, max)) {
    stateErr.innerHTML = ` must be between ${min} and ${max} characters.`
  } else if (!isName(stateEl)) {
    stateErr.innerHTML = 'Enter valid name'
    return false
  } else {
    stateErr.innerHTML = ''
    valid = true
  }
  return valid
}
function pinCode () {
  const pinNameEl = document.getElementById('pin').value
  const pinErr = document.getElementById('pinCodeErr')
  let valid = false

  const pin = pinNameEl
  if (!isBlank(pin)) {
    pinErr.innerHTML = 'can not be blank'
  } else if (!isPinNumber(pin)) {
    pinErr.innerHTML = 'enter a valid pin number'
  } else {
    pinErr.innerHTML = ''
    valid = true
  }
  return valid
}
function addressSubmitCheck () {
  const addressSubmitErr = document.getElementById('addressSubmitErr')
  const isFirstNameValid = checkFirstName()
  const isSurNameValid = checkSurName()
  const isMobileNumberValid = checkMobileNo()
  const isAddressOneValid = checkAddressOne()
  const isAddressTwoValid = checkAddressTwo()
  const isPostOfficeValid = checkPostOffice()
  const isAreaNameValid = checkAreaName()
  const isEmailValid = addressCheckEmail()
  const isCountryValid = checkCountry()
  const isStateValid = checkState()
  const isPinCodeValid = pinCode()
  const isFormValid =
  isFirstNameValid && isStateValid && isPinCodeValid && isSurNameValid && isMobileNumberValid && isAddressOneValid && isAddressTwoValid && isPostOfficeValid && isAreaNameValid && isEmailValid && isCountryValid
  if (!isFormValid) {
    addressSubmitErr.innerHTML = 'Clear the errors'
    setTimeout(showCouponSubmitErr, 2000)
    return false
  }
}
function showCouponSubmitErr () {
  const addressSubmitErr = document.getElementById('addressSubmitErr')
  addressSubmitErr.innerHTML = ''
}
