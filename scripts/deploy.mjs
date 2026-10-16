// Yayına alma betiği (npm run deploy)
//
// Önemli: sitedeki "Yayına Al" düğmesi kartları doğrudan gh-pages dalındaki
// sites.json dosyasına yazar. Bu betik yeni sürüm yayınlarken önce yayındaki
// sites.json'u indirip korur; böylece yayınlanmış kartlar kaybolmaz.
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' })

// 1) Yayındaki kart listesini koru
let preserved = false
try {
  execSync('git fetch origin gh-pages', { cwd: root, stdio: 'ignore' })
  const live = execSync('git show origin/gh-pages:sites.json', {
    cwd: root,
    encoding: 'utf8',
  })
  const parsed = JSON.parse(live)
  if (Array.isArray(parsed.sites)) {
    writeFileSync(resolve(root, 'public/sites.json'), live)
    preserved = true
    console.log(`✓ Yayındaki sites.json korundu (${parsed.sites.length} kart)`)
  }
} catch {
  console.log('• Yayında sites.json bulunamadı, mevcut dosya kullanılacak')
}

// 2) Derle
run('npx vite build')

// 3) GitHub Pages'in Jekyll işlemesini kapat
writeFileSync(resolve(root, 'dist/.nojekyll'), '')

// 4) gh-pages dalına gönder
run('npx gh-pages -d dist -b gh-pages')

console.log('\n🚀 Yayınlandı: https://thykeumut.github.io/umut/')
if (preserved) {
  console.log('   (yayındaki kartlar korundu)')
}
