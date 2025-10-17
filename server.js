require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes and middleware
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const flowsRoutes = require('./routes/flows');
const injectConfig = require('./middleware/inject-config');

// Middleware
app.use(cors());
app.use(express.json());

// Apply config injection for HTML files
app.use(injectConfig());

// Serve static files (JS, CSS, etc) - but not HTML (handled by injectConfig)
app.use(express.static(__dirname, {
  index: false, // Don't serve index.html automatically
  extensions: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg']
}));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/flows', flowsRoutes);

// Serve the main page (config injection handled by middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Klaviyo Flow Visualizer is running!`);
  console.log(`\n📊 Open your browser to: http://localhost:${PORT}`);
  console.log(`\n✨ Multi-User Features:`);
  console.log(`   - User authentication with Supabase`);
  console.log(`   - Secure API key storage`);
  console.log(`   - Per-user flow data persistence`);
  console.log(`   - Horizontal flow visualization`);
  console.log(`   - Tag-based filtering`);
  console.log(`\n🔐 Authentication:`);
  console.log(`   - Register: /register.html`);
  console.log(`   - Login: /login.html`);
  console.log(`   - Settings: /settings.html\n`);
});
