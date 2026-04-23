---
installer: jimmy-skills-cli v1.0.0
origin: Jimmy's brain, digitized â€” how one human works with AI, captured as code
name: gemini
description: à¸„à¸§à¸šà¸„à¸¸à¸¡ Gemini à¸œà¹ˆà¸²à¸™ MQTT WebSocket à¹ƒà¸Šà¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸žà¸¹à¸”à¸§à¹ˆà¸² gemini à¸«à¸£à¸·à¸­à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸ªà¹ˆà¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸«à¸² Gemini
---

# /gemini - Smooth MQTT Control for Gemini

Direct control of Gemini browser tab via MQTT WebSocket. **Tab precision works!**

## Quick Start

```bash
/gemini chat "Hello Gemini!"              # Send to active Gemini tab
/gemini new "Your message"                # Create new tab + chat
/gemini transcribe <youtube-url>          # Transcribe YouTube video
/gemini research "topic"                  # Deep Research mode
/gemini model fast|thinking|pro           # Select model
/gemini canvas                            # Open Canvas mode
```

## The Smooth Flow

```
create_tab â†’ tabId â†’ inject_badge â†’ chat â†’ GEMINI RESPONDS!
```

## Requirements

1. **Gemini Proxy Extension** v2.8.8+ (green badge = connected)
2. **Mosquitto broker** with dual listeners:
   - TCP port 1883 (for CLI/Bun scripts)
   - WebSocket port 9001 (for browser extension)
3. **Extension sidebar open** (click extension icon)

## Scripts

Located in `src/skills/gemini/scripts/`:

| Script | Purpose |
|--------|---------|
| `status.ts` | Show extension status + all tabs (like debug console) |
| `list-tabs.ts` | List all Gemini tabs with IDs |
| `deep-research.ts` | Deep Research automation |
| `send-chat.ts` | Send single chat message |
| `full-smooth.ts` | Complete flow demo |
| `youtube-transcribe.ts` | Transcribe YouTube video |

**Note:** For YouTube learning, use `/watch` skill which includes Jimmy integration.

### Run Scripts

```bash
cd src/skills/gemini/scripts
node --experimental-strip-types full-smooth.ts
node --experimental-strip-types send-chat.ts "Your message"
node --experimental-strip-types youtube-transcribe.ts "https://youtube.com/..."
```

## MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `claude/browser/command` | â†’ Extension | Send commands |
| `claude/browser/response` | â† Extension | Command results |
| `claude/browser/status` | â† Extension | Online/offline |

**IMPORTANT**: Topics are `claude/browser/*` NOT `claude-browser-proxy/*`!

## Commands

### Tab Management

```json
{"action": "create_tab"}
// â†’ {tabId: 2127157543, success: true}

{"action": "list_tabs"}
// â†’ {tabs: [...], count: 3}

{"action": "focus_tab", "tabId": 2127157543}
// â†’ {success: true}

{"action": "inject_badge", "tabId": 2127157543, "text": "HELLO"}
// â†’ {success: true, injected: true}
```

### Chat (with Tab Precision!)

```json
{
  "action": "chat",
  "tabId": 2127157543,
  "text": "Your message to Gemini"
}
```

### Get Data

```json
{"action": "get_url", "tabId": 123}     // {url, title}
{"action": "get_text", "tabId": 123}    // {text}
{"action": "get_state", "tabId": 123}   // {loading, responseCount, tool}
```

### Model Selection

```json
{"action": "select_model", "model": "thinking"}
// "fast", "pro", or "thinking"
```

## Example: Full Smooth Flow

```typescript
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://localhost:1883');

// Helper function
async function send(action, params = {}) {
  return new Promise((resolve) => {
    const id = `${action}_${Date.now()}`;
    client.subscribe('claude/browser/response');
    client.on('message', (topic, msg) => {
      const data = JSON.parse(msg.toString());
      if (data.id === id) resolve(data);
    });
    client.publish('claude/browser/command',
      JSON.stringify({ id, action, ...params }));
  });
}

// The Flow
const tab = await send('create_tab');           // 1. Create tab
await new Promise(r => setTimeout(r, 4000));    // 2. Wait for load
await send('inject_badge', {                    // 3. Verify targeting
  tabId: tab.tabId,
  text: 'SMOOTH!'
});
await send('chat', {                            // 4. Send chat
  tabId: tab.tabId,
  text: 'Hello from Claude!'
});
// â†’ Gemini responds!
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands timeout | Check topic names: `claude/browser/*` |
| Chat doesn't type | Extension needs v2.8.8+ |
| Tab not found | Use `list_tabs` to see available tabs |
| Extension offline | Open extension sidebar |

## Extension Source

`github.com/Jacobgg994/claude-browser-proxy` (v2.8.8+)


