# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klaviyo Flow Visualizer is a **multi-user** web application that provides horizontal visualization of Klaviyo email and SMS flows. It features secure authentication, encrypted API key storage, and real-time synchronization with Klaviyo.

## Key Commands

```bash
# Start development server
npm start

# Run with migrations (production)
bash start.sh

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Server runs on http://localhost:3000
```

## Architecture Overview

### Technology Stack

- **Backend**: Node.js + Express (server.js - 52 lines)
- **Frontend**: Vanilla JavaScript (app.js - 626 lines) + HTML (index.html - 567 lines)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Supabase Auth with JWT
- **Encryption**: AES-256-CBC for API keys
- **Screenshots**: HCTI.io API (optional)
- **Deployment**: Railway with automatic migrations

### Application Layers

1. **Backend (server.js)**:
   - Mounts API routes at `/api/auth`, `/api/settings`, `/api/flows` (lines 19-22)
   - Applies config injection middleware for HTML pages (line 25)
   - Serves static files and HTML with injected Supabase config (lines 28-36)

2. **Database Layer (Prisma)**:
   - User model with authentication data
   - UserSettings with encrypted API keys
   - Flow and Email models for Klaviyo data
   - Session model for auth management

3. **Frontend (app.js + HTML)**:
   - Supabase client initialization (lines 8-21)
   - Auth state management (lines 24-59)
   - Flow rendering with horizontal layout
   - Tag management with database persistence

## Core Features Implementation

### 1. Multi-User Authentication ✅

**Implementation**:
- **Supabase Integration**: `lib/supabase.js` creates client
- **Config Injection**: `middleware/inject-config.js:35-41` injects SUPABASE_URL and ANON_KEY into HTML
- **Auth Middleware**: `middleware/auth.js:13-55` validates JWT tokens
- **Protected Routes**: All API endpoints require authentication via `authenticate()` middleware

**Key Files**:
- `routes/auth.js`: Register, login, logout, session endpoints
- `middleware/auth.js`: JWT validation and user attachment to requests
- `app.js:24-59`: Frontend auth state management

### 2. SMS Support ✅

**Backend Processing** (`routes/flows.js`):
```javascript
// Line 265: Detect SMS actions
a.attributes?.action_type === 'send-sms'

// Line 286: Extract SMS body
messageBody = firstMessage.attributes.body;

// Line 310-311: Store SMS data
messageType: isSMS ? 'sms' : 'email',
messageBody: messageBody
```

**Frontend Rendering** (`app.js:331-371`):
- Checks `messageType === 'sms'`
- Renders green-themed SMS card with phone icon
- Displays message body in chat bubble style

**Styling** (`index.html:260-318`):
- `.sms-card`: Green border and background
- `.sms-preview`: Message bubble layout

### 3. Database Persistence ✅

**Schema** (`prisma/schema.prisma`):
```prisma
model Email {
  messageType       String   @default("email")  // "email" or "sms"
  messageBody       String?  // SMS content
  userTags          Json     @default("[]")  // User-managed tags
  screenshotUrl     String?  // Email preview URL
  // ... metrics, position, etc.
}
```

**Migrations**:
- `20250117_add_sms_support`: Initial SMS support
- `20251019225758_add_message_type_and_body`: Added missing columns (our fix)

### 4. API Key Encryption ✅

**Implementation** (`utils/encryption.js`):
- `encrypt()` (lines 8-28): AES-256-CBC with SHA-256 hashed key
- `decrypt()` (lines 33-59): Reverses encryption
- Format: `iv:encrypted` (hex encoded)

**Usage**:
- `routes/settings.js:76`: Encrypts before storing
- `routes/settings.js:164`: Decrypts when retrieving

### 5. Screenshot Generation ✅

**HCTI Integration** (`routes/flows.js:67-98`):
- Calls HCTI.io API with HTML content
- Returns null if env vars missing (graceful degradation)
- Only for emails, skipped for SMS (line 291)

### 6. Flow Data Management ✅

**GET /api/flows** (`routes/flows.js:158-224`):
- Fetches from DATABASE (not Klaviyo directly)
- Includes nested emails ordered by position
- Returns messageType and messageBody for SMS

**POST /api/flows/refresh** (`routes/flows.js:230-424`):
- Fetches live flows from Klaviyo
- Processes both email and SMS messages
- Generates screenshots for emails
- Rate-limited with 400ms delay between API calls
- Preserves user tags during refresh

