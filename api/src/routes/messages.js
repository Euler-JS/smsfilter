const router = require('express').Router()
const auth = require('../middleware/auth')
const BlockedMessage = require('../models/BlockedMessage')

// GET /api/messages
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1, pageSize = 20,
      sortKey = 'blockedAt', sortDir = 'desc',
      search, platform, severity, from, to,
    } = req.query

    const filter = {}
    if (search) {
      filter.$or = [
        { sender: { $regex: search, $options: 'i' } },
        { patternText: { $regex: search, $options: 'i' } },
      ]
    }
    if (platform) filter.platform = platform
    if (severity) filter.severity = severity
    if (from || to) {
      filter.blockedAt = {}
      if (from) filter.blockedAt.$gte = new Date(from + 'T00:00:00Z')
      if (to) filter.blockedAt.$lte = new Date(to + 'T23:59:59Z')
    }

    const sortObj = { [sortKey === 'blockedAt' ? 'blockedAt' : sortKey]: sortDir === 'asc' ? 1 : -1 }
    const skip = (parseInt(page) - 1) * parseInt(pageSize)

    const [total, messages] = await Promise.all([
      BlockedMessage.countDocuments(filter),
      BlockedMessage.find(filter).sort(sortObj).skip(skip).limit(parseInt(pageSize)).lean(),
    ])

    res.json({
      data: messages.map((m) => ({ ...m, id: m._id })),
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

// POST /api/messages — público, apps móveis reportam mensagens bloqueadas
router.post('/', async (req, res) => {
  try {
    const { deviceId, sender, patternText, severity, platform, appVersion, rawContent } = req.body
    if (!deviceId || !sender || !patternText) {
      return res.status(400).json({ message: 'deviceId, sender and patternText are required' })
    }
    const msg = await BlockedMessage.create({
      deviceId,
      sender,
      patternText,
      severity: severity || 'medium',
      platform: platform || 'unknown',
      appVersion: appVersion || '1.0',
      rawContent: rawContent || '',
      blockedAt: new Date(),
    })
    res.status(201).json({ id: msg._id, message: 'Reported' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/messages/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const msg = await BlockedMessage.findById(req.params.id).lean()
    if (!msg) return res.status(404).json({ message: 'Message not found' })
    res.json({ ...msg, id: msg._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
