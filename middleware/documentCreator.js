const PDFDocument = require('pdfkit-table')
const ExcelJS = require('exceljs')
const fs = require('fs')

async function generateReport (reportType, data) {
  try {
    if (reportType === 'pdf') {
      const doc = new PDFDocument()
      const tData = data[0].products.map(product => {
        return [
          product.cartProduct.Pname,
          product.cartProduct.Price,
          product.quantity,
          product.cartProduct.Price * product.quantity
        ]
      })
      const blankRow = ['', '', '', '']
      const subtotal = ['', '', 'Subtotal : ', data[0].itemsTotal]
      const tax = ['', '', 'Tax : ', data[0].itemsTotal]
      const shipping = ['', '', 'Shipping charge : ', '40']
      const total = ['', '', 'Total : ', data[0].total]
      console.log(data)
      tData.push(blankRow, subtotal, tax, shipping, total)
      console.log(tData)
      const table = {
        title: 'CHRISTMAS BOUTIQUE',
        subtitle: 'Invoice',
        headers: ['Product', 'Price', 'Quantity', 'Subtotal'],
        rows: tData

      }
      await doc.table(table)

      const filename = 'sales-report.pdf'
      const writeStream = fs.createWriteStream(filename)
      doc.pipe(writeStream)
      doc.end()
      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          console.log(`PDF report saved to ${filename}`)
          resolve(filename)
        })
        writeStream.on('error', (error) => {
          console.error(`Error saving PDF report: ${error}`)
          reject(error)
        })
      })
      return filename
    } else {
      throw new Error(`Invalid report type: ${reportType}`)
    }
  } catch (error) {
    console.error(`Error generating ${reportType} report: ${error}`)
    throw error
  }
}
module.exports = generateReport
