# 📋 TODO: Pending Features & Improvements

Prioritized list of features, improvements, and bug fixes for Klaviyo Flow Visualizer v2.x.

## 🚨 High Priority

### 1. Implement Real Metrics from Klaviyo API
**Priority**: HIGH
**Effort**: Medium
**Files to modify**: `routes/flows.js`

```javascript
// Add to routes/flows.js
async function fetchEmailMetrics(messageId, apiKey) {
  // Call Klaviyo Reporting API
  // GET /api/metrics/
  // Calculate open_rate, click_rate, conversion_rate
}
```

**Tasks**:
- [ ] Research Klaviyo Reporting API endpoints
- [ ] Implement metric fetching function
- [ ] Add to refresh flow process
- [ ] Update database with real metrics
- [ ] Handle API rate limits

### 2. Add Health Check Endpoint
**Priority**: HIGH
**Effort**: Low
**Files to modify**: `server.js`

```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: '2.0.0'
  });
});
```

**Tasks**:
- [ ] Create `/health` endpoint
- [ ] Check database connection
- [ ] Check Supabase connection
- [ ] Return appropriate status codes
- [ ] Add to Railway monitoring

### 3. Implement Rate Limiting
**Priority**: HIGH
**Effort**: Low
**Package**: `express-rate-limit`

```javascript
// Add to server.js
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
app.use('/api/', limiter);
```

**Tasks**:
- [ ] Install express-rate-limit
- [ ] Configure rate limits per endpoint
- [ ] Add custom error messages
- [ ] Exclude health check endpoint
- [ ] Test with multiple users

## 🔧 Medium Priority

### 4. User Notification for Missing Screenshots
**Priority**: MEDIUM
**Effort**: Low
**Files to modify**: `app.js`, `index.html`

```javascript
// Add to app.js
if (!email.screenshotUrl && email.messageType === 'email') {
  showNotification('Screenshot generation unavailable. Configure HCTI API for previews.');
}
```

**Tasks**:
- [ ] Add notification component
- [ ] Check for missing screenshots
- [ ] Show informative message
- [ ] Add link to HCTI setup docs
- [ ] Style notification banner

### 5. Generic Migration Baseline Logic
**Priority**: MEDIUM
**Effort**: Medium
**Files to modify**: `start.sh`

```bash
# Update start.sh
# Dynamically get migration names from directory
for migration in prisma/migrations/*/; do
  migration_name=$(basename "$migration")
  npx prisma migrate resolve --applied "$migration_name" 2>&1 || true
done
```

**Tasks**:
- [ ] Remove hardcoded migration names
- [ ] Scan migrations directory
- [ ] Apply all existing migrations
- [ ] Test with various scenarios
- [ ] Update deployment docs

### 6. Export Flow Visualizations
**Priority**: MEDIUM
**Effort**: High
**Files to modify**: `app.js`, `routes/flows.js`

**Features**:
- Export as PNG/PDF
- Export as CSV data
- Share via link
- Download all screenshots

**Tasks**:
- [ ] Add export button to UI
- [ ] Implement HTML to Canvas
- [ ] Generate PDF with jsPDF
- [ ] Create CSV export
- [ ] Add share functionality

### 7. Search Functionality
**Priority**: MEDIUM
**Effort**: Medium
**Files to modify**: `app.js`, `index.html`

```javascript
// Add to app.js
function searchFlows(query) {
  return flowsData.flows.filter(flow =>
    flow.name.toLowerCase().includes(query.toLowerCase()) ||
    flow.emails.some(email =>
      email.name.toLowerCase().includes(query.toLowerCase())
    )
  );
}
```

**Tasks**:
- [ ] Add search input to header
- [ ] Implement fuzzy search
- [ ] Search flows and emails
- [ ] Highlight search results
- [ ] Add search history

## 📊 Low Priority

### 8. Bulk Tag Operations
**Priority**: LOW
**Effort**: Medium
**Files to modify**: `app.js`, `routes/flows.js`

**Features**:
- Select multiple emails
- Add/remove tags in bulk
- Tag all emails in flow
- Import/export tags

