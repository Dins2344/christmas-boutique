function checkProName () {
  console.log('function called')
  const proNameEl = document.getElementById('proName').value
  const proNameErr = document.getElementById('proNameErr')

  let valid = false

  const min = 3
  const max = 25

  const proName = proNameEl

  if (!isLength(proName)) {
    proNameErr.innerHTML = 'Product name cannot be blank.'
  } else if (!isBetween(proName.length, min, max)) {
    proNameErr.innerHTML = `Product name must be between ${min} and ${max} characters.`
  } else {
    proNameErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCateName () {
  const cateNameEl = document.getElementById('CName').value
  const CNameErr = document.getElementById('CNameErr')
  let valid = false
  const min = 3
  const max = 25
  const cateName = cateNameEl
  if (!isLength(cateName)) {
    CNameErr.innerHTML = 'Category name can not be blank'
  } else if (!isBetween(cateName.length, min, max)) {
    CNameErr.innerHTML = `Category name must be between ${min} and ${max} characters.`
  } else if (!isAName(cateName)) {
    CNameErr.innerHTML = 'Enter valid name'
    return false
  } else {
    CNameErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkSubCateName () {
  const subCateNameEl = document.getElementById('SCName').value
  const SCNmeErr = document.getElementById('SCNameErr')
  let valid = false
  const min = 3
  const max = 25
  const subCateName = subCateNameEl
  if (!isLength(subCateName)) {
    SCNmeErr.innerHTML = 'Sub category name can not be blank'
  } else if (!isBetween(subCateName.length, min, max)) {
    SCNmeErr.innerHTML = `Sub category name must be between ${min} and ${max} characters.`
  } else if (!isAName(subCateName)) {
    SCNmeErr.innerHTML = 'Enter valid name'
    return false
  } else {
    SCNmeErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCateDescription () {
  const descriptionEl = document.getElementById('description').value
  const descErr = document.getElementById('descriptionErr')

  let valid = false

  const min = 5
  const max = 100

  const description = descriptionEl

  if (!isLength(description)) {
    descErr.innerHTML = 'Description cannot be blank.'
  } else if (!isBetween(description.length, min, max)) {
    descErr.innerHTML = `Description must be between ${min} and ${max} characters.`
  } else {
    descErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkDescription () {
  const descriptionEl = document.getElementById('description').value
  const descErr = document.getElementById('descErr')

  let valid = false

  const min = 5
  const max = 250

  const description = descriptionEl

  if (!isLength(description)) {
    descErr.innerHTML = 'Description cannot be blank.'
  } else if (!isBetween(description.length, min, max)) {
    descErr.innerHTML = `Description must be between ${min} and ${max} characters.`
  } else {
    descErr.innerHTML = ''
    valid = true
  }
  return valid
}

const checkPrice = () => {
  const priceEl = document.getElementById('price')
  const priceErr = document.getElementById('priceErr')
  let valid = false
  const price = priceEl.value.trim()
  if (!isLength(price)) {
    priceErr.innerHTML = 'Price cannot be blank'
    return false
  } else if (!isAPrice(price)) {
    priceErr.innerHTML = 'Enter valid price'
    return false
  } else {
    priceErr.innerHTML = ''
    valid = true
  }
  return valid
}
const checkDiscount = () => {
  const discountEl = document.getElementById('discount')
  const discountErr = document.getElementById('discountErr')
  let valid = false
  const discount = discountEl.value.trim()
  if (!isDiscount(discount)) {
    discountErr.innerHTML = 'Enter valid discount'
    return false
  } else {
    discountErr.innerHTML = ''
    valid = true
  }
  return valid
}

const isLength = (value) => value !== ''
const isBetween = (length, min, max) => !(length < min || length > max)
const isAName = (value) => {
  if (value.match(/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/)) {
    return true
  } else {
    return false
  }
}
const isAPrice = (value) => {
  if (value.match(/^\d{1,5}$/)) {
    return true
  } else {
    return false
  }
}
const isDiscount = (value) => {
  if (value.match(/\b\d{1,2}\b/)) {
    return true
  } else {
    return false
  }
}
function submitCheck () {
  const submitErr = document.getElementById('submitErr')
  const isProductNameValid = checkProName()
  const isDescriptionValid = checkDescription()
  const isPriceValid = checkPrice()
  const isDiscountValid = checkDiscount()

  const isFormValid =
    isProductNameValid && isDescriptionValid && isPriceValid && isDiscountValid
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

// Category validation

function categorySubmitCheck () {
  const cateSubmitErr = document.getElementById('cateSubmitErr')
  const isDescriptionValid = checkCateDescription()
  const isCateNameValid = checkCateName()
  const isSubCateName = checkSubCateName()

  const isFormValid =
  isCateNameValid && isDescriptionValid && isSubCateName
  if (!isFormValid) {
    cateSubmitErr.innerHTML = 'Clear the errors'
    setTimeout(showCateSubmitErr, 2000)
    return false
  }
}
function showCateSubmitErr () {
  const cateSubmitErr = document.getElementById('cateSubmitErr')
  cateSubmitErr.innerHTML = ''
}
// coupon validation
function checkCodeCoupon () {
  console.log('function called')
  const couponCodeEl = document.getElementById('couponCode').value
  const couponCodeErr = document.getElementById('couponCodeErr')

  let valid = false

  const min = 3
  const max = 10

  const couponCode = couponCodeEl

  if (!isLength(couponCode)) {
    couponCodeErr.innerHTML = 'Coupon code cannot be blank.'
  } else if (!isBetween(couponCode.length, min, max)) {
    couponCodeErr.innerHTML = `Coupon code must be between ${min} and ${max} characters.`
  } else if (!isCoupon(couponCode)) {
    couponCodeErr.innerHTML = 'Only capital letters and numbers are allowed'
  } else {
    couponCodeErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCodeTypeCoupon () {
  const couponTypeEl = document.getElementById('couponType').value
  const couponTypeErr = document.getElementById('couponTypeErr')

  let valid = false

  const min = 3
  const max = 10

  const couponType = couponTypeEl

  if (!isLength(couponType)) {
    couponTypeErr.innerHTML = 'Cannot be blank.'
  } else if (!isBetween(couponType.length, min, max)) {
    couponTypeErr.innerHTML = `Coupon code must be between ${min} and ${max} characters.`
  } else {
    couponTypeErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCouponDiscount () {
  const couponDiscEl = document.getElementById('couponDiscount').value
  const couponDiscErr = document.getElementById('couponDiscErr')

  let valid = false

  const couponDiscount = couponDiscEl

  if (!isLength(couponDiscount)) {
    couponDiscErr.innerHTML = 'Cannot be blank.'
  } else if (!isDiscount(couponDiscount)) {
    couponDiscErr.innerHTML = 'Enter valid discount'
  } else {
    couponDiscErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCouponMinLimit () {
  const couponMinLimitEl = document.getElementById('minLimit').value
  const couponMinLimitErr = document.getElementById('couponMimLimitErr')

  let valid = false

  const couponMinLimit = couponMinLimitEl

  if (!isLength(couponMinLimit)) {
    couponMinLimitErr.innerHTML = 'Cannot be blank.'
  } else if (!isAPrice(couponMinLimit)) {
    couponMinLimitErr.innerHTML = 'Enter valid price'
  } else {
    couponMinLimitErr.innerHTML = ''
    valid = true
  }
  return valid
}
function checkCouponMaxLimit () {
  const couponMaxLimitEl = document.getElementById('maxDis').value
  const couponMaxLimitErr = document.getElementById('couponMaxLimitErr')

  let valid = false

  const couponMaxLimit = couponMaxLimitEl

  if (!isLength(couponMaxLimit)) {
    couponMaxLimitErr.innerHTML = 'Cannot be blank.'
  } else if (!isAPrice(couponMaxLimit)) {
    couponMaxLimitErr.innerHTML = 'Enter valid price'
  } else {
    couponMaxLimitErr.innerHTML = ''
    valid = true
  }
  return valid
}
function isCoupon (coupon) {
  if (coupon.match(/^[A-Z0-9]+$/)) {
    return true
  } else {
    return false
  }
}

function couponSubmitCheck () {
  const couponSubmitErr = document.getElementById('couponSubmitErr')
  const isCouponCodeValid = checkCodeCoupon()
  const isCouponTypeValid = checkCodeTypeCoupon()
  const isCouponDiscountValid = checkCouponDiscount()
  const isCouponLimitValid = checkCouponMinLimit()
  const isMaxLimitValid = checkCouponMaxLimit()
  const isFormValid =
  isCouponCodeValid && isCouponTypeValid && isCouponDiscountValid && isCouponLimitValid && isMaxLimitValid
  if (!isFormValid) {
    couponSubmitErr.innerHTML = 'Clear the errors'
    setTimeout(showCouponSubmitErr, 2000)
    return false
  }
}
function showCouponSubmitErr () {
  const couponSubmitErr = document.getElementById('couponSubmitErr')
  couponSubmitErr.innerHTML = ''
}

// Address validation
