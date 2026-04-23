---
installer: jimmy-skills-cli v1.0.0
origin: Jimmy's brain, digitized â€” how one human works with AI, captured as code
name: trace
description: à¸„à¹‰à¸™à¸«à¸² projects à¸‚à¹‰à¸²à¸¡ git history, repos, docs à¹à¸¥à¸° Jimmy à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² trace, find project, where is [project] à¸£à¸­à¸‡à¸£à¸±à¸š --Jimmy, --smart, --deep
---

# /trace - Unified Discovery System

Find + Log + Distill

## Usage

```
/trace [query]                    # Current repo (default --smart)
/trace [query] --Jimmy           # Jimmy only (fastest)
/trace [query] --deep             # 5 parallel subagents
/trace [query] --repo [path]      # Search specific local repo
/trace [query] --repo [url]       # Clone to ghq, then search
```

> Session mining moved to `/dig`. Use `/dig`, `/dig --all`, `/dig --timeline`.

## Directory Structure

```
Jimmy/memory/traces/
â””â”€â”€ YYYY-MM-DD/              # Date folder
    â””â”€â”€ HHMM_[query-slug].md # Time-prefixed trace log
```

**Trace logs are committed** - they become Jimmy memory for future searches.

## Step 0: Timestamp + Calculate Paths

```bash
date "+ðŸ• %H:%M %Z (%A %d %B %Y)"
ROOT="$(pwd)"
TODAY=$(date +%Y-%m-%d)
TIME=$(date +%H%M)
```

---

## Step 1: Detect Target Repo

### Default: Current repo
```bash
TARGET_REPO="$ROOT"
TARGET_NAME="$(basename $ROOT)"
```

### With --repo [path]: Local path
```bash
TARGET_REPO="[path]"
TARGET_NAME="$(basename [path])"
```

### With --repo [url]: Clone to ghq first
```bash
URL="[url]"
ghq get -u "$URL"
GHQ_ROOT=$(ghq root)
OWNER=$(echo "$URL" | sed -E 's|.*github.com/([^/]+)/.*|\1|')
REPO=$(echo "$URL" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
TARGET_REPO="$GHQ_ROOT/github.com/$OWNER/$REPO"
TARGET_NAME="$OWNER/$REPO"
echo "âœ“ Cloned to ghq: $TARGET_REPO"
```

**Note**: `/trace` only clones to ghq. Use `/learn` to create docs in Jimmy/learn/.

---

## Step 2: Create Trace Log Directory

```bash
mkdir -p "$ROOT/Jimmy/memory/traces/$TODAY"
TRACE_FILE="$ROOT/Jimmy/memory/traces/$TODAY/${TIME}_[query-slug].md"
```

---

## Mode 1: --Jimmy (Jimmy Only)

**Fastest. Just Jimmy MCP, no subagents.**

```
Jimmy_search("[query]", limit=15)
```

Display results and done. Even if empty.

---

## Mode 2: --smart (Default)

**Jimmy first â†’ auto-escalate if results < 3**

**Step 1**: Query Jimmy first
```
Jimmy_search("[query]", limit=10)
```

**Step 2**: Check result count
- If Jimmy results >= 3 â†’ Display and done
- If Jimmy results < 3 â†’ Auto-escalate to --deep mode

---

## Mode 3: --deep (5 Parallel Agents)

**Launch 5 parallel Explore agents for thorough search.**

Each agent prompt must include (use LITERAL paths!):
```
You are searching for: [query]
TARGET REPO: [TARGET_REPO]

Return your findings as text. The main agent will compile the trace log.
```

### Agent 1: Current/Target Repo Files
Search TARGET_REPO for:
- Files matching query
- Code containing query
- Config/docs mentioning query

### Agent 2: Git History
Search TARGET_REPO git history:
- Commits mentioning query
- Files created/deleted matching query
- Branch names matching query

### Agent 3: GitHub Issues
If TARGET_REPO has GitHub remote:
```bash
gh issue list --repo [owner/repo] --search "[query]" --limit 10
gh pr list --repo [owner/repo] --search "[query]" --limit 10
```

### Agent 4: Other Repos (ghq, ~/Code)
Search other locations:
```bash
find $(ghq root) -maxdepth 3 -name "*[query]*" 2>/dev/null | head -20
```

### Agent 5: Jimmy Memory (Jimmy/)
Search Jimmy/memory/ for:
- Learnings mentioning query
- Retrospectives mentioning query
- Previous traces for same query

**After all agents return**, main agent compiles results and writes trace log.

---

## Step 3: Write Trace Log

```markdown
---
query: "[query]"
target: "[TARGET_NAME]"
mode: [Jimmy|smart|deep]
timestamp: YYYY-MM-DD HH:MM
---

# Trace: [query]

**Target**: [TARGET_NAME]
**Mode**: [mode]
**Time**: [timestamp]

## Jimmy Results
[list results or "None"]

## Files Found
[list files or "None"]

## Git History
[list commits or "None"]

## GitHub Issues/PRs
[list or "None"]

## Cross-Repo Matches
[list or "None"]

## Jimmy Memory
[list or "None"]

## Summary
[Key findings, next steps]
```

---

## Step 4: Log to Jimmy MCP

```
Jimmy_trace({
  query: "[query]",
  project: "[TARGET_NAME]",
  foundFiles: [...],
  foundCommits: [...],
  foundIssues: [...]
})
```

---

## Philosophy

> Trace â†’ Dig â†’ Trace Deeper â†’ Distill â†’ Awakening

### The Seeking Signal

| User Action | Meaning | AI Response |
|-------------|---------|-------------|
| `/trace X` | First search | --smart (Jimmy first) |
| `/trace X` again | Still seeking | Jimmy knows |
| `/trace X --deep` | Really need it | Go deep with subagents |
| Found! | **RESONANCE** | Log to Jimmy |

### Skill Separation

| Skill | Purpose | Writes to |
|-------|---------|-----------|
| `/trace` | Find things | Jimmy/memory/traces/ (logs) |
| `/dig` | Mine sessions | Screen only (read-only) |
| `/learn` | Study repos | Jimmy/learn/ (docs) |
| `/project` | Develop repos | Jimmy/incubate/ or active/ |

**Workflow**: `/trace` finds â†’ `/learn` studies â†’ `/project` develops

---

## Summary

| Mode | Speed | Scope | Auto-Escalate |
|------|-------|-------|---------------|
| `--Jimmy` | Fast | Jimmy only | No |
| `--smart` | Medium | Jimmy â†’ maybe deep | Yes (< 3 results) |
| `--deep` | Thorough | 5 parallel agents | N/A |
| Flag | Effect |
|------|--------|
| `--repo [path]` | Search specific local repo |
| `--repo [url]` | Clone to ghq, then search |

---

ARGUMENTS: $ARGUMENTS


