const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Pattern = require('../models/Pattern')

const validatePattern = [
  body('pattern').notEmpty().withMessage('Pattern is required'),
  body('type').isIn(['keyword', 'url', 'regex']).withMessage('Invalid type'),
  body('language').isIn(['pt', 'en', 'both']).withMessage('Invalid language'),
  body('severity').isIn(['low', 'medium', 'high']).withMessage('Invalid severity'),
]

// GET /api/patterns — public (apps móveis sincronizam sem autenticação)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, pageSize = 20,
      sortKey = 'createdAt', sortDir = 'desc',
      search, type, language, severity, status,
    } = req.query

    const filter = {}
    if (search) filter.pattern = { $regex: search, $options: 'i' }
    if (type) filter.type = type
    if (language) filter.language = language
    if (severity) filter.severity = severity
    if (status) filter.status = status

    const sortObj = { [sortKey]: sortDir === 'asc' ? 1 : -1 }
    const skip = (parseInt(page) - 1) * parseInt(pageSize)

    const [total, patterns] = await Promise.all([
      Pattern.countDocuments(filter),
      Pattern.find(filter).sort(sortObj).skip(skip).limit(parseInt(pageSize)).lean(),
    ])

    res.json({
      data: patterns.map((p) => ({ ...p, id: p._id })),
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

// POST /api/patterns
router.post('/', auth, validatePattern, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { pattern, type, language, severity, status = 'active' } = req.body
    const doc = await Pattern.create({ pattern, type, language, severity, status })
    res.status(201).json({ ...doc.toObject(), id: doc._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/patterns/:id
router.put('/:id', auth, validatePattern, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { pattern, type, language, severity, status } = req.body
    const doc = await Pattern.findByIdAndUpdate(
      req.params.id,
      { pattern, type, language, severity, status },
      { new: true, runValidators: true }
    )
    if (!doc) return res.status(404).json({ message: 'Pattern not found' })
    res.json({ ...doc.toObject(), id: doc._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/patterns/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Pattern.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Pattern not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/patterns/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const doc = await Pattern.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Pattern not found' })
    res.json({ ...doc.toObject(), id: doc._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
