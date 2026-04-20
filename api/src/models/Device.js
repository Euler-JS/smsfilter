const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  platform: { type: String, enum: ['android', 'ios'], required: true },
  appVersion: { type: String, default: '1.0.0' },
  totalBlocked: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
}, { timestamps: true })

deviceSchema.methods.toApiObject = function () {
  return {
    id: this._id,
    deviceId: this.deviceId,
    platform: this.platform,
    appVersion: this.appVersion,
    totalBlocked: this.totalBlocked,
    lastActive: this.lastActive,
    status: this.status,
  }
}

module.exports = mongoose.model('Device', deviceSchema)
