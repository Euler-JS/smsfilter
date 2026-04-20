const router = require('express').Router()
const auth = require('../middleware/auth')
const BlockedMessage = require('../models/BlockedMessage')
const Pattern = require('../models/Pattern')
const { subDays } = require('../utils/dateUtils')

function getDateRange(query) {
  const to = query.to ? new Date(query.to + 'T23:59:59Z') : new Date()
  const from = query.from ? new Date(query.from + 'T00:00:00Z') : subDays(new Date(), 29)
  return { from, to }
}

function getGroupFormat(granularity) {
  if (granularity === 'weekly') return '%Y-W%V'
  if (granularity === 'monthly') return '%Y-%m'
  return '%Y-%m-%d'
}

// GET /api/statistics/blocks-over-time
router.get('/blocks-over-time', auth, async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query)
    const format = getGroupFormat(req.query.granularity)

    const results = await BlockedMessage.aggregate([
      { $match: { blockedAt: { $gte: from, $lte: to } } },
      { $group: { _id: { $dateToString: { format, date: '$blockedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    res.json(results.map((r) => ({ date: r._id, count: r.count })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/statistics/blocks-by-platform
router.get('/blocks-by-platform', auth, async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query)
    const results = await BlockedMessage.aggregate([
      { $match: { blockedAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ])
    // Capitalize for display
    res.json(results.map((r) => ({
      platform: r._id === 'android' ? 'Android' : 'iOS',
      count: r.count,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/statistics/blocks-by-severity
router.get('/blocks-by-severity', auth, async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query)
    const SEVERITY_COLORS = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' }
    const results = await BlockedMessage.aggregate([
      { $match: { blockedAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$severity', value: { $sum: 1 } } },
    ])
    res.json(
      results.map((r) => ({
        name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
        value: r.value,
        color: SEVERITY_COLORS[r._id] || '#64748B',
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/statistics/blocks-by-language
router.get('/blocks-by-language', auth, async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query)

    // Join with patterns to get language
    const results = await BlockedMessage.aggregate([
      { $match: { blockedAt: { $gte: from, $lte: to } } },
      {
        $lookup: {
          from: 'patterns',
          localField: 'patternId',
          foreignField: '_id',
          as: 'pattern',
        },
      },
      { $unwind: { path: '$pattern', preserveNullAndEmpty: true } },
      { $group: { _id: '$pattern.language', count: { $sum: 1 } } },
    ])

    res.json(results.map((r) => ({ language: r._id || 'unknown', count: r.count })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/statistics/top-patterns
router.get('/top-patterns', auth, async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query)
    const limit = parseInt(req.query.limit) || 10

    const results = await BlockedMessage.aggregate([
      { $match: { blockedAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$patternId', count: { $sum: 1 }, lastMatched: { $max: '$blockedAt' }, patternText: { $first: '$patternText' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'patterns',
          localField: '_id',
          foreignField: '_id',
          as: 'pattern',
        },
      },
      { $unwind: { path: '$pattern', preserveNullAndEmpty: true } },
    ])

    res.json(
      results.map((r) => ({
        patternId: r._id,
        patternText: r.patternText || r.pattern?.pattern || 'Unknown',
        severity: r.pattern?.severity || 'medium',
        count: r.count,
        lastMatched: r.lastMatched,
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
