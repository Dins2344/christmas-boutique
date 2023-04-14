
const adminHelpers = require('../helpers/adminHelpers')
const productHelpers = require('../helpers/productHelpers')
const createReport = require('../middleware/reportCreator')
const fs = require('fs')
const admin = true

module.exports = {
  adminHome: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const totalUsers = await adminHelpers.totalUsers()
      const orders = await adminHelpers.totalOrders()
      const totalOrders = await adminHelpers.totalOrdersCount()
      const totalProducts = await adminHelpers.totalProducts()
      if (req.session.admin) {
        res.render('admin_layouts/adminHome', {
          admin,
          title: 'christmas boutique admin panel',
          adminInfo,
          totalUsers,
          totalOrders,
          totalProducts,
          orders
        })
      } else {
        res.redirect('/admin/login')
      }
    } catch (err) {
      console.log(err + 'admin home getting err')
      res.status(500).render('404')
    }
  },

  adminLogin: (req, res) => {
    try {
      res.render('admin_layouts/adminLogin', {
        admin,
        title: 'christmas boutique admin panel',
        logErr: req.session.logErr
      })
      req.session.logErr = false
    } catch (err) {
      console.log(err + 'admin login page err')
      res.status(500).render('404')
    }
  },
  adminLoginPost: (req, res) => {
    try {
      adminHelpers
        .adminlogin(req.body)
        .then((response) => {
          req.session.admin = response
          req.session.adminLoggedIn = true
          res.redirect('/admin')
        })
        .catch(() => {
          req.session.logErr = 'invalid user name or password'
          res.redirect('login')
        })
    } catch (err) {
      console.log(err + 'admin login post err')
      res.status(500).render('404')
    }
  },

  adminLogout: (req, res) => {
    try {
      req.session.admin = null
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'admin log out err')
      res.status(500).render('404')
    }
  },
  getDataForGraphs: async (req, res) => {
    try {
      const monthlySales = await adminHelpers.getMonthlySales()
      const visitorsCount = await adminHelpers.getMonthlyVisitors()
      const productSold = await adminHelpers.getMonthlySoldProducts()
      const orderDetails = {
        delivered: await adminHelpers.getDeliveredOrdersCount(),
        readyForShipping: await adminHelpers.getRFShippingCount(),
        shipped: await adminHelpers.getShippedCount(),
        orderCanceled: await adminHelpers.gerOrderCanceledCount(),
        orderReturned: await adminHelpers.getOrderReturnedCount()
      }
      const paymentDetails = {
        COD: await adminHelpers.getCODOrdersCount(),
        OnlinePayment: await adminHelpers.getOPOrdersCount(),
        wallet: await adminHelpers.getWalletOrdersCount()
      }
      console.log(orderDetails, paymentDetails)
      const data = { monthlySales, visitorsCount, productSold, orderDetails, paymentDetails }
      res.status(200).json(data)
    } catch (err) {
      console.log(err + 'graph getting err')
      res.status(500).render('404')
    }
  },
  adminAddProduct: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const categories = await productHelpers.getCategories()
      res.render('admin_layouts/addProducts', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        categories,
        ProErr: req.session.addProErr
      })

      req.session.addProErr = false
    } catch (err) {
      console.log(err + 'product adding err')
      res.status(500).render('404')
    }
  },
  adminAddProductPost: async (req, res) => {
    try {
      try {
        const product = await productHelpers.getByName(req.body.Pname)
        if (product) {
          req.session.addProErr = 'This name is already assigned to a product...!'
          res.redirect('/admin/addproduct')
        } else {
          const images = req.files.map(file => file.path)
          productHelpers.addproduct(req.body, images).then(() => {
            req.session.addProductSuccess = 'Product added successfully'
            req.session.addProductStatus = true
            res.redirect('/admin/addproduct')
          })
        }
      } catch (error) {
        console.error(error)
        req.session.addProductStatus = false
      }
    } catch (err) {
      console.log(err + 'add product post err')
      res.status(500).render('404')
    }
  },

  viewProducts: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const products = await productHelpers.getProducts()
      res.render('admin_layouts/viewProducts', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        products
      })
    } catch (err) {
      console.log(err + 'view product err')
      res.status(500).render('404')
    }
  },

  deleteProducts: async (req, res) => {
    try {
      const productId = req.params.id
      await productHelpers.deleteProduct(productId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'product delete err')
      res.status(500).render('404')
    }
  },

  editProductGet: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const product = await productHelpers.getProduct(req.params.id)
      const categories = await productHelpers.getCategories()
      res.render('admin_layouts/editProduct', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        product,
        categories
      })
    } catch (err) {
      console.log(err + 'edit product page get err')
      res.status(500).render('404')
    }
  },

  editProductPost: (req, res) => {
    try {
      const images = req.files.map(file => file.path)
      const id = req.params.id
      console.log(id)

      productHelpers.changeProduct(req.params.id, req.body, images).then(() => {
        res.redirect('/admin/viewproducts')
      })
    } catch (err) {
      console.log(err + 'edit product post err')
      res.status(500).render('404')
    }
  },

  getUsers: (req, res) => {
    try {
      const adminInfo = req.session.admin
      adminHelpers.getUsers().then((users) => {
        res.render('admin_layouts/viewUsers', {
          admin,
          title: 'christmas boutique admin panel',
          adminInfo,
          users
        })
      })
    } catch (err) {
      console.log(err + 'admin users getting err')
      res.status(500).render('404')
    }
  },

  blockUser: (req, res) => {
    try {
      adminHelpers.blockUserStatus(req.params.id).then(() => {
        res.json({ status: true })
      })
    } catch (err) {
      console.log(err + 'admin block user err')
      res.status(500).render('404')
    }
  },
  unblockUser: (req, res) => {
    try {
      adminHelpers.unblockUserStatus(req.params.id).then(() => {
        res.json({ status: true })
      })
    } catch (err) {
      console.log(err + 'admin unblock err')
      res.status(500).render('404')
    }
  },

  categoryGet: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      await productHelpers.getCategories().then((category) => {
        res.render('admin_layouts/viewCategory', {
          admin,
          title: 'christmas boutique admin panel',
          adminInfo,
          category
        })
      })
    } catch (err) {
      console.log(err + 'category get err')
      res.status(500).render('404')
    }
  },
  addCategory: (req, res) => {
    try {
      const adminInfo = req.session.admin
      res.render('admin_layouts/addCategory', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        cateErr: req.session.addCateErr
      })
      req.session.addCateErr = false
    } catch (err) {
      console.log(err + 'admin category add err')
      res.status(500).render('404')
    }
  },
  addCategoryPost: async (req, res) => {
    try {
      const categoryFromBody = req.body.Cname.toLowerCase()
      const category = await adminHelpers.getCategoryByName(categoryFromBody)
      if (category) {
        req.session.addCateErr = 'This name is already assigned to a category...!'
        res.redirect('/admin/addcategory')
      } else {
        await productHelpers.addCategory(req.body)
        res.redirect('/admin/addcategory')
      }
    } catch (err) {
      console.log(err + 'category add post err')
      res.status(500).render('404')
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id
      await productHelpers.deleteCategory(categoryId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'category delete err')
      res.status(500).render('404')
    }
  },

  editCategoryGet: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const category = await productHelpers.getCategory(req.params.id)

      res.render('admin_layouts/editcategory', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        category
      })
    } catch (err) {
      console.log(err + 'edit category err')
      res.status(500).render('404')
    }
  },

  editCategoryPost: (req, res) => {
    try {
      productHelpers.changeCategory(req.params.id, req.body).then(() => {
        res.redirect('/admin/category')
      })
    } catch (err) {
      console.log(err + 'edit category post err')
      res.status(500).render('404')
    }
  },
  couponsGet: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const coupons = await adminHelpers.getCoupons()
      res.render('admin_layouts/viewCoupons', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        coupons
      })
    } catch (err) {
      console.log(err + 'coupons get err')
      res.status(500).render('404')
    }
  },
  ordersGet: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const orders = await adminHelpers.getAllOrders()
      res.render('admin_layouts/viewOrders', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        orders
      })
    } catch (err) {
      console.log(err + 'orders get err')
      res.status(500).render('404')
    }
  },
  orderDetails: async (req, res) => {
    try {
      const id = req.params.id
      const adminInfo = req.session.admin
      const order = await adminHelpers.getAOrder(id)
      res.render('admin_layouts/viewOneOrder', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        order
      })
    } catch (err) {
      console.log(err + 'orderDetails getting err')
      res.status(500).render('404')
    }
  },
  orderUpdating: async (req, res) => {
    try {
      const data = req.body
      let delivered = false
      if (data.deliveryStatus === 'delivered') {
        delivered = true
      }
      await adminHelpers.updateOrder(data, delivered)
      res.redirect('/admin/view-order-details/' + data.orderId)
    } catch (err) {
      console.log(err + 'order updating err')
      res.status(500).render('404')
    }
  },
  addCoupon: async (req, res) => {
    try {
      const data = req.body
      await adminHelpers.addCoupon(data)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'coupon adding err')
      res.status(500).render('404')
    }
  },
  deleteCoupon: async (req, res) => {
    try {
      const id = req.params.id
      await adminHelpers.deleteCoupon(id)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'coupon delete err')
      res.status(500).render('404')
    }
  },
  editCoupon: async (req, res) => {
    try {
      const data = req.query
      await adminHelpers.editCoupon(data)
      res.redirect('/admin/coupons')
    } catch (err) {
      console.log(err + 'edit coupon err')
      res.status(500).render('404')
    }
  },
  makeReport: async (req, res) => {
    try {
      const { format } = req.body

      // Check if format field is present
      if (!format) {
        return res.status(400).send('Format field is required')
      }
      // Generate the sales report using your e-commerce data
      const salesData = {}
      try {
        salesData.totalUsers = await adminHelpers.totalUsers()
        // salesData.totalRevenue = await adminHelpers.calculateTotalRevenue()
        salesData.totalOrders = await adminHelpers.totalOrders()
        salesData.totalProducts = await adminHelpers.totalProducts()
        // salesData.monthlyEarnings = await adminHelpers.calculateMonthlyEarnings()
      } catch (err) {
        console.log('Error calculating sales data:', err)
        return res.status(500).send('Error calculating sales data')
      }
      try {
        // Convert the report into the selected file format and get the name of the generated file
        const reportFile = await createReport(format, salesData)
        // Set content type and file extension based on format
        let contentType, fileExtension
        if (format === 'PDF') {
          contentType = 'application/pdf'
          fileExtension = 'pdf'
        } else if (format === 'Excel') {
          console.log('proper format')
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          fileExtension = 'xlsx'
        } else {
          return res.status(400).send('Invalid format specified')
        }
        // Send the report back to the client and download it
        res.setHeader('Content-Disposition', `attachment; filename=sales-report.${fileExtension}`)
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
    } catch (err) {
      console.log(err + 'report making err')
      res.status(500).render('404')
    }
  },
  offerPageShow: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const products = await productHelpers.getAllProducts()
      const adminInfo = req.session.admin
      const offeredProducts = await productHelpers.getOfferedProducts()
      res.render('admin_layouts/viewOfferPage', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        categories,
        products,
        offeredProducts
      })
    } catch (err) {
      console.log(err + 'offer page show err')
      res.status(500).render('404')
    }
  },
  categoryPageShow: async (req, res) => {
    try {
      const categories = await productHelpers.getCategories()
      const products = await productHelpers.getAllProducts()
      const adminInfo = req.session.admin
      const offeredCategories = await productHelpers.getOfferedCategories()
      res.render('admin_layouts/categoryOffer', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        categories,
        products,
        offeredCategories
      })
    } catch (err) {
      console.log(err + 'category page show err')
      res.status(500).render('404')
    }
  },
  addProductOffer: async (req, res) => {
    try {
      const data = req.query
      await adminHelpers.addProductOffer(data.product, parseInt(data.discount))
      res.redirect('/admin/add-product-offer')
    } catch (err) {
      console.log(err + 'product offer adding err')
      res.status(500).render('404')
    }
  },
  removeProductOffer: async (req, res) => {
    try {
      const productId = req.params.id
      await adminHelpers.removeProductOffer(productId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'remove product offer err')
      res.status(500).render('404')
    }
  },
  addCategoryOffer: async (req, res) => {
    try {
      const data = req.body
      await adminHelpers.addCategoryOffer(data.category, parseInt(data.discount), data)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'category offer adding err')
      res.status(500).render('404')
    }
  },
  removeCategoryOffer: async (req, res) => {
    try {
      const cateName = req.params.id
      await adminHelpers.removeCategoryOffer(cateName)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'remove category offer err')
      res.status(500).render('404')
    }
  },
  postGenerateReport: async (req, res) => {
    try {
      const limit = req.body
      const orderedData = await adminHelpers.getOrdersInDate(limit.startDate, limit.expiryDate)
      const totalUsersCount = await adminHelpers.totalUsers()
      const productsCount = await adminHelpers.totalProducts()
      let totalSum = 0
      for (let i = 0; i < orderedData.length; i++) {
        totalSum += orderedData[i].total
      }

      const adminInfo = req.session.admin
      res.render('admin_layouts/generateReport', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        orderedData,
        productsCount,
        totalSum,
        totalUsersCount
      })
    } catch (err) {
      console.log(err + 'generate report post err')
      res.status(500).render('404')
    }
  },
  returnRequests: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const orders = await adminHelpers.getReturnedOrders()
      res.render('admin_layouts/returnedOrders', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        orders
      })
    } catch (err) {
      console.log(err + 'order return requests err')
      res.status(500).render('404')
    }
  },
  returnRequestApproval: async (req, res) => {
    try {
      const orderId = req.params.id
      await adminHelpers.approveReturn(orderId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'return request approval err')
      res.status(500).render('404')
    }
  },
  refundRequests: async (req, res) => {
    try {
      const adminInfo = req.session.admin
      const orders = await adminHelpers.getRefundOrders()
      res.render('admin_layouts/refundRequests', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        orders
      })
    } catch (err) {
      console.log(err + 'refund request err')
      res.status(500).render('404')
    }
  },
  rejectReturn: async (req, res) => {
    try {
      const orderId = req.params.id
      await adminHelpers.rejectReturn(orderId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'reject return request err')
      res.status(500).render('404')
    }
  },
  refundApproved: async (req, res) => {
    try {
      const orderId = req.params.id
      await adminHelpers.approveRefund(orderId)
      res.json({ status: true })
    } catch (err) {
      console.log(err + 'refund approval err')
      res.status(500).render('404')
    }
  }
}
