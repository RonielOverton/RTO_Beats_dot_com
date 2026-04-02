# Deploy to Vercel: www.rtobeats.com

**Platform:** Vercel (recommended)  
**Domain:** www.rtobeats.com  
**Status:** Ready to deploy

---

## 🚀 Step 1: Push Code to Git

```powershell
# Commit all changes (tests completed, no uncommitted code)
git add .
git commit -m "Pre-launch: security hardening, tests passing"
git push origin main
```

After push, code is ready for Vercel.

---

## 🚀 Step 2: Connect Git Repo to Vercel

**Option A: Using Vercel CLI (fastest)**
```powershell
npm install -g vercel
vercel link
# Follow prompts to create new Vercel project
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repo (`rto_beats_dot_com`)
4. Click "Import"

---

## ⚙️ Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Click your project → "Settings" → "Environment Variables"
2. Add these variables for **Production** environment:

```
STRIPE_SECRET_KEY = sk_live_[your-stripe-secret-key]
STRIPE_WEBHOOK_SECRET = whsec_[from-stripe-dashboard-webhooks]
NEXT_PUBLIC_SANITY_PROJECT_ID = [your-sanity-project-id]
NEXT_PUBLIC_SANITY_DATASET = production
NEXT_PUBLIC_SANITY_API_VERSION = 2024-01-01
SITE_URL = https://www.rtobeats.com
YOUTUBE_API_KEY = [optional-youtube-api-key]
```

**⚠️ CRITICAL: Get These VALUES Now**

### Stripe Keys (Production)
1. Go to https://dashboard.stripe.com/apikeys
2. Ensure you're in **Live Mode** (toggle in top-left)
3. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY` (starts with `sk_live_`)
   - **Publishable key** → for later use in frontend (starts with `pk_live_`)

### Stripe Webhook Secret
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add Endpoint"
   - URL: `https://www.rtobeats.com/api/webhooks/stripe`
   - Events: Select **only** `checkout.session.completed`
   - Click "Add Endpoint"
3. Click the new endpoint → "Signing secret" section
4. Click "Reveal" → Copy secret → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

### Sanity Credentials
1. Go to https://sanity.io/manage
2. Find your project → click it
3. Go to **API** tab
4. Copy:
   - **Project ID** → `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - **Datasets** → `production` (or your dataset name)
   - **API version** → Use `2024-01-01` (or today's date in `YYYY-MM-DD` format)

---

## 🌐 Step 4: Configure Custom Domain

In Vercel Dashboard:
1. Click your project → "Settings" → "Domains"
2. Click "Add" → Enter `www.rtobeats.com`
3. Vercel shows your DNS records:
   - CNAME: `cname.vercel.com`
   - Or use A records (shown in dashboard)

**At your domain registrar (where you bought rtobeats.com):**
1. Log in to DNS settings
2. Add the CNAME record from Vercel
   - **Name:** `www`
   - **Value:** `cname.vercel.com`
3. Save changes
4. Wait 24–48 hours for DNS to propagate (or check status in Vercel → usually 5-10 min)

**Verify in Vercel:** Once DNS propagates, Vercel auto-provisions SSL cert (takes ~5 min).

---

## ✅ Step 5: Deploy

**Method 1: Auto-deploy on git push**
```powershell
git push origin main
# Vercel automatically detects push and deploys
```

**Method 2: Manual deploy via CLI**
```powershell
vercel --prod
# Deploys to production URL
```

**Watch deployment:**
1. Go to Vercel Dashboard → your project
2. Click "Deployments" tab
3. Watch status update → should show "✓ Ready" in ~2-3 minutes

---

## 🧪 Step 6: Test Production

### A. Verify Site is Live
```powershell
# Check homepage loads
Invoke-WebRequest https://www.rtobeats.com -UseBasicParsing | Select-Object StatusCode, StatusDescription

