---
name: location-install
description: à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡ Location Tracking à¸ªà¸³à¸«à¸£à¸±à¸š user à¹ƒà¸«à¸¡à¹ˆ â€” à¸ªà¸£à¹‰à¸²à¸‡ HTTP password, GitHub repo, clone, config à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² location install, add location user, setup location
user-invocable: true
---

# /location-install â€” Setup Location Tracking for a New User

Install OwnTracks location tracking for a new user on this server.

## What this does

1. Ask user for details
2. Add HTTP credentials to users.json
3. Create GitHub repo (auto, under logged-in gh account)
4. Clone repo locally
5. Add user to `users.json`
6. Restart `location-webhook`

## Steps

### Step 1: Check prerequisites

```bash
gh auth status 2>&1 | head -3
pm2 status location-webhook | grep location-webhook
```

If `location-webhook` is not running â†’ tell user to start it first.
Get GitHub username: `gh api user --jq '.login'`

### Step 2: Ask questions (one by one, wait for each answer)

Ask in order:

1. **Username** â€” "à¸Šà¸·à¹ˆà¸­ username à¸ªà¸³à¸«à¸£à¸±à¸š location tracking à¸„à¸·à¸­à¸­à¸°à¹„à¸£?"
2. **Password** â€” "à¸•à¸±à¹‰à¸‡ password à¸ªà¸³à¸«à¸£à¸±à¸š {username} à¸„à¸£à¸±à¸š (à¹ƒà¸Šà¹‰à¹ƒà¸™ OwnTracks HTTP auth)"
3. **Repo name** â€” "à¸Šà¸·à¹ˆà¸­ GitHub repo à¸„à¸·à¸­à¸­à¸°à¹„à¸£? (à¸à¸” Enter à¹ƒà¸Šà¹‰ default: {username}-location)"
4. **Named places** â€” "à¸¡à¸µà¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸Šà¸·à¹ˆà¸­à¸¡à¸±à¹‰à¸¢? à¹€à¸Šà¹ˆà¸™ Home, Office (à¸žà¸´à¸¡à¸žà¹Œà¸Šà¸·à¹ˆà¸­,lat,lon à¹€à¸Šà¹ˆà¸™ 'Home,13.756,100.502' à¸«à¸£à¸·à¸­ skip à¸à¸” Enter)"

### Step 3: Create GitHub repo + clone

```bash
GITHUB_USER=$(gh api user --jq '.login')
REPO_NAME="{username}-location"  # or custom name from step 2
REPO_DIR="$HOME/Project/{Username}-Location"

# Create repo
gh repo create $GITHUB_USER/$REPO_NAME --public --description "Location tracking for {username}"

# Initialize with current.csv
mkdir -p $REPO_DIR
cd $REPO_DIR
git init
echo "lat,lon,address,timestamp,battery,accuracy" > current.csv
echo "0,0,initializing,$(date -u +%Y-%m-%dT%H:%M:%SZ),," >> current.csv
git add .
git commit -m "init: location tracking repo"
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git push -u origin main
```

### Step 4: Add user to users.json

Read current `/home/paji/Project/Location-Server/users.json`, add new user entry:

```json
"{username}": {
  "repo_dir": "/home/paji/Project/{Username}-Location",
  "github_repo": "{github_user}/{repo_name}",
  "http_password": "{password}",
  "named_places": [
    {"name": "Place Name", "lat": 0.0, "lon": 0.0, "radius_m": 200}
  ]
}
```

Write back to users.json.

### Step 5: Restart location-webhook

```bash
pm2 restart location-webhook
pm2 logs location-webhook --lines 5 --nostream
```

### Step 6: Show OwnTracks setup guide

Display connection settings for the new user:

```
âœ… Setup Complete!

ðŸ“± OwnTracks Settings:
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Mode:     HTTP
URL:      https://location.athena-Jimmy.site/pub
Username: {username}
Password: {password}
Device ID: iphone (à¸«à¸£à¸·à¸­à¸­à¸°à¹„à¸£à¸à¹‡à¹„à¸”à¹‰)
TLS:      ON (automatic via HTTPS)

ðŸ“¦ GitHub Repo: https://github.com/{github_user}/{repo_name}
```

## Notes

- à¹„à¸¡à¹ˆà¸•à¹‰à¸­à¸‡à¹ƒà¸Šà¹‰ Tailscale â€” à¸—à¸¸à¸à¸„à¸™à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¹„à¸”à¹‰à¸œà¹ˆà¸²à¸™ HTTPS
- Named places à¹€à¸žà¸´à¹ˆà¸¡à¸—à¸µà¸«à¸¥à¸±à¸‡à¹„à¸”à¹‰à¹‚à¸”à¸¢à¹à¸à¹‰ `/home/paji/Project/Location-Server/users.json`
- History à¸ˆà¸°à¹€à¸£à¸´à¹ˆà¸¡à¹€à¸à¹‡à¸šà¸—à¸±à¸™à¸—à¸µà¸—à¸µà¹ˆ OwnTracks à¸ªà¹ˆà¸‡ location à¹à¸£à¸
- "idle" status à¹ƒà¸™ OwnTracks HTTP mode = à¸›à¸à¸•à¸´ (à¹„à¸¡à¹ˆà¸¡à¸µ persistent connection)
- à¸ªà¹ˆà¸‡ location à¸ˆà¸²à¸ Map screen (à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ "Publish Settings")

