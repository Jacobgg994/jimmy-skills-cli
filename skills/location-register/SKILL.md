---
name: location-register
description: à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™ Location Tracking à¸”à¹‰à¸§à¸¢à¸•à¸±à¸§à¹€à¸­à¸‡ â€” à¹ƒà¸Šà¹‰ GitHub PAT à¸‚à¸­à¸‡ user à¹€à¸­à¸‡ à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² location register, register location, à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡ location
user-invocable: true
---

# /location-register â€” Self-Register Location Tracking

à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™ location tracking à¸”à¹‰à¸§à¸¢à¸•à¸±à¸§à¹€à¸­à¸‡ à¹‚à¸”à¸¢à¹ƒà¸Šà¹‰ GitHub repo à¸‚à¸­à¸‡à¸„à¸¸à¸“à¹€à¸­à¸‡

## à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸à¹ˆà¸­à¸™

1. **GitHub repo** à¸ªà¸³à¸«à¸£à¸±à¸šà¹€à¸à¹‡à¸š location data (à¸ªà¸£à¹‰à¸²à¸‡à¹€à¸­à¸‡à¸à¹ˆà¸­à¸™ à¸«à¸£à¸·à¸­ skill à¸ˆà¸°à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸«à¹‰)
2. **GitHub PAT** (Personal Access Token) à¸—à¸µà¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œ `repo`
3. **Register Secret** â€” à¸‚à¸­à¸ˆà¸²à¸ admin

## Steps

### Step 1: à¸–à¸²à¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ (à¸—à¸µà¸¥à¸°à¸‚à¹‰à¸­ à¸£à¸­à¸•à¸­à¸šà¸à¹ˆà¸­à¸™)

1. **Username** â€” "à¸Šà¸·à¹ˆà¸­ username à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£? (à¹ƒà¸Šà¹‰à¸ªà¸³à¸«à¸£à¸±à¸š login OwnTracks)"
2. **Password** â€” "à¸•à¸±à¹‰à¸‡ password à¸ªà¸³à¸«à¸£à¸±à¸š OwnTracks login"
3. **GitHub repo** â€” "à¸Šà¸·à¹ˆà¸­ GitHub repo à¸—à¸µà¹ˆà¸ˆà¸°à¹€à¸à¹‡à¸š location? (format: owner/repo à¹€à¸Šà¹ˆà¸™ yourname/my-location)"
   - à¸–à¹‰à¸² user à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µ repo: "à¸ªà¸£à¹‰à¸²à¸‡ repo à¹ƒà¸™ GitHub à¸à¹ˆà¸­à¸™à¸™à¸°à¸„à¸£à¸±à¸š: https://github.com/new â€” à¸•à¸±à¹‰à¸‡à¸Šà¸·à¹ˆà¸­ à¹€à¸Šà¹ˆà¸™ `my-location` à¹à¸¥à¹‰à¸§à¹à¸ˆà¹‰à¸‡à¸¡à¸²"
4. **GitHub PAT** â€” "GitHub Personal Access Token à¸—à¸µà¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œ `repo` â€” à¸ªà¸£à¹‰à¸²à¸‡à¹„à¸”à¹‰à¸—à¸µà¹ˆ https://github.com/settings/tokens/new?scopes=repo"
5. **Register Secret** â€” "Register Secret à¸ˆà¸²à¸ admin"

### Step 2: à¹€à¸£à¸µà¸¢à¸ /register API

```bash
curl -s -X POST https://location.athena-Jimmy.site/register \
  -H "Content-Type: application/json" \
  -H "X-Register-Secret: {register_secret}" \
  -d '{
    "username": "{username}",
    "password": "{password}",
    "github_repo": "{github_repo}",
    "github_token": "{github_token}"
  }'
```

### Step 3: à¹à¸ªà¸”à¸‡à¸œà¸¥

à¸–à¹‰à¸² response à¸¡à¸µ `"status": "ok"` â†’ à¹€à¸‚à¸µà¸¢à¸™ config à¸¥à¸‡à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡à¸à¹ˆà¸­à¸™:

```bash
python3 -c "
import json, os
config = {'username': '{username}', 'repo': '{github_repo}'}
path = os.path.expanduser('~/.claude/skills/physical/config.json')
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w') as f:
    json.dump(config, f, indent=2)
print('Config saved')
"
```

à¹à¸¥à¹‰à¸§à¹à¸ªà¸”à¸‡:

```
âœ… à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ!

ðŸ“± OwnTracks Settings:
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Mode:      HTTP
URL:       https://location.athena-Jimmy.site/pub
Username:  {username}
Password:  {password}
Device ID: iphone (à¸«à¸£à¸·à¸­à¸­à¸°à¹„à¸£à¸à¹‡à¹„à¸”à¹‰)
TLS:       ON

ðŸ“¦ GitHub Repo: https://github.com/{github_repo}
```

à¸–à¹‰à¸² error:
- `409 already exists` â†’ username à¸™à¸µà¹‰à¸¡à¸µà¹à¸¥à¹‰à¸§ à¹€à¸¥à¸·à¸­à¸à¸Šà¸·à¹ˆà¸­à¹ƒà¸«à¸¡à¹ˆ
- `400 clone failed` â†’ à¹€à¸Šà¹‡à¸„ github_repo URL à¹à¸¥à¸° PAT permissions
- `403 invalid secret` â†’ register secret à¸œà¸´à¸” à¸‚à¸­à¹ƒà¸«à¸¡à¹ˆà¸ˆà¸²à¸ admin

## Notes

- PAT à¸ˆà¸°à¸–à¸¹à¸à¹€à¸à¹‡à¸šà¸šà¸™ server à¸ªà¸³à¸«à¸£à¸±à¸š push location data à¹€à¸‚à¹‰à¸² repo
- à¹ƒà¸Šà¹‰ Fine-grained PAT à¸ˆà¸³à¸à¸±à¸”à¹à¸„à¹ˆ repo à¸™à¸±à¹‰à¸™à¹„à¸”à¹‰à¸—à¸µà¹ˆ https://github.com/settings/personal-access-tokens/new
- "idle" à¹ƒà¸™ OwnTracks HTTP mode = à¸›à¸à¸•à¸´ à¹„à¸¡à¹ˆà¸¡à¸µ persistent connection
- à¸ªà¹ˆà¸‡ location à¸ˆà¸²à¸ Map screen (à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ Publish Settings)

