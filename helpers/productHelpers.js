const db = require('../configure/mongoConnections')
const collection = require('../configure/collectionNames')
const objectid = require('mongodb').ObjectId
module.exports = {
  addproduct: async (productDetails, images) => {
    const imageObj = {}
    for (let i = 0; i < images.length; i++) {
      const keyName = `image${i + 1}`
      imageObj[keyName] = images[i]
    }
    const product = {
      Pname: productDetails.Pname,
      Description: productDetails.Description,
      Category: productDetails.Category,
      Price: parseInt(productDetails.Price),
      Discount: parseInt(productDetails.Discount),
      images: imageObj
    }
    await db.get()
      .collection(collection.ProCollection)
      .insertOne(product)
  },
  getProducts: async () => {
    try {
      const product = await db
        .get()
        .collection(collection.ProCollection)
        .find()
        .toArray()
      return product
    } catch (err) {
      return err
    }
  },

  deleteProduct: async (proid) => {
    try {
      await db.get()
        .collection(collection.ProCollection)
        .deleteOne({ _id: objectid(proid) })
    } catch (err) {
      return err
    }
  },
  getByName: async (name) => {
    try {
      const product = await db.get()
        .collection(collection.ProCollection)
        .findOne({ Pname: name })
      return product
    } catch (err) {
      return err
    }
  },
  getHotSales: async () => {
    try {
      const hotSales = await db.get().collection(collection.ProCollection).find({ SaleStatus: 'Hot Sale' }).toArray()
      return hotSales
    } catch (err) {
      return err
    }
  },
  getLatestPro: async () => {
    try {
      const newProducts = await db.get()
        .collection(collection.ProCollection)
        .find({}).sort({ _id: -1 }).limit(4)
        .toArray()
      return newProducts
    } catch (err) {
      return err
    }
  },
  getProduct: async (proid) => {
    try {
      const product = await db.get()
        .collection(collection.ProCollection)
        .findOne({ _id: objectid(proid) })
      return product
    } catch (err) {
      return err
    }
  },
  changeProduct: (proid, proDetails, images) => {
    try {
      const imageObj = {}
      for (let i = 0; i < images.length; i++) {
        const keyName = `image${i + 1}`
        imageObj[keyName] = images[i]
      } return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ProCollection)
          .updateOne(
            { _id: objectid(proid) },
            {
              $set: {
                Pname: proDetails.Pname,
                Description: proDetails.Description,
                Category: proDetails.Category,
                Price: parseInt(proDetails.Price),
                Discount: parseInt(proDetails.Discount),
                SaleStatus: proDetails.SaleStatus,
                images: imageObj
              }
            }
          )
          .then((response) => {
            resolve()
          })
      })
    } catch (err) {
      return err
    }
  },
  getSearchedProducts: async (search, page, limit) => {
    try {
      const products = await db.get().collection(collection.ProCollection).find(
        {
          $or:
          [{ Pname: { $regex: new RegExp(search, 'i') } }, { Category: { $regex: new RegExp(search, 'i') } }]
        }).limit(limit).skip((page - 1) * limit).toArray()

      return products
    } catch (err) {
      return err
    }
  },
  getSearchedProductsLength: async (search) => {
    try {
      const products = await db.get().collection(collection.ProCollection).find(
        {
          $or:
          [{ Pname: { $regex: new RegExp(search, 'i') } }, { Category: { $regex: new RegExp(search, 'i') } }]
        }).toArray()

      return products.length
    } catch (err) {
      return err
    }
  },
  getAmountBasedProducts: async (min, max) => {
    try {
      const minimum = parseInt(min)
      const maximum = parseInt(max)

      const products = await db.get().collection(collection.ProCollection).find({
        Price: {
          $gte: minimum,
          $lte: maximum
        }
      }).toArray()

      return products
    } catch (err) {
      return err
    }
  },
  getAllProducts: async (page, limit) => {
    try {
      const products = await db.get()
        .collection(collection.ProCollection)
        .find({})
        .limit(limit)
        .skip((page - 1) * limit)
        .toArray()
      return products
    } catch (err) {
      return err
    }
  },
  getAllProductsCount: async () => {
    try {
      const products = await db.get()
        .collection(collection.ProCollection)
        .find({})
        .toArray()
      return products.length
    } catch (err) {
      return err
    }
  },
  getCategoryProducts: async (category, page, limit) => {
    try {
      console.log(limit)
      const products = await db
        .get()
        .collection(collection.ProCollection)
        .find({ Category: category })
        .limit(limit)
        .skip((page - 1) * limit)
        .toArray()
      return products
    } catch (err) {
      return err
    }
  },
  getCategoryProductsCount: async (category) => {
    try {
      const products = await db.get().collection(collection.ProCollection).find({ Category: category }).toArray()
      return products.length
    } catch (err) {
      return err
    }
  },
  getProductsAscending: async () => {
    try {
      const products = await db.get().collection(collection.ProCollection).find({}).sort({ Price: 1, _id: 1 }).toArray()
      return products
    } catch (err) {
      return err
    }
  },
  getProductsDescending: async () => {
    try {
      const products = await db.get().collection(collection.ProCollection).find({}).sort({ Price: -1, _id: 1 }).toArray()
      return products
    } catch (err) {
      return err
    }
  },

  addCategory: async (category) => {
    try {
      await db
        .get()
        .collection(collection.CategoryCollection)
        .insertOne(category)
    } catch (err) {
      return err
    }
  },
  getCategories: async () => {
    try {
      const categories = await db
        .get()
        .collection(collection.CategoryCollection)
        .find()
        .toArray()
      return categories
    } catch (err) {
      return err
    }
  },
  getCategory: (proid) => {
    try {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.CategoryCollection)
          .findOne({ _id: objectid(proid) })
          .then((category) => {
            resolve(category)
          })
      })
    } catch (err) {
      return err
    }
  },
  deleteCategory: async (cateId) => {
    try {
      await db.get()
        .collection(collection.CategoryCollection)
        .deleteOne({ _id: objectid(cateId) })
    } catch (err) {
      return err
    }
  },
  changeCategory: (cateid, cateDetails) => {
    try {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.CategoryCollection)
          .updateOne(
            { _id: objectid(cateid) },
            {
              $set: {
                Cname: cateDetails.Cname,
                SCname: cateDetails.SCname,
                Discription: cateDetails.Discription
              }
            }
          )
          .then((response) => {
            resolve()
          })
      })
    } catch (err) {
      return err
    }
  },
  getOfferedProducts: async () => {
    try {
      const products = await db.get().collection(collection.ProCollection)
        .find({ discountPrice: { $exists: true } })
        .toArray()
      return products
    } catch (err) {
      return err
    }
  },
  getOfferedCategories: async () => {
    try {
      const offeredCategories = await db.get().collection(collection.CategoryCollection).find({ categoryOffer: { $exists: true } }).toArray()
      return offeredCategories
    } catch (err) {
      return err
    }
  }
}
