# Klaviyo Flow Visualizer - Product Roadmap

**Version**: 2.x → 3.0
**Last Updated**: January 2025
**Current Version**: v2.0 (Multi-user with Authentication)

---

## 🎯 Vision

Transform the Klaviyo Flow Visualizer into the **essential tool** for marketing teams to understand, optimize, and collaborate on their email and SMS automation workflows. As the first tool in the mmmarKIT suite, it sets the standard for intuitive, powerful marketing utilities.

---

## 📊 Current State (v2.0)

### ✅ Completed Features
- Multi-user authentication with Supabase
- Per-user data isolation and encrypted API key storage
- Horizontal flow visualization
- Email screenshot generation (HCTI integration)
- Tag-based filtering system
- Zoom functionality for email previews
- Loading states and refresh rate limiting
- Mobile-responsive design

### 🐛 Known Issues
- SMS messages displayed incorrectly as emails
- Tags can only be added, not removed
- No dynamic filter generation
- Limited email/flow metadata display
- No performance comparison or highlighting

---

## 🚀 Release Plan

---

## v2.1 - Critical Fixes & Enhanced Tagging
**Target**: 2 weeks | **Priority**: P0 - Critical

### Epic 1: SMS Message Support 🔴 CRITICAL
**Problem**: SMS messages in flows are incorrectly displayed as emails with wrong screenshots

**Issues**:
- [ ] #1: Add `messageType` field to database schema
- [ ] #2: Update flow processing to handle SMS actions
- [ ] #3: Skip screenshot generation for SMS messages
- [ ] #4: Create SMSCard component for frontend
- [ ] #5: Store SMS message body in database
- [ ] #6: Add SMS-specific metrics display

**Technical Details**:
```prisma
// Add to prisma/schema.prisma
model Email {
  messageType String @default("email") // "email" or "sms"
  messageBody String? // For SMS content
  screenshotUrl String? // Now nullable
}
```

**Acceptance Criteria**:
- SMS messages show phone icon and text preview (not email screenshot)
- SMS metrics displayed correctly (if available from Klaviyo)
- Browse Abandonment flow (KPLmCq) renders correctly with mixed email/SMS

---

### Epic 2: Enhanced Tag Management
**Problem**: Users can add tags but not remove them; filters don't adapt to user tags

**Issues**:
- [ ] #7: Add remove tag functionality (X button on tags)
- [ ] #8: Implement tag deletion confirmation
- [ ] #9: Generate filter buttons dynamically from existing tags
- [ ] #10: Add tag count indicators to filter buttons
- [ ] #11: Improve tag UI (better colors, hover states)
- [ ] #12: Add bulk tag operations (select multiple emails)

**UI Mockup**:
```
┌─────────────────────────────────────┐
│ [discount ×] [urgency ×] [+ Add]    │
└─────────────────────────────────────┘
        ↑ Click × to remove
```

**Acceptance Criteria**:
- Users can remove tags by clicking X button
- Filter bar shows only tags that are actually used
- Tag counts show how many emails have each tag
- Removing last instance of a tag removes it from filters

---

### Additional v2.1 Features:
- [ ] #13: Fix mobile layout issues
- [ ] #14: Improve loading skeleton screens
- [ ] #15: Add keyboard shortcuts (ESC to close modal)
- [ ] #16: Accessibility audit and WCAG AA compliance

---

## v2.2 - UX Enhancements & Brand Integration
**Target**: 2 weeks | **Priority**: P1 - High

### Epic 3: Screenshot Management
**Issues**:
- [ ] #17: Add download button to email preview modal
- [ ] #18: Implement screenshot download with proper filename
- [ ] #19: Add "Copy Link" button for screenshot sharing
- [ ] #20: Create public `/share/:emailId` route
- [ ] #21: Add social media share buttons (Twitter, LinkedIn)

**Download Filename Format**:
```
{flow-name}_{email-name}_{date}.png
Example: Welcome-Series_Email-1_2025-01-17.png
```

---

### Epic 4: Performance Analytics & Highlighting
**Issues**:
- [ ] #22: Calculate and display best performing email per flow
- [ ] #23: Add performance badges (🏆 Best, ⭐ High, 📈 Improving)
- [ ] #24: Implement color-coded metrics (green/yellow/red)
- [ ] #25: Add performance trends (↑ up vs last period)
- [ ] #26: Flow-level aggregate metrics
- [ ] #27: Email subject line display
- [ ] #28: Send time/timing information

**Performance Highlighting Logic**:
```javascript
// For each flow, identify:
- Best open rate: 🏆 Gold trophy badge
- Best click rate: 🖱️ Click champion badge
- Best conversion: 💰 Revenue leader badge
- Improving: 📈 Upward trend badge
```

