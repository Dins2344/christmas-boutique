module.exports = {
  userSessionChecking: (req, res, next) => {
    if (req.session.user) {
      res.redirect('/')
    } else {
      next()
    }
  },
  userSessionCheckingHome: (req, res, next) => {
    if (req.session.user) {
      next()
    } else {
      res.redirect('/login')
    }
  },

  adminSessionChecking: (req, res, next) => {
    if (req.session.admin) {
      res.redirect('/admin')
    } else {
      next()
    }
  },

  adminSessionCheckingHome: (req, res, next) => {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin/login')
    }
  }

}
