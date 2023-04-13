/* eslint-disable prefer-promise-reject-errors */
const db = require('../configure/mongoConnections')
const collection = require('../configure/collectionNames')
const generateUniqueId = require('generate-unique-id')
const objectid = require('mongodb').ObjectId
require('dotenv').config()
module.exports = {
  adminlogin: (adminData) => {
    try {
      const adminUsername = process.env.ADMIN_USER_NAME
      const adminPassword = process.env.ADMIN_PASSWORD
      console.log(adminUsername, adminPassword)
      console.log('called') // eslint-disable-next-line no-async-promise-executor
      console.log(adminData)
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        if (adminUsername === adminData.Uname) {
          if (adminPassword === adminData.password) {
            console.log('admin logged in')
            resolve(adminUsername)
          } else {
            console.log('admin login failed')
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ logErr: false })
          }
        } else {
          reject({ status: false })
        }
      })
    } catch (err) {
      return err
    }
  },
  getMonthlySales: async () => {
    try {
      const monthlySales = {
        '2023-01': 0,
        '2023-02': 0,
        '2023-03': 0,
        '2023-04': 0,
        '2023-05': 0,
        '2023-06': 0,
        '2023-07': 0,
        '2023-08': 0,
        '2023-09': 0,
        '2023-10': 0,
        '2023-11': 0,
        '2023-12': 0
      }
      const cursor = await db.get().collection(collection.OrderCollection).find(
        {},
        {
          projection:
          { _id: 0, total: 1, orderedDate: 1 }
        }).toArray()
      cursor.forEach(function (doc) {
        // Extract the month from the date in the 'YYYY-MM-DD' format
        const month = doc.orderedDate.substring(0, 7)

        // Update the frequency counter for the month
        if (month in monthlySales) {
          monthlySales[month] += doc.total
        } else {
          monthlySales[month] = doc.total
        }
      })
      return monthlySales
    } catch (err) {
      return err
    }
  },
  getMonthlyVisitors: async () => {
    try {
      const monthlyVisitors = {
        '2023-01': 0,
        '2023-02': 0,
        '2023-03': 0,
        '2023-04': 0,
        '2023-05': 0,
        '2023-06': 0,
        '2023-07': 0,
        '2023-08': 0,
        '2023-09': 0,
        '2023-10': 0,
        '2023-11': 0,
        '2023-12': 0
      }
      const visitors = await db.get().collection(collection.VisitorsCollection).find({}).toArray()
      visitors.forEach(function (doc) {
        // Extract the month from the date in the 'YYYY-MM-DD' format
        const month = doc.visitedDate.substring(0, 7)

        // Update the frequency counter for the month
        if (month in monthlyVisitors) {
          monthlyVisitors[month] += 1
        } else {
          monthlyVisitors[month] = 1
        }
      })
      return monthlyVisitors
    } catch (err) {
      return err
    }
  },
  getMonthlySoldProducts: async () => {
    try {
      const monthlyProducts = {
        '2023-01': 0,
        '2023-02': 0,
        '2023-03': 0,
        '2023-04': 0,
        '2023-05': 0,
        '2023-06': 0,
        '2023-07': 0,
        '2023-08': 0,
        '2023-09': 0,
        '2023-10': 0,
        '2023-11': 0,
        '2023-12': 0
      }
      const cursor = await db.get().collection(collection.OrderCollection).find(
        {},
        {
          projection:
          { _id: 0, products: 1, orderedDate: 1 }
        }).toArray()
      cursor.forEach(function (doc) {
        // Extract the month from the date in the 'YYYY-MM-DD' format
        const month = doc.orderedDate.substring(0, 7)

        // Update the frequency counter for the month
        if (month in monthlyProducts) {
          monthlyProducts[month] += doc.products.length
        } else {
          monthlyProducts[month] = doc.products.length
        }
      })
      return monthlyProducts
    } catch (err) {
      return err
    }
  },
  getDeliveredOrdersCount: async () => {
    try {
      const DOCount = await db.get().collection(collection.OrderCollection).find({ deliveryStatus: 'delivered' }).toArray()
      return DOCount.length
    } catch (err) {
      return err
    }
  },
  getRFShippingCount: async () => {
    try {
      const RFShoppingCount = await db.get().collection(collection.OrderCollection).find({ deliveryStatus: 'Ready for shipping' }).toArray()
      return RFShoppingCount.length
    } catch (err) {
      return err
    }
  },
  getShippedCount: async () => {
    try {
      const shippedCount = await db.get().collection(collection.OrderCollection).find({ deliveryStatus: 'shipped' }).toArray()
      return shippedCount.length
    } catch (err) {
      return err
    }
  },
  gerOrderCanceledCount: async () => {
    try {
      const canceledOrderCount = await db.get().collection(collection.OrderCollection).find({ deliveryStatus: 'Order canceled' }).toArray()
      return canceledOrderCount.length
    } catch (err) {
      return err
    }
  },
  getOrderReturnedCount: async () => {
    try {
      const returnedOrderCount = await db.get().collection(collection.OrderCollection).find({ deliveryStatus: 'returned' }).toArray()
      return returnedOrderCount.length
    } catch (err) {
      return err
    }
  },
  getCODOrdersCount: async () => {
    try {
      const CODOrdersCount = await db.get().collection(collection.OrderCollection).find({ paymentMethod: 'COD' }).toArray()
      return CODOrdersCount.length
    } catch (err) {
      return err
    }
  },
  getOPOrdersCount: async () => {
    try {
      const OPOrdersCount = await db.get().collection(collection.OrderCollection).find({ paymentMethod: 'online payment' }).toArray()
      return OPOrdersCount.length
    } catch (err) {
      return err
    }
  },
  getWalletOrdersCount: async () => {
    try {
      const WalletOrder = await db.get().collection(collection.OrderCollection).find({ paymentMethod: 'wallet' }).toArray()
      return WalletOrder.length
    } catch (err) {
      return err
    }
  },
  getUsers: async () => {
    try {
      const users = await db.get().collection(collection.UserCollection).find().toArray()
      return users
    } catch (err) {
      return err
    }
  },
  getCategoryByName: async (cateName) => {
    try {
      const category = await db.get().collection(collection.CategoryCollection).findOne({ Cname: cateName })
      return category
    } catch (err) {
      return err
    }
  },
  blockUserStatus: (id) => {
    try {
      return new Promise((resolve, reject) => {
        db.get().collection(collection.UserCollection).updateOne({ _id: objectid(id) }, {
          $set: {
            status: false
          }
        }).then((response) => {
          resolve()
        })
      })
    } catch (err) {
      return err
    }
  },

  unblockUserStatus: (id) => {
    try {
      return new Promise((resolve, reject) => {
        db.get().collection(collection.UserCollection).updateOne({ _id: objectid(id) }, {
          $set: {
            status: true
          }
        }).then((response) => {
          resolve()
        })
      })
    } catch (err) {
      return err
    }
  },
  getAllOrders: async () => {
    try {
      const orders = await db.get().collection(collection.OrderCollection).find({}).toArray()
      return orders
    } catch (err) {
      return err
    }
  },
  getAOrder: async (id) => {
    try {
      const order = await db.get().collection(collection.OrderCollection).find({ _id: objectid(id) }).toArray()
      return order
    } catch (err) {
      return err
    }
  },
  updateOrder: (data, delivered) => {
    try {
      db.get().collection(collection.OrderCollection).updateOne({ _id: objectid(data.orderId) },
        {
          $set: { deliveryStatus: data.deliveryStatus, deliveryDate: data.date, delivered }
        })
    } catch (err) {
      return err
    }
  },
  addCoupon: async (data) => {
    try {
      data.couponId = generateUniqueId({
        length: 9,
        excludeSymbols: ['0'],
        useLetters: false
      })
      await db.get().collection(collection.CouponCollection).insertOne(data)
    } catch (err) {
      return err
    }
  },
  getCoupons: async () => {
    try {
      const coupons = await db.get().collection(collection.CouponCollection).find({}).toArray()
      return coupons
    } catch (err) {
      return err
    }
  },
  deleteCoupon: async (id) => {
    try {
      await db.get().collection(collection.CouponCollection).deleteOne({ _id: objectid(id) })
    } catch (err) {
      return err
    }
  },
  editCoupon: async (data) => {
    try {
      await db.get().collection(collection.CouponCollection).updateOne(
        { _id: objectid(data.couponId) },
        {
          $set: {
            couponCode: data.couponCode,
            couponType: data.couponType,
            discount: data.discount,
            startDate: data.startDate,
            expiryDate: data.expiryDate
          }
        })
    } catch (err) {
      return err
    }
  },
  totalUsers: async () => {
    try {
      const users = await db.get().collection(collection.UserCollection).find({}).toArray()
      return users.length
    } catch (err) {
      return err
    }
  },
  totalOrdersCount: async () => {
    try {
      const orders = await db.get().collection(collection.OrderCollection).find({}).toArray()
      return orders.length
    } catch (err) {
      return err
    }
  },
  totalOrders: async () => {
    try {
      const orders = await db.get().collection(collection.OrderCollection).find({}).sort({ _id: -1 }).limit(10).toArray()
      return orders
    } catch (err) {
      return err
    }
  },
  totalProducts: async () => {
    try {
      const products = await db.get().collection(collection.ProCollection).find({}).toArray()
      return products.length
    } catch (err) {
      return err
    }
  },
  addProductOffer: async (proId, discount) => {
    try {
      const data = await db.get().collection(collection.ProCollection).find({ _id: objectid(proId) }).toArray()
      const price = data[0].Price
      await db.get().collection(collection.ProCollection).updateOne(
        { _id: objectid(proId) },
        {
          $set: {
            discountPrice: Math.round((price * (100 - discount)) / 100)
          }
        },
        { upsert: true }
      )
    } catch (err) {
      return err
    }
  },
  removeProductOffer: async (proId) => {
    try {
      await db.get().collection(collection.ProCollection).updateOne(
        { _id: objectid(proId) },
        { $unset: { discountPrice: null } }
      )
    } catch (err) {
      return err
    }
  },
  addCategoryOffer: async (cateName, discount, data) => {
    try {
      await db
        .get()
        .collection(collection.ProCollection)
        .find({ Category: cateName })
        .forEach(function (data) {
          const discountPercentage = discount
          const discountedPrice =
         Math.round(data.Price - data.Price * (discountPercentage / 100))
          db.get().collection(collection.ProCollection).update(
            { _id: data._id },
            { $set: { discountPrice: discountedPrice } }
          )
        })
      await db.get().collection(collection.CategoryCollection).updateOne(
        { Cname: cateName },
        {
          $set: {
            categoryOffer: true,
            discount,
            startDate: data.startDate,
            endDate: data.expiryDate,
            offerType: data.offerType
          }
        })
    } catch (err) {
      return err
    }
  },
  removeCategoryOffer: async (cateName) => {
    try {
      await db
        .get()
        .collection(collection.ProCollection)
        .find({ Category: cateName })
        .forEach(function (data) {
          db.get().collection(collection.ProCollection).update(
            { _id: data._id },
            { $unset: { discountPrice: null } }
          )
        })
      await db.get().collection(collection.CategoryCollection).updateOne(
        { Cname: cateName },
        {
          $unset: {
            categoryOffer: '',
            discount: '',
            startDate: '',
            endDate: '',
            offerType: ''
          }
        })
    } catch (err) {
      return err
    }
  },
  getOrdersInDate: async (start, end) => {
    try {
      const ordersInDate = db.get()
        .collection(collection.OrderCollection).find({ orderedDate: { $gte: start, $lt: end } }).toArray()
      return ordersInDate
    } catch (err) {
      return err
    }
  },
  getReturnedOrders: async () => {
    try {
      const orders = await db.get().collection(collection.OrderCollection).find({ returnStatus: { $exists: true } }).toArray()
      return orders
    } catch (err) {
      return err
    }
  },
  approveReturn: async (id) => {
    try {
      await db.get().collection(collection.OrderCollection).updateOne(
        { orderId: id },
        {
          $set: {
            returnStatus: 'approved'
          }
        })
    } catch (err) {
      return err
    }
  },
  getRefundOrders: async () => {
    try {
      const order = await db.get().collection(collection.OrderCollection).find({ refunding: { $exists: true } }).toArray()
      return order
    } catch (err) {
      return err
    }
  },
  rejectReturn: async (id) => {
    try {
      await db.get().collection(collection.OrderCollection).updateOne({ orderId: id }, {
        $set: {
          returnStatus: 'rejected'
        }
      })
    } catch (err) {
      return err
    }
  },
  approveRefund: async (id) => {
    try {
      await db.get().collection(collection.OrderCollection).updateOne({ orderId: id }, {
        $set: {
          refundStatus: 'approved'
        }
      })
      const total = await db.get().collection(collection.OrderCollection).findOne({ orderId: id }, { projection: { total: 1, userId: 1, _id: 0 } })
      const userId = total.userId
      const wallet = {
        userId,
        total: total.total,
        transactions: [{
          amount: total.total,
          type: 'credit',
          transactionId: generateUniqueId({
            length: 8,
            excludeSymbols: ['0'],
            useLetters: false
          }),
          date: new Date().toDateString()
        }]
      }
      const userWallet = await db.get().collection(collection.WalletCollection).findOne({ userId })

      if (!userWallet) {
        await db.get().collection(collection.WalletCollection).insertOne(wallet)
      } else {
        const newTransaction = {
          amount: total.total,
          type: 'credit',
          transactionId: generateUniqueId({
            length: 9,
            excludeSymbols: ['0'],
            useLetters: false
          }),
          date: new Date().toDateString()
        }
        await db.get().collection(collection.WalletCollection).updateOne({ userId }, { $push: { transactions: newTransaction } })
        await db.get().collection(collection.WalletCollection).updateOne({ userId }, { $inc: { total: newTransaction.amount } })
      }
    } catch (err) {
      return err
    }
  }
}
