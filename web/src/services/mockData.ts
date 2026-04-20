import { subDays, format } from 'date-fns'
import type {
  PhishingPattern, BlockedMessage, Device,
  OverviewStats, BlocksPerDay, BlocksByPlatform, TopPattern
} from '../types'

export const mockStats: OverviewStats = {
  totalBlocked: 54_873,
  activeDevices: 1_204,
  activePatterns: 103,
  blockedLast24h: 487,
}

export const mockBlocksPerDay: BlocksPerDay[] = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
  count: Math.floor(Math.random() * 500) + 50,
}))

export const mockBlocksByPlatform: BlocksByPlatform[] = [
  { platform: 'android', count: 31_204 },
  { platform: 'ios', count: 17_087 },
]

export const mockTopPatterns: TopPattern[] = [
  { patternId: '1',  patternText: 'clique aqui para ganhar',       severity: 'high',   count: 4_231, lastMatched: new Date().toISOString() },
  { patternId: '2',  patternText: 'bit.ly/',                       severity: 'high',   count: 3_108, lastMatched: new Date().toISOString() },
  { patternId: '3',  patternText: 'confirme seus dados',           severity: 'medium', count: 2_440, lastMatched: new Date().toISOString() },
  { patternId: '11', patternText: 'conta bancária foi bloqueada',  severity: 'high',   count: 2_190, lastMatched: new Date().toISOString() },
  { patternId: '12', patternText: 'apostas grátis',                severity: 'high',   count: 1_874, lastMatched: new Date().toISOString() },
  { patternId: '4',  patternText: 'promoção exclusiva',            severity: 'low',    count: 1_890, lastMatched: new Date().toISOString() },
  { patternId: '13', patternText: 'rb.gy/',                        severity: 'high',   count: 1_540, lastMatched: new Date().toISOString() },
  { patternId: '5',  patternText: 'senha expirada',                severity: 'medium', count: 1_312, lastMatched: new Date().toISOString() },
  { patternId: '14', patternText: 'chat.whatsapp.com/',            severity: 'medium', count:   980, lastMatched: new Date().toISOString() },
  { patternId: '15', patternText: 'abre.ai/',                      severity: 'high',   count:   812, lastMatched: new Date().toISOString() },
]

