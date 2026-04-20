const router = require('express').Router()
const auth = require('../middleware/auth')
const Pattern = require('../models/Pattern')
const BlockedMessage = require('../models/BlockedMessage')
const Device = require('../models/Device')
const { subDays, startOfDay } = require('../utils/dateUtils')

// GET /api/overview/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const since30d = subDays(new Date(), 30)

    const [totalBlocked, activeDevices, activePatterns, blockedLast24h] = await Promise.all([
      BlockedMessage.countDocuments(),
      Device.countDocuments({ lastActive: { $gte: since30d }, status: 'active' }),
      Pattern.countDocuments({ status: 'active' }),
      BlockedMessage.countDocuments({ blockedAt: { $gte: since24h } }),
    ])

    res.json({ totalBlocked, activeDevices, activePatterns, blockedLast24h })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/overview/blocks-per-day?days=30
router.get('/blocks-per-day', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    const since = subDays(new Date(), days)

    const results = await BlockedMessage.aggregate([
      { $match: { blockedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$blockedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Fill missing days with 0
    const map = Object.fromEntries(results.map((r) => [r._id, r.count]))
    const data = Array.from({ length: days }, (_, i) => {
      const d = subDays(new Date(), days - 1 - i)
      const date = d.toISOString().slice(0, 10)
      return { date, count: map[date] || 0 }
    })

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/overview/blocks-by-platform
router.get('/blocks-by-platform', auth, async (req, res) => {
  try {
    const results = await BlockedMessage.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ])
    res.json(results.map((r) => ({ platform: r._id, count: r.count })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/overview/top-patterns?limit=5
router.get('/top-patterns', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    const results = await Pattern.find({ status: 'active' })
      .sort({ matchCount: -1 })
      .limit(limit)
      .lean()

    res.json(
      results.map((p) => ({
        patternId: p._id,
        patternText: p.pattern,
        severity: p.severity,
        count: p.matchCount,
        lastMatched: p.updatedAt,
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/overview/recent-blocked?limit=10
router.get('/recent-blocked', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const messages = await BlockedMessage.find()
      .sort({ blockedAt: -1 })
      .limit(limit)
      .lean()

    res.json(messages.map((m) => ({ ...m, id: m._id })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
