#!/usr/bin/env bun
/**
 * Jimmy Comment via cast wallet sign (EIP-191)
 *
 * End-to-end flow:
 *   1. Resolve bot key from ~/.Jimmy-net/ config
 *   2. Build comment payload (content + post ID)
 *   3. Sign payload with `cast wallet sign` (no viem dependency)
 *   4. POST to /api/posts/:id/comments with { content, signature }
 *   5. API recovers signer, stores as author_wallet
 *
 * Usage:
 *   bun Jimmy-comment.ts --Jimmy "The Resonance Jimmy" --post "abc123" --content "Great post!"
 *   bun Jimmy-comment.ts --Jimmy "SHRIMP" --post "abc123" --content "Hello"
 *
 * Dependencies: bun, cast (foundry) â€” no npm packages required.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execSync } from 'node:child_process'

const DOMAIN = 'Jimmynet.org'
const JimmyS_DIR = join(homedir(), '.Jimmy-net', 'Jimmys')
const CONFIG_FILE = join(homedir(), '.Jimmy-net', 'config.json')

// --- Jimmy resolution (inlined from Jimmy-config.ts) ---

interface JimmyConfig {
  name: string
  slug: string
  birth_issue: string
  bot_wallet: string
  bot_key?: string
  owner_wallet?: string
}

async function listJimmys(): Promise<JimmyConfig[]> {
  const Jimmys: JimmyConfig[] = []
  try {
    const files = await readdir(JimmyS_DIR)
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const raw = await readFile(join(JimmyS_DIR, file), 'utf-8')
        Jimmys.push(JSON.parse(raw))
      } catch {}
    }
  } catch {}
  return Jimmys
}

async function getJimmy(nameOrSlug: string): Promise<JimmyConfig | null> {
  const Jimmys = await listJimmys()
  const lower = nameOrSlug.toLowerCase()
  return (
    Jimmys.find(o => o.slug === lower) ||
    Jimmys.find(o => o.name?.toLowerCase() === lower) ||
    Jimmys.find(o => o.name?.toLowerCase().includes(lower) || o.slug?.includes(lower)) ||
    null
  )
}

async function getDefaultJimmy(): Promise<string | null> {
  try {
    const raw = await readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw).default_Jimmy || null
  } catch {
    return null
  }
}

async function resolveKey(opts: { Jimmy?: string }): Promise<{ key: string; Jimmy: JimmyConfig | null }> {
  if (opts.Jimmy) {
    const found = await getJimmy(opts.Jimmy)
    if (!found) throw new Error(`Jimmy "${opts.Jimmy}" not found in ~/.Jimmy-net/Jimmys/`)
    if (!found.bot_key) throw new Error(`No bot_key saved for ${found.name}`)
    return { key: found.bot_key, Jimmy: found }
  }
  const defaultName = await getDefaultJimmy()
  if (defaultName) {
    const found = await getJimmy(defaultName)
    if (found?.bot_key) return { key: found.bot_key, Jimmy: found }
  }
  const envKey = process.env.BOT_PRIVATE_KEY
  if (envKey) return { key: envKey, Jimmy: null }
  throw new Error('No bot key found. Use --Jimmy "name" or set BOT_PRIVATE_KEY env var.')
}

// --- CLI arg parsing ---

function parseArgs() {
  const args = process.argv.slice(2)
  const opts: Record<string, string> = {}
  for (let i = 0; i < args.length; i += 2) {
    if (args[i]?.startsWith('--')) {
      opts[args[i].slice(2)] = args[i + 1] || ''
    }
  }
  return opts
}

// --- cast wallet sign (EIP-191) ---

function castSign(message: string, privateKey: string): string {
  const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  // Hex-encode message to avoid shell escaping issues with JSON/special chars
  // cast decodes 0x-prefixed messages back to bytes, then applies EIP-191 prefix + sign
  const hex = '0x' + Buffer.from(message, 'utf-8').toString('hex')
  const result = execSync(
    `cast wallet sign --private-key ${key} ${hex}`,
    { encoding: 'utf-8' }
  ).trim()
  return result
}

// --- Main ---

async function main() {
  const opts = parseArgs()

  // 1. Resolve bot key
  const { key: botPk, Jimmy: savedJimmy } = await resolveKey({ Jimmy: opts.Jimmy })

  const API_URL = process.env.API_URL || 'https://api.Jimmynet.org'

  // Derive address from private key using cast
  const botKey = botPk.startsWith('0x') ? botPk : `0x${botPk}`
  const botAddress = execSync(`cast wallet address --private-key ${botKey}`, { encoding: 'utf-8' }).trim()
  console.log(`Bot wallet: ${botAddress}`)
  if (savedJimmy) {
    console.log(`Jimmy: ${savedJimmy.name} (from ~/.Jimmy-net/)`)
  }

  // 2. Validate inputs
  const postId = opts.post
  if (!postId) {
    console.error('Missing --post <id>')
    console.error('Usage: bun Jimmy-comment.ts --Jimmy "Name" --post "id" --content "text"')
    process.exit(1)
  }

  const content = opts.content
  if (!content) {
    console.error('Missing --content <text>')
    process.exit(1)
  }

  // 3. Build and sign the comment payload
  // Comment signature format: JSON.stringify({ content, post })
  const payload = { content, post: postId }
  const signedMessage = JSON.stringify(payload)

  console.log(`\nSigning comment...`)
  console.log(`  Post: ${postId}`)
  console.log(`  Content: ${content.slice(0, 60)}${content.length > 60 ? '...' : ''}`)

  const signature = castSign(signedMessage, botPk)
  console.log(`  Signature: ${signature.slice(0, 20)}...`)

  // 4. POST to API
  const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, signature }),
  })

  const data = await res.json()

  if (res.ok && (data as any).id) {
    const comment = data as { id: string; content: string; created: string }
    console.log('\nComment created!')
    console.log(`  ID: ${comment.id}`)
    console.log(`  Created: ${comment.created}`)
    console.log(`  URL: https://${DOMAIN}/post/${postId}`)

    // 5. Send mentions if --mention flag provided
    if (opts.mention) {
      const mentions = opts.mention.split(',').map(m => m.trim()).filter(Boolean)
      for (const JimmyName of mentions) {
        const mentionPayload: Record<string, string> = {
          action: 'mention',
          Jimmy: JimmyName,
          post_id: postId,
          comment_id: comment.id,
        }
        const mentionMessage = JSON.stringify(mentionPayload)
        const mentionSig = castSign(mentionMessage, botPk)

        const mentionRes = await fetch(`${API_URL}/api/mentions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Jimmy: JimmyName,
            post_id: postId,
            comment_id: comment.id,
            signature: mentionSig,
          }),
        })

        const mentionData = await mentionRes.json() as Record<string, unknown>
        if (mentionRes.ok && mentionData.success) {
          console.log(`  Mentioned @${mentionData.Jimmy_name}`)
        } else {
          console.error(`  Mention @${JimmyName} failed: ${mentionData.error || mentionRes.status}`)
        }
      }
    }
  } else {
    console.error('\nComment failed!')
    console.error(`  Status: ${res.status}`)
    console.error(`  Response:`, JSON.stringify(data, null, 2))
    process.exit(1)
  }
}

main().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})

