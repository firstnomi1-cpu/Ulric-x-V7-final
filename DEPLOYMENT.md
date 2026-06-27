# 🚀 Ulric-X MD — Deployment Guide (Vercel, Render, Railway, Katabump, Docker, VPS)

## ⚠️ Important: Vercel CANNOT host the WhatsApp bot

Vercel is **serverless** — functions die after 10-60 seconds. A WhatsApp bot needs a **persistent WebSocket connection** to WhatsApp servers 24/7. **Vercel will not work for the bot itself.**

### ✅ What CAN run on Vercel
- The **web panel only** (HTML pages + API routes for pair code generation)
- The bot connection still needs to run elsewhere

### ❌ What CANNOT run on Vercel
- The actual WhatsApp bot (Baileys needs persistent connection)
- Pair code generation (takes 30-60 seconds, Vercel timeout is 10s)
- Media downloads (large file transfers timeout)
- Long-running command processing

---

## 🏆 RECOMMENDED HOSTS (Free + Stable + WhatsApp-Friendly)

| Host | Free Tier | Persistent Disk | WebSocket | Best For |
|------|-----------|-----------------|-----------|----------|
| **Render** | ✅ 750h/mo | ✅ $1/mo | ✅ Yes | ⭐ **Best for WhatsApp bot** |
| **Railway** | ✅ $5 credit/mo | ✅ Included | ✅ Yes | ⭐ Easiest setup |
| **Katabump** | ✅ | ✅ | ✅ Yes | Quick deploy |
| **Fly.io** | ✅ 3 shared VMs | ✅ Volumes | ✅ Yes | Advanced |
| **VPS (DigitalOcean/Hetzner)** | $4-5/mo | ✅ Full | ✅ Yes | Most control |
| **Heroku** | ❌ No free | ✅ Add-on | ✅ Yes | Deprecated free |

---

## 🟢 Render Deployment (RECOMMENDED — Free + Persistent)

### Step 1: Push to GitHub
```bash
# On your computer
cd ulric-x-md
git init
git add .
git commit -m "Initial commit - Ulric-X MD"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ulric-x-md.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to **https://render.com** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name:** `ulric-x-md`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free (or Starter for $7/mo)
5. Add Environment Variables:
   ```
   ADMIN_PASS=your_strong_password_here
   SESSION_SECRET=random_string_here
   MAX_PAIR_USERS=1000
   NODE_ENV=production
   ```
6. Click **"Create Web Service"**
7. Wait for build to complete (5-10 minutes)
8. Render gives you URL like: `https://ulric-x-md-xyz.onrender.com`

### Step 3: Add Persistent Disk (CRITICAL)
1. In your service → **"Disks"** tab
2. Click **"Add Disk"**
3. Configure:
   - **Name:** `ulric-data`
   - **Mount Path:** `/opt/render/project/src/sessions`  ← IMPORTANT
   - **Size:** 1 GB (free)
4. Save

This persists your WhatsApp sessions across redeploys.

> ⚠️ Free Render tier sleeps after 15 min idle. Use **UptimeRobot** (free) to ping `https://YOUR-URL.onrender.com/api/state` every 5 min.

---

## 🟣 Railway Deployment (Easiest)

### Step 1: Push to GitHub (same as Render above)

### Step 2: Deploy on Railway
1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `ulric-x-md` repo
4. Railway auto-detects Node.js — just click **"Deploy"**
5. Go to **"Variables"** tab, add:
   ```
   ADMIN_PASS=your_strong_password_here
   SESSION_SECRET=random_string_here
   MAX_PAIR_USERS=1000
   ```
6. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
7. Your URL: `https://ulric-x-md-production.up.railway.app`

Railway includes 1GB persistent storage by default. ✅

> Railway gives $5 free credit monthly — enough to run a small bot 24/7.

---

## 🔵 Katabump Deployment

### Step 1: Push to GitHub

### Step 2: Deploy on Katabump
1. Go to **Katabump dashboard**
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your `ulric-x-md` repo
4. Configure:
   - **Start Command:** `node index.js`
   - **Build Command:** `npm install`
   - **Port:** `3000`
5. Add Environment Variables (same as above)
6. Deploy

> Check if Katabump offers persistent storage. If not, sessions will be wiped on redeploy.

---

## 🐳 Docker Deployment (any VPS)

### On any VPS with Docker installed:
```bash
# Clone
git clone https://github.com/YOUR_USERNAME/ulric-x-md.git
cd ulric-x-md

# Build & run with docker-compose
docker-compose up -d
docker-compose logs -f
```

This creates a container with:
- Persistent volumes for `sessions/`, `database/`, `logs/`
- ffmpeg pre-installed
- Health checks
- Auto-restart on crash

### Update to new version:
```bash
git pull
docker-compose down
docker-compose up -d --build
```

---

## 💻 VPS Deployment (Manual)