**Tasks**:
- [ ] Add checkbox selection
- [ ] Implement bulk actions menu
- [ ] Create bulk API endpoint
- [ ] Add confirmation dialogs
- [ ] Update UI for multi-select

### 9. Admin Panel
**Priority**: LOW
**Effort**: High
**New files**: `admin.html`, `routes/admin.js`

**Features**:
- User management
- Usage statistics
- System settings
- API key management
- Database maintenance

**Tasks**:
- [ ] Create admin authentication
- [ ] Build admin dashboard
- [ ] User CRUD operations
- [ ] Usage analytics
- [ ] System health monitoring

### 10. Production Logging
**Priority**: LOW
**Effort**: Medium
**Package**: `winston` or `pino`

```javascript
// Add logging service
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

**Tasks**:
- [ ] Choose logging library
- [ ] Configure log levels
- [ ] Add file rotation
- [ ] Integrate with monitoring
- [ ] Remove console.log statements

## 🐛 Bug Fixes

### Known Issues

1. **Silent Screenshot Failures**
   - Add error notifications
   - Log failed attempts
   - Retry mechanism

2. **Migration Baseline Hardcoding**
   - Make dynamic
   - Handle edge cases
   - Better error messages

3. **No Timeout on API Calls**
   - Add fetch timeouts
   - Handle network errors
   - Show loading states

## 🎨 UI/UX Improvements

### Enhancements

1. **Dark Mode**
   - [ ] Add theme toggle
   - [ ] Store preference
   - [ ] Update all components
   - [ ] Test contrast ratios

2. **Mobile Responsive**
   - [ ] Improve mobile layout
   - [ ] Touch gestures
   - [ ] Responsive cards
   - [ ] Mobile navigation

3. **Keyboard Shortcuts**
   - [ ] Add hotkeys
   - [ ] Document shortcuts
   - [ ] Accessibility improvements
   - [ ] Focus management

4. **Performance Metrics Dashboard**
   - [ ] Aggregate metrics view
   - [ ] Charts and graphs
   - [ ] Trend analysis
   - [ ] Export reports

## 🚀 Future Features

### Version 3.0 Ideas

1. **A/B Test Visualization**
   - Show test variants
   - Performance comparison
   - Statistical significance

2. **Flow Templates**
   - Save flow structures
   - Share templates
   - Template marketplace

3. **Collaborative Features**
   - Team workspaces
   - Comments on flows
   - Change history
   - Approval workflow

4. **AI Insights**
   - Performance predictions
   - Optimization suggestions
   - Content analysis
   - Anomaly detection

5. **Webhook Integration**
   - Real-time updates
   - External notifications
   - Third-party integrations
   - Zapier/Make support

## 📅 Implementation Timeline

### Sprint 1 (Week 1-2)
- [ ] Health check endpoint
- [ ] Rate limiting
- [ ] Screenshot notifications
- [ ] Bug fixes

### Sprint 2 (Week 3-4)
- [ ] Real metrics implementation
- [ ] Generic migration logic
- [ ] Search functionality

### Sprint 3 (Week 5-6)
- [ ] Export features
- [ ] Bulk operations
- [ ] UI improvements

### Sprint 4 (Week 7-8)
- [ ] Admin panel foundation
- [ ] Production logging
- [ ] Performance optimization

## 📝 Documentation Updates

### Needed Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Video tutorials
- [ ] Troubleshooting guide
- [ ] Performance tuning guide
- [ ] Security best practices
- [ ] Deployment variations (Vercel, AWS, etc.)

## 🧪 Testing Requirements

### Test Coverage Needed
- [ ] Unit tests for utilities
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Load testing
- [ ] Security testing
- [ ] Accessibility testing

---

## Quick Start Commands

```bash
# For high priority tasks
npm install express-rate-limit
npm install winston

# For PDF export
npm install jspdf html2canvas

# For testing
npm install --save-dev jest supertest playwright
```

## Contributing

To work on any of these items:
1. Create a feature branch
2. Implement the feature
3. Add tests
4. Update documentation
5. Submit a pull request

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Maintainer**: @paulj726