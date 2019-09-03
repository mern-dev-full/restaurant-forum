const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const userService = require('../../services/userService')

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

module.exports = {
  signIn: async (req, res) => {
    // check if any field is empty
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: 'Email and password are required!' })
    }
    // save data to variables
    const username = req.body.email
    const password = req.body.password

    const user = await User.findOne({ where: { email: username } })
    // no user found
    if (!user) return res.status(401).json({ status: 'error', message: 'No such user' })
    // existing user: check password
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ status: 'error', message: 'Wrong password' })
    // sign token
    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return res.json({
      status: 'success',
      message: 'ok',
      token,
      user: {
        id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin
      }
    })
  },
  signUp: async (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      return res.json({ status: 'error', message: '兩次密碼輸入不同' })
    }

    try {
      // check unique user
      const user = await User.findOne({ where: { email: req.body.email } })
      // existing user
      if (user) {
        return res.json({ status: 'error', message: 'Email 已經註冊過' })
      }
      // create new user
      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        image: 'https://randomuser.me/api/portraits/lego/1.jpg'
      })
      return res.json({ status: 'success', message: '成功註冊帳號!' })
    } catch (err) {
      res.json({ status: 'error', message: err })
    }
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, data => {
      return res.json(data)
    })
  },
}