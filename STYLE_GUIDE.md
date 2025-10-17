# mmmarKIT Style Guide
**Version 1.0 | Updated: January 2025**

> This style guide defines the visual identity for mmmarKIT and all its tools, including the Klaviyo Flow Visualizer. Reference this guide frequently to ensure brand consistency across all touchpoints.

---

## 🎯 Brand Essence

**Keywords**: Modern, Essential, Integrated, Strategic, Professional, Approachable, No-Nonsense, Smooth, Effortless

**Core Philosophy**:
mmmarKIT is a lovingly crafted collection of marketing tools that smooth the rough edges of everyday marketing tasks. Like WD-40 on a squeaky door, a perfectly broken-in loafer, or that favorite coffee mug that makes everything taste better—our tools bring comfort and ease to your workflow. We make marketing tasks better through intuitive, enthusiast-crafted tools that feel natural to use.

**Brand Promise**:
Introduce ease into your 9-to-5. Experience what it feels like when your workflow flows smooth.

---

## 🎨 Color Palette

### Primary Colors

```css
/* Primary Blue - Dominant accent, main text, primary CTAs */
--mmm-blue-primary: #2A4B8D;
--mmm-blue-rgb: 42, 75, 141;
--mmm-blue-cmyk: 70%, 47%, 0%, 45%;

/* Background Cream - Primary background for all surfaces */
--mmm-cream-bg: #EAE4DB;
--mmm-cream-rgb: 234, 228, 219;
--mmm-cream-cmyk: 0%, 3%, 6%, 8%;

/* Accent Red - Highlights, secondary CTAs (use sparingly) */
--mmm-red-accent: #8B091B;
--mmm-red-rgb: 139, 9, 27;
--mmm-red-cmyk: 0%, 94%, 81%, 45%;

/* Dark Grey - Body text, subheadings, subtle borders */
--mmm-grey-dark: #464646;
--mmm-grey-rgb: 70, 70, 70;
--mmm-grey-cmyk: 0%, 0%, 0%, 72%;

/* Light Grey - Borders, dividers, inactive states */
--mmm-grey-light: #C6C4C1;
--mmm-grey-rgb: 198, 196, 193;
--mmm-grey-cmyk: 0%, 1%, 2%, 22%;

/* Off-White - Clean highlights, details on dark backgrounds */
--mmm-off-white: #FCFCFC;
--mmm-off-white-rgb: 252, 252, 252;
--mmm-off-white-cmyk: 0%, 0%, 0%, 1%;
```

### Extended UI Colors

```css
/* Blue Variants */
--mmm-blue-hover: #1E3A6F;      /* Darker blue for hover states */
--mmm-blue-light: #4A6BAD;       /* Lighter blue for backgrounds */
--mmm-blue-alpha-10: rgba(42, 75, 141, 0.1);  /* Subtle backgrounds */
--mmm-blue-alpha-20: rgba(42, 75, 141, 0.2);  /* Hover backgrounds */

/* Semantic Colors */
--mmm-success: #2D7A3E;          /* Success messages, positive indicators */
--mmm-warning: #D97706;          /* Warnings, caution states */
--mmm-error: #B91C1C;            /* Errors, destructive actions */
--mmm-info: #3B82F6;             /* Informational messages */

/* Performance Indicators (for metrics display) */
--mmm-perf-excellent: #059669;   /* 30%+ rates */
--mmm-perf-good: #10B981;        /* 20-30% rates */
--mmm-perf-average: #F59E0B;     /* 10-20% rates */
--mmm-perf-poor: #EF4444;        /* <10% rates */
```

### Color Usage Guidelines

- **Primary Blue**: Use for all primary CTAs, headings, links, and brand elements
- **Cream Background**: Default background for all pages and surfaces
- **Red Accent**: Use sparingly—only for important highlights or secondary CTAs
- **Dark Grey**: Standard body text color, ensuring WCAG AA compliance
- **Light Grey**: Borders, dividers, disabled states
- **Performance Colors**: Automatically apply based on metric values

