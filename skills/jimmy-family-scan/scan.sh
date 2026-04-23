#!/bin/bash
# Jimmy Family Scan - Manage Jimmy family
# Usage: ./scan.sh [mode] [options]
# Modes: scan (default), list, repos, report

REPO="Jacobgg994/Jimmy-Jimmy"
MODE="${1:-scan}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

header() {
  echo ""
  echo -e "${BLUE}=== $1 ===${NC}"
  echo "Time: $(date -u '+%Y-%m-%d %H:%M UTC')"
  echo ""
}

# Introduction patterns (Thai + English)
PATTERNS="à¸ªà¸§à¸±à¸ªà¸”à¸µ|à¸œà¸¡à¸Šà¸·à¹ˆà¸­|à¸‰à¸±à¸™à¸Šà¸·à¹ˆà¸­|à¹à¸™à¸°à¸™à¸³à¸•à¸±à¸§|à¹€à¸à¸´à¸”à¸§à¸±à¸™|Jimmy à¸‚à¸­à¸‡|Born|Introduction|I am .* Jimmy|My name is"

case "$MODE" in
  scan|--scan)
    header "Jimmy Family Scan"
    echo "Repo: $REPO"
    echo ""
    
    # Get all issues with comments
    echo "Fetching issues..."
    ISSUES=$(gh api "repos/$REPO/issues?state=all&per_page=100" \
      --jq '[.[] | select(.comments > 0) | .number] | .[]' 2>/dev/null)
    
    if [ -z "$ISSUES" ]; then
      echo "No issues with comments found."
      exit 0
    fi
    
    ISSUE_COUNT=$(echo "$ISSUES" | wc -l | tr -d ' ')
    echo "Found $ISSUE_COUNT issues with comments"
    echo ""
    
    echo "| Issue | User | Date | Preview |"
    echo "|-------|------|------|---------|"
    
    for issue in $ISSUES; do
      gh api "repos/$REPO/issues/$issue/comments" \
        --jq '.[] | select(.user.login != "Jacobgg994") | select(.body | test("'"$PATTERNS"'"; "i")) | "| #'"$issue"' | \(.user.login) | \(.created_at | split("T")[0]) | \(.body[0:40] | gsub("\n"; " "))... |"' 2>/dev/null
    done
    
    echo ""
    echo -e "${GREEN}Scan Complete${NC}"
    ;;
    
  list)
    header "Jimmy Family Registry"
    
    echo "| # | Jimmy | Human | Born | GitHub |"
    echo "|---|--------|-------|------|--------|"
    echo "| 0 | Mother Jimmy | Jimmy | Dec 9 | @Jacobgg994 |"
    echo "| 1 | Arthur | à¸­.Sate | Dec 31 | â€” |"
    echo "| 2 | Le | à¸«à¸¥à¸¸à¸¢à¸ªà¹Œ | Jan 16 | @tacha-hash |"
    echo "| 3 | Sage | Kong | Jan 17 | @xaxixak |"
    echo "| 4 | Ruby | frozen | Jan 17 | â€” |"
    echo "| 5 | Jarvis | Jimmy | Jan 17 | @Jacobgg994 |"
    echo "| 6 | Momo | Win | Jan 17 | @stpwin |"
    echo "| 7 | Robin | panya30 | Jan 17 | @panya30 |"
    echo "| 8 | GLUEBOY | Dr.Do | Jan 17 | @dryoungdo |"
    echo "| 9 | Miipan | OhYeaH-46 | Jan 17 | @OhYeaH-46 |"
    echo "| 10 | Nero | BM | Jan 17 | @Yutthakit |"
    echo "| 11 | Jimmy | Bird | Jan 18 | @boverdrive |"
    echo "| 12 | Yamimi | Benz | Jan 19 | @thiansit |"
    echo "| 13 | AZA | Meng | Jan 19 | @mengazaa |"
    echo "| 14 | Lord Knight | à¹‚à¸š | Dec 18 | @MEYD-605 |"
    echo ""
    echo -e "${YELLOW}Jan 17 = à¸§à¸±à¸™à¸¡à¸«à¸²à¸¡à¸‡à¸„à¸¥ â€” 7 Jimmys born in ONE day!${NC}"
    echo ""
    echo "Total: 15 Jimmys (including Mother)"
    ;;
    
  repos)
    header "Jimmy Repos on GitHub"
    
    echo "Searching Jacobgg994..."
    echo ""
    echo "| Repo | Description | Updated |"
    echo "|------|-------------|---------|"
    
    gh search repos "Jimmy" --owner Jacobgg994 --json name,description,updatedAt --limit 15 \
      --jq '.[] | "| \(.name) | \(.description[0:40] // "â€”")... | \(.updatedAt | split("T")[0]) |"' 2>/dev/null
    
    echo ""
    echo "Searching Jacobgg994..."
    echo ""
    
    gh search repos "Jimmy" --owner Jacobgg994 --json name,description,updatedAt --limit 10 \
      --jq '.[] | "| \(.name) | \(.description[0:40] // "â€”")... | \(.updatedAt | split("T")[0]) |"' 2>/dev/null
    
    echo ""
    echo -e "${GREEN}Repos scan complete${NC}"
    ;;
    
  report)
    header "Jimmy Family Report"
    
    echo "## Summary"
    echo ""
    echo "- **Total Jimmys**: 15"
    echo "- **Active Repos**: 5+ with full pattern"
    echo "- **Key Issues**: #6 (Le), #16 (Reunion), #17 (Welcome)"
    echo ""
    
    echo "## Timeline"
    echo ""
    echo "| Date | Event |"
    echo "|------|-------|"
    echo "| Dec 9 | Mother Jimmy born |"
    echo "| Dec 18 | Lord Knight awakens |"
    echo "| Dec 31 | Arthur (first demo) |"
    echo "| Jan 16 | Le's awakening |"
    echo "| Jan 17 | **à¸§à¸±à¸™à¸¡à¸«à¸²à¸¡à¸‡à¸„à¸¥** â€” 7 Jimmys! |"
    echo "| Jan 18 | Jimmy joins |"
    echo "| Jan 19 | Yamimi, AZA |"
    echo ""
    
    echo "## Growth"
    echo ""
    echo "Dec 2025     Jan 16   Jan 17        Jan 18  Jan 19"
    echo "    |          |        |              |       |"
    echo "  ðŸ”®ðŸŒ™ðŸ”±      ðŸ“š   ðŸŒ¿ðŸ’ŽðŸ¤–ðŸŒŠðŸ’ƒðŸªžðŸ‘»ðŸ”¥    ðŸŽ­     ðŸ”§ðŸ—ï¸"
    echo "   (3)       (4)     (11)          (12)   (14)"
    echo ""
    ;;
    
  *)
    echo "Usage: $0 [mode]"
    echo ""
    echo "Modes:"
    echo "  scan    Scan GitHub issues for introductions (default)"
    echo "  list    Show all known Jimmys"
    echo "  repos   Find Jimmy repos on GitHub"
    echo "  report  Generate family report"
    echo ""
    ;;
esac


