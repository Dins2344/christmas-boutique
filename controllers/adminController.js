
const adminHelpers = require('../helpers/adminHelpers')
const productHelpers = require('../helpers/productHelpers')
const createReport = require('../middleware/reportCreator')
const fs = require('fs')
const admin = true

module.exports = {
  adminHome: async (req, res) => {
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
  },

  adminLogin: (req, res) => {
    res.render('admin_layouts/adminLogin', {
      admin,
      title: 'christmas boutique admin panel',
      logErr: req.session.logErr
    })
    req.session.logErr = false
  },
  adminLoginPost: (req, res) => {
    console.log('called')
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
  },

  adminLogout: (req, res) => {
    req.session.admin = null
    res.json({ status: true })
  },
  getDataForGraphs: async (req, res) => {
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
  },
  adminAddProduct: async (req, res) => {
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
  },
  adminAddProductPost: async (req, res) => {
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
  },

  viewProducts: (req, res) => {
    const adminInfo = req.session.admin
    productHelpers.getProducts().then((products) => {
      res.render('admin_layouts/viewProducts', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        products
      })
    })
  },

  deleteProducts: async (req, res) => {
    const productId = req.params.id
    await productHelpers.deleteProduct(productId)
    res.json({ status: true })
  },

  editProductGet: async (req, res) => {
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
  },

  editProductPost: (req, res) => {
    const id = req.params.id
    productHelpers.changeProduct(req.params.id, req.body).then(() => {
      res.redirect('/admin/viewproducts')
      if (req.files.img) {
        const image = req.files.img
        image.mv('./public/images/prodimg/' + id + '.jpg')
      } else {
        res.redirect('/admin/viewproducts')
      }
    })
  },

  getUsers: (req, res) => {
    const adminInfo = req.session.admin
    adminHelpers.getUsers().then((users) => {
      res.render('admin_layouts/viewUsers', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        users
      })
    })
  },

  blockUser: (req, res) => {
    adminHelpers.blockUserStatus(req.params.id).then(() => {
      res.json({ status: true })
    })
  },
  unblockUser: (req, res) => {
    adminHelpers.unblockUserStatus(req.params.id).then(() => {
      res.json({ status: true })
    })
  },

  categoryGet: async (req, res) => {
    const adminInfo = req.session.admin
    await productHelpers.getCategories().then((category) => {
      res.render('admin_layouts/viewCategory', {
        admin,
        title: 'christmas boutique admin panel',
        adminInfo,
        category
      })
    })
  },
  addCategory: (req, res) => {
    const adminInfo = req.session.admin
    res.render('admin_layouts/addCategory', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      cateErr: req.session.addCateErr
    })
    req.session.addCateErr = false
  },
  addCategoryPost: async (req, res) => {
    console.log(req.body)
    const category = await adminHelpers.getCategoryByName(req.body.Cname)
    if (category) {
      req.session.addCateErr = 'This name is already assigned to a category...!'
      res.redirect('/admin/addcategory')
    } else {
      await productHelpers.addCategory(req.body)
      res.redirect('/admin/addcategory')
    }
  },

  deleteCategory: async (req, res) => {
    const categoryId = req.params.id
    await productHelpers.deleteCategory(categoryId)
    res.json({ status: true })
  },

  editCategoryGet: async (req, res) => {
    const adminInfo = req.session.admin
    const category = await productHelpers.getCategory(req.params.id)

    res.render('admin_layouts/editcategory', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      category
    })
  },

  editCategoryPost: (req, res) => {
    console.log('called')
    console.log(req.params.id, req.body)
    productHelpers.changeCategory(req.params.id, req.body).then(() => {
      res.redirect('/admin/category')
    })
  },
  couponsGet: async (req, res) => {
    const adminInfo = req.session.admin
    const coupons = await adminHelpers.getCoupons()
    res.render('admin_layouts/viewCoupons', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      coupons
    })
  },
  ordersGet: async (req, res) => {
    const adminInfo = req.session.admin
    const orders = await adminHelpers.getAllOrders()
    console.log(orders)
    res.render('admin_layouts/viewOrders', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      orders
    })
  },
  orderDetails: async (req, res) => {
    const id = req.params.id
    const adminInfo = req.session.admin
    const order = await adminHelpers.getAOrder(id)
    res.render('admin_layouts/viewOneOrder', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      order
    })
  },
  orderUpdating: async (req, res) => {
    const data = req.body
    let delivered = false
    console.log(data)
    if (data.deliveryStatus === 'delivered') {
      delivered = true
    }
    await adminHelpers.updateOrder(data, delivered)

    res.redirect('/admin/view-order-details/' + data.orderId)
  },
  addCoupon: async (req, res) => {
    console.log(req.query)
    const data = req.body
    await adminHelpers.addCoupon(data)
    res.json({ status: true })
  },
  deleteCoupon: async (req, res) => {
    const id = req.params.id

    await adminHelpers.deleteCoupon(id)
    res.json({ status: true })
  },
  editCoupon: async (req, res) => {
    const data = req.query
    console.log(data)
    await adminHelpers.editCoupon(data)
    res.redirect('/admin/coupons')
  },
  makeReport: async (req, res) => {
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
  },
  offerPageShow: async (req, res) => {
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
  },
  categoryPageShow: async (req, res) => {
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
  },
  addProductOffer: async (req, res) => {
    const data = req.query
    await adminHelpers.addProductOffer(data.product, parseInt(data.discount))
    res.redirect('/admin/add-product-offer')
  },
  removeProductOffer: async (req, res) => {
    const productId = req.params.id
    console.log(productId)
    await adminHelpers.removeProductOffer(productId)
    res.json({ status: true })
  },
  addCategoryOffer: async (req, res) => {
    const data = req.body
    console.log(data)
    await adminHelpers.addCategoryOffer(data.category, parseInt(data.discount), data)
    res.json({ status: true })
  },
  removeCategoryOffer: async (req, res) => {
    const cateName = req.params.id
    console.log(cateName)
    await adminHelpers.removeCategoryOffer(cateName)
    res.json({ status: true })
  },
  postGenerateReport: async (req, res) => {
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
  },
  returnRequests: async (req, res) => {
    const adminInfo = req.session.admin
    const orders = await adminHelpers.getReturnedOrders()
    res.render('admin_layouts/returnedOrders', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      orders
    })
  },
  returnRequestApproval: async (req, res) => {
    const orderId = req.params.id
    await adminHelpers.approveReturn(orderId)
    res.json({ status: true })
  },
  refundRequests: async (req, res) => {
    const adminInfo = req.session.admin
    const orders = await adminHelpers.getRefundOrders()
    res.render('admin_layouts/refundRequests', {
      admin,
      title: 'christmas boutique admin panel',
      adminInfo,
      orders
    })
  },
  rejectReturn: async (req, res) => {
    const orderId = req.params.id
    console.log(orderId)
    await adminHelpers.rejectReturn(orderId)
    res.json({ status: true })
  },
  refundApproved: async (req, res) => {
    const orderId = req.params.id
    await adminHelpers.approveRefund(orderId)
    res.json({ status: true })
  }
}
