const express = require('express')
const statusChecker = require('../middleware/statusChecker')
const userController = require('../controllers/userController')
const router = express.Router()
const controller = require('../controllers/userController')
const sessionCheck = require('../middleware/sessionHandling')

/* GET home page. */
router.get('/', controller.getUserHome)

/* login page rendering */
router
  .route('/login')
  .get(sessionCheck.userSessionChecking, controller.userLoginGet)
  .post(controller.userLoginPost)

/* login Otp page rendering */
router
  .route('/otplogin')
  .get(controller.userLoginOtpGet)
  .post(controller.userLoginOtpPost)

router
  .route('/otpverify')
  .get(controller.userOtpVerifyGet)
  .post(controller.userOtpVerifyPost)

/* signup page rendering */
router
  .route('/signup')
  .get(controller.userSignupGet)
  .post(controller.userSignupPost)

router.get('/allproduct', controller.getAllProducts)

router.get('/quickView/:id', controller.quickviewGet)

router.get('/christmas%20tree', controller.getTreeProducts)
router.get('/Unique%20ornaments', controller.getOrnamentsProducts)
router.get('/Holiday%20lights', controller.getHolidayLightProducts)

// userinfo loading page rendering
router.route('/userinfo')
  .get(sessionCheck.userSessionCheckingHome, controller.userInfoGet)
  .post(sessionCheck.userSessionCheckingHome, controller.userInfoPost)
router.route('/manage-address')
  .get(sessionCheck.userSessionCheckingHome, controller.addressManageGet)
  .post(controller.addAddressPost)

router.get('/addNewAddress', userController.addNewAddress)

router.get('/delete-address/:id', controller.deleteAddress)

// adding wishlist
router.get('/wishlist-add/:id', controller.addToWishlist)

/* showing wishlist */
router.get('/my-wishlist', sessionCheck.userSessionCheckingHome, controller.showingWishlist)
router.get('/delete-wishlist/:id', controller.deleteWishlist)

// add to cart methods
router.get('/add-cart/:id', sessionCheck.userSessionCheckingHome, controller.addToCart)
/* my cart get method */
router.get('/my-cart', sessionCheck.userSessionCheckingHome, controller.showingMyCart)
/* cart product quantity update post method */
router.post('/update-product-quantity', sessionCheck.userSessionCheckingHome, controller.updateQuantity)
/* cart product delete method */
router.get('/delete-cart-item/:id', controller.deleteCartItem)
/* my cart total amount get method */
router.route('/proceed-to-checkout')
  .get(sessionCheck.userSessionCheckingHome, controller.proceedToCheckOut)
  .post(statusChecker.userStatusChecking, controller.proceedToCheckOutPost)

router.post('/verify-payment', controller.verifyPayment)
/* my cart total amount get method */
router.get('/order-placed', sessionCheck.userSessionCheckingHome, controller.orderPlaced)
/* my orders list get method */
router.get('/my-orders', sessionCheck.userSessionCheckingHome, controller.showOrders)

/* my invoice download post method */
router.post('/admin/create-report', sessionCheck.userSessionCheckingHome, controller.makeDocument)
/* my coupons get method */
router.get('/my-coupons', sessionCheck.userSessionCheckingHome, controller.showCouponsPage)
/* my coupons applying get method */
router.post('/coupon-applied', sessionCheck.userSessionCheckingHome, controller.applyCoupon)
/* applied coupon removing get method */
router.get('/remove-coupon', controller.unsetCoupon)
// order cancellation get method
router.get('/order-cancellation-request/:id', sessionCheck.userSessionCheckingHome, controller.cancelOrder)
// order return request
router.get('/order-return-request/:id', sessionCheck.userSessionCheckingHome, controller.returnOrder)
// my wallet get method
router.get('/my-wallet', sessionCheck.userSessionCheckingHome, controller.myWalletShow)
/* logout get method */
router.get('/logout', controller.userLogout)

module.exports = router
