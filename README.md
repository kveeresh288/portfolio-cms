# KV.dev — Portfolio CMS

A production-ready, full-stack Portfolio & Content Management System built with **Next.js 14**, **Express**, and **MongoDB**.

The admin panel is secured with the same dual-channel MFA architecture as the [SecureVault MFA project](https://github.com/kveeresh288/SecureVault-MFA): **Email OTP** or **Authenticator App (TOTP)**, plus a complete per-section profile editor so every word on the public site can be changed without touching code.

---

## Live

| Layer | URL |
|---|---|
| Frontend | https://client-lilac-zeta-41.vercel.app |
| Backend API | *(deploy to Render — see below)* |

---

## Features

### Public Portfolio
- Animated Hero with role ticker, badge, and social links — all DB-driven
- About section with bio paragraphs, experience timeline, Google Maps link
- Skills with categorised proficiency bars and auto-scrolling marquee
- Projects grid with featured row, GitHub / Live Demo links, tag badges
- DSA Notes section (Algorithms365 & Apna College resources)
- Contact form routed to Gmail

### Admin CMS (`/admin`)
- **Dual-channel MFA** matching the SecureVault MFA project:
  - **Email OTP** — 6-digit code sent to your Gmail (bcrypt-hashed, 5-min TTL, auto-deleted by MongoDB TTL index)
  - **Authenticator App (TOTP)** — otplib, same library as the MFA project; scan QR with Google Authenticator or Authy
  - Switch channels anytime from the sidebar
- **Profile Editor** — Hero, About, Contact, Social all editable in-place
- **Projects CRUD** — featured toggle, drag order, image URL preview, tag editor
- **Skills CRUD** — proficiency slider, category grouping
- Always-mounted tab panels (no re-fetch on tab switch)
- Mobile-responsive sidebar with overlay

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion |
| Backend | Node.js · Express · TypeScript |
| Database | MongoDB via Mongoose |
| Auth | JWT (HttpOnly cookie) · otplib (TOTP) · bcryptjs (OTP hashing) |
| Email | Nodemailer + Gmail SMTP |
| Deploy | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

---

## Project Structure

```
Portfolio/
├── client/                  Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             Homepage (Server Component, ISR 60s)
│   │   │   ├── layout.tsx           Root layout (minimal — no Navbar)
│   │   │   ├── middleware.ts        Protects /admin/* via JWT cookie
│   │   │   └── admin/
│   │   │       ├── page.tsx         Dashboard (Projects, Skills, Profile, MFA)
│   │   │       └── login/page.tsx   2-step login (password → OTP/TOTP)
│   │   ├── components/
│   │   │   ├── layout/              Navbar, Footer (profile-driven)
│   │   │   ├── sections/            Hero, About, Skills, Projects, Resources, Contact
│   │   │   ├── ui/                  ProjectCard
│   │   │   └── admin/               ProjectTable, SkillTable, ProfileEditor, ProjectModal
│   │   ├── lib/
│   │   │   ├── api.ts               API client (fetch + proxy)
│   │   │   └── types.ts             Shared TypeScript interfaces
│   │   └── data/mock.ts             Fallback data when API is unreachable
│   ├── vercel.json                  Vercel rewrites (proxy /api/* → backend)
│   └── .env.local                   Local environment variables
│
├── server/                  Express + TypeScript
│   ├── src/
│   │   ├── server.ts                Entry point
│   │   ├── config/db.ts             MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts              Admin user (password, mfaChannel, mfaSecret)
│   │   │   ├── OtpSession.ts        Email OTP sessions (TTL auto-delete)
│   │   │   ├── SiteProfile.ts       Singleton site content document
│   │   │   ├── Project.ts
│   │   │   └── Skill.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts    Login, Email OTP, TOTP, enable/disable MFA
│   │   │   ├── profileController.ts Get/update SiteProfile singleton
│   │   │   ├── projectController.ts CRUD + field whitelisting
│   │   │   └── skillController.ts   CRUD
│   │   ├── middleware/authMiddleware.ts  JWT cookie validation
│   │   ├── routes/                  auth, profile, projects, skills, contact
│   │   └── utils/emailService.ts    Gmail OTP emails (ported from MFA project)
│   ├── scripts/
│   │   ├── seed.ts                  Create admin user + default data
│   │   ├── reset-totp.ts            Reset MFA (recovery)
│   │   └── reset-totp.ts
│   ├── render.yaml                  Render.com deployment config
│   └── .env.production.example
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Clone and install

```bash
git clone https://github.com/kveeresh288/portfolio-cms
cd portfolio-cms

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure environment

```bash
# Server
cp server/.env.production.example server/.env
# Edit server/.env — fill in MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, Gmail creds

# Client
cp client/.env.example client/.env.local
# .env.local is already pre-filled for local dev:
# NEXT_PUBLIC_API_URL=/api
# API_URL=http://localhost:5001/api
# BACKEND_URL=http://localhost:5001
```

### 3. Seed the database

```bash
cd server
npm run seed
# Creates admin user, default SiteProfile, and sample projects/skills
```

### 4. Run both servers

```bash
# Terminal 1 — Express API
cd server && npm run dev      # http://localhost:5001

# Terminal 2 — Next.js
cd client && npm run dev      # http://localhost:3000
```

---

## Admin Panel Usage

### First login

1. Go to `http://localhost:3000/admin`
2. Email: `kveeresh288@gmail.com` · Password: `Admin@Portfolio123!`
3. MFA is disabled on first login — you land directly on the dashboard
4. **Set up MFA from the sidebar** (see below)

### Setting up MFA

**Option A — Email OTP** (recommended for simplicity):
- Click **Enable Email OTP** in the sidebar
- Next login: after password → 6-digit code is emailed to you

**Option B — Authenticator App**:
- Click **Setup Authenticator** in the sidebar
- Scan the QR code with **Google Authenticator** or **Authy**
- Enter the 6-digit code to confirm
- Next login: after password → enter the code from your app

### Switching MFA method
- Use the sidebar buttons: "Switch to Authenticator" or "Switch to Email OTP"

### Recovery (locked out)
```bash
cd server && npm run reset-totp
# Disables MFA — you can log in with password only and re-enable from dashboard
```

### Editing site content
- **Profile tab** → Hero, About, Contact, Social — edit and save each section independently
- **Projects tab** → Add/edit/delete projects; toggle featured; search by title/tag
- **Skills tab** → Add/delete skills with category and proficiency

---

## Deployment

### Step 1 — MongoDB Atlas (Database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Build a free **M0 cluster**
3. Database Access → Add user (username + password)
4. Network Access → Allow from anywhere (`0.0.0.0/0`)
5. Cluster → Connect → Drivers → copy the connection string
   - Replace `<username>` and `<password>` with your DB user credentials
   - Append `/portfolio_cms` as the database name

### Step 2 — Backend on Render.com

1. Go to [render.com](https://render.com) → Sign up (free)
2. New → Web Service → connect your GitHub repo
3. Set the root directory to `server/`
4. Build command: `npm install && npm run build`
5. Start command: `node dist/src/server.js`
6. Add these environment variables in the Render dashboard:

```
NODE_ENV        = production
PORT            = 10000
MONGO_URI       = mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/portfolio_cms
JWT_SECRET      = <run: openssl rand -hex 64>
CLIENT_URL      = https://your-app.vercel.app   ← fill after Vercel deploy
ADMIN_EMAIL     = kveeresh288@gmail.com
ADMIN_PASSWORD  = <your-secure-password>
GMAIL_USER      = 4al22cs068@aiet.org.in
GMAIL_APP_PASSWORD = <16-char-gmail-app-password>
```

7. Click **Create Web Service** — first deploy takes ~5 minutes
8. Copy the service URL: `https://portfolio-cms-api.onrender.com`

> **Note:** Render free tier spins down after 15 min of inactivity. First request after sleep takes 20–30 seconds. Upgrade to Starter ($7/mo) to keep it always-on.

**After first deploy — run the seed:**
```bash
# In Render dashboard → Shell
node dist/src/server.js &
sleep 5
node dist/scripts/seed.js
```
Or run seed locally pointed at the Atlas URI:
```bash
MONGO_URI=mongodb+srv://... npm run seed
```

### Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub (free)
2. New Project → Import `portfolio-cms` repo
3. Set **Root Directory** to `client/`
4. Add environment variables:

```
NEXT_PUBLIC_API_URL  = /api
API_URL              = https://portfolio-cms-api.onrender.com/api
BACKEND_URL          = https://portfolio-cms-api.onrender.com
```

5. Click **Deploy** — Vercel builds and deploys automatically

6. **Update `client/vercel.json`** with your Render URL:
```json
{
  "rewrites": [{
    "source": "/api/:path*",
    "destination": "https://portfolio-cms-api.onrender.com/api/:path*"
  }]
}
```

7. Also update `CLIENT_URL` in Render to your Vercel URL, then redeploy the backend.

### Step 4 — Verify

```bash
curl https://portfolio-cms-api.onrender.com/api/health
# {"status":"ok","timestamp":"..."}

curl https://your-app.vercel.app/api/health
# Same response (through Vercel proxy)
```

---

## MFA Architecture

The authentication system is directly integrated from the [SecureVault MFA project](https://github.com/kveeresh288/SecureVault-MFA):

```
Login flow (same as MFA project):

  Step 1: POST /api/auth/login
          → validates email + password
          → if mfaEnabled + channel=email:
               generates 6-digit OTP
               hashes with bcrypt (10 rounds)
               stores in OtpSession (TTL: 5 min)
               sends via Gmail SMTP
               returns { requiresMfa: true, mfaChannel: 'email', sessionToken }
          → if mfaEnabled + channel=totp:
               returns { requiresMfa: true, mfaChannel: 'totp', preAuthToken (5-min JWT) }
          → if !mfaEnabled:
               issues full JWT cookie directly

  Step 2a: POST /api/auth/verify-email-otp { sessionToken, otp }
           → find OtpSession by token
           → bcrypt.compare(otp, session.otpHash)
           → max 5 attempts (brute-force protection)
           → on success: issue 7-day JWT cookie, mark session verified

  Step 2b: POST /api/auth/verify-totp { preAuthToken, totpCode }
           → verify preAuthToken signature + preAuth flag
           → otplib.verify({ token: totpCode, secret: user.mfaSecret })
           → on success: issue 7-day JWT cookie

Models:
  User        → email, password (bcrypt), mfaChannel, isMfaEnabled, mfaSecret (select:false)
  OtpSession  → sessionToken (indexed), userId, otpHash, channel, expiresAt (TTL index)
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Step 1: password check |
| POST | `/api/auth/verify-email-otp` | — | Step 2a: verify email OTP |
| POST | `/api/auth/verify-totp` | — | Step 2b: verify TOTP code |
| GET | `/api/auth/me` | ✓ | Current user info |
| POST | `/api/auth/enable-email-mfa` | ✓ | Enable email OTP |
| GET | `/api/auth/setup-totp` | ✓ | Generate TOTP QR code |
| POST | `/api/auth/confirm-totp` | ✓ | Confirm TOTP setup |
| POST | `/api/auth/disable-mfa` | ✓ | Disable MFA (recovery) |
| POST | `/api/auth/logout` | ✓ | Clear session cookie |
| GET | `/api/profile` | — | Get site content |
| PUT | `/api/profile` | ✓ | Update site content (partial) |
| GET | `/api/projects` | — | List all projects |
| POST | `/api/projects` | ✓ | Create project |
| PUT | `/api/projects/:id` | ✓ | Update project |
| DELETE | `/api/projects/:id` | ✓ | Delete project |
| GET | `/api/skills` | — | List all skills |
| POST | `/api/skills` | ✓ | Create skill |
| PUT | `/api/skills/:id` | ✓ | Update skill |
| DELETE | `/api/skills/:id` | ✓ | Delete skill |
| POST | `/api/contact` | — | Send contact email (5/hr rate limit) |
| GET | `/api/health` | — | Health check |

---

## Scripts

```bash
# Server
npm run dev          # Start with ts-node-dev (hot reload)
npm run build        # Compile TypeScript → dist/
npm start            # Run compiled dist/
npm run seed         # Create admin user + sample data
npm run reset-totp   # Disable MFA for admin (recovery)

# Client
npm run dev          # Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Serve production build
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✓ | `development` or `production` |
| `PORT` | ✓ | Server port (5001 local, 10000 on Render) |
| `MONGO_URI` | ✓ | MongoDB connection string |
| `JWT_SECRET` | ✓ | Min 32-char random string |
| `CLIENT_URL` | ✓ | Frontend origin (for CORS) |
| `ADMIN_EMAIL` | ✓ | Used by seed script |
| `ADMIN_PASSWORD` | ✓ | Used by seed script |
| `GMAIL_USER` | Recommended | Gmail address for email OTP |
| `GMAIL_APP_PASSWORD` | Recommended | 16-char Gmail App Password |

### Client (`client/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Browser API base — use `/api` (proxied) in all envs |
| `API_URL` | Server Component direct URL (`http://localhost:5001/api` locally) |
| `BACKEND_URL` | Used by `next.config.js` rewrites target |

---

## Related Projects

- [SecureVault MFA](https://github.com/kveeresh288/SecureVault-MFA) — standalone MFA system with Email OTP, TOTP, and WebAuthn Passkeys
- [ApnaCollege-DSA-Notes](https://github.com/kveeresh288/ApnaCollege-DSA-Notes) — DSA notes from Apna College Java course
- [Computer-Science](https://github.com/kveeresh288/Computer-Science) — CS fundamentals from Algorithms365

---

## Author

**K Veeresh** — CSE @ AIET 2026 · Data Engineer Intern at MyVoteLabs

- GitHub: [@kveeresh288](https://github.com/kveeresh288)
- LinkedIn: [veeresh-k-41107b25b](https://www.linkedin.com/in/veeresh-k-41107b25b/)
- Email: kveeresh288@gmail.com
