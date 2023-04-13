const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
require('dotenv').config()
// configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET_KEY

})

// upload
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => {
      // remove the file extension from the file name
      const fileName = file.originalname.split('.').slice(0, -1).join('.')
      return fileName
    }
  }
})

const upload = multer({ storage }).array('images', 10)

module.exports = upload
