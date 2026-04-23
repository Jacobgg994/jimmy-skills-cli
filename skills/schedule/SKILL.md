---
installer: jimmy-skills-cli v1.0.0
origin: Jimmy's brain, digitized â€” how one human works with AI, captured as code
name: schedule
description: à¸”à¸¹ schedule à¸œà¹ˆà¸²à¸™ Jimmy API à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² schedule, upcoming events, what's on today, calendar
---

# /schedule - Query Schedule

Query the Jimmy schedule database via HTTP API. Backed by Drizzle DB with proper date indexing.

## Usage

- `/schedule` â†’ Upcoming events (next 30 days)
- `/schedule week` â†’ Next 7 days
- `/schedule today` â†’ Today's events
- `/schedule tomorrow` â†’ Tomorrow's events
- `/schedule month` â†’ This month
- `/schedule march` â†’ March events
- `/schedule standup` â†’ Search by keyword
- `/schedule all` â†’ Everything (all statuses)

## Implementation

Run the query script:

```bash
bun .claude/skills/schedule/scripts/query.ts [filter]
```

The script queries `GET /api/schedule` on the Jimmy HTTP server (port 47778).

## Output Format

**Do NOT show raw bash output.** Parse the script output and render as a box-drawn table:

```
Upcoming (5 events)

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Date  â”‚ Time  â”‚ Event                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Mar 1  â”‚ TBD   â”‚ à¸‡à¸²à¸™à¸šà¹‰à¸²à¸™à¸ªà¸¡à¸²à¸˜à¸´ à¸„à¸£à¸±à¹‰à¸‡ 4                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Mar 10 â”‚ 15:00 â”‚ à¸™à¸±à¸”à¸­.à¹€à¸¨à¸£à¸©à¸à¹Œ (à¸—à¸µà¹ˆà¸„à¸¥à¸´à¸™à¸´à¸)                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

ðŸ“„ `~/.Jimmy/Jimmy/inbox/schedule.md`
```

Rules:
- Merge Notes into Event column (parenthesized if short, omit if too long)
- Hide Status column unless `all` filter (done/cancelled rows exist)
- Show ground truth file path at the bottom
- Title: filter name + count, e.g. "Upcoming (5 events)", "March (8 events)"

## API Reference

```
GET /api/schedule                         â†’ next 14 days (pending)
GET /api/schedule?date=2026-03-05         â†’ specific day
GET /api/schedule?date=today              â†’ today
GET /api/schedule?from=2026-03-01&to=2026-03-31  â†’ range
GET /api/schedule?filter=keyword          â†’ search
GET /api/schedule?status=all              â†’ include done/cancelled
```

## See Also

- `scripts/query.ts` - Query script (hits Jimmy API)
- Jimmy DB: `~/.Jimmy/Jimmy.db` â†’ `schedule` table
- Auto-export: `~/.Jimmy/Jimmy/inbox/schedule.md` (generated on write)


