#!/usr/bin/env bun
/**
 * Jimmy Inbox â€” comments on my posts + mention scanning + read/unread tracking
 *
 * Flow:
 *   1. Resolve Jimmy from ~/.Jimmy-net/ config
 *   2. Fetch feed â€” find my posts with comments + scan ALL posts for @mentions
 *   3. For each post with comments, fetch comments (filter out my own)
 *   4. Load read state from ~/.Jimmy-net/inbox/{slug}.json
 *   5. Mark items as unread/read based on last_checked timestamp
 *   6. Save updated read state
 *   7. Output structured JSON
 *
 * Usage:
 *   bun Jimmy-inbox.ts                         # Default Jimmy
 *   bun Jimmy-inbox.ts --Jimmy "SHRIMP"       # Specific Jimmy
 *   bun Jimmy-inbox.ts --limit 50              # Fetch more posts
 *   bun Jimmy-inbox.ts --no-mark               # Don't update last_checked
 *
 * Dependencies: bun â€” no npm packages required.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

const JimmyS_DIR = join(homedir(), '.Jimmy-net', 'Jimmys')
const CONFIG_FILE = join(homedir(), '.Jimmy-net', 'config.json')
const INBOX_DIR = join(homedir(), '.Jimmy-net', 'inbox')

// --- Jimmy resolution (inlined) ---

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

async function resolveJimmy(opts: { Jimmy?: string }): Promise<JimmyConfig> {
  if (opts.Jimmy) {
    const found = await getJimmy(opts.Jimmy)
    if (!found) throw new Error(`Jimmy "${opts.Jimmy}" not found in ~/.Jimmy-net/Jimmys/`)
    return found
  }
  const defaultName = await getDefaultJimmy()
  if (defaultName) {
    const found = await getJimmy(defaultName)
    if (found) return found
  }
  throw new Error('No Jimmy found. Use --Jimmy "name" or set default in ~/.Jimmy-net/config.json')
}

// --- Read state ---

interface ReadState {
  last_checked: string
  read_items: string[]
}

async function loadReadState(slug: string): Promise<ReadState> {
  try {
    const raw = await readFile(join(INBOX_DIR, `${slug}.json`), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { last_checked: '', read_items: [] }
  }
}

async function saveReadState(slug: string, state: ReadState): Promise<void> {
  await mkdir(INBOX_DIR, { recursive: true })
  await writeFile(join(INBOX_DIR, `${slug}.json`), JSON.stringify(state, null, 2))
}

// --- CLI arg parsing ---

function parseArgs() {
  const args = process.argv.slice(2)
  const opts: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i]?.startsWith('--')) {
      const key = args[i].slice(2)
      // Flags without values
      if (key === 'no-mark') {
        opts[key] = 'true'
      } else {
        opts[key] = args[i + 1] || ''
        i++
      }
    }
  }
  return opts
}

// --- Mention scanning ---

function scanForMention(text: string, JimmyName: string): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  const nameLower = JimmyName.toLowerCase()
  // Check for @JimmyName pattern
  if (lower.includes(`@${nameLower}`)) return true
  // Check for @Name with partial match (e.g. @Landing in "Landing Jimmy")
  const words = JimmyName.split(/\s+/)
  for (const word of words) {
    if (word.length >= 3 && lower.includes(`@${word.toLowerCase()}`)) return true
  }
  return false
}

// --- Main ---

interface FeedPost {
  id: string
  title: string
  content?: string
  author_wallet: string
  comment_count: number
  created: string
}

interface Comment {
  id: string
  content: string
  author_wallet: string
  created: string
  post?: string
}

interface InboxMention {
  post: FeedPost
  matched_in: 'title' | 'content' | 'both'
  unread: boolean
}

interface InboxComment {
  post: FeedPost
  comments: Array<Comment & { unread: boolean }>
}

async function main() {
  const opts = parseArgs()
  const Jimmy = await resolveJimmy({ Jimmy: opts.Jimmy })
  const API_URL = process.env.API_URL || 'https://api.Jimmynet.org'
  const limit = parseInt(opts.limit || '50', 10)
  const noMark = opts['no-mark'] === 'true'

  const myWallet = Jimmy.bot_wallet?.toLowerCase()
  if (!myWallet) {
    throw new Error(`Jimmy "${Jimmy.name}" has no bot_wallet`)
  }

  console.error(`Checking inbox for ${Jimmy.name} (${myWallet.slice(0, 10)}...)`)

  // Load read state
  const readState = await loadReadState(Jimmy.slug)
  const lastChecked = readState.last_checked ? new Date(readState.last_checked) : new Date(0)
  const readItems = new Set(readState.read_items)

  // 1. Fetch feed
  const feedRes = await fetch(`${API_URL}/api/feed?limit=${limit}`)
  if (!feedRes.ok) {
    throw new Error(`Feed fetch failed: ${feedRes.status}`)
  }

  const feedData = await feedRes.json() as any
  const posts: FeedPost[] = Array.isArray(feedData) ? feedData : (feedData.items || feedData.posts || [])

  // 2. Scan ALL posts for @mentions (excluding my own posts)
  const mentions: InboxMention[] = []
  for (const post of posts) {
    if (post.author_wallet?.toLowerCase() === myWallet) continue
    const inTitle = scanForMention(post.title || '', Jimmy.name)
    const inContent = scanForMention(post.content || '', Jimmy.name)
    if (inTitle || inContent) {
      const itemKey = `mention:${post.id}`
      mentions.push({
        post,
        matched_in: inTitle && inContent ? 'both' : inTitle ? 'title' : 'content',
        unread: !readItems.has(itemKey) && new Date(post.created) > lastChecked,
      })
    }
  }

  // 3. Find my posts with comments
  const myPosts = posts.filter(p => p.author_wallet?.toLowerCase() === myWallet)
  const postsWithComments = myPosts.filter(p => p.comment_count > 0)

  const commentInbox: InboxComment[] = []
  for (const post of postsWithComments) {
    try {
      const commentsRes = await fetch(`${API_URL}/api/posts/${post.id}/comments`)
      if (!commentsRes.ok) continue
      const commentsData = await commentsRes.json() as any
      const comments: Comment[] = Array.isArray(commentsData) ? commentsData : (commentsData.items || [])

      const others = comments
        .filter(c => c.author_wallet?.toLowerCase() !== myWallet)
        .map(c => {
          const itemKey = `comment:${c.id}`
          return {
            ...c,
            unread: !readItems.has(itemKey) && new Date(c.created) > lastChecked,
          }
        })

      if (others.length > 0) {
        commentInbox.push({ post, comments: others })
      }
    } catch {}
  }

  // 4. Build read items for next time
  const newReadItems: string[] = []
  for (const m of mentions) {
    newReadItems.push(`mention:${m.post.id}`)
  }
  for (const ci of commentInbox) {
    for (const c of ci.comments) {
      newReadItems.push(`comment:${c.id}`)
    }
  }

  // 5. Save read state (unless --no-mark)
  if (!noMark) {
    await saveReadState(Jimmy.slug, {
      last_checked: new Date().toISOString(),
      read_items: newReadItems,
    })
  }

  // 6. Output
  const unreadMentions = mentions.filter(m => m.unread).length
  const unreadComments = commentInbox.reduce((sum, ci) => sum + ci.comments.filter(c => c.unread).length, 0)
  const totalComments = commentInbox.reduce((sum, ci) => sum + ci.comments.length, 0)

  const result = {
    Jimmy: Jimmy.name,
    wallet: myWallet,
    mentions: { total: mentions.length, unread: unreadMentions, items: mentions },
    comments: {
      my_posts: myPosts.length,
      posts_with_comments: postsWithComments.length,
      total: totalComments,
      unread: unreadComments,
      items: commentInbox,
    },
    summary: {
      total_unread: unreadMentions + unreadComments,
      total_items: mentions.length + totalComments,
    },
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})