**Accessibility**: All text colors must meet WCAG 2.1 Level AA standards:
- Primary Blue (#2A4B8D) on Cream (#EAE4DB): ✅ 6.8:1 contrast
- Dark Grey (#464646) on Cream (#EAE4DB): ✅ 5.2:1 contrast
- Off-White (#FCFCFC) on Primary Blue (#2A4B8D): ✅ 7.1:1 contrast

---

## 📐 Spacing System

Based on 8px grid system for consistent rhythm:

```css
--space-xs: 4px;    /* Tight spacing, small gaps */
--space-sm: 8px;    /* Default gap between related items */
--space-md: 16px;   /* Standard spacing between sections */
--space-lg: 24px;   /* Large spacing, visual breaks */
--space-xl: 32px;   /* Extra large spacing, major sections */
--space-2xl: 48px;  /* Page-level spacing */
--space-3xl: 64px;  /* Hero sections, major breaks */
```

**Usage Examples**:
- Padding inside cards: `--space-lg` (24px)
- Gap between cards: `--space-md` (16px)
- Margin between sections: `--space-xl` (32px)
- Button padding: `--space-sm` horizontal, `--space-xs` vertical

---

## 🔤 Typography

### Font Family

**Primary Font**: [Montserrat](https://fonts.google.com/specimen/Montserrat)
- **Rationale**: Geometric, modern sans-serif with excellent readability
- **Weights**: 400 (Regular), 600 (SemiBold), 700 (Bold)
- **Fallback**: `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`

```css
--font-primary: 'Montserrat', system-ui, -apple-system, sans-serif;
--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Type Scale

```css
--text-xs: 0.75rem;     /* 12px - Small labels, captions */
--text-sm: 0.875rem;    /* 14px - Secondary text, metadata */
--text-base: 1rem;      /* 16px - Body text (default) */
--text-lg: 1.125rem;    /* 18px - Emphasized body text */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 2rem;       /* 32px - Page titles */
--text-4xl: 2.5rem;     /* 40px - Hero text */
```

### Line Heights

```css
--leading-tight: 1.2;   /* Headings */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

### Typography Guidelines

**Headings**:
- H1: `--text-3xl`, `--font-weight-bold`, `--leading-tight`, `--mmm-blue-primary`
- H2: `--text-2xl`, `--font-weight-bold`, `--leading-tight`, `--mmm-blue-primary`
- H3: `--text-xl`, `--font-weight-semibold`, `--leading-tight`, `--mmm-grey-dark`

**Body Text**:
- Regular: `--text-base`, `--font-weight-regular`, `--leading-normal`, `--mmm-grey-dark`
- Emphasized: `--text-base`, `--font-weight-semibold`, `--leading-normal`, `--mmm-blue-primary`
- Small: `--text-sm`, `--font-weight-regular`, `--leading-normal`, `--mmm-grey-dark`

---

## 🎨 Component Specifications

### Buttons

**Primary Button**:
```css
background: var(--mmm-blue-primary);
color: var(--mmm-off-white);
padding: 10px 20px;
border-radius: 8px;
font-weight: 600;
font-size: var(--text-base);
transition: all 0.2s ease;

/* Hover state */
background: var(--mmm-blue-hover);
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(42, 75, 141, 0.2);
```

**Secondary Button**:
```css
background: var(--mmm-cream-bg);
color: var(--mmm-blue-primary);
border: 2px solid var(--mmm-blue-primary);
padding: 10px 20px;
border-radius: 8px;
font-weight: 600;
```

**Tertiary Button** (text-only):
```css
background: transparent;
color: var(--mmm-blue-primary);
padding: 8px 12px;
border: none;
font-weight: 600;
text-decoration: underline;
text-decoration-thickness: 2px;
text-underline-offset: 4px;
```

### Cards

```css
background: var(--mmm-off-white);
border: 2px solid var(--mmm-grey-light);
border-radius: 12px;
padding: var(--space-lg);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
transition: all 0.3s ease;

/* Hover state */
border-color: var(--mmm-blue-primary);
transform: translateY(-2px);
box-shadow: 0 8px 24px rgba(42, 75, 141, 0.12);
```

### Form Inputs

```css
background: var(--mmm-off-white);
border: 2px solid var(--mmm-grey-light);
border-radius: 6px;
padding: 10px 12px;
font-size: var(--text-base);
color: var(--mmm-grey-dark);
font-family: var(--font-primary);

/* Focus state */
border-color: var(--mmm-blue-primary);
outline: none;
box-shadow: 0 0 0 3px var(--mmm-blue-alpha-10);
```

### Badges & Tags

```css
display: inline-flex;
align-items: center;
gap: 4px;
padding: 4px 8px;
border-radius: 4px;
font-size: var(--text-xs);
font-weight: 600;
border: 1px solid currentColor;

/* Status variants */
.badge-live {
  background: rgba(45, 122, 62, 0.1);
  color: var(--mmm-success);
}
.badge-draft {
  background: rgba(198, 196, 193, 0.2);
  color: var(--mmm-grey-dark);
}
```

---

## 🖼️ Logo Specifications

### Primary Logo

**Construction**:
1. **Wordmark "mmmarKIT"**:
   - "mmm" in Montserrat Regular, size 0.85x relative to "KIT"
   - "KIT" in Montserrat Bold, uppercase
   - Letter spacing: -0.02em for tight, cohesive feel
   - The three m's flow together with equal spacing between each

2. **Toolbox Icon**:
   - Positioned above the 'a' in "marKIT"
   - Minimal, line-drawn style (2px stroke)
   - Contains subtle upward-trending wave inside
   - Color: `--mmm-blue-primary`
   - Size: 24px × 18px at standard logo size

3. **Vintage Tool Illustration** (optional accent):
   - Positioned to left or right of wordmark
   - Simple line drawings of classic tools
   - Style: Technical illustration, minimal detail
   - References: vintage tool catalogs, botanical illustration books

### Logo Usage

**Clearspace**: Minimum clearspace equals height of lowercase 'm' in wordmark

**Minimum Sizes**:
- Digital: 120px width
- Print: 0.75 inches width

**Color Variations**:
- **Full Color**: Blue toolbox + blue/red wordmark on cream
- **Monochrome Dark**: All `--mmm-blue-primary` on light backgrounds
- **Monochrome Light**: All `--mmm-off-white` on dark backgrounds
- **Greyscale**: All `--mmm-grey-dark` when color not available

**Prohibited Uses**:
- ❌ Do not stretch or distort proportions
- ❌ Do not change colors outside approved variations
- ❌ Do not add effects (drop shadows, gradients, etc.)
- ❌ Do not place on low-contrast backgrounds
- ❌ Do not rotate or tilt the logo

---

## 🎭 Illustration Style

### Visual Principles

**Style**: Clean, geometric, purposeful
- Isometric or flat perspectives
- Line-based with solid color fills
- 2-3px stroke weight for icons and illustrations
- Minimal detail—focus on clarity over complexity

**Subject Matter**:
- Marketing tools and concepts: charts, mail, megaphones, dashboards
- Abstract representations: gears, lightbulbs, connected nodes
- Vintage tool aesthetics: wrenches, hammers, toolboxes
- Data visualization: graphs, metrics, comparisons

### Color Usage in Illustrations

- **Primary element**: `--mmm-blue-primary`
- **Secondary element**: `--mmm-grey-light` or `--mmm-cream-bg`
- **Accent/highlight**: `--mmm-red-accent` (sparingly)
- **Background**: `--mmm-off-white` or transparent

### Icon Library

**Style**: Outlined, 24px × 24px grid
- **Stroke**: 2px width
- **Corners**: Rounded (2px radius)
- **Style**: Geometric, consistent angles
- **Color**: Single color, typically `--mmm-blue-primary`

**Example Icons**:
- 📧 Email (envelope)
- 💬 SMS (chat bubble with phone)
- 📊 Analytics (bar chart)
- 🏷️ Tag (label shape)
- ⚙️ Settings (gear)
- 📈 Growth (upward trending line)
- 🎯 Target (bullseye)
- 🔄 Refresh (circular arrows)

---

## 📱 Data Visualization Guidelines

### Chart Colors

**Primary data series**:
```css
--chart-primary: var(--mmm-blue-primary);
--chart-secondary: var(--mmm-blue-light);
--chart-tertiary: var(--mmm-grey-light);
```

**Performance metrics** (semantic):
```css
--chart-excellent: #059669;
--chart-good: #10B981;
--chart-average: #F59E0B;
--chart-poor: #EF4444;
```

### Metric Display

**Performance Badges**:
- 🏆 Best Performer: Gold badge, trophy icon
- ⭐ High Performer: Blue star, above average
- 📈 Improving: Green arrow, positive trend
- 📉 Declining: Red arrow, negative trend

**Metric Cards**:
```css
display: flex;
flex-direction: column;
gap: var(--space-xs);

/* Value */
font-size: var(--text-2xl);
font-weight: 700;
color: var(--mmm-blue-primary);

/* Label */
font-size: var(--text-sm);
color: var(--mmm-grey-dark);
text-transform: uppercase;
letter-spacing: 0.05em;
```

---

## ✍️ Tone of Voice

### Written Communication

**Characteristics**:
- **Clear**: Use simple, direct language
- **Confident**: Know your subject, speak with authority
- **Empowering**: Help users feel capable and supported
- **Knowledgeable**: Demonstrate expertise without being condescending
- **Helpful**: Focus on solutions, not problems
- **Approachable**: Conversational but professional

**Writing Guidelines**:
- Use active voice
- Keep sentences short and scannable
- Avoid marketing jargon when plain language works
- Use "you" and "your" to speak directly to users
- Focus on benefits, not features
- Use metaphors that evoke comfort and ease

**Examples**:

✅ **Good**: "Your flows are performing well. Open rates are up 12% this month."
❌ **Bad**: "Pursuant to our analysis, your marketing automation sequences demonstrate positive performance metrics."

✅ **Good**: "Make your workflow smoother with these intuitive tools."
❌ **Bad**: "Leverage our cutting-edge SaaS solutions to synergize your marketing operations."

---

## 🎬 Motion & Animation

### Animation Principles

**Timing**:
- **Fast**: 150ms - Hovers, small transitions
- **Medium**: 250ms - Modals, dropdowns
- **Slow**: 400ms - Page transitions, large movements

**Easing**:
```css
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
```

**Common Animations**:
- **Hover**: Subtle lift (`translateY(-2px)`) + shadow
- **Button press**: Slight scale down (`scale(0.98)`)
- **Modal enter**: Fade in + scale up from 0.95 to 1.0
- **Toast notifications**: Slide in from top or bottom

---

## ♿ Accessibility Standards

**WCAG 2.1 Level AA Compliance**:
- ✅ Color contrast ratios of 4.5:1 for normal text
- ✅ Color contrast ratios of 3:1 for large text (18pt+)
- ✅ All interactive elements keyboard accessible
- ✅ Focus states clearly visible
- ✅ Alt text for all meaningful images
- ✅ Semantic HTML structure
- ✅ ARIA labels where appropriate

**Focus Indicators**:
```css
outline: 2px solid var(--mmm-blue-primary);
outline-offset: 2px;
```

---

## 📋 Checklist for New Designs

Before launching any mmmarKIT-branded design:

- [ ] Logo properly sized and positioned with adequate clearspace
- [ ] Colors match the approved palette exactly
- [ ] Typography uses Montserrat with correct weights
- [ ] Spacing follows 8px grid system
- [ ] All text meets WCAG AA contrast requirements
- [ ] Interactive elements have clear hover and focus states
- [ ] Illustrations follow the geometric, line-based style
- [ ] Tone of voice is clear, confident, and helpful
- [ ] Animations are smooth and purposeful (not distracting)
- [ ] Design tested on mobile and desktop viewports

---

## 🔗 Resources

**Fonts**:
- [Montserrat on Google Fonts](https://fonts.google.com/specimen/Montserrat)

**Design Tools**:
- Color contrast checker: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Accessibility testing: [WAVE Browser Extension](https://wave.webaim.org/extension/)

**Brand Assets**:
- Logo files: `/assets/brand/logo/`
- Icon library: `/assets/brand/icons/`
- Illustration templates: `/assets/brand/illustrations/`

---

**Last Updated**: January 2025
**Maintained By**: mmmarKIT Design Team
**Questions?**: Refer to this guide first, then reach out to the design lead.
