const mongoose = require('mongoose')

const patternSchema = new mongoose.Schema({
  pattern: { type: String, required: true, trim: true },
  type: { type: String, enum: ['keyword', 'url', 'regex'], required: true },
  language: { type: String, enum: ['pt', 'en', 'both'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  matchCount: { type: Number, default: 0 },
}, { timestamps: true })

patternSchema.methods.toApiObject = function () {
  return {
    id: this._id,
    pattern: this.pattern,
    type: this.type,
    language: this.language,
    severity: this.severity,
    status: this.status,
    matchCount: this.matchCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

module.exports = mongoose.model('Pattern', patternSchema)