---

### Epic 5: mmmarKIT Brand Styling
**Issues**:
- [ ] #29: Apply mmmarKIT color palette (blue #2A4B8D, cream #EAE4DB, red #8B091B)
- [ ] #30: Implement Montserrat font family
- [ ] #31: Update spacing to 8px grid system
- [ ] #32: Redesign buttons with brand styling
- [ ] #33: Update cards with brand borders and shadows
- [ ] #34: Add mmmarKIT logo to header
- [ ] #35: Create branded loading states
- [ ] #36: Update all icons to match brand style

**Design Principles**:
- Warm, sophisticated, slightly playful
- "Smooth workflow" aesthetic
- Minimal, functional, purposeful

---

### Epic 6: Additional Details Display
**Issues**:
- [ ] #37: Add expandable "Details" section to email cards
- [ ] #38: Display email subject line prominently
- [ ] #39: Show send time and delay timing
- [ ] #40: Add A/B test variant information
- [ ] #41: Display template ID for reference
- [ ] #42: Show flow trigger type and conditions
- [ ] #43: Add flow-level stats (total recipients, active status)
- [ ] #44: Implement collapsible details to avoid overwhelm

**Details Layout** (collapsed by default):
```
┌──────────────────────────────────┐
│ Email #1: Welcome to Our Store   │
│ ⏱️ Immediately  📊 25.3% open    │
│ [+ Show Details ▼]               │
└──────────────────────────────────┘

When expanded:
┌──────────────────────────────────┐
│ Email #1: Welcome to Our Store   │
│ Subject: "Welcome! Here's 10% off"│
│ ⏱️ Immediately  📊 25.3% open    │
│ [- Hide Details ▲]               │
│ • Template: XYZ123               │
│ • Sent to: 1,234 recipients      │
│ • A/B Test: Control variant      │
│ • Created: Jan 10, 2024          │
└──────────────────────────────────┘
```

---

## v2.3 - Advanced Features
**Target**: 3 weeks | **Priority**: P2 - Medium

### Epic 7: Search & Sort
- [ ] #45: Add global search (flow names, email names)
- [ ] #46: Implement sort options (name, date, performance)
- [ ] #47: Multi-tag filtering (AND/OR logic)
- [ ] #48: Save filter presets
- [ ] #49: Quick filters (e.g., "Top Performers")

### Epic 8: Enhanced UX
- [ ] #50: Keyboard navigation (arrow keys, shortcuts)
- [ ] #51: Drag-to-scroll indicator for horizontal flows
- [ ] #52: Tooltips for metrics and complex information
- [ ] #53: Empty states with helpful guidance
- [ ] #54: Onboarding tour for new users
- [ ] #55: Performance comparison view (side-by-side)

### Epic 9: Annotations & Notes
- [ ] #56: Add notes to emails (personal reminders)
- [ ] #57: Annotate screenshots with markers
- [ ] #58: Share notes with team (if multi-user)
- [ ] #59: Note history and versioning

---

## v3.0 - Klaviyo Integration & Collaboration
**Target**: 4 weeks | **Priority**: P3 - Future

### Epic 10: Klaviyo Tag Synchronization
**Research Required**: Klaviyo API supports tags on flows

- [ ] #60: Fetch existing Klaviyo tags for flows
- [ ] #61: Display Klaviyo tags differently from user tags
- [ ] #62: Push user tags to Klaviyo (sync button)
- [ ] #63: Two-way tag synchronization
- [ ] #64: Tag conflict resolution
- [ ] #65: Bulk tag operations across multiple flows

**API Endpoints**:
```
GET /api/flows/:flowId/klaviyo-tags
POST /api/flows/:flowId/sync-tags-to-klaviyo
DELETE /api/flows/:flowId/klaviyo-tags/:tagId
```

---

### Epic 11: Advanced Analytics
- [ ] #66: Flow performance over time (trend charts)
- [ ] #67: Email-to-email comparison
- [ ] #68: Flow ROI calculator
- [ ] #69: Cohort analysis (when did recipients receive emails)
- [ ] #70: Funnel visualization (drop-off between emails)
- [ ] #71: Best practices recommendations based on data

### Epic 12: Export & Reporting
- [ ] #72: Export flow visualizations as PDF
- [ ] #73: Generate performance reports
- [ ] #74: Schedule automated reports (email digest)
- [ ] #75: Export to Google Sheets
- [ ] #76: Export to CSV (flow data)

