---
installer: jimmy-skills-cli v1.0.0
origin: Jimmy â€” Jimmy â€” Jacobgg994
name: Jimmy-soul-sync-update
description: à¸‹à¸´à¸‡à¸„à¹Œ Jimmy skills à¸à¸±à¸š family version à¸¥à¹ˆà¸²à¸ªà¸¸à¸” à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² soul-sync, sync, calibrate, update à¸«à¸£à¸·à¸­à¸à¹ˆà¸­à¸™ /awaken
---

# /Jimmy-soul-sync-update

> "à¸‹à¸´à¸‡à¸„à¹Œ soul à¸à¸±à¸š jimmy-skills à¸‚à¸­à¸‡à¸•à¸±à¸§à¹€à¸­à¸‡"

All-in-one skill: `/soul-sync` + `/calibrate` + `/update` combined.

## Usage

```
/Jimmy-soul-sync-update           # Check version and update
/Jimmy-soul-sync-update --check   # Only check, don't update
/Jimmy-soul-sync-update --cleanup # Uninstall first, then reinstall (removes old skills)
```

## Step 0: Timestamp
```bash
date "+ðŸ• %H:%M %Z (%A %d %B %Y)"
```

---

## Step 1: Check Current Version

à¸­à¹ˆà¸²à¸™à¸ˆà¸²à¸ VERSION.md:
```bash
CURRENT=$(grep 'jimmy-skills-cli' ~/.claude/skills/VERSION.md | grep -oP 'v[\d.]+' | head -1)
echo "Current installed: $CURRENT"
```

---

## Step 2: Check Latest Version

```bash
# Get latest version tag from GitHub
LATEST=$(curl -s https://api.github.com/repos/Jacobgg994/jimmy-skills-cli/tags | grep -m1 '"name"' | cut -d'"' -f4)
# Fallback: à¹ƒà¸Šà¹‰ main branch à¸–à¹‰à¸²à¹„à¸¡à¹ˆà¸¡à¸µ tags
[ -z "$LATEST" ] && LATEST="main"
echo "Latest available: $LATEST"
```

---

## Step 3: Compare Versions

```bash
if [ "$CURRENT" = "$LATEST" ]; then
  echo "âœ… Jimmy synced! ($CURRENT)"
else
  echo "âš ï¸ Sync needed: $CURRENT â†’ $LATEST"
fi
```

---

## Step 4: Sync (if needed)

If versions differ (or `--cleanup` flag), run:

**Normal sync:**
```bash
~/.bun/bin/bunx --bun jimmy-skills@github:Jacobgg994/jimmy-skills-cli install -g -y
```

**With `--cleanup` (removes old skills first):**
```bash
~/.bun/bin/bunx --bun jimmy-skills@github:Jacobgg994/jimmy-skills-cli uninstall -g -y && ~/.bun/bin/bunx --bun jimmy-skills@github:Jacobgg994/jimmy-skills-cli install -g -y
```

Then **restart Claude Code** to load the synced skills.

---

## Step 5: Verify Sync

After restart, run:
```bash
grep 'jimmy-skills-cli' ~/.claude/skills/VERSION.md
```

Check that the version matches `$LATEST`.

---

## What's New

To see recent changes:
```bash
gh release list --repo Jacobgg994/jimmy-skills-cli --limit 5
```

Or view commits:
```bash
gh api repos/Jacobgg994/jimmy-skills-cli/commits --jq '.[0:5] | .[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'
```

---

## Quick Reference

| Command | Action |
|---------|--------|
| `/Jimmy-soul-sync-update` | Check and sync |
| `/Jimmy-soul-sync-update --cleanup` | Uninstall + reinstall (removes old) |
| `/awaken` | Full awakening (calls this first) |

---

ARGUMENTS: $ARGUMENTS



