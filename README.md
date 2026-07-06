# PRATHASTU — Phase 1

Numerology + Vastu Shastra + Admin/Client dashboards + Billing + Appointments.
Astrology (full Vedic chart + dasha) lands in Phase 2.

Built with **Next.js 14 + Firebase**, deployable entirely on free tiers (Firebase Spark plan + Vercel Hobby plan).

---

## 1. Create your Firebase project (free)

1. Go to https://console.firebase.google.com → **Add project** → name it `prathastu` (or similar) → finish setup (Google Analytics optional, skip it).
2. In the left sidebar: **Build → Authentication** → click **Get started** → enable **Email/Password** sign-in method.
3. In the left sidebar: **Build → Firestore Database** → click **Create database** → start in **Production mode** → pick a region close to India (e.g. `asia-south1`).
4. In the left sidebar: **Project settings** (gear icon) → scroll to **Your apps** → click the **</> (Web)** icon → register an app called "prathastu-web" → copy the `firebaseConfig` values shown.

## 2. Configure the app locally

1. Unzip this project.
2. Copy `.env.local.example` to `.env.local`.
3. Paste the values you copied from Firebase into `.env.local`.
4. Install dependencies and run locally:
   ```
   npm install
   npm run dev
   ```
5. Open http://localhost:3000 — you'll be redirected to `/login`.

## 3. Create your admin account

Since there's no signup page yet (by design — you control who gets in), create your own admin login manually:

1. Firebase Console → **Authentication → Users → Add user** → enter your email + a password. Copy the **User UID** shown.
2. Firebase Console → **Firestore Database → Start collection** → collection ID: `users` → Document ID: paste the **User UID** from step 1 → add fields:
   - `role` (string) = `admin`
   - `email` (string) = your email
3. Now log in at `/login` with that email/password — you'll land on `/admin`.

Client portal logins are created automatically from the app itself (Client detail page → "Create Portal Login" button) — you don't need to repeat this manual step for clients.

## 4. Deploy the Firestore security rules

These rules are what keep client data private (a client can only ever see their own records; only you can see everyone's). Install the Firebase CLI once:

```
npm install -g firebase-tools
firebase login
firebase init firestore
```
When it asks, point it at the existing `firestore.rules` file in this project (don't let it overwrite yours), select your `prathastu` project, then run:

```
firebase deploy --only firestore:rules
```

## 5. Deploy the app (Vercel, free)

1. Push this project to a GitHub repository.
2. Go to https://vercel.com → **New Project** → import that GitHub repo.
3. In the Vercel project's **Environment Variables** settings, add the same six `NEXT_PUBLIC_FIREBASE_...` values from your `.env.local`.
4. Click **Deploy**. Vercel gives you a live URL (e.g. `prathastu.vercel.app`) — this is what you share with clients.
5. Optional: connect your own domain (e.g. `prathastu.com`) under Vercel's **Domains** tab — free, you just point your domain's DNS to Vercel.

## 6. Free tier limits to be aware of

- **Firebase Spark (free) plan**: 50K reads/day, 20K writes/day, 1GB stored — more than enough for a growing solo practice. You'll get a warning email long before hitting limits, and can upgrade to pay-as-you-go (Blaze) only if needed.
- **Vercel Hobby plan**: free for personal/small business projects, generous bandwidth — fine until you're at serious scale.
- No credit card is required to start either.

## 7. What's in Phase 1

- Admin dashboard (client list, add client, revenue/appointment overview)
- Per-client tabs: Numerology, Vastu Shastra, Billing, Appointments (Astrology tab is a placeholder for Phase 2)
- Numerology: Chaldean / Pythagorean / Vedic-Loshu, selectable per report run, with Name/Life Path/Birth/Soul Urge/Personality numbers, mobile number analysis, and Loshu Grid — each as its own labeled result
- Vastu: property profile + 12 standard site-visit case templates
- Billing: create invoices, mark paid, see outstanding totals
- Appointments: schedule, mark complete/cancelled
- Client portal: clients log in and see only what you've published to them

## 8. Known simplifications (fine for now, worth revisiting later)

- Client portal accounts are created directly from the browser using the Firebase client SDK. This works but briefly uses your admin session to create the account. For a cleaner flow later, move this into a Firebase Cloud Function using the Admin SDK.
- Report/report PDF export and WhatsApp/email delivery aren't wired up yet — reports currently display in-app only.
- No online payment collection yet (Razorpay integration is a good Phase 3 addition).
