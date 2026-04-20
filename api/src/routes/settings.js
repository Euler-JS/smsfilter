const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const User = require('../models/User')
const AppSettings = require('../models/AppSettings')
const BlockedMessage = require('../models/BlockedMessage')
const Pattern = require('../models/Pattern')

// GET /api/settings/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user.toSafeObject())
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/settings/profile
router.put(
  '/profile',
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const user = await User.findById(req.user.id)
      if (!user) return res.status(404).json({ message: 'User not found' })

      const { name, email, currentPassword, newPassword } = req.body

      if (name) user.name = name
      if (email) user.email = email

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password required to change password' })
        }
        const ok = await user.comparePassword(currentPassword)
        if (!ok) return res.status(400).json({ message: 'Current password is incorrect' })
        user.password = newPassword
      }

      await user.save()
      res.json(user.toSafeObject())
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

// GET /api/settings/api-config
router.get('/api-config', auth, async (req, res) => {
  try {
    let settings = await AppSettings.findOne()
    if (!settings) settings = await AppSettings.create({})
    res.json({ baseApiUrl: settings.baseApiUrl, syncInterval: settings.syncInterval })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/settings/api-config
router.put('/api-config', auth, async (req, res) => {
  try {
    const { baseApiUrl, syncInterval } = req.body
    let settings = await AppSettings.findOne()
    if (!settings) settings = new AppSettings()
    if (baseApiUrl !== undefined) settings.baseApiUrl = baseApiUrl
    if (syncInterval !== undefined) settings.syncInterval = Number(syncInterval)
    await settings.save()
    res.json({ baseApiUrl: settings.baseApiUrl, syncInterval: settings.syncInterval })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/settings/statistics
router.delete('/statistics', auth, async (req, res) => {
  try {
    await BlockedMessage.deleteMany({})
    res.json({ message: 'All statistics cleared' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/settings/reset-patterns
router.post('/reset-patterns', auth, async (req, res) => {
  try {
    await Pattern.deleteMany({})
    // Re-seed default patterns
    const { defaultPatterns } = require('../utils/defaultPatterns')
    await Pattern.insertMany(defaultPatterns)
    res.json({ message: 'Patterns reset to default' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
