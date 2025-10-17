# 🎨 Visual Mockup - Klaviyo Flow Visualizer

## Interface Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  📧 Klaviyo Flow Visualizer                                         │
│  Live Flows: 8 | Total Emails: 23 | Last Updated: Just now         │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Filter by tag:  [All] [Discount] [Loyalty] [Social Proof] [Urgency]│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  [Welcome] Welcome Series - Email  [LIVE]  welcome                  │
│  [Edit in Klaviyo →]  [Collapse]                                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  ①          │ →  │  ②          │ →  │  ③          │         │
│  │ ┌──────────┐│    │ ┌──────────┐│    │ ┌──────────┐│         │
│  │ │  Email   ││    │ │  Email   ││    │ │  Email   ││         │
│  │ │ Preview  ││    │ │ Preview  ││    │ │ Preview  ││         │
│  │ │  Image   ││    │ │  Image   ││    │ │  Image   ││         │
│  │ │  Here    ││    │ │  Here    ││    │ │  Here    ││         │
│  │ │          ││    │ │          ││    │ │          ││         │
│  │ └──────────┘│    │ └──────────┘│    │ └──────────┘│         │
│  │ Welcome Email  │    │ Email 2      │    │ Email 3      │         │
│  │ Introduce Brand│    │ Product      │    │ Last Chance  │         │
│  │ ⏱️ Immediately │    │ Highlights   │    │ ⏱️ 5 days    │         │
│  │              │    │ ⏱️ 2 days     │    │              │         │
│  │ [welcome]     │    │              │    │ [welcome]     │         │
│  │ [discount]    │    │ [welcome]     │    │ [urgency]     │         │
│  │ [+ Add Tag]   │    │ [social-proof]│    │ [+ Add Tag]   │         │
│  │              │    │ [+ Add Tag]   │    │              │         │
│  │ 45.2%  12.3%  │    │ 38.5%  10.1%  │    │ 32.1%  8.5%   │         │
│  │ Open   Click  │    │ Open   Click  │    │ Open   Click  │         │
│  │ 2.1% Conv     │    │ 1.8% Conv     │    │ 1.5% Conv     │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  [ACE] Abandoned Cart - Added to Cart  [LIVE]  abandoned-cart      │
│  [Edit in Klaviyo →]  [Collapse]                                    │
│  ┌──────────────┐    ┌──────────────┐                              │
│  │  ①          │ →  │  ②          │                              │
│  │ ┌──────────┐│    │ ┌──────────┐│                              │
│  │ │  Email   ││    │ │  Email   ││                              │
│  │ │ Preview  ││    │ │ Preview  ││                              │
│  │ │          ││    │ │          ││                              │
│  │ └──────────┘│    │ └──────────┘│                              │
│  │ Cart Reminder 1│    │ Cart Reminder 2│                              │
│  │ ⏱️ 4 hours    │    │ Added Incentive│                              │
│  │              │    │ ⏱️ 1 day      │                              │
│  │ [urgency]     │    │              │                              │
│  │ [discount]    │    │ [urgency]     │                              │
│  │ [+ Add Tag]   │    │ [discount]    │                              │
│  │              │    │ [+ Add Tag]   │                              │
│  │ 52.3%  18.2%  │    │ 44.1%  15.3%  │                              │
│  │ Open   Click  │    │ Open   Click  │                              │
│  │ 5.2% Conv     │    │ 4.1% Conv     │                              │
│  └──────────────┘    └──────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘

[Continue scrolling down to see all 8 live flows...]
```

## Key Visual Elements

### Color Coding

**Flow Status Badge:**
- 🟢 LIVE = Green background (#c6f6d5)

**Tags:**
- 🔴 discount = Red/pink (#fed7d7)
- 🟡 loyalty = Yellow/orange (#fef5e7)
- 🟣 social-proof = Purple (#e9d8fd)
- 🔴 urgency = Pink (#fed7e2)
- 🔵 welcome = Light blue

**Interactive States:**
- Hover on email card = Lifts up with shadow
- Hover on filter button = Darker background
- Active filter = Purple with white text

### Layout Specifications

**Email Card Dimensions:**
- Width: 350px (fixed)
- Preview area: 350px × 400px
- Border radius: 8px
- Spacing between cards: 24px (1.5rem)

**Flow Row:**
- Background: White
- Border radius: 12px
- Padding: 24px
- Margin between flows: 24px
- Shadow: Subtle, increases on hover

**Typography:**
- Headers: 1.125rem (18px), semi-bold
- Email names: 16px, semi-bold
- Metrics: 16px for values, 10px for labels
- Tags: 12px
- Delay info: 12px

### Interaction Points

1. **Click Email Preview** → Opens full-size modal (coming soon)
2. **Click + Add Tag** → Prompt to enter tag name
3. **Click Tag** → Filters view to that tag
4. **Click Filter Button** → Filters all flows
5. **Click Edit in Klaviyo** → Opens flow in new tab
6. **Click Collapse** → Hides email cards (toggle)

### Scrolling Behavior

- **Horizontal scroll** within each flow row (smooth)
- **Vertical scroll** for the entire page
- Custom scrollbar styling (rounded, purple)

### Responsive Features

- Email cards maintain 350px width
- Flow container scrolls horizontally
- Header stays fixed at top
- Filter bar stays visible below header

## Data Flow

```
Current State (MVP):
Sample Data → app.js → Renders to HTML → localStorage for tags

Future State (Full Version):
Klaviyo API → server.js → app.js → Screenshot Service → Renders to HTML → Database for tags
```

## Future Visual Enhancements

1. **Email Previews**: 
   - Generate actual screenshots of email templates
   - Show full preview in modal on click
   - Thumbnail generation via headless browser

2. **Performance Indicators**:
   - Color-code metrics (red/yellow/green)
   - Show trend arrows (↑↓)
   - Performance comparison across flows

3. **Visual Flow Connections**:
   - Animated arrows showing timing
   - Branch visualization for conditional splits
   - Wait time indicators between emails

4. **Advanced Filters**:
   - Multi-select tags
   - Performance threshold sliders
   - Date range picker
   - Search bar with autocomplete

5. **Bulk Operations**:
   - Select multiple emails
   - Bulk tag assignment
   - Comparison view side-by-side

6. **Export Options**:
   - PDF generation of entire view
   - PNG screenshot
   - Share link with filters applied
   - Print-friendly view
```
