# Akhil Bhartiya Kushwaha Mahasabha — Community Platform

A full-stack **community management** web application for **Akhil Bhartiya Kushwaha Mahasabha (ABKM)**. It supports public marketing pages, **user accounts**, **membership** (free vs paid), a **members directory**, **job listings** (paid members), **matrimony listings** with an optional **marriage-portal subscription**, **events** (CRUD via admin + REST API), a **dynamic gallery** and **site CMS**, **Razorpay** payments, and **email receipts** via Nodemailer.

Built as a single **Next.js** application (App Router) with **MongoDB** and **JWT** session cookies.

---

## Features

- **User authentication** — Register, login, JWT cookies (`auth_token`), protected member areas  
- **Membership** — Pending / active states; join flow and payment for full membership  
- **Marriage portal** — Subscription (₹500) for eligible users; Razorpay + verification  
- **Job portal** — Post and browse jobs/profiles; **active paid members** only (UI + API gated)  
- **Members directory** — Search and filters; visibility controls  
- **Events** — Admin CRUD; public JSON via `/api/events` (extend with a public events page as needed)  
- **Gallery** — Dynamic images from CMS (`/gallery`)  
- **Admin dashboard** — `/admin` — members, payments, events, site content (hero, CTA, leadership, homepage images, gallery items)  
- **Payments** — Membership + marriage subscription; **Payment** records in MongoDB  
- **Email receipts** — Nodemailer (SMTP) when configured  

---

## Access levels

| Role | Description |
|------|-------------|
| **Guest** | Public pages: home, about, gallery, marketing sections; cannot access job/matrimony/members portals without login where required |
| **Logged-in user** | Account + cookie; may have **pending** or non-active membership |
| **Paid member** | `membershipStatus: active` — job portal, directory, and other member-only routes |
| **Marriage subscriber** | User with **marriage subscription** active (after paid flow) — access to marriage-portal experiences as implemented |
| **Admin** | Separate **admin** account + `admin_token` cookie — `/admin` CMS, members, payments, events only |

> **Note:** Admin auth is **separate** from end-user auth (different cookie and login at `/admin/login`).

---

## Site map (high level)

| Area | Path |
|------|------|
| Home | `/` |
| About | `/who-we-are` |
| सेवाएं (nav anchor) | `/who-we-are#services` |
| Join / membership flow | `/join`, `/payment` |
| Login / register | `/login`, `/register` |
| Members portal | `/members` |
| Job portal | `/jobs`, `/jobs/post` |
| Matrimony | `/matrimony`, `/matrimony/post`, `/matrimony/profile/[id]` |
| Marriage profile (public slug) | `/marriage/profile/[id]` |
| Gallery | `/gallery` |
| Contact | Footer / homepage sections (e.g. `#contact` where linked) |
| Admin | `/admin`, `/admin/login`, `/admin/members`, `/admin/payments`, `/admin/events`, `/admin/content` |

---

## Architecture

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Next.js App Router (`app/`), Tailwind CSS |
| **Backend** | **Next.js Route Handlers** (`app/api/**`) — not a separate Express server |
| **Database** | MongoDB via **Mongoose** |
| **Auth** | **JWT** in **httpOnly** cookies — shared `JWT_SECRET` for user + admin tokens (separate cookies) |
| **Edge gate** | `proxy.ts` — auth redirects for protected prefixes (jobs, matrimony, members, admin, etc.) |
| **Email** | **Nodemailer** + SMTP env vars |
| **Payments** | **Razorpay** (orders + verify); amounts validated server-side |

---

## Main database models (collections)

MongoDB collections are driven by Mongoose models under `lib/models/`:

| Model | Purpose |
|-------|---------|
| **User** | Accounts, membership status, marriage subscription flags, roles |
| **Member** | Directory entries (name, location, visibility, link to `userId`) |
| **Admin** | Admin users (email + password hash) |
| **Payment** | Razorpay orders/receipts — membership and marriage plan types |
| **Job** | Job seeker / job post listings |
| **Matrimony** | Matrimony profiles and gallery URLs |
| **Event** | Event records (title, description, date, location, image) |
| **SiteContent** | CMS documents keyed by `section` (`hero`, `cta`, `leadership`, `home_images`, `gallery`) |
| **PageContent** | Legacy page content (if still used by older APIs) |
| **SiteSettings** | Configurable site settings |

---

## Environment variables

Copy `.env.example` to `.env` or `.env.local` and fill values. Names **must** match the codebase.

**Database**

- `DATABASE_URL` — primary MongoDB URI (preferred)  
- `MONGODB_URI` — fallback if `DATABASE_URL` is unset  

