const db = require('../configure/mongoconnectioin')
const collection = require('../configure/collectionNames')
const bcrypt = require('bcrypt')
const generateUniqueId = require('generate-unique-id')
const objectid = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { resolve } = require('path')
const { ObjectId } = require('mongodb')

const instance = new Razorpay({
  key_id: 'rzp_test_2Nt8hWDvPKHDDI',
  key_secret: 'RFJTzBajBnQBkkFCHyjjk6NE'
})

module.exports = {
  saveVisitors: async (ip) => {
    const today = new Date()
    const yyyy = today.getFullYear()
    let mm = today.getMonth() + 1 // Months start at 0!
    let dd = today.getDate()
    if (dd < 10) dd = '0' + dd
    if (mm < 10) mm = '0' + mm
    const visitedDate = yyyy + '-' + mm + '-' + dd
    const visitorData = { ip, visitedDate }
    const visitor = await db.get().collection(collection.VisitorsCollection).findOne({ ip })
    if (visitor) {
      await db.get().collection(collection.VisitorsCollection).updateOne({ ip }, { $set: { visitedDate } })
    } else {
      await db.get().collection(collection.VisitorsCollection).insertOne(visitorData)
    }
  },
  doSignup: (userdata, status) => {
    console.log(userdata)
    return new Promise(async (resolve, reject) => {
      const userEmail = await db
        .get()
        .collection(collection.UserCollection)
        .findOne({
          $or: [{ email: userdata.email }, { Pnumber: userdata.Pnumber }]
        })
      if (userEmail) {
        resolve(userEmail)
      } else {
        resolve(userEmail)
        userdata.password = await bcrypt.hash(userdata.password, 10)
        const user = {
          Fname: userdata.Fname,
          Lname: userdata.Lname,
          email: userdata.email,
          Pnumber: userdata.Pnumber,
          password: userdata.password,
          status: true
        }
        db.get().collection(collection.UserCollection).insertOne(user)
      }
    })
  },

  doLogin: (userdata) => {
    return new Promise(async (resolve, reject) => {
      const response = {}
      const user = await db
        .get()
        .collection(collection.UserCollection)
        .findOne({ email: userdata.email })

      if (user) {
        if (user.status) {
          bcrypt.compare(userdata.password, user.password).then((status) => {
            if (status) {
              console.log('login success')
              response.user = user
              response.status = true
              resolve(response)
            } else {
              console.log('login failed')
              resolve(response.status = false)
            }
          })
        } else {
          console.log('login user blocked')
          response.blocked = true
          resolve(response)
        }
      } else {
        console.log('login user failed')
        resolve(response.status = false)
      }
    })
  },

  otpNumbersending: (mobileNumber) => {
    return new Promise(async (resolve, reject) => {
      const response = {}
      const user = await db
        .get()
        .collection(collection.UserCollection)
        .findOne({ Pnumber: mobileNumber.Pnumber })
      if (user) {
        if (user.status) {
          resolve(user)
        } else {
          console.log('login user blocked')
          response.status = true
          reject(response)
        }
      } else {
        console.log('login user failed')
        response.status = false
        reject(response)
      }
    })
  },
  createWallet: async (userId) => {
    const wallet = {
      userId,
      total: 0,
      transactions: []
    }
    await db.get().collection(collection.WalletCollection).insertOne(wallet)
  },
  getAUser: async (id) => {
    const user = await db.get().collection(collection.UserCollection).findOne({ _id: objectid(id) })
    return user
  },
  userGetting: (mobileNumber) => {
    return new Promise(async (resolve, reject) => {
      const user = await db
        .get()
        .collection(collection.UserCollection)
        .findOne({ Pnumber: mobileNumber })
      if (user) {
        resolve(user)
      }
    })
  },
  editUserInfo: async (data, Id) => {
    console.log(data)
    db.get().collection(collection.UserCollection).updateOne(
      { _id: objectid(Id) },
      {
        $set: {
          Fname: data.FName,
          Lname: data.LName,
          Pnumber: data.MNumber,
          email: data.EmailId
        }
      })
  },
  addressAdding: (user, data) => {
    const address = {
      Fname: data.Fname,
      Lname: data.Lname,
      Mnumber: data.Mnumber,
      address1: data.address1,
      address2: data.address2,
      Pcode: data.Pcode,
      Poffice: data.Poffice,
      area: data.area,
      email: data.email,
      country: data.country,
      state: data.state,
      addressType: data.inlineRadioOptions,
      userid: user
    }
    db.get()
      .collection(collection.AddressCollection)
      .insertOne(address)
  },
  getAAddress: (id) => {
    return new Promise(async (resolve, reject) => {
      const address = await db
        .get()
        .collection(collection.AddressCollection)
        .find({ _id: objectid(id) })
        .toArray()
      resolve(address)
    })
  },
  getAllAddress: (id) => {
    return new Promise(async (resolve, reject) => {
      const address = await db
        .get()
        .collection(collection.AddressCollection)
        .find({ userid: id })
        .toArray()
      resolve(address)
    })
  },
  deleteAddress: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.AddressCollection)
        .deleteOne({ _id: objectid(id) })
        .then((response) => {
          resolve(response)
        })
    })
  },
  wishlistAdd: async (id, Uid) => {
    const product = await db.get()
      .collection(collection.ProCollection)
      .findOne({ _id: objectid(id) })
    const wishlist = {
      Pname: product.Pname,
      description: product.description,
      category: product.Category,
      price: product.Price,
      discount: product.Discount,
      productId: id,
      userId: Uid,
      addedDate: new Date().toUTCString(),
      images: product.images
    }
    const alreadyWished = await db.get()
      .collection(collection.WishlistCollection)
      .findOne({ productId: id })
    if (alreadyWished) {
      db.get()
        .collection(collection.WishlistCollection)
        .updateOne({ productId: id }, { $set: wishlist })
    } else {
      db.get()
        .collection(collection.WishlistCollection)
        .insertOne(wishlist)
    }
  },
  getAllWishlists: async (id) => {
    const wishlists = await db
      .get()
      .collection(collection.WishlistCollection)
      .find({ userId: id })
      .sort({ _id: -1 })
      .toArray()
    return wishlists
  },
  deleteWishlist: async (id) => {
    await db.get()
      .collection(collection.WishlistCollection)
      .deleteOne({ productId: id })
  },

  addToCart: async (userId, ProId) => {
    const proCollection = { item: objectid(ProId), quantity: 1 }
    const userCart = await db.get()
      .collection(collection.CartCollection)
      .findOne({ userId: objectid(userId) })
    if (userCart) {
      // eslint-disable-next-line eqeqeq
      const proExists = userCart.products.findIndex(products => products.item == ProId)
      if (proExists !== -1) {
        db.get().collection(collection.CartCollection).updateOne({ 'products.item': objectid(ProId) },
          {
            $inc: { 'products.$.quantity': 1 }
          })
      } else {
        db.get().collection(collection.CartCollection).updateOne({ userId: objectid(userId) }, {
          $push: { products: proCollection }
        })
      }
    } else {
      const cartDetails = { userId: objectid(userId), products: [proCollection] }
      db.get().collection(collection.CartCollection).insertOne(cartDetails)
    }
  },
  redeemCoupon: async (couponId, userId) => {
    await db.get().collection(collection.UserCouponCollection).updateOne(
      { userId, couponId: ObjectId(couponId) },
      { $set: { redeemed: true } })
  },
  getCartProducts: async (userId) => {
    const cartItems = await db.get().collection(collection.CartCollection).aggregate([
      { $match: { userId: objectid(userId) } },
      {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: collection.ProCollection,
          localField: 'item',
          foreignField: '_id',
          as: 'cartProduct'
        }
      },
      {
        $project: {
          item: 1, quantity: 1, cartProduct: { $arrayElemAt: ['$cartProduct', 0] }
        }
      }
    ]).toArray()
    return (cartItems)
  },
  getCartItemsCount: async (userId) => {
    const items = await db.get().collection(collection.CartCollection).findOne({ userId: objectid(userId) })
    if (items) {
      const itemsCounts = items.products.length
      return itemsCounts
    }
  },
  getCartDetails: async (id) => {
    const cartDetails = await db.get().collection(collection.CartCollection).findOne({ userId: objectid(id) })
    return cartDetails
  },
  updateQuantity: (data) => {
    const count = parseInt(data.count)
    const quantity = parseInt(data.quantity)
    return new Promise((resolve, reject) => {
      if (count === -1 && quantity === 1) {
        db.get().collection(collection.CartCollection).updateOne(
          { _id: objectid(data.cart) },
          {
            $pull: { products: { item: objectid(data.product) } }
          }).then((response) => {
          resolve({ removed: true })
        })
      } else {
        db.get().collection(collection.CartCollection).updateOne(
          { _id: objectid(data.cart), 'products.item': objectid(data.product) },
          {
            $inc: { 'products.$.quantity': count }
          }).then((response) => {
          resolve(true)
        })
      }
    })
  },
  getTotalAmount: async (userId) => {
    const userCart = await db.get()
      .collection(collection.CartCollection)
      .findOne({ userId: objectid(userId) })
    if (userCart) {
      if (userCart.products.length) {
        const total = await db.get().collection(collection.CartCollection).aggregate([
          { $match: { userId: objectid(userId) } },
          {
            $unwind: '$products'
          },
          {
            $project: {
              item: '$products.item',
              quantity: '$products.quantity'
            }
          },
          {
            $lookup: {
              from: collection.ProCollection,
              localField: 'item',
              foreignField: '_id',
              as: 'cartProduct'
            }
          },
          {
            $project: {
              item: 1, quantity: 1, cartProduct: { $arrayElemAt: ['$cartProduct', 0] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$quantity', '$cartProduct.Price'] } }
            }
          }
        ]).toArray()

        return total[0].total
      }
    }
  },
  deleteCartItems: async (id) => {
    await db.get()
      .collection(collection.CartCollection)
      .deleteOne({ userId: objectid(id) })
      .then(() => {
        resolve()
      })
  },
  deleteOneCartItem: async (userId, proId) => {
    await db.get()
      .collection(collection.CartCollection)
      .updateOne(
        { userId: objectid(userId) },
        { $pull: { products: { item: objectid(proId) } } })
  },
  addTotalToCart: async (total, userId) => {
    await db.get().collection(collection.CartCollection).updateOne({ userId: objectid(userId) }, {
      $set: { total }
    })
  },
  getNewTotal: async (userId) => {
    const total = await db.get().collection(collection.CartCollection).findOne({ userId: objectid(userId) }, { projection: { total: 1, _id: 0 } })
    return total.total
  },
  addToOrders: (orderDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.OrderCollection)
        .insertOne(orderDetails)
        .then((response) => {
          resolve(response)
        })
    })
  },
  getOrders: async (id) => {
    const orders = await db.get().collection(collection.OrderCollection).find({ userId: id }).sort({ _id: -1 }).toArray()

    return orders
  },
  getAOrder: async (id) => {
    const order = await db.get().collection(collection.OrderCollection).find({ _id: objectid(id) }).toArray()
    return order
  },
  razorPay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      instance.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: orderId,
        notes: {
          key1: 'value3',
          key2: 'value2'
        }
      }, (err, orders) => {
        if (err) {
          console.log(err)
        } else {
          resolve(orders)
        }
      })
    })
  },
  walletPay: async (orderDetails) => {
    const userId = orderDetails.userId
    const userWallet = await db.get().collection(collection.WalletCollection).findOne({ userId: objectid(userId) })
    if (orderDetails.total <= userWallet.total) {
      const newTotal = userWallet.total - orderDetails.total
      const newTransaction = {
        amount: orderDetails.total,
        type: 'debit',
        transactionId: generateUniqueId({
          length: 9,
          excludeSymbols: ['0'],
          useLetters: false
        }),
        date: new Date().toDateString()
      }
      await db.get().collection(collection.WalletCollection).updateOne({ userId }, { $set: { total: newTotal } })
      await db.get().collection(collection.WalletCollection).updateOne({ userId }, { $push: { transactions: newTransaction } })
    } else {
      const insufficient = true
      return insufficient
    }
  },
  verifyPayment: (details) => {
    console.log(details)
    return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'RFJTzBajBnQBkkFCHyjjk6NE')
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      // eslint-disable-next-line eqeqeq
      if (hmac == details['payment[razorpay_signature]']) {
        resolve()
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
      }
    })
  },
  changePaymentStatus: (orderId) => {
    console.log('id is' + orderId)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.OrderCollection).updateOne(
        { orderId },
        { $set: { orderStatus: 'placed' } }).then(() => {
        resolve()
      })
    })
  },
  orderCancellation: async (orderId) => {
    const refundDate = new Date().toDateString()
    const order = await db.get().collection(collection.OrderCollection).find({ orderId }).toArray()
    console.log(order)
    if (order[0].paymentMethod === 'COD') {
      await db.get().collection(collection.OrderCollection).updateOne({ orderId },
        {
          $set: {
            orderStatus: 'Order canceled',
            orderBlocked: true,
            deliveryStatus: 'Order canceled'
          }
        })
    } else {
      await db.get().collection(collection.OrderRefundCollection).insertOne({ orderId })
      await db.get().collection(collection.OrderCollection).updateOne({ orderId },
        {
          $set: {
            orderStatus: 'Order canceled',
            orderBlocked: true,
            deliveryStatus: 'Order canceled',
            refunding: true,
            refundingInitiated: refundDate,
            refundStatus: 'pending'
          }
        })
    }
  },
  orderReturn: async (id) => {
    const refundDate = new Date().toDateString()
    console.log(refundDate)
    await db.get().collection(collection.OrderCollection).updateOne({ orderId: id },
      {
        $set: {
          deliveryStatus: 'returned',
          returnStatus: 'pending',
          refunding: true,
          refundingInitiated: refundDate,
          refundStatus: 'pending'
        }
      })
  },
  getAllCoupons: async () => {
    const coupons = await db.get().collection(collection.CouponCollection).find({}).sort({ _id: -1 }).toArray()
    return coupons
  },
  addCoupon: async (userId, coupon) => {
    const userCoupon = {
      couponCode: coupon.couponCode,
      couponType: coupon.couponType,
      discount: coupon.discount,
      minLimit: parseInt(coupon.minLimit),
      maxDis: parseInt(coupon.maxDis),
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      couponId: coupon._id,
      userId
    }
    db.get().collection(collection.UserCouponCollection).insertOne(userCoupon)
  },
  getACoupon: async (code, userId) => {
    const coupon = await db.get().collection(collection.UserCouponCollection).findOne({ userId, couponCode: code })
    console.log(coupon)
    if (coupon) {
      return coupon
    } else {
      return false
    }
  },
  addCouponDiscount: async (id, discountedPrice, discount, coupon) => {
    await db.get().collection(collection.CartCollection).updateOne(
      { userId: objectid(id) },
      {
        $set: { coupon, discountedPrice, discount }
      })
  },
  unsetCoupon: async (couponId, userId) => {
    await db.get().collection(collection.CartCollection).updateOne(
      { userId: objectid(userId) },
      { $unset: { coupon: false } })
  },
  getWallet: async (userId) => {
    const wallet = await db.get().collection(collection.WalletCollection).findOne({ userId: objectid(userId) })
    return wallet
  },
  getUsersAllCoupons: async (userId) => {
    const userCoupons = db.get().collection(collection.UserCouponCollection).find({ userId }).toArray()
    return userCoupons
  },
  getUserCoupons: async (userId) => {
    const userCoupons = db.get().collection(collection.UserCouponCollection).find({ redeemed: { $ne: true }, userId }).toArray()
    return userCoupons
  }
}
