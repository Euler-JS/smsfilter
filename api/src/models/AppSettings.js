const mongoose = require('mongoose')

// Singleton settings document
const appSettingsSchema = new mongoose.Schema({
  baseApiUrl: { type: String, default: 'http://localhost:8000/api' },
  syncInterval: { type: Number, default: 24 },
}, { timestamps: true })

module.exports = mongoose.model('AppSettings', appSettingsSchema)
