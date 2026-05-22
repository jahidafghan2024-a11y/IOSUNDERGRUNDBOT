# iOS Underground TMA — Free Deployment Guide

## What Was Added

- **IPA Signer** at `/signer` — users upload their `.p12` cert + `.mobileprovision` + `.ipa` and get a signed IPA back
- All references to the third-party ESign website (khoindvn.io.vn) removed
- Telegram Web App SDK added to `index.html`
- New `/api/sign` and `/api/health` backend endpoints
- Route `/signer` added to the React app

---

## Step 1 — Install zsign on Your Server

zsign is the free, open-source tool that does the actual signing.

### On Ubuntu/Debian (Railway, Render, Fly.io all use this):

```bash
# Install build dependencies
sudo apt-get update
sudo apt-get install -y build-essential cmake libssl-dev libzip-dev wget

# Clone and build zsign
git clone https://github.com/zhlynn/zsign.git
cd zsign
cmake .
make
sudo cp zsign /usr/local/bin/zsign
zsign --version   # should print version info
```

### Add to your Dockerfile (recommended for cloud hosting):

```dockerfile
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    build-essential cmake libssl-dev libzip-dev git \
    && git clone https://github.com/zhlynn/zsign.git /tmp/zsign \
    && cd /tmp/zsign && cmake . && make \
    && cp zsign /usr/local/bin/zsign \
    && rm -rf /tmp/zsign \
    && apt-get clean

WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "start"]
```

Save this as `Dockerfile` in the project root.

---

## Step 2 — Free Hosting Options

### Option A — Railway (Easiest, Recommended)

1. Go to https://railway.app → Sign up free
2. Click **New Project** → **Deploy from GitHub repo**
3. Connect your GitHub and push this project
4. Railway auto-detects Node.js and deploys
5. Add a custom domain or use the `.up.railway.app` URL
6. Free tier: 500 hours/month (plenty for a TMA)

> Railway will use your `Dockerfile` automatically if it exists.

### Option B — Render

1. Go to https://render.com → Sign up free
2. New → **Web Service** → Connect your GitHub repo
3. Build command: `pnpm install && pnpm run build`
4. Start command: `pnpm start`
5. Free tier: spins down after 15 min inactivity (fine for Telegram bots)

### Option C — Fly.io

1. Install: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly auth login`
3. In project folder: `fly launch` → follow prompts
4. Free tier: 3 shared VMs, 3GB storage

---

## Step 3 — Create Your Telegram Bot & Mini App

1. Open Telegram → search **@BotFather**
2. Send `/newbot` → follow instructions → copy your **Bot Token**
3. Send `/newapp` to BotFather → select your bot
4. Set the **Web App URL** to your deployed URL (e.g. `https://yourapp.up.railway.app`)
5. BotFather gives you a link like: `https://t.me/YourBot/app`

### Add Mini App button to your bot messages:

```javascript
// In your bot code (node-telegram-bot-api or grammy):
bot.sendMessage(chatId, "Open iOS Underground:", {
  reply_markup: {
    inline_keyboard: [[
      { text: "🔐 Open App", web_app: { url: "https://yourapp.up.railway.app" } }
    ]]
  }
});
```

---

## Step 4 — Local Development

```bash
# Install dependencies
pnpm install

# Run dev server (frontend + backend together)
pnpm dev

# Open http://localhost:5173
```

For signing to work locally, install zsign on your machine first (see Step 1).

---

## Step 5 — Verify Everything Works

After deploying, open `https://yourapp.com/api/health` in a browser.

You should see:
```json
{ "ok": true, "zsign": true }
```

If `zsign` is `false`, the zsign binary isn't installed — re-check Step 1 / your Dockerfile.

---

## File Size Limits

The server accepts up to **500 MB** per file. If you need larger, edit `server/index.ts`:

```typescript
limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
```

---

## Security Notes

- All uploaded files are stored in the OS temp directory and deleted immediately after signing
- No user data, certificates, or IPAs are logged or retained
- Certificate passwords are never written to disk — only passed as CLI args

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `zsign: command not found` | Install zsign (Step 1) and make sure it's in `/usr/local/bin` |
| Wrong certificate password | Make sure you're entering the correct p12 export password |
| Provision profile mismatch | Cert and .mobileprovision must come from the same Apple account |
| 500 MB upload limit exceeded | Increase `fileSize` limit in `server/index.ts` |
| Railway free tier expired | Switch to Render or Fly.io |

