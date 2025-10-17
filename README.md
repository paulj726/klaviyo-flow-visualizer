# 📧 Klaviyo Flow Visualizer

A beautiful, horizontal visualization dashboard for your Klaviyo email flows.

## ✨ Features

- **Horizontal Layout**: Flows displayed left-to-right instead of Klaviyo's vertical layout
- **Live Flows Only**: Filters to show only active/live flows
- **Larger Previews**: 350px wide email cards (vs tiny Klaviyo thumbnails)
- **Tag System**: Tag emails with content types (discount, loyalty, urgency, etc.)
- **Filter by Tags**: Instantly filter all flows by tag to find specific content
- **Performance Metrics**: See open, click, and conversion rates at a glance
- **Direct Links**: Click to edit any flow directly in Klaviyo

## 🚀 Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open your browser**:
   ```
   http://localhost:3000
   ```

## 🎯 Current Status

### What's Working:
- ✅ Horizontal flow visualization
- ✅ **Real Klaviyo API integration** (fetches your actual flows!)
- ✅ Tag filtering system
- ✅ Click to add tags (saved to localStorage)
- ✅ Performance metrics display
- ✅ Links to edit in Klaviyo
- ✅ Responsive layout with smooth scrolling
- ✅ Automatic data refresh
- ✅ Fallback to cached/sample data if API fails

### What's Next:
- 📸 Automatic email screenshot generation
- 🎨 Full-size email preview modal
- 📊 Real metrics from Klaviyo Reporting API
- 📊 Enhanced filtering (by performance, date, etc.)
- 🔍 Search functionality
- 📤 Export/share flows view

## 🏗️ Project Structure

```
klaviyo-flow-visualizer/
├── index.html      # Main HTML interface
├── app.js          # Frontend JavaScript logic
├── server.js       # Node.js Express server
├── package.json    # Dependencies
└── README.md       # This file
```

## 🎨 How to Use

### View All Flows
When you open the app, you'll see all your live flows in a horizontal layout. Each flow shows:
- Flow name and status badge
- Type (welcome, abandoned cart, etc.)
- Individual emails arranged left to right
- Arrows showing the flow progression

### Filter by Content
Use the filter buttons at the top to show only emails containing specific content:
- **All Emails** - Show everything
- **Discount** - Emails with discount offers
- **Loyalty** - Loyalty/rewards program emails
- **Social Proof** - Reviews, testimonials, UGC
- **Urgency** - Limited time, low stock, expiring offers
- **Welcome** - Welcome series emails

### Add Tags
Click the "+ Add Tag" button on any email card to categorize it. Available tags:
- `discount`
- `loyalty`
- `social-proof`
- `urgency`
- `welcome`
- `product-recs`

Tags are saved to your browser's localStorage.

### Edit in Klaviyo
Click the "Edit in Klaviyo →" button to open the flow in Klaviyo's editor.

## 🔌 Klaviyo API Setup

The app is now fully integrated with the Klaviyo API! To get it working:

1. **Get your Klaviyo Private API Key**:
   - Go to Klaviyo → Settings → API Keys
   - Create a new Private API Key with `flows:read` permission

2. **Add your API key to the `.env` file**:
   ```bash
   KLAVIYO_API_KEY=your_private_api_key_here
   PORT=3000
   ```

3. **Restart the server**:
   ```bash
   npm start
   ```

That's it! The app will now fetch your real flows from Klaviyo.

### How It Works

- The app fetches all live flows from your Klaviyo account
- For each flow, it retrieves all email actions (flow-actions)
- Flow types are automatically detected from flow names
- User-added tags are preserved across refreshes using localStorage
- If the API is unavailable, it falls back to cached or sample data

## 🎨 Customization

### Add More Tags
Edit the `availableTags` array in `app.js`:
```javascript
const availableTags = ['discount', 'loyalty', 'new-tag-here'];
```

### Change Colors
All colors are defined in the `<style>` section of `index.html`. Key color variables:
- Primary: `#667eea` (purple/blue)
- Success: `#c6f6d5` (green for "live" badge)
- Background: `#f5f7fa` (light gray)

### Adjust Card Width
In `index.html`, find `.email-card` and change:
```css
flex: 0 0 350px;  /* Change 350px to your preferred width */
```

## 💡 Pro Tips

1. **Quick Filter**: Click any tag on an email card to filter to that tag
2. **Collapse Flows**: Use the "Collapse" button to hide flows you're not currently reviewing
3. **Tag Strategy**: Develop a consistent tagging taxonomy across your team
4. **Cross-Flow Analysis**: Use filters to see all emails with loyalty content across different flows

## 📝 Sample Data

The app currently shows sample data for these live flows from your account:
- Welcome Series - Email
- Abandoned Cart - Added to Cart
- Abandoned Cart - Started Checkout
- Browse Abandonment
- Post Purchase
- Yotpo Loyalty - Redemption Earned
- Yotpo Loyalty - Referral Share
- Back in Stock

## 🤝 Contributing Ideas

Future enhancements we could build:
- A/B test visualization
- Email content diff tool
- Performance trend charts
- Bulk tag operations
- Export to PDF/image
- Team collaboration features
- Email template library

## 📄 License

Built for Garrett Wade's internal use.

---

**Need help?** The app is self-contained and runs locally. All data is stored in your browser's localStorage.
