const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

// POST /api/auth/login
router.post(
  '/login',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })
      if (!user) return res.status(401).json({ message: 'Invalid credentials' })

      const ok = await user.comparePassword(password)
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      res.json({ token, user: user.toSafeObject() })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

// GET /api/auth/me  (optional – used to verify token)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user.toSafeObject())
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
