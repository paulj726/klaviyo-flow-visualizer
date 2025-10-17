# Railway Deployment Checklist

## Pre-Deployment

- [x] All local testing complete
- [x] Bug fixes applied
- [x] Debug logging removed
- [x] Code committed to `multi-user-v2` branch
- [x] DEPLOYMENT.md guide created
- [ ] Review and confirm environment variables are ready

## Environment Variables to Prepare

Before starting deployment, have these ready:

```bash
# 1. Generate NEW encryption key for production
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Get from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://gzgpgnxqigjwmxvadzsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase Settings > API]

# 3. Get from Supabase dashboard (Connection Pooling tab)
DATABASE_URL_POOLED=postgresql://postgres.gzgpgnxqigjwmxvadzsb:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Deployment Steps

### 1. Create Railway Project

- [ ] Go to https://railway.app/new
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Select `multi-user-v2` branch
- [ ] Click "Deploy Now"

### 2. Configure Environment Variables

- [ ] Add `DATABASE_URL_POOLED`
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `ENCRYPTION_KEY` (new one, not local one)
- [ ] Optionally add `HCTI_USER_ID` and `HCTI_API_KEY`

### 3. Deploy & Wait

- [ ] Railway builds automatically
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Check Railway logs for any errors

### 4. Initial Testing

- [ ] Open deployed URL
- [ ] Test registration page loads
- [ ] Register a test account
- [ ] Test login works
- [ ] Test settings page loads
- [ ] Enter Klaviyo API key
- [ ] Test "Test Connection" button
- [ ] Save API key
- [ ] Go to main page
- [ ] Click "Refresh from Klaviyo"
- [ ] Verify flows display

### 5. Multi-User Testing

- [ ] Sign out
- [ ] Register second test account
- [ ] Enter different Klaviyo API key
- [ ] Refresh flows
- [ ] Verify different flows appear
- [ ] Sign out and log back in as first user
- [ ] Verify original flows still show

### 6. Production Verification

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Data persists across page refreshes
- [ ] No errors in browser console
- [ ] No errors in Railway logs
- [ ] Database queries are working
- [ ] API keys encrypt/decrypt correctly

## Post-Deployment

- [ ] Monitor Railway logs for 24 hours
- [ ] Test with real user account
- [ ] Verify performance is acceptable
- [ ] Check Supabase dashboard for any issues
- [ ] Get user approval
- [ ] Document the production URL
- [ ] (Optional) Update domain/DNS settings

## Rollback Plan

If deployment has issues:

1. Keep old deployment running
2. Fix issues locally on `multi-user-v2` branch
3. Re-deploy to Railway
4. Old service can be stopped after confirmation

## Success Criteria

✅ All checklist items completed
✅ No errors in logs
✅ Multi-user functionality verified
✅ Performance is acceptable
✅ User approval obtained

## Railway Project URL

Once deployed, document your project URL here:

```
Production URL: [https://your-project.railway.app]
Railway Project: [your-project-name]
```

## Notes

- The first deployment may take 3-5 minutes
- Supabase connection is tested during startup
- Monitor Railway logs for any connection issues
- Database tables are already created, no migration needed

## Troubleshooting

If deployment fails, check:

1. **Build fails:** Check Railway logs for npm install errors
2. **App crashes on start:** Check environment variables are set correctly
3. **Database connection fails:** Verify DATABASE_URL_POOLED is correct
4. **Authentication fails:** Verify Supabase credentials are correct
5. **API key encryption fails:** Verify ENCRYPTION_KEY is set

Refer to DEPLOYMENT.md for detailed troubleshooting steps.
