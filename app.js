const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const hbs = require('express-handlebars')
const db = require('./configure/mongoconnectioin')
const session = require('express-session')
const nocache = require('nocache')
const handlebars = require('handlebars')

const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const oneday = 1000 * 60 * 60 * 24

const app = express()
require('dotenv').config()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutDir: __dirname + '/views/layouts', partialDir: __dirname + '/views/partials/' }))
handlebars.registerHelper('multiply', function (a, b) {
  return a * b
})
handlebars.registerHelper('percentage', function (a, b, coupon) {
  console.log(coupon)
  return Math.round(b - ((a / 100) * b))
})
handlebars.registerHelper('eq', function (a, b) {
  if (a === b) return true
})
handlebars.registerHelper('or', function (a, b, options) {
  if (a || b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})
app.use(nocache())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({ secret: 'key', resave: false, saveUninitialized: false, cookie: { maxAge: oneday } }))
db.connect((err) => {
  if (err) {
    console.log('connection error : ' + err)
  } else { console.log('database connected') }
})

app.use('/', userRouter)
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
