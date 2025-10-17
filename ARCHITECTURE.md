# Comprehensive Multi-User Architecture Analysis & Recommendations

> Created: 2025-10-16
> Status: Approved for Implementation

## 🎯 Executive Summary

**RECOMMENDED TECH STACK:**
- **Database**: Supabase (not Railway PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Email/Password via Supabase Auth (add Google OAuth in v2)
- **Sessions**: Database-backed (persistent across deploys)
- **Deployment**: New Railway project (keep existing app running)
- **API Key Security**: AES-256 encryption with environment variable key

---

## 📊 Detailed Decision Analysis

### 1. Database: Supabase vs Railway PostgreSQL

**WINNER: Supabase** ✅

**Why Supabase is better:**
- **Built-in authentication** (saves 100+ lines of auth code)
- **Excellent documentation** (AI-friendly, easy to debug)
- **Free tier is generous** (500MB database, 50K MAU)
- **All-in-one solution** (database + auth + storage if needed later)
- **Still PostgreSQL under the hood** (no proprietary lock-in)

**Cost comparison:**
- Supabase: $0/month (free tier sufficient for MVP)
- Railway PostgreSQL + custom auth: $5-10/month + development time

**Architecture:**
- Railway: Hosts your Express app
- Supabase: Provides database + authentication
- Best of both worlds!

---

### 2. ORM: Prisma vs Raw SQL

**WINNER: Prisma** ✅

**Pros of Prisma:**
- **Type-safe queries** (catches bugs at compile time)
- **Schema is self-documenting** (easy for AI to understand)
- **Auto-generated migrations** (version control for database)
- **Excellent error messages** (easy debugging)
- **AI agents excel at Prisma** (well-structured, predictable patterns)

**Pros of Raw SQL:**
- Full control, lightweight
- No abstraction layer

**For your priorities** (easy to implement, debug, AI-friendly): **Prisma wins**

---

### 3. Authentication: Email/Password vs OAuth vs Magic Link

**WINNER: Email/Password (via Supabase Auth)** ✅

**Security: Is email/password safe?**
YES, when implemented correctly:
- Supabase uses bcrypt for password hashing
- HTTPS enforced
- Built-in rate limiting
- Email verification included
- Password reset flow included

**Implementation complexity:**
- **Email/Password**: ~10 lines of code with Supabase ✅ (EASIEST)
- **Google OAuth**: ~30 lines + OAuth setup (MODERATE)
- **Magic Link**: ~20 lines + email service (MODERATE)

**Recommendation:** Start with email/password, add Google OAuth in v2

**Can you offer multiple methods?** YES, but start with one for MVP

---

### 4. Session Storage: In-Memory vs Database

**WINNER: Database-backed (persistent)** ✅

**User Experience Impact:**

**In-memory sessions:**
- ❌ Users logged out on EVERY deployment
- ❌ Railway auto-deploys on git push
- ❌ Users frustrated by constant re-login
- ❌ **UNACCEPTABLE for production**

**Database sessions:**
- ✅ Users stay logged in across deploys
- ✅ Sessions persist 7-30 days (configurable)
- ✅ Expected behavior
- ✅ **REQUIRED for good UX**

**Clear winner: Database sessions are essential**

---

## 🗄️ Revised Database Schema

HCTI credentials removed (shared across all users via env variables). Here's the production-ready schema:

```prisma
// schema.prisma

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?  // null if OAuth only
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  settings      UserSettings?
  flows         Flow[]
  sessions      Session[]
}

model UserSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  klaviyoApiKey         String   // Encrypted with AES-256
  lastRefresh           DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Flow {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  flowId            String   // Klaviyo flow ID (e.g., "U2DUPz")
  name              String   // e.g., "[ACE] Abandoned Cart"
  status            String   // "live", "draft", "paused"
  type              String   // "welcome", "abandoned-cart", etc.
  klaviyoUrl        String   // Direct link to Klaviyo editor

  // Additional metadata from Klaviyo API
  archived          Boolean  @default(false)
  triggerType       String?  // "Metric", "Added to List", etc.
  klaviyoCreatedAt  DateTime?
  klaviyoUpdatedAt  DateTime?

  // Store full Klaviyo JSON for future use
  rawData           Json?    // Full API response

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  emails            Email[]

  @@unique([userId, flowId])
  @@index([userId, status])
}

model Email {
  id                String   @id @default(cuid())
  flowId            String
  flow              Flow     @relation(fields: [flowId], references: [id], onDelete: Cascade)

  emailId           String   // Klaviyo action/message ID
  name              String   // "BC Abandoned Cart ATC: Email 1"
  delay             String   // "4 hours", "2 days", "Immediately"

  // Additional metadata
  templateId        String?  // Klaviyo template ID
  subjectLine       String?  // "Your items are waiting."
  messageStatus     String?  // "live", "draft"

  // Screenshot data
  screenshotUrl     String?
  screenshotGeneratedAt DateTime?

  // Metrics (separate fields for easy querying)
  openRate          Float    @default(0)
  clickRate         Float    @default(0)
  conversionRate    Float    @default(0)

  // User-managed tags (JSON array)
  userTags          Json     @default("[]")

  // Position in flow for ordering
  position          Int      @default(0)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([flowId, emailId])
  @@index([flowId, position])
}

model Session {
  id        String   @id
  sid       String   @unique
  data      String
  expiresAt DateTime
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([expiresAt])
}
```

### Key Schema Improvements:

✅ **Removed HCTI credentials** (stays in env variables - shared across all users)
✅ **Added `rawData` JSON field** (stores full Klaviyo API response for future features)
✅ **Split metrics into separate fields** (easier to query than JSON)
✅ **Added `screenshotGeneratedAt`** (for cache management)
✅ **Added `position` field** (preserves email order in flow)
✅ **Added proper indexes** (performance optimization)
✅ **Added cascading deletes** (automatic cleanup when user deleted)

---

## 🔐 API Key Security Implementation

**Encryption Strategy: AES-256 with environment variable key**

```javascript
// utils/encryption.js
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes, generate with: crypto.randomBytes(32).toString('hex')

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
```

**Best practices:**
- Validate API key before saving (test Klaviyo API call)
- Never send decrypted key to frontend
- Store ENCRYPTION_KEY as Railway environment variable

---

## 🚀 Safe Implementation Roadmap

**Phase 1: Infrastructure Setup** (Zero risk - no code changes)
1. Create Supabase project
2. Install Prisma (`npm install prisma @prisma/client`)
3. Create `schema.prisma` file
4. Run `npx prisma migrate dev` locally
5. Test database connection

**Phase 2: Add Authentication** (Low risk - new pages)
1. Install Supabase client (`npm install @supabase/supabase-js`)
2. Create `/login`, `/register`, `/settings` pages
3. Don't require auth yet (test separately)
4. Verify login flow works

**Phase 3: Protect Routes** (Medium risk - add auth middleware)
1. Add auth middleware to Express
2. Protect `/api/*` endpoints
3. Add feature flag to bypass during testing
4. Test with logged-in users

**Phase 4: Migrate Data Layer** (High risk - core functionality)
1. Update `/api/flows` to read from database
2. Create `/api/refresh` to fetch from Klaviyo
3. Implement encryption/decryption for API keys
4. Test extensively locally

**Phase 5: Deploy to NEW Railway Project** (Low risk - separate deployment)
1. Create new Railway project (keep old one running)
2. Deploy v2 to new project
3. Test in production environment
4. Get user feedback

**Phase 6: Switch Over** (Medium risk - final migration)
1. Point domain to new version
2. Monitor for issues
3. Keep old version accessible for rollback

---

## ⚠️ Risk Analysis & Mitigation

### Major Risks Identified:

**Risk 1: Breaking existing functionality**
- Mitigation: New branch + separate deployment, thorough testing
- Rollback plan: Keep old version running

**Risk 2: API key encryption bugs**
- Mitigation: Extensive testing, validate keys before saving
- Fallback: Add UI to test key before saving

**Risk 3: Users locked out**
- Mitigation: Use battle-tested Supabase Auth
- Fallback: Password reset flow included

**Risk 4: Screenshot costs**
- Mitigation: Only generate on new/changed emails
- Fallback: Add user quotas if needed

---

## 💰 Cost Projections

**MVP (1-10 users):**
- Supabase: $0/month (free tier)
- Railway: $5/month
- HCTI: $0-19/month (50 free, then $19 for 1000)
- **Total: $5-24/month**

**Growth (100 users):**
- Supabase: $0-25/month
- Railway: $10/month
- HCTI: $19-39/month
- **Total: $29-74/month**

All very affordable for a SaaS product!

---

## ✅ Final Recommendations

Based on priorities (easy to implement, easy to debug, AI-friendly):

1. ✅ **Use Supabase** for database + auth
2. ✅ **Use Prisma** for ORM (type-safe, AI-friendly)
3. ✅ **Start with email/password** auth (add Google OAuth in v2)
4. ✅ **Use database sessions** (persistent across deploys - CRITICAL)
5. ✅ **Use the revised schema** provided above
6. ✅ **Create new project** (don't break existing app)
7. ✅ **Follow phased implementation** (test at each stage)

---

## 🎬 Implementation Status

- [x] Architecture design completed
- [x] Schema finalized
- [ ] Supabase project setup
- [ ] Prisma integration
- [ ] Authentication system
- [ ] Data layer migration
- [ ] Settings page
- [ ] Testing & deployment
