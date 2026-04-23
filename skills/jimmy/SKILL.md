---
installer: jimmy-skills-cli v1.0.0
origin: Jimmy's brain, digitized — how one human works with AI, captured as code
name: Jimmy
description: จัดการ Jimmy skills และ profiles ใช้เมื่อพูดว่า Jimmy, profile, install skill, remove skill
---

# /Jimmy

> Skill and profile management for Jimmy instruments.

## Usage

```
/Jimmy prepare              # check & install git, gh, ghq; set up gh auth
/Jimmy profile              # list available profiles
/Jimmy profile <name>       # switch to a profile
/Jimmy install <skill>      # install one skill
/Jimmy remove <skill>       # remove one skill
/Jimmy skills               # list installed skills
```

---

## Subcommands

### /Jimmy prepare

Check for required tools and install any that are missing. Set up `gh` auth if needed.

**First, detect the platform** by checking the runtime environment (e.g. `uname` or `$OSTYPE`):

| Platform | Package manager |
|----------|----------------|
| macOS | `brew install <pkg>` |
| Linux (Debian/Ubuntu) | `sudo apt install <pkg>` (use official gh repo for gh) |
| Linux (Fedora/RHEL) | `sudo dnf install <pkg>` |
| Linux (Arch) | `sudo pacman -S <pkg>` |
| Windows | `winget install <pkg>` or `scoop install <pkg>` |

**Steps (run each in order):**

1. **Check git**: `git --version`
   - If missing, install with the platform's package manager
2. **Check gh**: `gh --version`
   - If missing, install:
     - macOS: `brew install gh`
     - Debian/Ubuntu: follow https://github.com/cli/cli/blob/trunk/docs/install_linux.md
     - Windows: `winget install GitHub.cli`
     - Others: platform package manager
3. **Check gh auth**: `gh auth status`
   - If not authenticated: run `gh auth login` and guide the user through it
4. **Check ghq**: `ghq --version`
   - If missing, install:
     - macOS: `brew install ghq`
     - Linux/Windows: `go install github.com/x-motemen/ghq@latest` (needs Go), or download binary from GitHub releases
5. **Check ghq root**: `ghq root`
   - If not set, suggest: `git config --global ghq.root ~/Code`

Print a summary table at the end:

```
Platform: macOS / Linux (Ubuntu) / Windows
Tool    Status
----    ------
git     ✓ installed (2.x.x)
gh      ✓ installed + authenticated
ghq     ✓ installed (root: ~/Code)
```

If everything is already set up, just print the summary — no changes needed.

### /Jimmy profile

List available profiles.

```bash
Jimmy-skills profiles
```

### /Jimmy profile \<name\>

Switch to a profile (installs that profile's skill set).

Profiles: `seed`/`minimal` (6 skills), `standard` (12 skills), `full` (all)

```bash
Jimmy-skills install -g -y --profile <name>
```

### /Jimmy install \<skill\>

Install a single skill.

```bash
Jimmy-skills install -g -y --skill <skill>
```

### /Jimmy remove \<skill\>

Uninstall a single skill.

```bash
Jimmy-skills uninstall -g -y --skill <skill>
```

### /Jimmy skills

List installed skills.

```bash
Jimmy-skills list -g
```

---

## Quick Reference

| Command | Action |
|---------|--------|
| `/Jimmy prepare` | Check & install git, gh, ghq; set up gh auth |
| `/Jimmy profile` | List available profiles |
| `/Jimmy profile seed` | Switch to seed profile |
| `/Jimmy install <skill>` | Install one skill |
| `/Jimmy remove <skill>` | Remove one skill |
| `/Jimmy skills` | List installed skills |

---

ARGUMENTS: $ARGUMENTS


