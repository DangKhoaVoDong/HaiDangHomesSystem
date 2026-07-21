# Deploy Guide — HaiDang Homes System

## Architecture

```
Frontend (Next.js)    → Vercel
Backend (.NET 8 API)  → Render
Database (PostgreSQL) → NeonDB
Images / Files        → Cloudinary
Email                 → Resend
Payments              → PayOS
Caching (optional)    → Upstash Redis
```

---

## Prerequisites

Free accounts needed:

| Service | Purpose | Free Tier |
|---|---|---|
| [GitHub](https://github.com) | Code hosting + auto-deploy | Unlimited |
| [NeonDB](https://neon.tech) | PostgreSQL database | 0.5 GB, 3 branches |
| [Render](https://render.com) | Backend hosting | 7 days sleep after inactivity |
| [Vercel](https://vercel.com) | Frontend hosting | Unlimited deployments |
| [Cloudinary](https://cloudinary.com) | Image storage + CDN | 25 GB storage |
| [PayOS](https://payos.vn) | Payment gateway | Per-transaction fee |
| [Resend](https://resend.com) | Email sending | 3,000 emails/month |

---

## Step 1 — Push Code to GitHub

### 1.1 — Initialize Git (if not already)

Open terminal in `HaiDangHomesSystem` root folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/HaiDangHomesSystem.git
git push -u origin main
```

### 1.2 — .gitignore is already set up

The repo root `.gitignore` excludes `appsettings.Development.json` (secrets file). Only placeholders are committed.

---

## Step 2 — Set Up NeonDB (Database)

### 2.1 — Create Project

1. Go to [neon.tech](https://neon.tech) → **Sign Up** → **New Project**
2. Configure:
   - **Project Name**: `haidanghomes`
   - **Region**: `Singapore` (closest to Vietnam)
   - **Database Name**: `neondb`
   - **Pool Mode**: `Serverless` (recommended)
3. Click **Create Project**

### 2.2 — Get Connection String

1. In Neon dashboard, go to **Connection Details**
2. Copy the **Connection string** (it looks like this):

```
postgresql://USER:PASSWORD@ep-xxx-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Save this string — you'll add it to Render in Step 3.

---

## Step 3 — Set Up Cloudinary (Image Storage)

### 3.1 — Create Account

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. Choose **Developer** plan (free)
3. Copy the values from your **Dashboard**:

```
Cloud Name:  haqngbyw           ← from top-left corner
API Key:     338923538416556    ← from Account Details
API Secret: 7L1BUJ+ISniSQ...   ← from Account Details (click Show)
```

### 3.2 — Set Upload Preset

1. In Cloudinary Dashboard → **Settings** (gear icon) → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Signing Mode**: `Unsigned` (for client-side upload) OR `Signed` (recommended for security)
   - **Folder**: leave blank or set `haidanghomes`
5. Copy the **Preset name** (e.g., `haidanghomes_unsigned`)

> If using **Unsigned**, add `CLOUDINARY_UPLOAD_PRESET=haidanghomes_unsigned` to Vercel env vars later.

---

## Step 4 — Deploy Backend to Render

### 4.1 — Create Web Service

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo `HaiDangHomesSystem`
4. Configure as follows:

| Field | Value |
|---|---|
| **Name** | `haidanghomes-api` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Runtime** | `Docker` |
| **Root Directory** | (leave empty) |
| **Dockerfile Path** | `./Dockerfile` |
| **Build Command** | (leave empty) |
| **Start Command** | (leave empty) |
| **Plan** | Free |
| **Auto-Deploy** | Yes |

5. Click **Create Web Service**

> First deployment will start immediately — you'll add env vars next.

### 4.2 — Add Environment Variables

After the service is created, go to **Environment** tab and add each variable:

```
ASPNETCORE_ENVIRONMENT = Production
```

```
ConnectionStrings__DefaultConnection = postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

> **Replace** `USER:PASSWORD@HOST` with your actual NeonDB connection string from Step 2.

```
# JWT — Generate a strong secret:
# Run: openssl rand -base64 32
Jwt__Secret = YOUR_32+_CHARACTER_SECRET_KEY_HERE
Jwt__Issuer = HaiDangHomes
Jwt__Audience = HaiDangHomesAPI
Jwt__ExpiryInMinutes = 60
Jwt__RefreshTokenExpiryInDays = 7
```

```
# Cloudinary (from Step 3)
Cloudinary__CloudName = haqngbyw
Cloudinary__ApiKey = 338923538416556
Cloudinary__ApiSecret = 7L1BUJ+ISniSQGN_Mr8KzH3PoQXI
```

```
# PayOS (from payos.vn — optional if not using payments)
PayOS__ClientId = YOUR_PAYOS_CLIENT_ID
PayOS__ApiKey = YOUR_PAYOS_API_KEY
PayOS__ChecksumKey = YOUR_PAYOS_CHECKSUM_KEY
PayOS__ReturnUrl = https://YOUR_APP.vercel.app/booking/success
PayOS__CancelUrl = https://YOUR_APP.vercel.app/booking/failed
```

```
# Resend Email (from resend.com — optional if not using emails)
Resend__ApiKey = re_YOUR_RESEND_API_KEY
Resend__FromEmail = noreply@yourdomain.com
```

```
# App Config
App__CompanyName = HaiDang Homes
App__Url = https://YOUR_APP.vercel.app
```

> **Important:** For sensitive values (Jwt__Secret, PayOS keys, Cloudinary__ApiSecret, Resend__ApiKey), click **Encrypt** before saving.

### 4.3 — Wait for Deployment

- Build takes 3-10 minutes (first deploy)
- Watch logs in **Logs** tab
- Green health check = success

**Your backend URL will be:** `https://haidanghomes-api.onrender.com`

Test it:
- Health: `https://haidanghomes-api.onrender.com/health`
- Swagger: `https://haidanghomes-api.onrender.com/swagger`

---

## Step 5 — Deploy Frontend to Vercel

### 5.1 — Create Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import `HaiDangHomesSystem` from GitHub
4. Under **Root Directory**, click **Edit** → set to `frontend`
5. Click **Deploy**

### 5.2 — Add Environment Variables

Before the deploy finishes, go to **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL = https://haidanghomes-api.onrender.com/api
NEXT_PUBLIC_APP_URL = https://YOUR_APP_NAME.vercel.app
```

If using Cloudinary unsigned upload preset:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = haqngbyw
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = haidanghomes_unsigned
```

### 5.3 — Redeploy

After adding env vars, go to **Deployments** → click **...** → **Redeploy** on the latest deployment.

**Your frontend URL will be:** `https://YOUR_APP_NAME.vercel.app`

---

## Step 6 — Update Render with Real Frontend URL

Once Vercel gives you the final URL, go back to Render → Environment and update:

```
PayOS__ReturnUrl = https://YOUR_APP_NAME.vercel.app/booking/success
PayOS__CancelUrl = https://YOUR_APP_NAME.vercel.app/booking/failed
App__Url = https://YOUR_APP_NAME.vercel.app
```

```
# Allowed CORS Origins
AllowedOrigins = https://YOUR_APP_NAME.vercel.app,http://localhost:3000
```

---

## Step 7 — Configure Next.js API Rewrite

Update `frontend/next.config.ts` to proxy API calls to the backend:

```typescript
// frontend/next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://haidanghomes-api.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

Commit and push to trigger Vercel redeploy.

---

## Step 8 — Database Migration

On first startup, the API automatically runs pending EF Core migrations. If you add new migrations locally:

```bash
# Add migration locally
cd HaiDangHomes.API
dotnet ef migrations add YourMigrationName

# Commit and push
git add . && git commit -m "Add migration: YourMigrationName"
git push origin main
```

Render will auto-rebuild and apply the migration.

---

## Step 9 — Test Everything

### Backend Tests
- [ ] `https://haidanghomes-api.onrender.com/health` → returns 200
- [ ] `https://haidanghomes-api.onrender.com/swagger` → API docs load
- [ ] Register a new user
- [ ] Login and get JWT token
- [ ] Upload an image

### Frontend Tests
- [ ] Homepage loads
- [ ] Login/Register works
- [ ] Property listings display
- [ ] Booking flow works

### Payment Tests (if PayOS enabled)
- [ ] Create booking
- [ ] Click Pay → redirects to PayOS
- [ ] Complete payment → redirects to `/booking/success`
- [ ] Booking status updates to **Confirmed**

---

## Common Issues

### Render spins down (free tier)
Render's free tier sleeps after 15 min of inactivity. First request after sleep takes 30-60s. This is normal.

### CORS errors
Backend `Program.cs` must have CORS policy configured. Add `AllowedOrigins` env var on Render:
```
AllowedOrigins = https://YOUR_APP_NAME.vercel.app,http://localhost:3000
```

### Image upload fails
- Check `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret` are correct
- Check Cloudinary account is active (free tier has limits)

### Database connection fails
- Ensure `?sslmode=require` is in the connection string
- Check NeonDB project is not paused (Neon auto-pauses after 5 days of inactivity — log in to Neon dashboard to wake it up)

### PayOS webhook not working
Render free tier sleeps — webhook calls may fail. On the success page, call `GET /api/payments/check-status/{orderCode}` to verify payment.

### Build fails on Render
Check Docker logs in Render dashboard. Most common cause: missing or wrong `DATABASE_URL`.

---

## Updating After Code Changes

Both services auto-deploy on push to `main`:
- **Render**: picks up changes automatically
- **Vercel**: picks up changes automatically

No manual steps needed.

---

## Optional: Custom Domain

### Vercel
Settings → Domains → Add domain → Update DNS records as instructed by Vercel.

### Render
Settings → Custom Domains → Add domain → Add DNS records.

---

## Cost Summary

| Service | Plan | Monthly Cost |
|---|---|---|
| GitHub | Free | $0 |
| NeonDB | Free | $0 |
| Render | Free | $0 |
| Vercel | Hobby | $0 |
| Cloudinary | Free | $0 |
| Resend | Free | $0 |
| PayOS | Per-transaction | ~1-2% |
| **Total** | | **~$0** |
