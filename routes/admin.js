const express = require('express')
const router = express.Router()
const sessionCheck = require('../middleware/sessionHandling')
const upload = require('../middleware/multer')
const controller = require('../controllers/adminController')

/* get admin home page */
router
  .route('/')
  .get(sessionCheck.adminSessionCheckingHome, controller.adminHome)
  .post(sessionCheck.adminSessionCheckingHome, controller.postGenerateReport)

/* login page get and post */
router
  .route('/login')
  .get(sessionCheck.adminSessionChecking, controller.adminLogin)
  .post(controller.adminLoginPost)

/* logout: session clear */
router.get('/logout', controller.adminLogout)

/* add product page rendering */
router
  .route('/addproduct')
  .get(sessionCheck.adminSessionCheckingHome, controller.adminAddProduct)
  .post(upload, controller.adminAddProductPost)

/* view product page rendering */
router
  .route('/viewproducts')
  .get(sessionCheck.adminSessionCheckingHome, controller.viewProducts)

/* to delete products */
router.get('/deletepro/:id', controller.deleteProducts)

/* to edit product details */
router
  .route('/editpro/:id')
  .get(sessionCheck.adminSessionCheckingHome, controller.editProductGet)
  .post(upload, controller.editProductPost)

/* users viewing page rendering */
router
  .route('/viewusers')
  .get(sessionCheck.adminSessionCheckingHome, controller.getUsers)
  .post()

/* to block and unblock users */
router.get('/blockuser/:id', controller.blockUser)
router.get('/unblockuser/:id', controller.unblockUser)

/* to load category viewing page */
router.get(
  '/category',
  sessionCheck.adminSessionCheckingHome,
  controller.categoryGet
)

/* to load addcategory page */
router
  .route('/addcategory')
  .get(sessionCheck.adminSessionCheckingHome, controller.addCategory)
  .post(controller.addCategoryPost)

/* to delete category */
router.get('/deletecategory/:id', controller.deleteCategory)

/* to edit category details */
router
  .route('/editcategory/:id')
  .get(sessionCheck.adminSessionCheckingHome, controller.editCategoryGet)
  .post(controller.editCategoryPost)

/* to render coupons page */
router.route('/coupons')
  .get(sessionCheck.adminSessionCheckingHome, controller.couponsGet)
  .post(sessionCheck.adminSessionCheckingHome, controller.addCoupon)
/* to render order management page */
router.get('/orders', sessionCheck.adminSessionCheckingHome, controller.ordersGet)

router.get('/view-order-details/:id', sessionCheck.adminSessionCheckingHome, controller.orderDetails)
router.post('/view-order-details', sessionCheck.adminSessionCheckingHome, controller.orderUpdating)
// router.get('/add-coupon', controller.addCoupon)
/* to delete a coupon */
router.get('/delete-coupon/:id', controller.deleteCoupon)
router.get('/edit-coupon', controller.editCoupon)
router.post('/make-report', controller.makeReport)
router.get('/add-product-offer', sessionCheck.adminSessionCheckingHome, controller.offerPageShow)
router.get('/product-offer-create', sessionCheck.adminSessionCheckingHome, controller.addProductOffer)
router.get('/remove-product-offer/:id', sessionCheck.adminSessionCheckingHome, controller.removeProductOffer)
router.get('/category-offers', sessionCheck.adminSessionCheckingHome, controller.categoryPageShow)
router.post('/add-category-offer', sessionCheck.adminSessionCheckingHome, controller.addCategoryOffer)
router.get('/remove-category-offer/:id', sessionCheck.adminSessionCheckingHome, controller.removeCategoryOffer)
router.get('/order-return-requests', sessionCheck.adminSessionCheckingHome, controller.returnRequests)
router.get('/order-return-request-approved/:id', sessionCheck.adminSessionCheckingHome, controller.returnRequestApproval)
router.get('/refund-requests', sessionCheck.adminSessionCheckingHome, controller.refundRequests)
router.get('/reject-return/:id', sessionCheck.adminSessionCheckingHome, controller.rejectReturn)
router.get('/refund-approved/:id', sessionCheck.adminSessionCheckingHome, controller.refundApproved)
router.get('/data-for-graphs', controller.getDataForGraphs)
module.exports = router
