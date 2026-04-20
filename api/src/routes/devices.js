const router = require('express').Router()
const auth = require('../middleware/auth')
const Device = require('../models/Device')

// GET /api/devices
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1, pageSize = 20,
      platform, status,
    } = req.query

    const filter = {}
    if (platform) filter.platform = platform
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(pageSize)

    const [total, devices] = await Promise.all([
      Device.countDocuments(filter),
      Device.find(filter).sort({ lastActive: -1 }).skip(skip).limit(parseInt(pageSize)).lean(),
    ])

    res.json({
      data: devices.map((d) => ({ ...d, id: d._id })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize)),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
