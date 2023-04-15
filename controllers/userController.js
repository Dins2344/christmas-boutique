
const userHelpers = require('../helpers/userHelpers')
const productHelpers = require('../helpers/productHelpers')
const twilio = require('../middleware/twilio')
const generateUniqueId = require('generate-unique-id')
const fs = require('fs')
const generateDocument = require('../middleware/documentCreator')

module.exports = {

  getUserHome: async (req, res) => {
    try {
      const ip = req.ip
      userHelpers.saveVisitors(ip)
      const newProducts = await productHelpers.getLatestPro()
      const hotSaleProducts = await productHelpers.getHotSales()
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let userDetails
      if (req.session.user) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        const wishlistCount = wishlist.length
        const itemsCount = await userHelpers.getCartItemsCount(userInfo._id)

        res.render('user_layouts/index', {
          title: 'christmas boutique',
          userInfo,
          wishlistCount,
          itemsCount,
          categories,
          newProducts,
          hotSaleProducts,
          userDetails
        })
      } else {
        res.render('user_layouts/index', { title: 'christmas boutique' })
      }
    } catch (err) {
      console.log(err + 'home page rendering issue')
      res.status(500).render('404')
    }
  },

  userLoginGet: (req, res) => {
    try {
      res.render('user_layouts/login', {
        title: 'christmas boutique',
        logErr: req.session.logErr
      })
      req.session.logErr = false
    } catch (err) {
      console.log(err + 'login page rendering error')
      res.status(500).render('404')
    }
  },
  userLoginPost: (req, res) => {
    try {
      userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
          req.session.user = response.user
          req.session.user.loggedIn = true
          userHelpers.getWallet(req.session.user._id).then((wallet) => {
            if (!wallet) {
              userHelpers.createWallet(req.session.user._id)
              res.redirect('/')
            } else {
              res.redirect('/')
            }
          })
        } else if (response.blocked) {
          console.log('blocked')
          req.session.logErr = 'Your account has been blocked'
          res.redirect('/login')
        } else if (!response) {
          req.session.logErr = 'invalid user name or password'
          res.redirect('/login')
        }
      })
    } catch (err) {
      console.log(err + 'login post err')
      res.status(500).render('404')
    }
  },

  userSignupGet: (req, res) => {
    try {
      res.render('user_layouts/signup', {
        title: 'christmas boutique',
        emailerr: req.session.emailerr,
        passerr: req.session.passerr
      })
      req.session.emailerr = false
      req.session.passerr = false
    } catch (err) {
      console.log(err + 'signup get err')
      res.status(500).render('404')
    }
  },

  userSignupPost: (req, res) => {
    try {
      const status = true
      const signUp = req.body

      if (signUp.password === signUp.cpassword) {
        userHelpers.doSignup(req.body, status).then((userEmail) => {
          const email = userEmail
          if (email === null) {
            res.redirect('/login')
          } else {
            req.session.emailerr =
              'email address or phone number is already exist'
            res.redirect('/signup')
          }
        })
      } else {
        req.session.passerr = 'confirm password should be same as password'
        res.redirect('/signup')
      }
    } catch (err) {
      console.log(err)
      res.status(500).render('404')
    }
  },

  userLoginOtpGet: (req, res) => {
    try {
      res.render('user_layouts/otp', { logErr: req.session.logErr })
      req.session.logErr = false
    } catch (err) {
      console.log(err + 'login page get err')
      res.status(500).render('404')
    }
  },
  userLoginOtpPost: (req, res) => {
    try {
      userHelpers
        .otpNumbersending(req.body)
        .then((user) => {
          twilio.generateOpt(user.Pnumber).then(() => {
            req.session.mobile = req.body.Pnumber
            res.redirect('/otpverify')
          })
        })
        .catch((response) => {
          if (response.status) {
            console.log('blocked')
            req.session.logErr = 'Your account has been blocked'
            res.redirect('/otplogin')
          } else if (!response.status) {
            req.session.logErr = 'this number is not registered'
            res.redirect('/otplogin')
          }
        })
    } catch (err) {
      console.log(err + 'login post err')
      res.status(500).render('404')
    }
  },

  userOtpVerifyGet: (req, res) => {
    try {
      res.render('user_layouts/otpEnter', { OTPerr: req.session.OTPerr })
      req.session.OTPerr = false
    } catch (err) {
      console.log(err + 'otp verify get err')
      res.status(500).render('404')
    }
  },
  userOtpVerifyPost: (req, res) => {
    try {
      const otp = req.body
      const number = req.session.mobile
      twilio.verifyOtp(number, otp).then((status) => {
        if (status.status === 'approved') {
          userHelpers.userGetting(number).then((user) => {
            req.session.user = user
            req.session.user.loggedIn = true
            userHelpers.getWallet(req.session.user._id).then((wallet) => {
              if (!wallet) {
                userHelpers.createWallet(req.session.user._id)
                res.redirect('/')
              } else {
                res.redirect('/')
              }
            })
          })
        } else {
          req.session.OTPerr = 'entered OTP is not valid'
          res.redirect('/otpverify')
        }
      })
    } catch (err) {
      console.log(err + 'otp verify post err')
      res.status(500).render('404')
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let page = 1
      const limit = 6
      let productsCount
      if (req.query.page) {
        page = req.query.page
      }
      let products
      if (req.query.search) {
        const search = req.query.search
        products = await productHelpers.getSearchedProducts(search, page, limit)
        productsCount = await productHelpers.getSearchedProductsLength(search)
      } else if (req.query.min || req.query.max) {
        const max = req.query.max
        const min = req.query.min
        products = await productHelpers.getAmountBasedProducts(min, max)
      } else if (req.query.sort) {
        const sort = req.query.sort
        if (sort === 'low') {
          products = await productHelpers.getProductsAscending()
        } else if (sort === 'high') {
          products = await productHelpers.getProductsDescending()
        }
      } else {
        products = await productHelpers.getAllProducts(page, limit)
        productsCount = await productHelpers.getAllProductsCount()
      }
      const totalPages = Math.ceil(productsCount / limit)
      const maxPage = []
      for (let i = 1; i <= totalPages; i++) {
        maxPage.push({ pageNumber: i })
      }
      let cartProducts
      let userDetails
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
        cartProducts = await userHelpers.getCartProducts(userInfo._id)
        if (cartProducts) {
          await cartCompare()
          function cartCompare () {
            for (const item of cartProducts) {
              // Compare the productId field of the item to the _id field of each product in the products array
              for (const product of products) {
                if (item.cartProduct._id.toString() === product._id.toString()) {
                  product.addedToCart = true
                }
              }
            }
          }
        }
        await compare()
        function compare () {
          for (const item of wishlist) {
          // Compare the productId field of the item to the _id field of each product in the products array
            for (const product of products) {
              if (item.productId === product._id.toString()) {
                product.wished = true
              }
            }
          }
        }
      }
      res.render('user_layouts/shopAll', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        page,
        maxPage,
        itemsCount,
        wishlistCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'all product getting err')
      res.status(500).render('404')
    }
  },

  getTreeProducts: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let page = 1
      const limit = 2

      if (req.query.treePage) {
        page = req.query.treePage
      }
      let userDetails
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      const category = 'Christmas tree'
      const products = await productHelpers.getCategoryProducts(category, page, limit)
      const productsCount = await productHelpers.getCategoryProductsCount(category)
      const totalPages = Math.ceil(productsCount / limit)
      const maxPage = []
      for (let i = 1; i <= totalPages; i++) {
        maxPage.push({ pageNumber: i })
      }
      res.render('user_layouts/chrisTree', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        itemsCount,
        maxPage,
        wishlistCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'tree category getting err')
      res.status(500).render('404')
    }
  },

  getOrnamentsProducts: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let page = 1
      const limit = 2

      if (req.query.treePage) {
        page = req.query.treePage
      }
      let userDetails
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      const category = 'Unique ornaments'
      const products = await productHelpers.getCategoryProducts(category, page, limit)
      const productsCount = await productHelpers.getCategoryProductsCount(category)
      const totalPages = Math.ceil(productsCount / limit)
      const maxPage = []
      for (let i = 1; i <= totalPages; i++) {
        maxPage.push({ pageNumber: i })
      }
      res.render('user_layouts/uniqueOrna', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        itemsCount,
        maxPage,
        wishlistCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'ornaments getting err')
      res.status(500).render('404')
    }
  },

  getHolidayLightProducts: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let page = 1
      const limit = 2

      if (req.query.treePage) {
        page = req.query.treePage
      }
      let userDetails
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      const category = 'Holiday lights'
      const products = await productHelpers.getCategoryProducts(category, page, limit)
      const productsCount = await productHelpers.getCategoryProductsCount(category)
      const totalPages = Math.ceil(productsCount / limit)
      const maxPage = []
      for (let i = 1; i <= totalPages; i++) {
        maxPage.push({ pageNumber: i })
      }
      res.render('user_layouts/holidayLights', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        itemsCount,
        maxPage,
        wishlistCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'lights getting err')
      res.status(500).render('404')
    }
  },

  quickviewGet: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let userDetails
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      productHelpers.getProduct(req.params.id).then((product) => {
        res.render('user_layouts/holidayLights copy', {
          title: 'christmas boutique',
          userInfo,
          product,
          categories,
          itemsCount,
          wishlistCount,
          userDetails
        })
      })
    } catch (err) {
      console.log(err + 'quick view get err')
      res.status(500).render('404')
    }
  },
  userInfoGet: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let userDetails

      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      res.render('user_layouts/user_profile/userInfo', {
        title: 'christmas boutique',
        userInfo,
        categories,
        wishlistCount,
        itemsCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'user Info get err')
      res.status(500).render('404')
    }
  },
  userInfoPost: async (req, res) => {
    try {
      const data = req.body
      const userInfo = req.session.user

      await userHelpers.editUserInfo(data, userInfo._id)
      res.redirect('/userinfo')
    } catch (err) {
      console.log(err + 'userInfo post err')
      res.status(500).render('404')
    }
  },
  addressManageGet: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const userInfo = req.session.user
      let userDetails
      const address = await userHelpers.getAllAddress(userInfo._id)
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      res.render('user_layouts/user_profile/addressManage', {
        title: 'christmas boutique',
        userInfo,
        categories,
        address,
        wishlistCount,
        itemsCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'address management get err')
      res.status(500).render('404')
    }
  },
  addAddressPost: (req, res) => {
    try {
      const address = req.body
      const user = req.session.user
      userHelpers.addressAdding(user._id, address)
      res.redirect('/manage-address')
    } catch (err) {
      console.log(err + 'address post err')
      res.status(500).render('404')
    }
  },
  addNewAddress: (req, res) => {
    try {
      const address = req.query

      const user = req.session.user
      userHelpers.addressAdding(user._id, address)
      res.redirect('/proceed-to-checkout')
    } catch (err) {
      console.log(err + 'new address adding err')
      res.status(500).render('404')
    }
  },
  deleteAddress: async (req, res) => {
    try {
      const id = req.params.id
      await userHelpers.deleteAddress(id)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'delete address err')
      res.status(500).render('404')
    }
  },
  addToWishlist: (req, res) => {
    try {
      const wid = req.params.id
      const user = req.session.user
      userHelpers.wishlistAdd(wid, user._id)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'adding wishlist err')
      res.status(500).render('404')
    }
  },
  showingWishlist: async (req, res) => {
    try {
      const userInfo = req.session.user
      const userDetails = await userHelpers.getAUser(userInfo._id)
      const categories = await productHelpers.getCategories()
      const wishlists = await userHelpers.getAllWishlists(userInfo._id)
      const wishlistCount = wishlists.length
      const itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      res.render('user_layouts/user_profile/wishlistShow', {
        title: 'christmas boutique',
        userInfo,
        categories,
        wishlists,
        wishlistCount,
        itemsCount,
        userDetails
      })
    } catch (err) {
      console.log(err + 'wishlist showing err')
      res.status(500).render('404')
    }
  },
  deleteWishlist: async (req, res) => {
    try {
      const id = req.params.id
      await userHelpers.deleteWishlist(id)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'delete wishlist err')
      res.status(500).render('404')
    }
  },
  addToCart: (req, res) => {
    try {
      const userId = req.session.user._id
      const cartData = req.body

      userHelpers.addToCart(userId, cartData.proId, cartData.quantity).then(() => {
        res.json({ status: true })
      })
    } catch (err) {
      console.log(err + 'add to cart err')
      res.status(500).render('404')
    }
  },
  showingMyCart: async (req, res) => {
    try {
      const userInfo = req.session.user
      let userDetails
      const categories = await productHelpers.getCategories()
      const cartDetails = await userHelpers.getCartDetails(userInfo._id)
      const cartItems = await userHelpers.getCartProducts(userInfo._id)
      let total = 0
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].cartProduct.discountPrice) {
          cartItems[i].cartProduct.Price = cartItems[i].cartProduct.discountPrice
        }
        total = total + (cartItems[i].quantity * cartItems[i].cartProduct.Price)
      }
      total = 40 + total
      await userHelpers.addTotalToCart(total, userInfo._id)
      const tax = Math.round((total / 100) * 18)
      const subTotal = total - tax
      let userCoupons
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userCoupons = await userHelpers.getUserCoupons(userInfo._id)
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      res.render('user_layouts/user_profile/cart', {
        title: 'christmas boutique',
        userInfo,
        categories,
        cartItems,
        wishlistCount,
        itemsCount,
        total,
        subTotal,
        tax,
        cartDetails,
        userDetails,
        userCoupons

      })
    } catch (err) {
      console.log(err + 'showing cart page err')
      res.status(500).render('404')
    }
  },
  updateQuantity: (req, res) => {
    try {
      userHelpers.updateQuantity(req.body).then((response) => {
        res.json(response)
      })
    } catch (err) {
      console.log(err + 'update quantity err')
      res.status(500).render('404')
    }
  },
  deleteCartItem: async (req, res) => {
    try {
      const proId = req.params.id
      const userInfo = req.session.user

      await userHelpers.deleteOneCartItem(userInfo._id, proId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'delete cart item err')
      res.status(500).render('404')
    }
  },
  proceedToCheckOut: async (req, res) => {
    try {
      const userInfo = req.session.user
      let userDetails
      const categories = await productHelpers.getCategories()
      const cartItems = await userHelpers.getCartProducts(userInfo._id)
      const cart = await userHelpers.getCartDetails(userInfo._id)
      let total
      let discount
      if (cart.coupon) {
        total = cart.discountedPrice
        discount = cart.discount
      } else {
        total = await userHelpers.getNewTotal(userInfo._id)
      }
      const tax = Math.round((total / 100) * 18)
      const subTotal = total - tax
      const address = await userHelpers.getAllAddress(userInfo._id)
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }

      res.render('user_layouts/user_profile/checkout',
        {
          title: 'christmas boutique',
          total,
          discount,
          userInfo,
          categories,
          cartItems,
          wishlistCount,
          itemsCount,
          userDetails,
          address,
          subTotal,
          tax
        })
    } catch (err) {
      console.log(err + 'proceed to checkout err')
      res.status(500).render('404')
    }
  },
  proceedToCheckOutPost: async (req, res) => {
    try {
      const data = req.body
      let status
      if (data.flexRadioDefault === 'COD' || data.flexRadioDefault === 'wallet') {
        status = 'placed'
      } else {
        status = 'pending'
      }
      const userInfo = req.session.user
      const cartItems = await userHelpers.getCartProducts(userInfo._id)
      req.session.addressId = data.addressId
      const address = await userHelpers.getAAddress(data.addressId)
      const cart = await userHelpers.getCartDetails(userInfo._id)
      let totalAmount
      let discount
      let couponCode
      if (cart.coupon) {
        totalAmount = cart.discountedPrice
        discount = cart.discount
        couponCode = cart.coupon.couponCode
      } else {
        totalAmount = parseInt(40 + await userHelpers.getTotalAmount(userInfo._id))
      }
      const taxAmount = Math.round((totalAmount / 100) * 18)
      const itemsTotalAmount = totalAmount - taxAmount
      const today = new Date()
      const yyyy = today.getFullYear()
      let mm = today.getMonth() + 1 // Months start at 0!
      let dd = today.getDate()

      if (dd < 10) dd = '0' + dd
      if (mm < 10) mm = '0' + mm

      const formattedToday = yyyy + '-' + mm + '-' + dd
      const coupons = await userHelpers.getAllCoupons()
      if (coupons.length) {
        const randomIndex = Math.floor(Math.random() * coupons.length)
        const randomCoupon = coupons[randomIndex]
        await userHelpers.addCoupon(userInfo._id, randomCoupon)
      }

      const orderDetails = {
        couponCode,
        discount,
        deliveryAddressId: data.addressId,
        userId: userInfo._id,
        userFirstName: userInfo.Fname,
        userLastName: userInfo.Lname,
        paymentMethod: data.flexRadioDefault,
        total: totalAmount,
        tax: taxAmount,
        itemsTotal: itemsTotalAmount,
        products: cartItems,
        orderStatus: status,
        deliveryStatus: 'Ready for shipping',
        deliveryAddress: address,
        orderedDate: formattedToday,
        orderId: generateUniqueId({
          length: 8,
          excludeSymbols: ['0'],
          useLetters: false
        })
      }
      if (cart.coupon) {
        await userHelpers.redeemCoupon(cart.coupon.couponId, userInfo._id)
      }
      if (data.flexRadioDefault !== 'wallet') { await userHelpers.addToOrders(orderDetails) }
      // eslint-disable-next-line eqeqeq
      if (data.flexRadioDefault == 'online payment') {
        userHelpers.razorPay(orderDetails.orderId, orderDetails.total).then((razorOrder) => {
          res.json({ razorOrder, status: 'online' })
        })
        // eslint-disable-next-line eqeqeq
      } else if (data.flexRadioDefault == 'COD') {
        res.json({ status: 'COD' })
        // eslint-disable-next-line eqeqeq
      } else if (data.flexRadioDefault == 'wallet') {
        userHelpers.walletPay(orderDetails).then(async (walletNotEnough) => {
          if (!walletNotEnough) {
            await userHelpers.addToOrders(orderDetails)
          }
          res.json({ walletNotEnough, status: 'wallet' })
        })
      }
    } catch (err) {
      console.log(err + 'proceed to post err')
      res.status(500).render('404')
    }
  },
  verifyPayment: (req, res) => {
    try {
      userHelpers.verifyPayment(req.body).then(() => {
        userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
          res.json({ status: true })
        })
      }).catch(() => {
        res.json({ status: false })
      })
    } catch (err) {
      console.log(err + 'verify payment err')
      res.status(500).render('404')
    }
  },
  orderPlaced: async (req, res) => {
    try {
      const userInfo = req.session.user
      let userDetails
      const addressId = req.session.addressId
      const address = await userHelpers.getAAddress(addressId)
      const categories = await productHelpers.getCategories()
      const cartItems = await userHelpers.getCartProducts(userInfo._id)
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      await userHelpers.deleteCartItems(userInfo._id)
      const orders = await userHelpers.getAllOrders(userInfo._id)
      const lastOrder = orders[0]
      res.render('user_layouts/user_profile/orderPlaced', {
        title: 'christmas boutique',
        userInfo,
        categories,
        cartItems,
        wishlistCount,
        itemsCount,
        userDetails,
        address,
        lastOrder
      })
    } catch (err) {
      console.log(err + 'order place err')
      res.status(500).render('404')
    }
  },
  showOrders: async (req, res) => {
    try {
      const userInfo = req.session.user
      let userDetails
      let page = 1
      const limit = 4
      if (req.query.page) {
        page = req.query.page
      }
      const categories = await productHelpers.getCategories()
      const orders = await userHelpers.getOrders(userInfo._id, page, limit)
      const ordersCount = await userHelpers.getOrdersCount(userInfo._id)
      const totalPages = Math.ceil(ordersCount / limit)
      const maxPage = []
      for (let i = 1; i <= totalPages; i++) {
        maxPage.push({ pageNumber: i })
      }
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }

      res.render('user_layouts/user_profile/myOrders', {
        title: 'christmas boutique',
        userInfo,
        categories,
        orders,
        maxPage,
        wishlistCount,
        userDetails,
        itemsCount
      })
    } catch (err) {
      console.log(err + 'order show err')
      res.status(500).render('404')
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id

      await userHelpers.orderCancellation(orderId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'cancel order err')
      res.status(500).render('404')
    }
  },
  returnOrder: async (req, res) => {
    try {
      const orderId = req.params.id

      await userHelpers.orderReturn(orderId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'return order err')
      res.status(500).render('404')
    }
  },
  makeDocument: async (req, res) => {
    const data = req.body
    const format = data.format
    // Check if format field is present
    if (!format) {
      return res.status(400).send('Format field is required')
    }
    // Generate the sales report using your e-commerce data
    let salesData
    try {
      salesData = await userHelpers.getAOrder(data.orderId)
    } catch (err) {
      console.log('Error calculating sales data:', err)
      return res.status(500).send('Error calculating sales data')
    }
    try {
    // Convert the report into the selected file format and get the name of the generated file
      const reportFile = await generateDocument(format, salesData)
      // Set content type and file extension based on format
      let contentType, fileExtension
      if (format === 'pdf') {
        contentType = 'application/pdf'
        fileExtension = 'pdf'
      } else {
        return res.status(400).send('Invalid format specified')
      }
      // Send the report back to the client and download it
      res.setHeader('Content-Disposition', `attachment; filename=document.${fileExtension}`)
      res.setHeader('Content-Type', contentType)
      const fileStream = fs.createReadStream(reportFile)
      fileStream.pipe(res)
      fileStream.on('end', () => {
        console.log('File sent successfully!')
        // Remove the file from the server
        fs.unlink(reportFile, (err) => {
          if (err) {
            console.log('Error deleting file:', err)
          } else {
            console.log('File deleted successfully!')
          }
        })
      })
    } catch (err) {
      console.log('Error generating invoice:', err)
      return res.status(500).send('Error generating invoice')
    }
  },
  myWalletShow: async (req, res) => {
    try {
      const userInfo = req.session.user
      let userDetails
      const categories = await productHelpers.getCategories()
      const cartItems = await userHelpers.getCartProducts(userInfo._id)
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      const myWallet = await userHelpers.getWallet(userInfo._id)
      if (myWallet.transactions.length) {
        myWallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
      res.render('user_layouts/user_profile/myWallet', {
        title: 'christmas boutique',
        userInfo,
        categories,
        cartItems,
        wishlistCount,
        itemsCount,
        userDetails,
        myWallet
      })
    } catch (err) {
      console.log(err + 'wallet show err')
      res.status(500).render('404')
    }
  },

  userLogout: (req, res) => {
    try {
      req.session.user = null
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'logOut err')
      res.status(500).render('404')
    }
  },

  showCouponsPage: async (req, res) => {
    try {
      const userInfo = req.session.user
      let userDetails
      const categories = await productHelpers.getCategories()
      const cartItems = await userHelpers.getCartProducts(userInfo._id)
      let wishlistCount
      let itemsCount
      if (userInfo) {
        userDetails = await userHelpers.getAUser(userInfo._id)
        const wishlist = await userHelpers.getAllWishlists(userInfo._id)
        wishlistCount = wishlist.length
        itemsCount = await userHelpers.getCartItemsCount(userInfo._id)
      }
      const myCoupons = await userHelpers.getUsersAllCoupons(userInfo._id)
      res.render('user_layouts/user_profile/myCoupons', {
        title: 'christmas boutique',
        userInfo,
        categories,
        cartItems,
        wishlistCount,
        itemsCount,
        userDetails,
        myCoupons

      })
    } catch (err) {
      console.log(err + 'show coupon page err')
      res.status(500).render('404')
    }
  },
  applyCoupon: async (req, res) => {
    try {
      const user = req.session.user
      const couponData = req.body
      console.log(couponData)
      if (couponData.couponId === '') {
        res.json({ status: false })
      }
      const coupon = await userHelpers.getACoupon(couponData.couponCode, user._id)
      const totalAmount = await userHelpers.getNewTotal(user._id)
      const discountedPrice = Math.round(totalAmount - ((parseInt(coupon.discount) / 100) * totalAmount))
      await userHelpers.addCouponDiscount(user._id, discountedPrice, coupon.discount, coupon)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'coupon applying err')
      res.status(500).render('404')
    }
  },
  unsetCoupon: async (req, res) => {
    try {
      const userInfo = req.session.user
      const couponId = req.query
      await userHelpers.unsetCoupon(couponId, userInfo._id)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'coupon unset err')
      res.status(500).render('404')
    }
  }

}