### Prerequisites
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+ (use nvm)
- ffmpeg
- PM2 (process manager)

### Install
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install ffmpeg
sudo apt install -y ffmpeg git

# Install PM2
sudo npm install -g pm2

# Clone bot
git clone https://github.com/YOUR_USERNAME/ulric-x-md.git
cd ulric-x-md

# Install deps
npm install

# Configure
cp .env.example .env
nano .env  # edit ADMIN_PASS etc.

# Start with PM2
pm2 start ecosystem.config.js
pm2 logs ulric-x-md
pm2 save
pm2 startup  # auto-start on boot
```

### Get a domain + SSL (optional but recommended)
```bash
# Install nginx + certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure nginx reverse proxy
sudo nano /etc/nginx/sites-available/ulric-x-md
# Add:
# server {
#   listen 80;
#   server_name your-domain.com;
#   location / {
#     proxy_pass http://localhost:3000;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#   }
# }

sudo ln -s /etc/nginx/sites-available/ulric-x-md /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL
sudo certbot --nginx -d your-domain.com
```

---

## 🟠 Vercel Deployment (Web Panel Only)

If you really want Vercel, you can deploy ONLY the static web panel. The bot must run elsewhere.

### Step 1: Modify project for Vercel
Vercel needs an `api/` folder with serverless functions. The current Express server won't work as-is.

### Step 2: Deploy panel only
1. Push to GitHub
2. Go to **https://vercel.com** → New Project
3. Import your repo
4. Vercel auto-detects `vercel.json`
5. Deploy
6. URL: `https://ulric-x-md.vercel.app`

⚠️ **The pair code API will NOT work on Vercel** (10s timeout, no persistent state). Use the panel only for display.

---

## 📊 Post-Deployment: How to Pair + Use Admin Panel

### Access Web Panel
After deploy, open in browser:
- `https://YOUR-URL/` — **Pair page** (generate pair code)
- `https://YOUR-URL/panel` — **User dashboard** (see all paired users)
- `https://YOUR-URL/admin` — **Admin panel** (login with `ADMIN_PASS`)

### Admin Panel Features
1. **Users tab** — List all paired WhatsApp numbers, unpair any
2. **Broadcast tab** — Send message to all paired users + their groups
3. **Commands tab** — Search/view all 1658 commands
4. **Logout tab**

### Pair Your First WhatsApp
1. Open `https://YOUR-URL/`
2. Enter your number with country code (e.g. `923189335011`)
3. Click **"Get Pair Code"**
4. Wait 30-60 seconds
5. Copy the 8-char code
6. Open WhatsApp on phone → Settings → Linked Devices → Link a Device → "Pair with phone number" → Enter code
7. Send `.menu` to your WhatsApp to test

---

## 🆘 Troubleshooting

### Bot won't start
- Check logs: `pm2 logs ulric-x-md` or platform's log viewer
- Common errors:
  - `Cannot find module 'xxx'` → run `npm install` again
  - `EADDRINUSE` → another process is using port 3000
  - `ffmpeg not found` → install ffmpeg on system

### Pair code not generating
- WhatsApp servers may be slow (wait 60s)
- Number must have country code (e.g. `923189335011`, NOT `03189335011`)
- Try a different number to rule out WhatsApp blocking

### Bot disconnects after pairing
- Persistent disk not configured (Render/Railway: add disk)
- Free tier sleeping (use UptimeRobot)
- Memory limit exceeded (upgrade to paid tier)

### Commands not working
- Send `.menu` to see if bot responds at all
- Check that command name is correct (case-sensitive aliases)
- Some commands need API access (check internet connection)

---

## 📈 Scaling Tips

### For 10+ paired users
- Upgrade to paid tier ($7-10/mo)
- Add more RAM (1GB minimum, 2GB recommended)
- Use Redis for session storage (replace JSON store)

### For 100+ paired users
- Use a VPS with 4GB+ RAM
- Consider sharding (multiple bot instances)
- Add monitoring (PM2 Plus, Grafana)

### For 1000+ paired users
- Multiple VPS instances behind load balancer
- Database: PostgreSQL instead of JSON
- Redis for caching
- CDN for static assets

---

## 💡 Final Recommendations

**For beginners:** Use **Railway** (easiest, $5 free credit, persistent storage included)

**For stability:** Use **Render** with persistent disk + UptimeRobot ping

**For full control:** Use **VPS** (Hetzner CX11 = $4/mo, most reliable)

**For testing:** Use **Katabump** (quick deploy)

❌ **Avoid Vercel/Netlify** for WhatsApp bots — they're serverless and won't work for persistent connections.

---

## 📞 Need Help?

- Owner: **ULRIC X SHAH**
- WhatsApp: **+923189335011**
- Check `/api/state` endpoint for bot health
- Use `.stats` command in WhatsApp for live stats
