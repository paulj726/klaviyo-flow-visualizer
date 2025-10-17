# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klaviyo Flow Visualizer is a web-based dashboard that provides horizontal visualization of Klaviyo email flows. It's a lightweight Express.js server that serves a single-page application displaying email flow data with filtering and tagging capabilities.

## Development Commands

```bash
# Start the development server
npm start

# Server runs on http://localhost:3000
```

## Architecture

### Application Structure

This is a simple three-layer application:

1. **Backend (server.js)**: Minimal Express server that:
   - Serves static files (index.html, app.js)
   - Provides CORS support
   - Contains a stub `/api/flows` endpoint for future Klaviyo API integration

2. **Frontend (index.html)**: Single-page HTML with:
   - All CSS defined inline in `<style>` tags
   - Responsive horizontal flow layout
   - Sticky header with stats
   - Tag-based filtering system
   - Modal for email previews (not yet implemented)

3. **Frontend Logic (app.js)**: Vanilla JavaScript that:
   - Manages in-memory flow data (currently hardcoded sample data)
   - Implements filtering by tags
   - Handles localStorage persistence for user-added tags
   - Renders flows dynamically using template strings

### Data Model

The core data structure is `flowsData` in app.js, which contains an array of flow objects:

```javascript
{
  flows: [
    {
      id: string,           // Klaviyo flow ID
      name: string,         // Display name
      status: "live",       // Current status
      type: string,         // Flow type (welcome, abandoned-cart, etc.)
      klaviyoUrl: string,   // Direct link to Klaviyo editor
      emails: [
        {
          id: string,
          name: string,
          delay: string,
          tags: string[],   // User-managed tags
          metrics: {
            openRate: number,
            clickRate: number,
            conversionRate: number
          }
        }
      ]
    }
  ]
}
```

### Key Design Decisions

**State Management**: Data is stored in a global `flowsData` object and persisted to localStorage when tags are modified. On page load, localStorage data overrides hardcoded sample data.

**Filtering Logic**: When a tag filter is active, the app filters each flow's emails array and only shows flows that have at least one email matching the filter. The "all" filter shows everything.

**Tag System**: Tags are user-managed strings. Available tags are defined in `availableTags` array but not enforced. Users can add any tag via prompt dialog.

**Rendering**: The entire flows container is re-rendered on every state change using template strings. No virtual DOM or diffing.

## Future Integration Points

### Klaviyo API Integration

The `/api/flows` endpoint in server.js is a placeholder. To connect to real Klaviyo data:

1. Add Klaviyo API key to environment variable
2. Implement Klaviyo API calls in server.js
3. Update app.js to fetch from `/api/flows` instead of using hardcoded data
4. Map Klaviyo's flow/email structure to the local data model

Key Klaviyo APIs needed:
- List flows
- Get flow details
- Get email metrics

### Email Screenshot Generation

The email preview functionality (`.email-preview` divs) currently shows placeholders. To add real previews:

1. Generate screenshots of email templates (server-side using Puppeteer or similar)
2. Store screenshots as files or URLs
3. Add `previewUrl` field to email objects
4. Update `renderEmails()` to use `<img>` tags instead of placeholders

## File Organization

- `server.js` - Express server (43 lines)
- `app.js` - Frontend JavaScript logic (365 lines)
- `index.html` - HTML + inline CSS (435 lines)
- `flows-data.json` - Empty placeholder for future API data persistence
- `package.json` - Dependencies: express, cors

## UI Components

**Header**: Displays live flow count, total email count, last updated timestamp

**Filters Bar**: Horizontal list of tag buttons. Active filter gets purple background.

**Flow Row**: Each flow is a card containing:
- Flow header with title, status badge, type, edit link, collapse button
- Horizontal scrollable email container
- Arrow connectors between emails

**Email Card**: 350px wide card showing:
- Numbered badge
- Email preview area (400px height)
- Email name and delay
- Tags (clickable to filter, plus add tag button)
- Performance metrics (open/click/conversion rates)

## Color Scheme

- Primary action: `#667eea` (purple-blue)
- Live status: `#c6f6d5` (green)
- Background: `#f5f7fa` (light gray)
- Cards: white with `#e2e8f0` borders
- Tag colors vary by type (discount=red, loyalty=yellow, social-proof=purple, urgency=pink)

## State Persistence

Tags added by users are saved to localStorage under the key `klaviyoFlowsData`. On page load, `loadData()` checks for saved data and merges it with the initial data structure.

**Note**: This means tag changes persist across sessions, but the underlying flow/email data still comes from the hardcoded sample data in app.js.
