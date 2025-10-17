# Railway Deployment Guide

> Multi-User Klaviyo Flow Visualizer Deployment

## Prerequisites

- Railway account (https://railway.app)
- Supabase project already set up with database
- Environment variables ready

---

## Step 1: Create New Railway Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Select the `multi-user-v2` branch
5. Click "Deploy Now"

---

## Step 2: Configure Environment Variables

In Railway's project settings, add the following environment variables:

### Required Variables

```bash
# Database (IMPORTANT: Use the pooled connection for Railway)
DATABASE_URL_POOLED=postgresql://postgres.gzgpgnxqigjwmxvadzsb:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://gzgpgnxqigjwmxvadzsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Encryption (Generate new 32-byte key for production)
ENCRYPTION_KEY=[your-32-byte-hex-string]

# Server
PORT=3000
```

### Optional Variables (for screenshot generation)

```bash
HCTI_USER_ID=[your-hcti-user-id]
HCTI_API_KEY=[your-hcti-api-key]
```

**IMPORTANT Notes:**
- Use `DATABASE_URL_POOLED` (not `DATABASE_URL`) for Railway
- Generate a NEW `ENCRYPTION_KEY` for production (don't reuse the local one)
- Do NOT commit the KLAVIYO_API_KEY to Railway - users provide their own via Settings

---

## Step 3: Generate New Encryption Key

Run this command locally to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as the `ENCRYPTION_KEY` in Railway.

---

## Step 4: Deploy & Verify

1. Railway will automatically deploy after you add environment variables
2. Wait for deployment to complete
3. Click "Open App" to view your deployed site
4. Test the following:
   - Registration works
   - Login works
   - Settings page loads
   - Can save API key
   - Can refresh flows from Klaviyo
   - Flows display correctly

---

## Step 5: Post-Deployment Testing

### Test Multi-User Functionality

1. **Create Test User 1**
   - Register with test1@example.com
   - Save a Klaviyo API key
   - Refresh flows
   - Verify flows appear

2. **Create Test User 2**
   - Sign out
   - Register with test2@example.com
   - Save a different Klaviyo API key
   - Refresh flows
   - Verify different flows appear

3. **Verify Isolation**
   - Switch between users
   - Confirm each user only sees their own flows
   - Confirm API keys are stored separately

---

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server":
- Verify `DATABASE_URL_POOLED` is correct
- Ensure Supabase project is running
- Check Railway logs for detailed error messages

### Authentication Issues

If login/registration fails:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check Supabase dashboard for auth logs

### API Key Decryption Issues

If you see "Invalid encrypted text format":
- Ensure `ENCRYPTION_KEY` is set in Railway
- Ensure it's a valid 32-byte hex string
- Note: Keys encrypted locally won't work in production (different encryption key)

---

## Environment Variable Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL_POOLED` | ✅ Yes | Supabase pooled connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `ENCRYPTION_KEY` | ✅ Yes | 32-byte hex string for API key encryption |
| `PORT` | ⚠️ Optional | Railway sets this automatically |
| `HCTI_USER_ID` | ⚠️ Optional | For email screenshot generation |
| `HCTI_API_KEY` | ⚠️ Optional | For email screenshot generation |

---

## Security Notes

- ✅ All Klaviyo API keys are encrypted at rest
- ✅ Users can only access their own data
- ✅ Authentication required for all protected routes
- ✅ JWT tokens used for session management
- ✅ Password hashing handled by Supabase Auth
- ⚠️ Use HTTPS in production (Railway provides this automatically)
- ⚠️ Keep `ENCRYPTION_KEY` secret and unique per environment

---

## Rollback Plan

If issues arise in production:

1. **Keep old deployment running** on separate Railway service
2. **Test new deployment thoroughly** before switching
3. **DNS/Domain changes** - Only switch domains after confirming everything works
4. **Database is shared** - Both versions use same Supabase database

---

## Next Steps After Deployment

1. ✅ Verify all functionality works in production
2. ✅ Get user approval
3. ✅ Update domain/URL if needed
4. ✅ Monitor Railway logs for errors
5. ✅ Set up monitoring/alerts (optional)

---

## Railway Project Settings

### Build Command
Railway should auto-detect: `npm install`

### Start Command
Railway should auto-detect: `npm start`

If not, manually set to: `node server.js`

### Node Version
Railway uses the latest LTS version by default. Your app is compatible with Node 18+.

---

## Cost Estimates

**Railway (Pro Plan recommended for production):**
- Starter: $5/month (suitable for testing)
- Pro: $20/month (recommended for production)
- Includes: 500 GB bandwidth, $5 of usage credits

**Supabase:**
- Free tier: Suitable for getting started
- Pro tier: $25/month (recommended for production)
- Includes: 8GB database, 50GB bandwidth

**Total Monthly Cost (Production):** ~$45/month

---

## Support

- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
