const db = require('../configure/mongoconnectioin')
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
  getProducts: () => {
    return new Promise(async (resolve, reject) => {
      const product = await db
        .get()
        .collection(collection.ProCollection)
        .find()
        .toArray()

      resolve(product)
    })
  },

  deleteProduct: async (proid) => {
    await db.get()
      .collection(collection.ProCollection)
      .deleteOne({ _id: objectid(proid) })
  },
  getByName: async (name) => {
    const product = await db.get()
      .collection(collection.ProCollection)
      .findOne({ Pname: name })
    return product
  },
  getHotSales: async () => {
    const hotSales = await db.get().collection(collection.ProCollection).find({ SaleStatus: 'Hot Sale' }).toArray()
    return hotSales
  },
  getLatestPro: async () => {
    const newProducts = await db.get()
      .collection(collection.ProCollection)
      .find({}).sort({ _id: -1 }).limit(4)
      .toArray()
    return newProducts
  },
  getProduct: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ProCollection)
        .findOne({ _id: objectid(proid) })
        .then((product) => {
          resolve(product)
        })
    })
  },
  changeProduct: (proid, proDetails) => {
    return new Promise((resolve, reject) => {
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
              SaleStatus: proDetails.SaleStatus
            }
          }
        )
        .then((response) => {
          resolve()
        })
    })
  },

  getAllProducts: async () => {
    const products = await db
      .get()
      .collection(collection.ProCollection)
      .find({})
      .toArray()
    return products
  },
  getTreeProducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await db
        .get()
        .collection(collection.ProCollection)
        .find({ Category: 'Christmas tree' })
        .toArray()
      resolve(products)
    })
  },
  getOrnamentsProducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await db
        .get()
        .collection(collection.ProCollection)
        .find({ Category: 'Unique ornaments' })
        .toArray()
      resolve(products)
    })
  },
  getHolidayLightsProducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await db
        .get()
        .collection(collection.ProCollection)
        .find({ Category: 'Holiday lights' })
        .toArray()
      resolve(products)
    })
  },

  addCategory: async (category) => {
    console.log(category)
    await db
      .get()
      .collection(collection.CategoryCollection)
      .insertOne(category)
  },
  getCategories: async () => {
    const categories = await db
      .get()
      .collection(collection.CategoryCollection)
      .find()
      .toArray()
    return categories
  },
  getCategory: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CategoryCollection)
        .findOne({ _id: objectid(proid) })
        .then((category) => {
          resolve(category)
        })
    })
  },
  deleteCategory: async (cateId) => {
    await db.get()
      .collection(collection.CategoryCollection)
      .deleteOne({ _id: objectid(cateId) })
  },
  changeCategory: (cateid, cateDetails) => {
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
  },
  getOfferedProducts: async () => {
    const products = await db.get().collection(collection.ProCollection)
      .find({ discountPrice: { $exists: true } })
      .toArray()
    return products
  },
  getOfferedCategories: async () => {
    const offeredCategories = await db.get().collection(collection.CategoryCollection).find({ categoryOffer: { $exists: true } }).toArray()
    console.log(offeredCategories)
    return offeredCategories
  }
}