export const mockPatterns: PhishingPattern[] = [
  // Existentes
  { id: '1',  pattern: 'clique aqui para ganhar',                    type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 4231, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: '2',  pattern: 'bit.ly/',                                    type: 'url',     language: 'both', severity: 'high',   status: 'active',   matchCount: 3108, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-16T00:00:00Z' },
  { id: '3',  pattern: 'confirme seus dados',                        type: 'keyword', language: 'pt',   severity: 'medium', status: 'active',   matchCount: 2440, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-17T00:00:00Z' },
  { id: '4',  pattern: 'promoção exclusiva',                         type: 'keyword', language: 'pt',   severity: 'low',    status: 'active',   matchCount: 1890, createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-01-18T00:00:00Z' },
  { id: '5',  pattern: 'senha expirada',                             type: 'keyword', language: 'pt',   severity: 'medium', status: 'active',   matchCount: 1312, createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-19T00:00:00Z' },
  { id: '6',  pattern: 'click here to win',                          type: 'keyword', language: 'en',   severity: 'high',   status: 'active',   matchCount:  892, createdAt: '2024-01-06T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: '7',  pattern: 'tinyurl.com',                                type: 'url',     language: 'both', severity: 'medium', status: 'active',   matchCount:  567, createdAt: '2024-01-07T00:00:00Z', updatedAt: '2024-01-21T00:00:00Z' },
  { id: '8',  pattern: 'verify your account',                        type: 'keyword', language: 'en',   severity: 'high',   status: 'inactive', matchCount:  345, createdAt: '2024-01-08T00:00:00Z', updatedAt: '2024-01-22T00:00:00Z' },
  { id: '9',  pattern: '(\\d{3}-\\d{4}-\\d{4})',                    type: 'regex',   language: 'both', severity: 'low',    status: 'active',   matchCount:  234, createdAt: '2024-01-09T00:00:00Z', updatedAt: '2024-01-23T00:00:00Z' },
  { id: '10', pattern: 'você foi selecionado',                       type: 'keyword', language: 'pt',   severity: 'medium', status: 'active',   matchCount:  189, createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-24T00:00:00Z' },
  // Golpes bancários
  { id: '11', pattern: 'conta bancária foi bloqueada',               type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 2190, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '12', pattern: 'transferência pendente',                     type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 1650, createdAt: '2024-02-02T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '13', pattern: 'acesso suspeito',                            type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 1420, createdAt: '2024-02-03T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '14', pattern: 'desbloqueie sua conta',                      type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount:  980, createdAt: '2024-02-04T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  // URLs encurtadas adicionais
  { id: '15', pattern: 'rb.gy/',                                     type: 'url',     language: 'both', severity: 'high',   status: 'active',   matchCount: 1540, createdAt: '2024-02-05T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '16', pattern: 'abre.ai/',                                   type: 'url',     language: 'both', severity: 'high',   status: 'active',   matchCount:  812, createdAt: '2024-02-06T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  // Apostas / jogos de azar
  { id: '17', pattern: 'apostas grátis',                             type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 1874, createdAt: '2024-02-07T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '18', pattern: 'gira grátis',                                type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount:  730, createdAt: '2024-02-08T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '19', pattern: 'roleta',                                     type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount:  605, createdAt: '2024-02-09T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '20', pattern: 'bónus',                                      type: 'keyword', language: 'pt',   severity: 'medium', status: 'active',   matchCount:  490, createdAt: '2024-02-10T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  // Esquemas de grupo / pirâmide WhatsApp
  { id: '21', pattern: 'chat.whatsapp.com/',                         type: 'url',     language: 'both', severity: 'medium', status: 'active',   matchCount:  980, createdAt: '2024-02-11T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '22', pattern: 'fazer dinheiro na Internet',                 type: 'keyword', language: 'pt',   severity: 'medium', status: 'active',   matchCount:  420, createdAt: '2024-02-12T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '23', pattern: 'comunidade.*fazer dinheiro',                 type: 'regex',   language: 'pt',   severity: 'medium', status: 'active',   matchCount:  310, createdAt: '2024-02-13T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  // Prémios / resgates
  { id: '24', pattern: 'você ganhou',                                type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 1760, createdAt: '2024-02-14T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: '25', pattern: 'clique aqui para resgatar',                  type: 'keyword', language: 'pt',   severity: 'high',   status: 'active',   matchCount: 1230, createdAt: '2024-02-15T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
]

const sampleMessages = [
  { patternId: '24', patternText: 'você ganhou',               severity: 'high'   as const, rawContent: 'Parabéns! Você ganhou R$500. Clique aqui para resgatar: bit.ly/premio123' },
  { patternId: '11', patternText: 'conta bancária foi bloqueada', severity: 'high' as const, rawContent: 'URGENTE: Sua conta bancária foi bloqueada. Confirme seus dados agora: bit.ly/banco-verify' },
  { patternId: '12', patternText: 'transferência pendente',    severity: 'high'   as const, rawContent: 'Você tem uma transferência pendente. Confirme seus dados em: rb.gy/seguro' },
  { patternId: '13', patternText: 'acesso suspeito',           severity: 'high'   as const, rawContent: 'Seu banco detectou acesso suspeito. Desbloqueie sua conta: tinyurl.com/acesso123' },
  { patternId: '17', patternText: 'apostas grátis',            severity: 'high'   as const, rawContent: 'Nova plataforma no ar! Receba 25 apostas grátis + 1.000 MT só por criar conta. Regista-te já: abre.ai/oLye' },
  { patternId: '18', patternText: 'gira grátis',               severity: 'high'   as const, rawContent: '😳 Eu não acreditei… Mas tá pagando mesmo! Gira grátis e pode sair 10.000MT 👇 https://roleta-olabet.vercel.app/' },
  { patternId: '21', patternText: 'chat.whatsapp.com/',        severity: 'medium' as const, rawContent: 'SAUDAÇÕES CARÍSSIMO! Convite para a comunidade juvenil mais experiente em fazer dinheiro na Internet: chat.whatsapp.com/LLxRE9sl5C247Mp5MXAOHU' },
  { patternId: '25', patternText: 'clique aqui para resgatar', severity: 'high'   as const, rawContent: 'Você tem um prémio de 5.000 MT. Clique aqui para resgatar: abre.ai/xYz9' },
  { patternId: '3',  patternText: 'confirme seus dados',       severity: 'medium' as const, rawContent: 'Atenção! Confirme seus dados para evitar o bloqueio da conta: bit.ly/confirmar' },
  { patternId: '10', patternText: 'você foi selecionado',      severity: 'medium' as const, rawContent: 'Parabéns! Você foi selecionado para receber um prémio. Clique aqui para ganhar agora!' },
  { patternId: '16', patternText: 'rb.gy/',                    severity: 'high'   as const, rawContent: 'Transferência de 2.500 MT aguarda confirmação. Acesse agora: rb.gy/confirmar' },
  { patternId: '20', patternText: 'bónus',                     severity: 'medium' as const, rawContent: 'Bónus exclusivo! Depósito mínimo e ganhe 200% de bónus. Regista-te: abre.ai/bonus2x' },
]

export const mockMessages: BlockedMessage[] = Array.from({ length: 50 }, (_, i) => {
  const sample = sampleMessages[i % sampleMessages.length]
  return {
    id: String(i + 1),
    deviceId: `DEV-${String(1000 + Math.floor(Math.random() * 9000))}`,
    sender: ['+258 84 123 4567', '+258 82 987 6543', '+258 86 555 1234', 'INFO', 'BANCO', 'Ele Vive!'][i % 6],
    patternId: sample.patternId,
    patternText: sample.patternText,
    severity: sample.severity,
    platform: i % 2 === 0 ? 'android' : 'ios',
    appVersion: ['1.0.0', '1.1.0', '1.2.0'][i % 3],
    blockedAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
    rawContent: sample.rawContent,
  }
})

export const mockDevices: Device[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  deviceId: `DEV-${String(1000 + i)}`,
  platform: i % 2 === 0 ? 'android' : 'ios',
  appVersion: ['1.0.0', '1.1.0', '1.2.0'][i % 3],
  totalBlocked: Math.floor(Math.random() * 500),
  lastActive: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
  status: i % 7 === 0 ? 'expired' : 'active',
}))
