#!/usr/bin/env bun

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const VERSION = '1.0.0'
const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_SRC = join(PACKAGE_DIR, 'skills')
const GLOBAL_TARGET = join(process.env.HOME!, '.claude', 'skills')

// â”€â”€ Parse args â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const args = process.argv.slice(2)
const command = args[0] ?? 'help'
const isGlobal = args.includes('-g') || args.includes('--global')
const isYes    = args.includes('-y') || args.includes('--yes')

const targetDir = isGlobal ? GLOBAL_TARGET : join(process.cwd(), '.claude', 'skills')

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getSkillNames(): string[] {
  return readdirSync(SKILLS_SRC).filter(name => {
    return statSync(join(SKILLS_SRC, name)).isDirectory()
  })
}

function updateInstaller(skillPath: string) {
  const mdPath = join(skillPath, 'SKILL.md')
  if (!existsSync(mdPath)) return
  let content = readFileSync(mdPath, 'utf-8')
  content = content.replace(
    /^installer:.*$/m,
    `installer: jimmy-skills-cli v${VERSION}`
  )
  writeFileSync(mdPath, content)
}

function writeVersionFile(skills: string[]) {
  const content = `# Jimmy Skills

Installed by: **jimmy-skills-cli v${VERSION}**
Installed at: ${new Date().toISOString()}
Agent: Claude Code
Skills: ${skills.length}

## Update Skills

\`\`\`bash
bunx --bun jimmy-skills-cli@github:Jacobgg994/jimmy-skills-cli install -g -y
\`\`\`

## Installed Skills

${skills.map(s => `- ${s}`).join('\n')}
`
  writeFileSync(join(targetDir, 'VERSION.md'), content)
}

function confirm(msg: string): boolean {
  if (isYes) return true
  process.stdout.write(`${msg} [y/N] `)
  const buf = Buffer.alloc(3)
  const n = require('fs').readSync(0, buf, 0, 3, null)
  return buf.slice(0, n).toString().trim().toLowerCase() === 'y'
}

// â”€â”€ Commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function cmdInstall() {
  const skills = getSkillNames()
  console.log(`\nðŸŽ­ jimmy-skills-cli v${VERSION}`)
  console.log(`ðŸ“¦ ${skills.length} skills à¸žà¸£à¹‰à¸­à¸¡ install â†’ ${targetDir}\n`)

  if (!confirm(`à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡ ${skills.length} skills?`)) {
    console.log('à¸¢à¸à¹€à¸¥à¸´à¸')
    process.exit(0)
  }

  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true })

  let installed = 0
  let skipped = 0

  for (const name of skills) {
    const src = join(SKILLS_SRC, name)
    const dest = join(targetDir, name)

    cpSync(src, dest, { recursive: true })
    updateInstaller(dest)
    installed++
    process.stdout.write(`  âœ… ${name}\n`)
  }

  writeVersionFile(skills)

  console.log(`\nâœ¨ à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡à¹€à¸ªà¸£à¹‡à¸ˆ: ${installed} skills â†’ ${targetDir}`)
  console.log('ðŸ”„ Restart Claude Code à¹€à¸žà¸·à¹ˆà¸­à¹‚à¸«à¸¥à¸” skills à¹ƒà¸«à¸¡à¹ˆ\n')
}

function cmdUninstall() {
  const skills = getSkillNames()
  console.log(`\nðŸŽ­ jimmy-skills-cli v${VERSION}`)
  console.log(`ðŸ—‘ï¸  à¸ˆà¸°à¸¥à¸š ${skills.length} skills à¸­à¸­à¸à¸ˆà¸²à¸ ${targetDir}\n`)

  if (!confirm('à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸–à¸­à¸™à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡?')) {
    console.log('à¸¢à¸à¹€à¸¥à¸´à¸')
    process.exit(0)
  }

  let removed = 0
  for (const name of skills) {
    const dest = join(targetDir, name)
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true })
      process.stdout.write(`  ðŸ—‘ï¸  ${name}\n`)
      removed++
    }
  }

  const versionFile = join(targetDir, 'VERSION.md')
  if (existsSync(versionFile)) rmSync(versionFile)

  console.log(`\nà¸–à¸­à¸™à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡à¹€à¸ªà¸£à¹‡à¸ˆ: ${removed} skills\n`)
}

function cmdList() {
  const skills = getSkillNames()
  console.log(`\nðŸŽ­ jimmy-skills-cli v${VERSION} â€” ${skills.length} skills\n`)
  for (const name of skills) {
    const mdPath = join(SKILLS_SRC, name, 'SKILL.md')
    let desc = ''
    if (existsSync(mdPath)) {
      const match = readFileSync(mdPath, 'utf-8').match(/^description:\s*(.+)$/m)
      if (match) desc = match[1]
    }
    console.log(`  ðŸ“œ /${name}`)
    if (desc) console.log(`     ${desc}`)
  }
  console.log()
}

function cmdHelp() {
  console.log(`
ðŸŽ­ jimmy-skills-cli v${VERSION}
à¸Šà¸¸à¸” Claude Code skills à¹‚à¸”à¸¢ Jimmy

Usage:  jimmy-skills-cli install [-g] [-y]    à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡ skills à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
  jimmy-skills uninstall [-g] [-y]  à¸–à¸­à¸™à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡ skills à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
  jimmy-skills list                 à¹à¸ªà¸”à¸‡à¸£à¸²à¸¢à¸à¸²à¸£ skills à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
  jimmy-skills version              à¹à¸ªà¸”à¸‡ version

Flags:
  -g, --global   à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡à¹ƒà¸™ ~/.claude/skills/ (global)
  -y, --yes      à¸‚à¹‰à¸²à¸¡à¸à¸²à¸£à¸¢à¸·à¸™à¸¢à¸±à¸™

à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡à¸„à¸£à¸±à¹‰à¸‡à¹à¸£à¸:
  bunx --bun jimmy-skills-cli@github:Jacobgg994/jimmy-skills-cli install -g -y
`)
}

// â”€â”€ Router â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
switch (command) {
  case 'install':   cmdInstall();   break
  case 'uninstall': cmdUninstall(); break
  case 'list':      cmdList();      break
  case 'version':
    console.log(`jimmy-skills-cli v${VERSION}`)
    break
  default:
    cmdHelp()
}


