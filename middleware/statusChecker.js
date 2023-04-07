const userHelpers = require('../helpers/userHelpers')
module.exports = {
  userStatusChecking: async (req, res, next) => {
    const id = req.session.user._id
    const user = await userHelpers.getAUser(id)
    if (user.status) {
      next()
    } else {
      res.json({ status: 'blocked' })
    }
  }
}