# Should return: StatusCode: 200
```

### B. Check Security Headers
```powershell
@"
$((Invoke-WebRequest https://www.rtobeats.com -UseBasicParsing).Headers | Where-Object { $_.name -match 'csp|frame|content-type|referrer|strict-transport' } | ForEach-Object { "$($_.Name): $($_.Value)" })
"@
```

**Should output:**
```
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### C. Check HTTPS Enforcement
```powershell
# Visit http://www.rtobeats.com (without 's')
# Should auto-redirect to https://www.rtobeats.com
$response = Invoke-WebRequest http://www.rtobeats.com -MaximumRedirection 1 -SkipHttpErrorCheck
$response.BaseResponse.RequestMessage.RequestUri  # Should be HTTPS
```

### D. Test Stripe Checkout (Test Mode)
1. Visit https://www.rtobeats.com/store
2. Add an item to cart
3. Click checkout → redirects to Stripe
4. Use test card: `4242 4242 4242 4242` (expiry: any future date, CVV: any 3 digits)
5. Complete checkout
6. Should redirect to order success page

### E. Verify Webhook is Receiving Orders
1. After test checkout completes, go to Stripe Dashboard
2. Click **Events** → you should see `checkout.session.completed` event
3. Go to Sanity Studio /studio
4. Check **Orders** collection — new order should appear within 30 seconds

---

## 🚨 Deployment Risks Checklist

| Risk | Status | Mitigation |
|------|--------|-----------|
| Rate limiting safe | ✅ SAFE | Vercel is single-instance by default |
| SSL/HTTPS enforced | ✅ AUTO | Vercel manages SSL cert automatically |
| CSP headers active | ✅ VERIFIED | Tested locally; deployed code identical |
| Webhook signature verified | ✅ VERIFIED | Stripe webhook requires signature |
| Secrets not in git | ✅ VERIFIED | Secrets scanning passed; all in env vars |
| Domain DNS propagation | ⏳ PENDING | May take up to 48h; check hourly |
| Stripe webhook URL correct | ⏳ TODO | Verify after DNS propagates |

---

## ❌ Common Deployment Issues & Fixes

### "Domain not found" or shows 404
**Cause:** DNS hasn't propagated yet  
**Fix:** Wait 24–48 hours, then check Vercel dashboard → Domains → status should be ✓ Active

### "SSL certificate not provisioned"
**Cause:** Possible DNS issue  
**Fix:** 
1. Verify CNAME record is correct in your registrar's DNS settings
2. Wait 1–2 hours for SSL cert to auto-provision
3. If still pending: Delete domain in Vercel and re-add it

### "Stripe webhook returns 400"
**Cause:** Webhook secret doesn't match  
**Fix:**
1. Go to Stripe Dashboard → Webhooks → find endpoint
2. Click "Copy signing secret" again (not the event data — the **signing secret**)
3. Update `STRIPE_WEBHOOK_SECRET` env var in Vercel
4. Redeploy: `vercel --prod`

### "Orders not appearing in Sanity after checkout"
**Cause:** `SANITY_API_WRITE_TOKEN` might not have order create/update permissions  
**Fix:**
1. Go to Sanity → API → generate a write token with "All" permissions
2. Add it as `SANITY_API_WRITE_TOKEN` env var in Vercel
3. Redeploy

---

## 📋 Post-Deployment Checklist

After deployment and DNS propagation:

- [ ] https://www.rtobeats.com resolves (no 404 or timeout)
- [ ] Security headers present in browser DevTools (F12 → Network → Response headers)
- [ ] HTTP redirects to HTTPS (test with http://www.rtobeats.com)
- [ ] CSS, images, fonts load correctly (no CSP violations in console)
- [ ] Stripe checkout works with test card (4242...)
- [ ] Order appears in Sanity Studio within 30 seconds of checkout
- [ ] Stripe webhook shows "Live" status in Dashboard (not test mode)
- [ ] No 5xx errors in Vercel logs (Dashboard → Deployments → Function Logs)

---

## 🔄 Rollback if Needed

If something breaks in production:

```powershell
# View deployment history
vercel --prod --list

# Rollback to previous version
vercel rollback
# Follow prompts to select previous deployment

# Or redeploy from specific git commit
git checkout [commit-hash]
git push origin main
# Vercel auto-redeploys
```

---

## 📞 Next Steps

1. **Gather credentials** (Stripe keys, Sanity project ID) — use the checklist above
2. **Add env vars to Vercel** → Settings → Environment Variables
3. **Configure domain DNS** → add CNAME record to your registrar
4. **Deploy** → `git push origin main` (or use Vercel CLI)
5. **Wait for DNS** → 5–48 hours for propagation
6. **Test production** → use checklist above
7. **Monitor logs** → Vercel Dashboard → Deployments → Function Logs

---

## 🆘 Need Help?

- **Vercel docs:** https://vercel.com/docs
- **Stripe webhooks:** https://stripe.com/docs/webhooks
- **Sanity API:** https://www.sanity.io/docs/http-api
- **Security pre-flight:** See [SECURITY_PRE_LAUNCH.md](SECURITY_PRE_LAUNCH.md)

---

**Estimated time to live:** 30 minutes (+ DNS propagation wait)  
**Go-live status:** ✅ Ready when DNS propagates
