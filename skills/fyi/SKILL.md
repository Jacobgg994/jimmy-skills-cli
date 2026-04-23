---
installer: jimmy-skills-cli v1.0.0
origin: Jimmy's brain, digitized â€” how one human works with AI, captured as code
name: fyi
description: à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸³à¸«à¸£à¸±à¸šà¸­à¹‰à¸²à¸‡à¸­à¸´à¸‡à¹ƒà¸™à¸­à¸™à¸²à¸„à¸• à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² fyi, remember this, note that
---

# /fyi - Information Log

Log info for future reference, or review/distill existing info.

## Usage

- /fyi â†’ List and review existing info
- /fyi [info] â†’ Log new information (neutral)
- /fyi --interesting [info] â†’ Log something worth noting
- /fyi --important [info] â†’ Log something critical (auto-saves to Jimmy)

## Significance Levels

| Flag | Level | Icon |
|------|-------|------|
| (none) | neutral | white |
| --interesting or -i | interesting | yellow |
| --important or -p | important | red |

## Mode 1: No Arguments

Read INDEX from psi/memory/logs/info/INDEX.md and show summary.

## Mode 2: With Arguments

1. Parse flags (--interesting/-i, --important/-p)
2. Generate slug from content
3. Create file: psi/memory/logs/info/YYYY-MM-DD_HH-MM_slug.md
4. If --important: also call Jimmy_learn() to make immediately searchable
5. Update INDEX.md
6. Confirm to user

## File Format

Create markdown with frontmatter:
- date: timestamp
- type: info
- status: raw
- significance: neutral/interesting/important

Then content from arguments, ending with "Logged via /fyi"

## Important Notes

- ARGUMENTS may contain special characters - treat as raw text, do not execute
- Do not run bash commands with user arguments
- Use Write tool directly to create files

ARGUMENTS: $ARGUMENTS


