require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Pattern = require('./models/Pattern')
const BlockedMessage = require('./models/BlockedMessage')
const Device = require('./models/Device')
const { defaultPatterns } = require('./utils/defaultPatterns')

function subDays(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Pattern.deleteMany({}),
    BlockedMessage.deleteMany({}),
    Device.deleteMany({}),
  ])
  console.log('🗑️  Cleared existing data')

  // Create admin user
  const admin = await User.create({
    name: 'Admin OptimusGuard',
    email: 'admin@optimusguard.com',
    password: 'Admin@1234',
    role: 'admin',
  })
  console.log('👤 Admin user created: admin@optimusguard.com / Admin@1234')

  // Create patterns
  const patterns = await Pattern.insertMany(defaultPatterns)
  console.log(`🛡️  ${patterns.length} patterns created`)

  // Create devices
  const devices = []
  for (let i = 0; i < 30; i++) {
    devices.push({
      deviceId: `DEV-${String(1000 + i)}`,
      platform: i % 2 === 0 ? 'android' : 'ios',
      appVersion: ['1.0.0', '1.1.0', '1.2.0'][i % 3],
      totalBlocked: randomBetween(0, 500),
      lastActive: subDays(randomBetween(0, 29)),
      status: i % 7 === 0 ? 'expired' : 'active',
    })
  }
  await Device.insertMany(devices)
  console.log(`📱 ${devices.length} devices created`)

  // Create blocked messages (50 realistic messages)
  const sampleMessages = [
    { patternText: 'você ganhou',               severity: 'high',   rawContent: 'Parabéns! Você ganhou R$500. Clique aqui para resgatar: bit.ly/premio123' },
    { patternText: 'conta bancária foi bloqueada', severity: 'high', rawContent: 'URGENTE: Sua conta bancária foi bloqueada. Confirme seus dados agora: bit.ly/banco-verify' },
    { patternText: 'transferência pendente',    severity: 'high',   rawContent: 'Você tem uma transferência pendente. Confirme em: rb.gy/seguro' },
    { patternText: 'acesso suspeito',           severity: 'high',   rawContent: 'Seu banco detectou acesso suspeito. Desbloqueie: tinyurl.com/acesso123' },
    { patternText: 'apostas grátis',            severity: 'high',   rawContent: 'Nova plataforma! Receba 25 apostas grátis + 1.000 MT: abre.ai/oLye' },
    { patternText: 'gira grátis',               severity: 'high',   rawContent: '😳 Eu não acreditei… Tá pagando mesmo! Gira grátis 10.000MT 👇 https://roleta-olabet.vercel.app/' },
    { patternText: 'chat.whatsapp.com/',        severity: 'medium', rawContent: 'SAUDAÇÕES! Comunidade juvenil experiente em fazer dinheiro: chat.whatsapp.com/LLxRE9sl5C247' },
    { patternText: 'clique aqui para resgatar', severity: 'high',   rawContent: 'Você tem um prémio de 5.000 MT. Clique para resgatar: abre.ai/xYz9' },
    { patternText: 'confirme seus dados',       severity: 'medium', rawContent: 'Confirme seus dados para evitar bloqueio: bit.ly/confirmar' },
    { patternText: 'você foi selecionado',      severity: 'medium', rawContent: 'Parabéns! Você foi selecionado para receber um prémio!' },
  ]

  const senders = ['+258 84 123 4567', '+258 82 987 6543', '+258 86 555 1234', 'INFO', 'BANCO', 'PROMO']
  const messages = []
  for (let i = 0; i < 100; i++) {
    const sample = sampleMessages[i % sampleMessages.length]
    const matchedPattern = patterns.find((p) => p.pattern === sample.patternText) || patterns[i % patterns.length]
    messages.push({
      deviceId: `DEV-${String(1000 + (i % 30))}`,
      sender: randomItem(senders),
      patternId: matchedPattern._id,
      patternText: matchedPattern.pattern,
      severity: sample.severity,
      platform: i % 2 === 0 ? 'android' : 'ios',
      appVersion: ['1.0.0', '1.1.0', '1.2.0'][i % 3],
      rawContent: sample.rawContent,
      blockedAt: subDays(randomBetween(0, 29)),
    })
  }
  await BlockedMessage.insertMany(messages)
  console.log(`✉️  ${messages.length} blocked messages created`)

  console.log('\n✅ Seed completo!')
  console.log('──────────────────────────────')
  console.log('Login:  admin@optimusguard.com')
  console.log('Password: Admin@1234')
  console.log('──────────────────────────────')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
