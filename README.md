# 📧 Klaviyo Flow Visualizer - Multi-User Edition

A beautiful, horizontal visualization dashboard for Klaviyo email and SMS flows with multi-user support, secure API key storage, and real-time synchronization.

## ✨ Features

### Core Functionality
- **Multi-User Architecture**: Secure user authentication with Supabase Auth
- **Horizontal Flow Layout**: Flows displayed left-to-right for better visualization
- **Live Flows Only**: Automatically filters to show only active/live flows
- **Email & SMS Support**: Visualizes both email and SMS messages in flows
- **Larger Previews**: 350px wide cards with email screenshots
- **Tag System**: User-managed tags for categorizing emails
- **Filter by Tags**: Instantly filter all flows by content type
- **Performance Metrics**: Display open, click, and conversion rates
- **Direct Klaviyo Links**: One-click access to edit flows in Klaviyo
- **Secure API Storage**: Encrypted API keys with AES-256 encryption
- **Automatic Refresh**: Sync with Klaviyo to get latest flow data
- **Screenshot Generation**: Automatic email preview generation via HCTI API

### Security Features
- JWT-based authentication
- Encrypted API key storage (AES-256-CBC)
- Per-user data isolation
- Secure session management
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL database (via Supabase)
- Klaviyo account with API access
- Supabase project for authentication

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/paulj726/klaviyo-flow-visualizer.git
   cd klaviyo-flow-visualizer
   git checkout multi-user-v2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Configure your database**:
   ```bash
   # Set DATABASE_URL to your Supabase direct connection (port 5432)
   npx prisma migrate deploy
   ```

5. **Start the application**:
   ```bash
   npm start
   # or for production with migrations:
   bash start.sh
   ```

6. **Open your browser**:
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Required Environment Variables

```bash
# Database Connections
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/postgres  # Direct connection for migrations
DATABASE_URL_POOLED=postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true  # Pooled for runtime

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Security
ENCRYPTION_KEY=your-32-byte-hex-string  # Generate with: openssl rand -hex 32

# Server
PORT=3000  # Optional, defaults to 3000
```

### Optional Environment Variables

```bash
# Screenshot Generation (via HCTI.io)
HCTI_USER_ID=your-hcti-user-id
HCTI_API_KEY=your-hcti-api-key
```

## 📱 Usage Guide

### First Time Setup

1. **Register an account**: Navigate to `/register.html`
2. **Login**: Use your credentials at `/login.html`
3. **Configure Klaviyo**: Go to Settings (`/settings.html`) and add your Klaviyo API key
4. **Refresh flows**: Click "Refresh from Klaviyo" to sync your flows

### Viewing Flows

- **Horizontal Layout**: Each flow displays emails/SMS from left to right
- **Flow Information**: Shows flow name, status, type, and direct Klaviyo edit link
- **Message Cards**:
  - 📧 **Email**: Shows screenshot preview (if available), subject, delay timing
  - 💬 **SMS**: Shows message content in a chat bubble style
- **Performance Metrics**: View open, click, and conversion rates per email

### Managing Tags

- Click "+ Add Tag" on any email card to categorize content
- Available tags: `discount`, `loyalty`, `social-proof`, `urgency`, `welcome`, `product-recs`
- Filter flows by clicking tag buttons in the header
- Tags persist across sessions (stored in database)

### Refreshing Data

- Click "🔄 Refresh from Klaviyo" to sync latest flow data
- System prevents excessive refreshes (warns if refreshed within 60 minutes)
- Automatically fetches flow actions, messages, and generates screenshots
- Rate-limited to respect Klaviyo API limits

## 🏗️ Architecture

### Technology Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Encryption**: AES-256-CBC for API keys
- **Screenshot API**: HCTI.io (optional)
- **Deployment**: Railway-ready with automatic migrations

### Project Structure

```
klaviyo-flow-visualizer/
├── server.js           # Express server setup
├── app.js             # Frontend application logic
├── index.html         # Main dashboard
├── login.html         # Authentication page
├── register.html      # User registration
├── settings.html      # API key configuration
├── routes/
│   ├── auth.js        # Authentication endpoints
│   ├── flows.js       # Flow data management
│   └── settings.js    # User settings management
├── middleware/
│   ├── auth.js        # JWT authentication
│   └── inject-config.js # Config injection
├── utils/
│   └── encryption.js  # AES encryption utilities
├── lib/
│   └── supabase.js    # Supabase client
├── prisma/
│   └── schema.prisma  # Database schema
└── start.sh           # Production startup script
```

### Database Schema

- **User**: Authentication and profile data
- **UserSettings**: Encrypted API keys and preferences
- **Flow**: Klaviyo flow metadata
- **Email**: Individual messages (email/SMS) in flows
- **Session**: User session management

## 🚀 Deployment

### Railway Deployment

1. Create a new Railway project
2. Connect your GitHub repository
3. Select the `multi-user-v2` branch
4. Add environment variables in Railway settings
5. Deploy (migrations run automatically via `start.sh`)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Vercel Deployment

1. Import project to Vercel
2. Configure environment variables
3. Set build command: `npx prisma generate`
4. Set start command: `node server.js`

## 🔒 Security Considerations

- **API Keys**: Stored encrypted with AES-256-CBC
- **Authentication**: JWT-based with Supabase Auth
- **Data Isolation**: Strict per-user data separation
- **HTTPS**: Required for production deployments
- **Environment Variables**: Never commit sensitive data
- **Rate Limiting**: Built-in delays for Klaviyo API calls

## 📊 Current Limitations

- **Metrics**: Currently shows placeholder values (0%) - real metrics API integration pending
- **Screenshots**: Requires HCTI API subscription for email previews
- **Search**: No full-text search functionality yet
- **Export**: Cannot export flow visualizations yet
- **Bulk Operations**: No bulk tag management

## 🛠️ Development

### Running Locally

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Start development server
npm start
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

### Testing API Connection

Use the "Test Connection" button in Settings to verify your Klaviyo API key.

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update API key
- `GET /api/flows` - Get user's flows
- `POST /api/flows/refresh` - Refresh from Klaviyo
- `PUT /api/flows/:flowId/emails/:emailId/tags` - Update tags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Klaviyo for their comprehensive API
- Supabase for authentication infrastructure
- HCTI.io for screenshot generation
- Railway for deployment platform

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the [documentation](https://github.com/paulj726/klaviyo-flow-visualizer/wiki)

---

**Version**: 2.0.0 (Multi-User)
**Last Updated**: October 2025
**Status**: Production Ready