## Environment Variables

### Required
```bash
DATABASE_URL            # Direct connection (port 5432) for migrations
DATABASE_URL_POOLED     # Pooled connection (port 6543) for runtime
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ENCRYPTION_KEY          # 32-byte hex string
```

### Optional
```bash
HCTI_USER_ID           # For screenshot generation
HCTI_API_KEY           # For screenshot generation
PORT                   # Defaults to 3000
```

## Current Limitations

1. **Metrics**: Shows placeholder values (0%) - not fetching from Klaviyo API
2. **Screenshots**: Requires HCTI API subscription
3. **Migration Baseline**: Hardcoded in `start.sh:18-19`
4. **Error Handling**: Screenshot failures are silent
5. **Search**: No full-text search implemented
6. **Export**: Cannot export visualizations

## Deployment Notes

### Railway Deployment
- Uses `start.sh` for automatic migrations
- Handles P3005 error by baselining existing migrations
- 120-second timeout on migrations to prevent hanging
- DATABASE_URL must use port 5432 for migrations

### Migration Error Handling (`start.sh`)
```bash
# Timeout (exit code 124): Continue anyway
# P3005 error (exit code 1): Baseline and retry
# Other errors: Exit with error
```

## Key Design Decisions

**Why Database over localStorage**: Multi-user support requires persistent, isolated storage

**Why Supabase Auth**: Provides secure, managed authentication without custom implementation

**Why AES-256 Encryption**: Industry standard for sensitive data like API keys

**Why Horizontal Layout**: Better visualization of email flow progression

**Why Rate Limiting**: Respects Klaviyo API limits and prevents abuse

**Why Config Injection**: Allows environment-based configuration without hardcoding

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | No | User registration |
| `/api/auth/login` | POST | No | User login |
| `/api/auth/logout` | POST | Yes | User logout |
| `/api/auth/session` | GET | Optional | Get current session |
| `/api/settings` | GET/POST/DELETE | Yes | Manage API keys |
| `/api/flows` | GET | Yes | Get user's flows |
| `/api/flows/refresh` | POST | Yes | Sync with Klaviyo |
| `/api/flows/:flowId/emails/:emailId/tags` | PUT | Yes | Update tags |

## File Organization

```
routes/
├── auth.js         # Authentication endpoints
├── flows.js        # Flow data management (427 lines)
└── settings.js     # User settings and API keys

middleware/
├── auth.js         # JWT authentication
└── inject-config.js # Supabase config injection

utils/
└── encryption.js   # AES-256 encryption utilities

lib/
└── supabase.js    # Supabase client singleton

prisma/
├── schema.prisma   # Database schema
└── migrations/     # Database migrations
```

## Testing & Debugging

### Common Issues

1. **"Column doesn't exist"**: Run `npx prisma migrate deploy`
2. **"Authentication failed"**: Check Supabase keys in env
3. **"No screenshots"**: Verify HCTI_USER_ID and HCTI_API_KEY
4. **"Migration failed"**: Ensure DATABASE_URL uses port 5432

### Debug Commands

```bash
# Check database schema
npx prisma db pull

# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

## Code Style Guidelines

- **Async/Await**: Preferred over callbacks
- **Error Handling**: Always use try/catch blocks
- **Logging**: Use console.error for errors, console.log for info
- **Comments**: Document complex logic and API calls
- **Security**: Never expose sensitive data in responses
- **Validation**: Validate all user inputs

## Future Improvements (TODO)

1. Implement real metrics from Klaviyo Reporting API
2. Add health check endpoint (`GET /health`)
3. Implement rate limiting middleware
4. Add user notification for screenshot failures
5. Make migration baseline more generic
6. Add export functionality
7. Implement search feature
8. Add bulk tag operations
9. Create admin panel for user management
10. Add production logging (not just console)

## Security Best Practices

- Always use `authenticate()` middleware for protected routes
- Encrypt sensitive data before storage
- Use parameterized queries (handled by Prisma)
- Validate and sanitize user inputs
- Never expose internal errors to users
- Use HTTPS in production
- Implement rate limiting
- Regular security audits

## Performance Optimizations

- Database queries include only needed fields
- Emails ordered by position in single query
- Rate limiting prevents API abuse
- Config injection caches HTML modifications
- Prisma connection pooling for efficiency

---

**Last Updated**: October 2025
**Version**: 2.0.0 (Multi-User)
**Status**: Production Ready with noted limitations
