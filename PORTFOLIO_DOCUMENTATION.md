# Portfolio CMS — Complete Technical Documentation

**Author:** K Veeresh  
**Live URL:** https://client-lilac-zeta-41.vercel.app  
**Admin Panel:** https://client-lilac-zeta-41.vercel.app/admin  
**GitHub:** https://github.com/kveeresh288/portfolio-cms  

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [How the Public Portfolio Works](#4-how-the-public-portfolio-works)
5. [How the Admin Panel Works](#5-how-the-admin-panel-works)
6. [Authentication & MFA Deep Dive](#6-authentication--mfa-deep-dive)
7. [Database Design](#7-database-design)
8. [API Reference](#8-api-reference)
9. [Deployment Infrastructure](#9-deployment-infrastructure)
10. [Data Flow Diagrams](#10-data-flow-diagrams)
11. [Security Model](#11-security-model)
12. [How to Run Locally](#12-how-to-run-locally)

---

## 1. What Is This Project?

This is a **full-stack Portfolio & Content Management System (CMS)** built for K Veeresh. It has two distinct faces:

| Face | URL | Who Uses It |
|------|-----|-------------|
| **Public Portfolio** | `/` | Anyone on the internet — recruiters, collaborators |
| **Admin Panel** | `/admin` | Only K Veeresh — to manage all content |

The key idea: **every word, project, and skill on the public site can be edited from the admin panel** — no code changes needed. When the admin saves something, the public site updates automatically.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Free Tier)                    │
│                                                          │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │   Next.js Frontend   │  │  Next.js API Routes     │  │
│  │                      │  │  (Route Handlers)       │  │
│  │  • Public Portfolio  │  │                         │  │
│  │  • Admin Dashboard   │  │  • /api/auth/*          │  │
│  │  • React Components  │  │  • /api/projects/*      │  │
│  │  • Framer Motion     │  │  • /api/skills/*        │  │
│  │  • Tailwind CSS      │  │  • /api/profile         │  │
│  │                      │  │  • /api/contact         │  │
│  └──────────────────────┘  └──────────┬──────────────┘  │
│                                        │                  │
└────────────────────────────────────────┼──────────────────┘
                                         │ Mongoose ODM
                                         ▼
                         ┌───────────────────────────────┐
                         │    MongoDB Atlas (Free M0)    │
                         │   portfolio.yqdujvb.mongodb   │
                         │                               │
                         │  Collections:                 │
                         │  • users                      │
                         │  • projects                   │
                         │  • skills                     │
                         │  • siteprofiles               │
                         │  • otpsessions                │
                         └───────────────────────────────┘

                    ┌─────────────────────────┐
                    │   Resend (Email API)    │
                    │   OTP email delivery    │
                    │   100 free emails/day   │
                    └─────────────────────────┘
```

**Key architectural decision:** There is no separate Express server. Everything — both the frontend and the backend API — lives inside the **same Next.js application** deployed on Vercel. This is called a **monolithic serverless** architecture.

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2 (App Router) | React framework, SSR, ISR, file-based routing |
| **TypeScript** | 5.x | Type safety across the codebase |
| **Tailwind CSS** | 3.x | Utility-first CSS, dark mode, responsive design |
| **Framer Motion** | 11.x | Scroll animations, fade-ins, role ticker |
| **Lucide React** | 0.378 | Icons (lock, user, trash, pencil, etc.) |
| **React Hot Toast** | 2.x | Notification toasts (success/error popups) |

### Backend (inside Next.js API Routes)
| Technology | Purpose |
|-----------|---------|
| **Mongoose** | MongoDB ODM — schema definitions, queries, hooks |
| **bcryptjs** | Hashing passwords and OTP codes |
| **jsonwebtoken** | Creating and verifying JWT tokens |
| **otplib** | TOTP generation and QR code for Authenticator app |
| **qrcode** | Generating the QR code image (base64 data URL) |
| **Resend** | Sending OTP emails reliably (HTTPS API, not SMTP) |

### Infrastructure
| Service | Free Tier | Purpose |
|---------|-----------|---------|
| **Vercel** | Hobby (free) | Hosts the entire Next.js app |
| **MongoDB Atlas** | M0 (free, 512MB) | Database |
| **Resend** | 100 emails/day | Email OTP delivery |
| **GitHub** | Free | Source code, triggers Vercel auto-deploy |

---

## 4. How the Public Portfolio Works

### Page Load Flow

When someone visits `https://client-lilac-zeta-41.vercel.app`:

```
Browser requests /
        │
        ▼
Vercel runs app/page.tsx (Server Component)
        │
        ├─── connectDB() → connects to MongoDB Atlas
        │
        ├─── Project.find() → fetches your 4 projects
        ├─── Skill.find()   → fetches your 12 skills
        └─── SiteProfile.findOne() → fetches Hero/About/Contact/Social
                │
                ▼
        HTML is generated on the server (Server-Side Rendering)
        with YOUR data already baked in
                │
                ▼
        Browser receives complete HTML — no loading spinner
        Framer Motion animations play as sections scroll into view
```

**ISR (Incremental Static Regeneration):** The page is cached for 60 seconds. After 60 seconds, the next request triggers a background rebuild. This means the site is always fast AND always up-to-date.

### Sections and What Powers Them

#### Hero Section
- Name, badge text, animated role ticker, subtitle → pulled from `SiteProfile.hero` in MongoDB
- GitHub/LinkedIn links → pulled from `SiteProfile.social`
- Animated grid background and floating orbs → pure CSS + Framer Motion

#### About Section
- Bio paragraphs → `SiteProfile.about.bio` (array of strings)
- Work location → `SiteProfile.contact.workLocation`
- **MyVoteLabs** → clickable link to `https://myvotelabs.com`
- Google Maps link → `SiteProfile.contact.workMapsUrl`
- College → `SiteProfile.contact.college`

#### Skills Section
- All skills → fetched from `skills` collection in MongoDB
- Grouped by category (frontend, backend, database, devops, tools)
- Proficiency bars → animated with Framer Motion on scroll-into-view
- Auto-scrolling marquee → CSS `animation: marquee 30s linear infinite`

#### Projects Section
- All projects → fetched from `projects` collection in MongoDB
- Featured projects appear in the top 2-column row
- Tags, GitHub link, Live Demo link → stored in each project document
- Star (★) indicator for featured projects

#### Resources Section (DSA Notes)
- Hardcoded links to your GitHub and Google Drive DSA notes
- 3 cards: Algorithms365 CS Notes, Apna College GitHub, Apna College Drive

#### Contact Section
- Email, phone, work location → from `SiteProfile.contact`
- Form submission → sends to `/api/contact` → Resend API → email to your Gmail

### Fallback Mechanism
If MongoDB is unreachable (e.g., Atlas is down), the page falls back to `src/data/mock.ts` which contains your real info hardcoded. The site **never shows a blank page**.

---

## 5. How the Admin Panel Works

### Access Control
The admin panel at `/admin` is protected at two levels:

**Level 1 — Next.js Middleware** (`src/middleware.ts`)
```
Request to /admin/*
        │
        ▼
Middleware reads the 'token' cookie
        │
        ├─ Cookie missing → redirect to /admin/login
        └─ Cookie present → allow request through
```

**Level 2 — API Route Guards** (`src/lib/serverAuth.ts`)
Every protected API call checks the JWT token:
```
API request with Cookie: token=xxx
        │
        ▼
requireAuth() reads the cookie
jwt.verify(token, JWT_SECRET)
        │
        ├─ Invalid/expired → 401 Unauthorized
        └─ Valid → extract { id, email } → proceed
```

### Admin Dashboard Tabs

#### Overview Tab
Shows live counts: **Projects**, **Featured**, **Skills**
- These numbers come from `ProjectTable` and `SkillTable` components
- Both components are always mounted (hidden with CSS when not active)
- They call their APIs on page load and report counts via `onCountChange` callbacks
- The overview always shows correct numbers immediately (no extra fetch needed)

#### Projects Tab (`ProjectTable` component)
- Fetches `GET /api/projects` on mount → shows all projects in a table
- **Search** — client-side filter on title and tags (no extra API call)
- **Featured toggle** — inline button → `PUT /api/projects/:id { featured: !current }` → updates instantly
- **Edit** → opens `ProjectModal` pre-filled with project data → `PUT /api/projects/:id`
- **Delete** → `DELETE /api/projects/:id` → per-row spinner while deleting
- **New Project** → opens blank `ProjectModal` → `POST /api/projects`
- **Refresh** → re-fetches from MongoDB

#### Skills Tab (`SkillTable` component)
- Fetches `GET /api/skills` on mount
- **Add Skill** → inline form (name, category dropdown, icon name, proficiency slider)
- **Delete** → `DELETE /api/skills/:id`
- Proficiency shown as animated bar

#### Profile Tab (`ProfileEditor` component)
- Fetches `GET /api/profile` on mount
- Split into 4 sub-sections, each saves independently:
  - **Hero** → name, badge, roles (one per line), subtitle
  - **About** → bio paragraphs (separate with blank line)
  - **Contact** → email, phone, work location, Maps URL, college
  - **Social** → GitHub, LinkedIn, Twitter, resume PDF URL
- Saves via `PUT /api/profile` with partial updates (deep merge)
- Changes reflected on the public site within 60 seconds (ISR cache)

### MFA Management (Sidebar)

The sidebar shows your current 2FA status and lets you:
- **Enable Email OTP** → one click, no setup needed (sends code to your Gmail)
- **Setup Authenticator** → generates QR code → scan with Google Authenticator or Authy
- **Switch between** Email OTP and TOTP anytime
- **Disable MFA** → emergency recovery option

---

## 6. Authentication & MFA Deep Dive

### Why JWT + HttpOnly Cookies?

The admin session uses a JWT (JSON Web Token) stored in an **HttpOnly cookie**. This means:
- JavaScript on the page **cannot read the cookie** (XSS protection)
- The cookie is sent **automatically** with every request to `/api/*`
- No manual `Authorization: Bearer` headers needed in the frontend

### Login Flow — No MFA

```
Admin enters email + password
        │
        ▼
POST /api/auth/login
        │
        ├─ Find user in MongoDB by email
        ├─ bcrypt.compare(entered_password, stored_hash)
        │
        ├─ isMfaEnabled === false?
        │       │
        │       ▼
        │   jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' })
        │   Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Path=/
        │   Response: { success: true, data: { requiresMfa: false } }
        │       │
        │       ▼
        │   Browser stores cookie
        │   Admin dashboard loads
```

### Login Flow — Email OTP (2FA)

```
Admin enters email + password
        │
        ▼
POST /api/auth/login
        │
        ├─ Credentials verified ✓
        ├─ isMfaEnabled === true, mfaChannel === 'email'
        │
        ├─ Generate 6-digit OTP: crypto.randomInt(100000, 999999)
        ├─ Hash OTP: bcrypt.hash(otp, 10)  ← stored hashed, never plaintext
        ├─ Create OtpSession in MongoDB:
        │     { sessionToken, userId, otpHash, expiresAt: now + 5min }
        │
        ├─ Send email via Resend API:
        │     FROM: onboarding@resend.dev
        │     TO:   kveeresh288@gmail.com
        │     BODY: styled HTML with the 6-digit code
        │
        └─ Response: { requiresMfa: true, mfaChannel: 'email', sessionToken }
                │
                ▼
        Admin sees OTP input screen
        Enters 6-digit code from Gmail
                │
                ▼
        POST /api/auth/verify-email-otp { sessionToken, otp }
                │
                ├─ Find OtpSession by sessionToken
                ├─ Check: not expired, not already verified, attempts < 5
                ├─ bcrypt.compare(entered_otp, session.otpHash)
                │
                ├─ Invalid → increment attempts counter, return error
                │            (max 5 attempts → locked out)
                │
                └─ Valid → mark session.verified = true
                           jwt.sign({ id, email }, JWT_SECRET, '7d')
                           Set-Cookie: token=<jwt>; HttpOnly
                           Response: { success: true }
                                │
                                ▼
                           Admin dashboard loads
```

### Login Flow — TOTP Authenticator (2FA)

```
Admin enters email + password
        │
        ▼
POST /api/auth/login
        │
        ├─ Credentials verified ✓
        ├─ isMfaEnabled === true, mfaChannel === 'totp'
        │
        ├─ NO email sent (admin reads code from Authenticator app)
        │
        └─ jwt.sign({ id, email, preAuth: true }, JWT_SECRET, '5m')
           Response: { requiresMfa: true, mfaChannel: 'totp', preAuthToken }
                │
                ▼
        Admin sees Authenticator code input
        Opens Google Authenticator / Authy
        Enters current 6-digit code
                │
                ▼
        POST /api/auth/verify-totp { preAuthToken, totpCode }
                │
                ├─ Verify preAuthToken signature + preAuth flag
                ├─ Find user, get mfaSecret from MongoDB (+select)
                ├─ otplib.verify({ token: totpCode, secret: mfaSecret })
                │     ← TOTP uses time-based algorithm (RFC 6238)
                │       code changes every 30 seconds
                │       window: 1 → accepts 1 step before/after for clock skew
                │
                └─ Valid → issue full JWT cookie → dashboard loads
```

### TOTP Setup Flow

```
Admin clicks "Setup Authenticator"
        │
        ▼
GET /api/auth/setup-totp  (protected — needs JWT cookie)
        │
        ├─ generateSecret() → 32-char base32 secret
        ├─ generateURI({ secret, label: email, issuer: 'Portfolio CMS' })
        │     → otpauth://totp/Portfolio%20CMS:kveeresh288@gmail.com?secret=...
        ├─ QRCode.toDataURL(otpauthUrl) → base64 PNG image
        │
        ├─ Save secret to user.mfaSecret in MongoDB
        └─ Response: { data: { qrCode: 'data:image/png;base64,...', secret } }
                │
                ▼
        Admin dashboard shows QR code
        Admin scans with Google Authenticator
        Admin enters 6-digit code to confirm
                │
                ▼
        POST /api/auth/confirm-totp { totpCode }
                │
                ├─ Verify the code against the stored secret
                ├─ user.mfaChannel = 'totp'
                ├─ user.isMfaEnabled = true
                └─ Save → TOTP is now active for all future logins
```

---

## 7. Database Design

All data lives in **MongoDB Atlas** (cluster: `portfolio.yqdujvb.mongodb.net`, database: `portfolio_cms`).

### Collection: `users`

```javascript
{
  _id: ObjectId,
  email: "kveeresh288@gmail.com",   // unique, lowercase
  password: "$2b$12$...",            // bcrypt hash (12 rounds), NEVER plaintext
  mfaChannel: "email" | "totp",     // which 2FA method is active
  isMfaEnabled: false,              // true once 2FA is set up
  mfaSecret: "KJIC4Y3B...",         // base32 TOTP secret (select: false — hidden from queries)
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Security notes:**
- `mfaSecret` has `select: false` — it's never returned in API responses unless explicitly requested
- Password is hashed with bcrypt (12 salt rounds = ~400ms to hash, extremely hard to brute-force)

### Collection: `otpsessions`

```javascript
{
  _id: ObjectId,
  sessionToken: "a7e5d0f4...",        // 32-byte random hex, given to client
  userId: ObjectId,                    // references users._id
  otpHash: "$2b$10$...",              // bcrypt hash of the 6-digit OTP
  channel: "email" | "totp",
  expiresAt: ISODate,                 // 5 minutes from creation
  attempts: 0,                        // incremented on wrong guess (max 5)
  verified: false,                    // true once used — can't be reused
  createdAt: ISODate
}
```

**TTL Index:** MongoDB automatically deletes expired sessions after `expiresAt` has passed. No cron job needed.

### Collection: `siteprofiles`

```javascript
{
  _id: ObjectId,
  hero: {
    name: "K Veeresh",
    badge: "Open to full-time SWE / DE roles from June 2026",
    roles: ["Data Engineer Intern", "Full-Stack Developer", ...],
    subtitle: "CSE student at AIET (2026)..."
  },
  about: {
    bio: [
      "Computer Science Engineering student...",
      "Currently working as a Software Engineer Intern at MyVoteLabs..."
    ]
  },
  contact: {
    email: "kveeresh288@gmail.com",
    phone: "+91 76192 80422",
    workLocation: "HSR Layout, Bangalore",
    workMapsUrl: "https://maps.app.goo.gl/...",
    college: "AIET · Moodbidri, Mangalore"
  },
  social: {
    github: "https://github.com/kveeresh288",
    linkedin: "https://www.linkedin.com/in/veeresh-k-41107b25b/",
    twitter: "",
    resume: ""
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Singleton:** Only one document ever exists. `GET /api/profile` does `findOne()` and creates it with defaults if missing.

### Collection: `projects`

```javascript
{
  _id: ObjectId,
  title: "SecureVault MFA",
  description: "Production-ready Multi-Factor Authentication...",
  imageUrl: "https://images.unsplash.com/photo-...",
  githubUrl: "https://github.com/kveeresh288/SecureVault-MFA",
  liveUrl: "",
  tags: ["Node.js", "Express", "MongoDB", "React", "WebAuthn"],
  featured: true,                  // appears in top row on portfolio
  order: 0,                        // sort order (lower = first)
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Collection: `skills`

```javascript
{
  _id: ObjectId,
  name: "React",
  category: "frontend",            // frontend|backend|database|devops|tools|other
  iconName: "React",               // display label for the icon
  proficiency: 88,                 // 1–100, shown as % bar
  order: 0
}
```

---

## 8. API Reference

All API routes live at `https://client-lilac-zeta-41.vercel.app/api/...`

### Authentication Routes

| Method | Path | Auth | What It Does |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | ❌ Public | Step 1: verify password. Returns `requiresMfa` flag. If MFA is on, sends OTP email or returns preAuthToken for TOTP |
| `POST` | `/api/auth/verify-email-otp` | ❌ Public | Step 2a: verify 6-digit email OTP. Sets JWT cookie on success |
| `POST` | `/api/auth/verify-totp` | ❌ Public | Step 2b: verify TOTP code from Authenticator app. Sets JWT cookie |
| `GET`  | `/api/auth/me` | ✅ JWT | Returns current user info: `{ email, mfaChannel, isMfaEnabled }` |
| `POST` | `/api/auth/logout` | ✅ JWT | Clears the JWT cookie |
| `POST` | `/api/auth/enable-email-mfa` | ✅ JWT | Enables email OTP (no setup needed — uses registered email) |
| `GET`  | `/api/auth/setup-totp` | ✅ JWT | Generates a TOTP secret + QR code image |
| `POST` | `/api/auth/confirm-totp` | ✅ JWT | Confirms TOTP setup by verifying first code, enables TOTP |
| `POST` | `/api/auth/disable-mfa` | ✅ JWT | Disables all MFA (emergency recovery) |

### Content Routes

| Method | Path | Auth | What It Does |
|--------|------|------|-------------|
| `GET`  | `/api/projects` | ❌ Public | List all projects, sorted by featured + order |
| `POST` | `/api/projects` | ✅ JWT | Create a new project |
| `PUT`  | `/api/projects/:id` | ✅ JWT | Update a project (field whitelist prevents mass-assignment) |
| `DELETE` | `/api/projects/:id` | ✅ JWT | Delete a project |
| `GET`  | `/api/skills` | ❌ Public | List all skills, sorted by category + order |
| `POST` | `/api/skills` | ✅ JWT | Create a new skill |
| `PUT`  | `/api/skills/:id` | ✅ JWT | Update a skill |
| `DELETE` | `/api/skills/:id` | ✅ JWT | Delete a skill |
| `GET`  | `/api/profile` | ❌ Public | Get site profile (hero/about/contact/social). Creates default if missing |
| `PUT`  | `/api/profile` | ✅ JWT | Update profile. Accepts partial updates — only sends changed sections |
| `POST` | `/api/contact` | ❌ Public | Send contact form email via Resend. Rate limited: 5 per hour per IP |
| `GET`  | `/api/health` | ❌ Public | Health check: `{ status: "ok", timestamp }` |

### Request / Response Format

**Standard success response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Standard error response:**
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

---

## 9. Deployment Infrastructure

### Vercel (Frontend + API)

**How it works:**
- Every `git push` to the `main` branch on GitHub automatically triggers a new Vercel build
- Vercel builds the Next.js app (`npm run build`) using 2 cores, 8GB RAM
- The built app is deployed as serverless functions (each API route = one Lambda function)
- Static pages (cached HTML) are served from Vercel's CDN edge network globally

**Environment Variables set in Vercel:**
```
MONGODB_URI        = mongodb+srv://portfoliouser:...@portfolio.yqdujvb.mongodb.net/portfolio_cms
JWT_SECRET         = kvportfolio2026supersecretjwtkey32chars!
ADMIN_EMAIL        = kveeresh288@gmail.com
ADMIN_PASSWORD     = Admin@Portfolio123!
RESEND_API_KEY     = re_NaBWMsUx_...
GMAIL_USER         = 4al22cs068@aiet.org.in       (legacy, kept for fallback)
GMAIL_APP_PASSWORD = fzhtwktomojxqltp              (legacy, kept for fallback)
NODE_ENV           = production
NEXT_PUBLIC_API_URL = /api
```

**Build optimization:**
- TypeScript checking: `ignoreBuildErrors: true` (runs locally, skipped on Vercel to avoid OOM)
- Memory: `NODE_OPTIONS='--max-old-space-size=3072'` caps Node at 3GB during build

### MongoDB Atlas (Database)

- **Cluster:** `portfolio` on AWS `us-east-1`
- **Tier:** M0 Free (512MB storage, shared CPU/RAM)
- **Database:** `portfolio_cms`
- **User:** `portfoliouser` (readWriteAnyDatabase role)
- **Network:** 0.0.0.0/0 (all IPs allowed — required for Vercel Lambda which has dynamic IPs)

**Connection singleton pattern** (important for serverless):
```typescript
// src/lib/db.ts — prevents opening 1000 connections per Lambda invocation
declare global {
  var _mongoCache: { conn: mongoose | null; promise: Promise<mongoose> | null }
}
// If a warm Lambda already has a connection → reuse it
// If cold start → create new connection
if (!global._mongoCache) global._mongoCache = { conn: null, promise: null }
```

### Resend (Email Delivery)

- **Why Resend instead of Gmail SMTP?** AWS Lambda (which Vercel uses) silently drops SMTP connections on port 587. Emails never arrive. Resend uses HTTPS API — always works from Lambda.
- **Sender:** `onboarding@resend.dev` (Resend's verified domain — no spam filtering)
- **Free plan:** 100 emails/day, 3,000/month — more than enough for an admin panel

### GitHub (Source Control)

- Repository: `kveeresh288/portfolio-cms`
- Every push to `main` → Vercel auto-deploys
- Branch protection not set up (single developer)

---

## 10. Data Flow Diagrams

### Public Site — User Visits Portfolio

```
User's Browser
     │
     │  GET https://client-lilac-zeta-41.vercel.app/
     ▼
Vercel Edge (CDN)
     │  Cache miss → runs Server Component
     ▼
app/page.tsx (Server Component, runs on Vercel Lambda)
     │
     ├── connectDB() ──────────────────► MongoDB Atlas
     │                                       │
     ├── Project.find()                 Returns projects[]
     ├── Skill.find()                   Returns skills[]
     └── SiteProfile.findOne()          Returns profile{}
                │
                ▼
     HTML generated with real data
     Sent to browser (≈50ms from Lambda)
                │
                ▼
     Browser renders HTML
     React hydrates (makes interactive)
     Framer Motion plays entrance animations
     Page is fully interactive in <2 seconds
```

### Admin — Edit a Project

```
Admin clicks "Edit" on a project
        │
        ▼
ProjectModal opens with current data pre-filled
        │
Admin changes title, tags, etc. → clicks "Update Project"
        │
        ▼
ProjectTable.handleSave()
        │
PUT /api/projects/:id { title, tags, ... }
        │
        ├── Cookie: token=<jwt> sent automatically
        ├── requireAuth() verifies JWT → extracts { id, email }
        ├── pickAllowed(body) → strips any fields not in whitelist
        ├── Project.findByIdAndUpdate(id, data, { new: true })
        └── Returns updated project
                │
                ▼
        ProjectTable updates local state (no page reload)
        Toast: "Project updated" ✅
        Public site reflects change within 60 seconds (ISR)
```

### Admin — Email OTP Login

```
Admin → enters credentials → POST /api/auth/login
        │
        ├── User found, password matches
        ├── isMfaEnabled: true, mfaChannel: 'email'
        │
        ├── crypto.randomInt(100000, 999999) → "847291"
        ├── bcrypt.hash("847291", 10) → "$2b$10$..."
        ├── OtpSession.create({ sessionToken, otpHash, expiresAt })
        │
        ├── Resend.emails.send(to: admin@gmail.com, body: "847291")
        │         └── Resend HTTPS API → Gmail inbox (< 2 seconds)
        │
        └── Response: { sessionToken: "a7e5d0f4..." }

Admin opens Gmail → sees "847291" → enters it → POST /api/auth/verify-email-otp
        │
        ├── OtpSession found by sessionToken
        ├── bcrypt.compare("847291", session.otpHash) → true ✓
        ├── session.verified = true (can't be reused)
        │
        ├── jwt.sign({ id, email }, SECRET, '7d')
        └── Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Lax
                │
                ▼
        Admin dashboard loads ✅
```

---

## 11. Security Model

### What Protects the Admin Panel

| Threat | Protection |
|--------|-----------|
| Password guessing | bcrypt (12 rounds) — 400ms per hash — brute-force impractical |
| Stolen password | MFA required — attacker also needs your phone/email |
| Session theft (XSS) | HttpOnly cookie — JavaScript can't read it |
| Cross-site request forgery | SameSite=Lax — browser won't send cookie cross-site |
| OTP reuse | `verified: true` flag — used OTPs are invalidated immediately |
| OTP brute-force | Max 5 attempts per session, then session is dead |
| OTP expiry | MongoDB TTL index auto-deletes sessions after 5 minutes |
| Mass-assignment | `pickAllowed()` in every write route — only whitelisted fields accepted |
| Data leakage | `mfaSecret` has `select: false` — never returned in queries |
| Payload flooding | Body size limited to 10KB |
| DDoS | Rate limiting: 5 contact emails/hour per IP |

### What Is NOT Implemented (Known Limitations)

- No CAPTCHA on login (could add reCAPTCHA v3)
- No account lockout after failed password attempts (only OTP attempts are limited)
- No audit log of admin actions
- JWT revocation not implemented (logout just clears cookie — old tokens valid until expiry)
- Single admin user only — no multi-user support

---

## 12. How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB running locally (`brew install mongodb-community && brew services start mongodb-community`)

### Setup

```bash
# Clone
git clone https://github.com/kveeresh288/portfolio-cms
cd portfolio-cms

# Install dependencies
cd client && npm install
```

### Environment Variables

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=/api
MONGODB_URI=mongodb://localhost:27017/portfolio_cms
JWT_SECRET=any-random-string-32-chars-minimum
ADMIN_EMAIL=kveeresh288@gmail.com
ADMIN_PASSWORD=Admin@Portfolio123!

# Optional — OTP prints to console if not set
RESEND_API_KEY=re_your_key_here
```

### Seed the Database

```bash
# From portfolio-cms/server/ (uses the separate Express server for seeding)
cd ../server && npm install
npm run seed    # creates admin user + sample data
```

### Run the Development Server

```bash
cd ../client
npm run dev
# Open http://localhost:3000
```

### Key Development URLs

| URL | What You See |
|-----|-------------|
| `http://localhost:3000` | Public portfolio |
| `http://localhost:3000/admin` | Admin dashboard |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:3000/api/health` | API health check |
| `http://localhost:3000/api/projects` | All projects (JSON) |

### Deploying Updates

```bash
git add -A
git commit -m "your change description"
git push origin main
# Vercel automatically detects the push and deploys in ~30 seconds
```

---

## Summary

```
┌─────────────────────────────────────────────────────┐
│           HOW IT ALL CONNECTS                        │
│                                                      │
│  Public User                                         │
│     │                                                │
│     │  visits https://client-lilac-zeta-41.vercel.app
│     ▼                                                │
│  Vercel CDN ──► Next.js Server Component             │
│                        │                             │
│                        ▼                             │
│              MongoDB Atlas (reads data)              │
│                        │                             │
│                        ▼                             │
│              Beautiful portfolio HTML                │
│              sent to user's browser                  │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  K Veeresh (Admin)                                   │
│     │                                                │
│     │  visits /admin/login                           │
│     │  enters password + OTP (from Gmail or app)     │
│     ▼                                                │
│  JWT cookie set ──► /admin dashboard unlocks         │
│                        │                             │
│                   Edit anything:                     │
│                   Projects, Skills,                  │
│                   Hero text, Contact info            │
│                        │                             │
│                        ▼                             │
│              MongoDB Atlas (writes data)             │
│                        │                             │
│                        ▼                             │
│              Public site updates in 60 seconds       │
└─────────────────────────────────────────────────────┘
```

---

*Document generated: May 2026 | K Veeresh Portfolio CMS v1.0*
