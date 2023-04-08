
const userHelpers = require('../helpers/userHelpers')
const productHelpers = require('../helpers/productHelpers')
const twilio = require('../middleware/twilio')
const generateUniqueId = require('generate-unique-id')
const fs = require('fs')
const generateDocument = require('../middleware/documentCreator')

module.exports = {

  getUserHome: async (req, res) => {
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
  },

  userLoginGet: (req, res) => {
    res.render('user_layouts/login', {
      title: 'christmas boutique',
      logErr: req.session.logErr
    })
    req.session.logErr = false
  },
  userLoginPost: (req, res) => {
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
  },

  userSignupGet: (req, res) => {
    res.render('user_layouts/signup', {
      title: 'christmas boutique',
      emailerr: req.session.emailerr,
      passerr: req.session.passerr
    })
    req.session.emailerr = false
    req.session.passerr = false
  },

  userSignupPost: (req, res) => {
    const status = true
    const signUp = req.body
    console.log(signUp)
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
  },

  userLoginOtpGet: (req, res) => {
    res.render('user_layouts/otp', { logErr: req.session.logErr })
    req.session.logErr = false
  },
  userLoginOtpPost: (req, res) => {
    userHelpers
      .otpNumbersending(req.body)
      .then((user) => {
        twilio.generateOpt(user.Pnumber).then(() => {
          req.session.mobile = req.body.Pnumber
          res.redirect('/otpverify')
        })
      })
      .catch((response) => {
        console.log(response)
        if (response.status) {
          console.log('blocked')
          req.session.logErr = 'Your account has been blocked'
          res.redirect('/otplogin')
        } else if (!response.status) {
          req.session.logErr = 'this number is not registered'
          res.redirect('/otplogin')
        }
      })
  },

  userOtpVerifyGet: (req, res) => {
    res.render('user_layouts/otpEnter', { OTPerr: req.session.OTPerr })
    req.session.OTPerr = false
  },
  userOtpVerifyPost: (req, res) => {
    const otp = req.body
    const number = req.session.mobile
    twilio.verifyOtp(number, otp).then((status) => {
      if (status.status === 'approved') {
        userHelpers.userGetting(number).then((user) => {
          console.log(user)
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
  },

  getAllProducts: async (req, res) => {
    const categories = await productHelpers.getCategories()
    const userInfo = req.session.user
    const products = await productHelpers.getAllProducts()
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
      itemsCount,
      wishlistCount,
      userDetails
    })
  },

  getTreeProducts: async (req, res) => {
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
    productHelpers.getTreeProducts().then((products) => {
      res.render('user_layouts/chrisTree', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        itemsCount,
        wishlistCount,
        userDetails
      })
    })
  },
  getOrnamentsProducts: async (req, res) => {
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
    productHelpers.getOrnamentsProducts().then((products) => {
      res.render('user_layouts/uniqueOrna', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        itemsCount,
        wishlistCount,
        userDetails
      })
    })
  },
  getHolidayLightProducts: async (req, res) => {
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
    productHelpers.getHolidayLightsProducts().then((products) => {
      res.render('user_layouts/holidayLights', {
        title: 'christmas boutique',
        userInfo,
        products,
        categories,
        itemsCount,
        wishlistCount,
        userDetails
      })
    })
  },

  quickviewGet: async (req, res) => {
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
  },
  userInfoGet: async (req, res) => {
    const categories = await productHelpers.getCategories()
    const userInfo = req.session.user
    let userDetails
    console.log(userDetails)
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
  },
  userInfoPost: async (req, res) => {
    const data = req.body
    const userInfo = req.session.user

    await userHelpers.editUserInfo(data, userInfo._id)
    res.redirect('/userinfo')
  },
  addressManageGet: async (req, res) => {
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
  },
  addAddressPost: (req, res) => {
    const address = req.body
    const user = req.session.user
    userHelpers.addressAdding(user._id, address)
    res.redirect('/manage-address')
  },
  addNewAddress: (req, res) => {
    const address = req.query
    console.log(address)
    const user = req.session.user
    userHelpers.addressAdding(user._id, address)
    // res.json({ status: true })
    res.redirect('/proceed-to-checkout')
  },
  deleteAddress: (req, res) => {
    const id = req.params.id
    userHelpers.deleteAddress(id)
    res.redirect('/manage-address')
  },
  addToWishlist: (req, res) => {
    const wid = req.params.id
    const user = req.session.user
    userHelpers.wishlistAdd(wid, user._id)

    res.json({ status: true })
  },
  showingWishlist: async (req, res) => {
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
  },
  deleteWishlist: async (req, res) => {
    const id = req.params.id
    console.log('id vannuuu' + id)
    await userHelpers.deleteWishlist(id)
    res.json({ status: true })
  },
  addToCart: (req, res) => {
    const userId = req.session.user._id
    const proId = req.params.id
    userHelpers.addToCart(userId, proId).then(() => {
      res.json({ status: true })
    })
  },
  showingMyCart: async (req, res) => {
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
  },
  updateQuantity: (req, res) => {
    userHelpers.updateQuantity(req.body).then((response) => {
      res.json(response)
    })
  },
  deleteCartItem: async (req, res) => {
    const proId = req.params.id
    const userInfo = req.session.user
    console.log(proId)
    await userHelpers.deleteOneCartItem(userInfo._id, proId)
    res.json({ status: true })
  },
  proceedToCheckOut: async (req, res) => {
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
      console.log(total)
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
  },
  proceedToCheckOutPost: async (req, res) => {
    const data = req.body
    const status = data.flexRadioDefault === 'COD' ? 'placed' : 'pending'
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
    if (coupons) {
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
    userHelpers.addToOrders(orderDetails).then(async () => {
      if (data.flexRadioDefault == 'online payment') {
        userHelpers.razorPay(orderDetails.orderId, orderDetails.total).then((razorOrder) => {
          res.json({ razorOrder, status: 'online' })
        })
      } else if (data.flexRadioDefault == 'COD') {
        res.json({ status: 'COD' })
      } else if (data.flexRadioDefault == 'wallet') {
        userHelpers.walletPay(orderDetails).then((walletNotEnough) => {
          console.log(walletNotEnough)
          res.json({ walletNotEnough, status: 'wallet' })
        })
      }
    })
  },
  verifyPayment: (req, res) => {
    userHelpers.verifyPayment(req.body).then(() => {
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    }).catch(() => {
      res.json({ status: false })
    })
  },
  orderPlaced: async (req, res) => {
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
    const orders = userHelpers.getOrders(userInfo._id)
    const lastOrder = orders[orders.length - 1]
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
  },
  showOrders: async (req, res) => {
    const userInfo = req.session.user
    let userDetails
    const categories = await productHelpers.getCategories()
    const orders = await userHelpers.getOrders(userInfo._id)
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
      wishlistCount,
      userDetails,
      itemsCount
    })
  },
  cancelOrder: async (req, res) => {
    const orderId = req.params.id
    console.log(orderId)
    await userHelpers.orderCancellation(orderId)
    res.json({ status: true })
  },
  returnOrder: async (req, res) => {
    const orderId = req.params.id
    console.log(orderId)
    await userHelpers.orderReturn(orderId)
    res.json({ status: true })
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
      console.log('Error generating report:', err)
      return res.status(500).send('Error generating report')
    }
  },
  myWalletShow: async (req, res) => {
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
  },

  userLogout: (req, res) => {
    req.session.user = null
    res.redirect('/')
  },

  showCouponsPage: async (req, res) => {
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
  },
  applyCoupon: async (req, res) => {
    console.log('called')
    const user = req.session.user
    const couponData = req.body
    console.log(couponData)
    const coupon = await userHelpers.getACoupon(couponData.couponCode, user._id)
    const totalAmount = await userHelpers.getNewTotal(user._id)
    const discountedPrice = Math.round(totalAmount - ((parseInt(coupon.discount) / 100) * totalAmount))
    await userHelpers.addCouponDiscount(user._id, discountedPrice, coupon.discount, coupon)
    res.json({ status: true })
  },
  unsetCoupon: async (req, res) => {
    const userInfo = req.session.user
    const couponId = req.query
    await userHelpers.unsetCoupon(couponId, userInfo._id)
    res.json({ status: true })
  }

}