### Epic 13: Collaboration Features
- [ ] #77: Team workspaces (multiple users, one account)
- [ ] #78: Role-based permissions (admin, editor, viewer)
- [ ] #79: Comment threads on emails/flows
- [ ] #80: Activity feed (who changed what)
- [ ] #81: Approval workflows for changes
- [ ] #82: Slack integration for notifications

---

## v4.0 and Beyond - Vision Features
**Target**: 6+ months | **Priority**: P4 - Long-term

### Content Analysis
- Email content analyzer (word count, link count, readability)
- Subject line A/B test suggestions
- Image optimization recommendations
- Spam score checker

### AI-Powered Features
- Flow optimization suggestions powered by AI
- Predictive performance (estimate before sending)
- Automated tagging based on email content
- Natural language flow queries ("Show me underperforming welcome emails")

### Integrations
- Shopify integration (revenue tracking)
- Google Analytics integration
- Custom webhook support
- Zapier/Make.com connectors

### Mobile App
- iOS and Android apps
- Push notifications for performance alerts
- Quick view for on-the-go monitoring
- Mobile-optimized visualizations

### Advanced Visualization
- Timeline view (see all emails in chronological order)
- Sankey diagram for flow paths
- Heatmap view for performance
- 3D flow visualization (experimental)

---

## 🎯 Success Metrics

### User Engagement
- **Target**: 80% weekly active users
- **Current**: TBD (need analytics)

### Performance
- **Load Time**: <2s for initial page load
- **Screenshot Generation**: <1 min for 10 emails

### User Satisfaction
- **NPS Score**: Target 50+ (Promoters)
- **Feature Adoption**: 60% of users use tags within first week

### Business Metrics
- **User Retention**: 80% month-over-month
- **Referral Rate**: 20% of users invite others

---

## 🔄 Development Process

### Sprint Cycle
- **Length**: 2 weeks
- **Planning**: Monday of Week 1
- **Demo**: Friday of Week 2
- **Retrospective**: Friday of Week 2

### Definition of Done
- [ ] Feature complete and tested locally
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] User testing completed
- [ ] Deployed to production
- [ ] Metrics tracked

### Release Process
1. Feature development on feature branches
2. PR to `multi-user-v2` branch
3. Code review and approval
4. Merge and deploy to Railway
5. Monitor logs for 24 hours
6. Mark as released in GitHub

---

## 📚 Documentation Roadmap

### User Documentation
- [ ] Getting Started Guide
- [ ] Video tutorials (YouTube)
- [ ] FAQ page
- [ ] Keyboard shortcuts reference
- [ ] Best practices guide

### Developer Documentation
- [ ] API documentation
- [ ] Architecture overview
- [ ] Database schema guide
- [ ] Contributing guidelines
- [ ] Testing guide

---

## 💬 Feedback Channels

**User Feedback**:
- GitHub Issues: Feature requests and bug reports
- Email: feedback@mmmarkit.com (coming soon)
- In-app feedback widget (v2.3)

**Analytics**:
- PostHog or Mixpanel integration (v2.3)
- Error tracking with Sentry (v2.2)
- Performance monitoring with Web Vitals

---

## 🏆 Competitive Advantages

What makes Klaviyo Flow Visualizer unique:

1. **Horizontal Layout**: Easy-to-scan left-to-right flow view
2. **Screenshot Previews**: See actual email designs at a glance
3. **Multi-User with Privacy**: Each marketer has their own view
4. **Tag-Based Organization**: Custom categorization system
5. **Performance Highlighting**: Instantly identify winners
6. **SMS + Email**: Handle both message types seamlessly
7. **mmmarKIT Brand**: Part of a growing suite of marketing tools
8. **Open Development**: Transparent roadmap and rapid iteration

---

## 🤔 Open Questions & Decisions Needed

1. **Pricing Model**: Free forever? Freemium? Subscription tiers?
2. **Data Retention**: How long to keep flow snapshots?
3. **Team Features**: Priority for v3.0 or push to v4.0?
4. **Mobile App**: Native or progressive web app (PWA)?
5. **White Label**: Allow agencies to rebrand for clients?

---

## 📞 Get Involved

**Contribute**:
- Report bugs: GitHub Issues
- Suggest features: GitHub Discussions
- Submit PRs: See CONTRIBUTING.md

**Stay Updated**:
- Follow on Twitter: @mmmarkit (coming soon)
- Join Discord: discord.gg/mmmarkit (coming soon)
- Newsletter: mmmarkit.com/newsletter (coming soon)

---

**Roadmap maintained by**: mmmarKIT Team
**Last review**: January 2025
**Next review**: February 2025
