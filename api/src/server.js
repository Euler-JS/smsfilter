require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const authRoutes = require('./routes/auth')
const overviewRoutes = require('./routes/overview')
const patternsRoutes = require('./routes/patterns')
const statisticsRoutes = require('./routes/statistics')
const messagesRoutes = require('./routes/messages')
const devicesRoutes = require('./routes/devices')
const settingsRoutes = require('./routes/settings')

const app = express()

// Security & parsing
app.use(helmet())
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/overview', overviewRoutes)
app.use('/api/patterns', patternsRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/devices', devicesRoutes)
app.use('/api/settings', settingsRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 8000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