**Auth**

- `JWT_SECRET` — required; signs user + admin JWTs  

**Email (Nodemailer)**

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`  

**Razorpay**

- `RAZORPAY_KEY_ID`  
- `RAZORPAY_SECRET`  

**App URLs (SSR / server fetches)**

- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, or `NEXT_PUBLIC_BASE_URL` — site origin (no trailing slash)  
- `NEXT_PUBLIC_APP_NAME` — optional display name  
- `VERCEL_URL` — set automatically on Vercel  

**Media uploads**

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`  

**Runtime**

- `NODE_ENV` — usually set by Next.js (`development` / `production`)  

> Legacy names like `MONGO_URI` / `EMAIL_HOST` are **not** read by this repo — use the variables above.

---

## Installation & setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd community

# 2. Install dependencies
npm install

# 3. Environment
cp .env.example .env.local
# Edit .env.local — at minimum: DATABASE_URL or MONGODB_URI, JWT_SECRET

# 4. Seed admin (optional)
npx tsx scripts/seed-admin.ts

# 5. Development
npm run dev
# App: http://localhost:3000

# 6. Production build
npm run build
npm start
```

There is **no separate** `npm run server` — API lives inside Next.js.

---

## Admin panel

| Section | Function |
|---------|----------|
| **Dashboard** | Member counts, active members, payment totals, recent transactions |
| **Members** | Directory-linked users — approve / reject / remove from directory, view details |
| **Payments** | Filter by plan type and date; tabular payment history |
| **Events** | Create, edit, delete events (title, description, date, location, image URL) |
| **Content** | Site-wide CMS sections (see below) |

Login: **`/admin/login`** (admin credentials only).

---

## Dynamic CMS (site content)

Admin **Content management** saves merged JSON-like payloads into **`SiteContent`** (`section` + `data`):

- **Hero** — heading, subheading, button text, background image (upload to Cloudinary supported)  
- **CTA** — carousel slides (image, heading, button text)  
- **Leadership** — cards (name, role, image)  
- **Services** — title + list of descriptions  
- **Homepage images** — URL list (admin only; not rendered on home by default in current UI)  
- **Gallery** — items with `imageUrl`, optional `title`, optional `category` / `albumId` for future use  

Public read: **`GET /api/site-content`**. Admin write: **`PUT /api/admin/site-content`** (authenticated).

---

## Payment system

- **Membership** — User completes join flow and pays via Razorpay; server verifies amount and updates **User** / **Payment** records; receipt email when SMTP is configured  
- **Marriage subscription** — **₹500** (`50_000` paise) — `POST /api/marriage/subscribe` → Razorpay → `POST /api/marriage/verify`; updates user marriage subscription state and records payment  
- **Receipts** — Server-side receipt data; **Nodemailer** sends confirmation when SMTP env vars are valid  

---

## Security

- **JWT** in **httpOnly** cookies; **secure** flag in production  
- **Role / status checks** — membership status for jobs; admin routes require admin JWT  
- **proxy.ts** — redirects unauthenticated users away from protected path prefixes  
- **Server-side validation** on API routes (payments, forms, uploads)  
- **Admin uploads** — Cloudinary credentials required; admin auth enforced on upload routes  

---

## Future improvements

- Admin analytics dashboard  
- Marriage request / matching workflow beyond listings  
- Job portal: employer contact / outreach analytics (optional)  
- Gallery categories / albums in UI (data fields partially ready)  
- Subscription expiry automation and reminders  
- Public-facing events calendar page consuming `/api/events`  

---

## Project structure (this repo)

This is a **single Next.js app** (no separate `/client` + `/server` folders):

```
community/
├── app/                    # App Router: pages, layouts, API route handlers
│   ├── api/                # REST-style endpoints (auth, payment, members, CMS, …)
│   ├── admin/              # Admin UI routes
│   ├── gallery/
│   ├── jobs/
│   ├── matrimony/
│   └── …
├── components/             # Shared React components (layout, admin clients, payment UI)
├── lib/                    # db, auth, models, helpers, email, Cloudinary
├── proxy.ts                # Edge auth gate (protected routes)
├── public/                 # Static assets — see docs/assets/images.md
├── scripts/                # seed-admin.ts, seed-member.ts
├── styles/                 # Theme / Tailwind-related CSS
└── docs/                   # Additional documentation
```

---

## Image assets

All images under **`/public/images`** should follow the structure documented in **[docs/assets/images.md](docs/assets/images.md)**.

---

## Author & license

**Author:** Project maintainers / ABKM development team  

**License:** Specify your license here (e.g. MIT, proprietary) — *not set in this repository by default.*
