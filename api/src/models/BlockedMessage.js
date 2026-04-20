const mongoose = require('mongoose')

const blockedMessageSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  sender: { type: String, required: true },
  patternId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pattern' },
  patternText: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  platform: { type: String, enum: ['android', 'ios'], required: true },
  appVersion: { type: String, default: '1.0.0' },
  rawContent: { type: String, default: '' },
  blockedAt: { type: Date, default: Date.now },
}, { timestamps: false })

blockedMessageSchema.methods.toApiObject = function () {
  return {
    id: this._id,
    deviceId: this.deviceId,
    sender: this.sender,
    patternId: this.patternId,
    patternText: this.patternText,
    severity: this.severity,
    platform: this.platform,
    appVersion: this.appVersion,
    rawContent: this.rawContent,
    blockedAt: this.blockedAt,
  }
}

module.exports = mongoose.model('BlockedMessage', blockedMessageSchema)
