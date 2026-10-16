// Yönetici şifresini değiştirir:  npm run sifre -- "yeni-sifren"
//
// Şifreden PBKDF2-SHA256 özeti üretir, maskeler ve src/lib/config.js içine yazar.
// Maske anahtarı config.js'ten okunur, böylece ikisi asla ayrışmaz.
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = resolve(root, 'src/lib/config.js')

const password = process.argv[2]
if (!password) {
  console.error('Kullanım:  npm run sifre -- "yeni-sifren"')
  process.exit(1)
}
if (password.length < 6) {
  console.error('Şifre en az 6 karakter olmalı.')
  process.exit(1)
}

let text = readFileSync(configPath, 'utf8')

const maskMatch = text.match(/const MASK = \[([^\]]+)\]/)
if (!maskMatch) {
  console.error('config.js içinde MASK bulunamadı.')
  process.exit(1)
}
const MASK = maskMatch[1].split(',').map((n) => Number(n.trim()))

const roundsMatch = text.match(/rounds:\s*(\d+)/)
const rounds = roundsMatch ? Number(roundsMatch[1]) : 210000

const salt = randomBytes(16)
const hashHex = pbkdf2Sync(password, salt, rounds, 32, 'sha256').toString('hex')

const source = Buffer.from(hashHex, 'utf8')
const masked = Buffer.alloc(source.length)
for (let i = 0; i < source.length; i++) {
  masked[i] = source[i] ^ MASK[i % MASK.length]
}

text = text
  .replace(/salt: '[0-9a-f]*'/, `salt: '${salt.toString('hex')}'`)
  .replace(/rounds:\s*\d+/, `rounds: ${rounds}`)
  .replace(/v: '[A-Za-z0-9+/=]*'/, `v: '${masked.toString('base64')}'`)

writeFileSync(configPath, text)

console.log('✓ Yönetici şifresi güncellendi.')
console.log('  (tuz + özet yeniden üretildi, şifre kodda saklanmıyor)')
console.log('\nSitede geçerli olması için:  npm run deploy')
