# UI Guidelines: Neo-Postman Core

**Feature**: 001-postman-core  
**Date**: 2025-12-05  
**Design System**: Linear/Modern (see `/prompt-for-fe.md`)

## Overview

Neo-Postman follows the Linear/Modern design system - a dark, cinematic aesthetic with ambient lighting effects, multi-layer shadows, and precision micro-interactions. The goal is software that feels like a premium desktop application.

**Source of Truth**: `/prompt-for-fe.md` contains the complete design system specification.

---

## Color Token Mapping

### Base Palette (from design system)

| Token | Value | Usage in Neo-Postman |
|-------|-------|---------------------|
| `background-deep` | `#020203` | App shell, deepest layers |
| `background-base` | `#050506` | Main canvas, page background |
| `background-elevated` | `#0a0a0c` | Sidebar, panels |
| `surface` | `rgba(255,255,255,0.05)` | Cards, request builder |
| `surface-hover` | `rgba(255,255,255,0.08)` | Hovered cards |
| `foreground` | `#EDEDEF` | Primary text |
| `foreground-muted` | `#8A8F98` | Descriptions, metadata |
| `accent` | `#5E6AD2` | Buttons, links, active states |
| `border-default` | `rgba(255,255,255,0.06)` | Card borders, dividers |

### HTTP Method Colors (Extension)

Extend the accent palette for HTTP method badges:

| Method | Color | Tailwind Class |
|--------|-------|----------------|
| GET | `#10B981` (emerald) | `bg-emerald-500/20 text-emerald-400` |
| POST | `#3B82F6` (blue) | `bg-blue-500/20 text-blue-400` |
| PUT | `#F59E0B` (amber) | `bg-amber-500/20 text-amber-400` |
| PATCH | `#8B5CF6` (violet) | `bg-violet-500/20 text-violet-400` |
| DELETE | `#EF4444` (red) | `bg-red-500/20 text-red-400` |
| HEAD | `#6B7280` (gray) | `bg-gray-500/20 text-gray-400` |
| OPTIONS | `#6B7280` (gray) | `bg-gray-500/20 text-gray-400` |

### Status Code Colors

| Range | Color | Meaning |
|-------|-------|---------|
| 2xx | `#10B981` (emerald) | Success |
| 3xx | `#3B82F6` (blue) | Redirect |
| 4xx | `#F59E0B` (amber) | Client error |
| 5xx | `#EF4444` (red) | Server error |

---

## Component Guidelines

### App Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header (environment selector, sync status)      bg-deep   │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │           Main Panel                         │
│  bg-elevated │          bg-base                             │
│              │  ┌────────────────────────────────────────┐  │
│  Collections │  │  Request Builder (surface card)        │  │
│  History     │  │  URL bar, headers, body, auth          │  │
│              │  └────────────────────────────────────────┘  │
│              │  ┌────────────────────────────────────────┐  │
│              │  │  Response Viewer (surface card)        │  │
│              │  │  Status, headers, body                 │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Request Builder Card

**Container:**
- Background: `bg-gradient-to-b from-white/[0.08] to-white/[0.02]`
- Border: `border border-white/[0.06]`
- Radius: `rounded-2xl`
- Shadow: Multi-layer (see design system)
- Padding: `p-6`

**Mouse-tracking spotlight:** Enable on the entire card container.

**URL Bar:**
- Full width input with method selector prefix
- Background: `bg-[#0F0F12]`
- Border: `border-white/10` → `border-accent` on focus
- Font: Monospace for URL portion
- Highlight `{{variables}}` with accent color background

**Headers/Body Tabs:**
- Tab bar with subtle bottom border
- Active tab: Gradient text + accent underline
- Inactive tab: Muted text
- Content area: No additional card, flows into parent

**Send Button:**
- Primary button style with accent glow
- Loading state: Pulse animation on glow
- Position: Right side of URL bar

### Response Viewer Card

**Container:** Same styling as Request Builder

**Status Bar:**
- Status code with color badge (see Status Code Colors)
- Response time: `{time}ms` in muted text
- Response size: `{size} KB` in muted text
- Layout: Horizontal with gaps

**Tabs (Headers/Body/Raw):**
- Same tab styling as request builder
- Default to Body tab

**Response Body:**
- Monaco Editor or code block with syntax highlighting
- JSON: Collapsible sections at each level
- Background: Slightly darker than card (`bg-[#0a0a0c]`)
- Line numbers in muted color
- Copy button (ghost style) in top-right

**Error State:**
- Red-tinted surface: `bg-red-500/10`
- Error icon + message
- Retry button (secondary style)

**Loading State:**
- Skeleton shimmer effect
- Or: Centered spinner with "Sending request..." text

### Sidebar

**Container:**
- Background: `bg-[#0a0a0c]` (elevated)
- Width: `280px` (resizable optional)
- Border-right: `border-white/[0.06]`

**Tab Switcher (Collections / History):**
- Horizontal tabs at top
- Active: Accent color text + underline
- Inactive: Muted text

**Collection Tree:**
- Indentation: `16px` per level
- Folder icons: Chevron for expand/collapse
- Request items: Method badge + name
- Hover: `bg-white/[0.05]` + subtle glow
- Selected: `bg-accent/10` + accent left border

**History List:**
- Grouped by date (Today, Yesterday, etc.)
- Each entry: Method badge + URL (truncated) + status badge
- Timestamp in muted text
- Hover: Same as collection items

**Context Menus:**
- Glass effect: `bg-[#0a0a0c]/90 backdrop-blur-xl`
- Border: `border-white/10`
- Items: `hover:bg-white/[0.05]`
- Separator: `border-white/[0.06]`

### Environment Selector

**Dropdown Trigger:**
- Ghost button style with current env name
- Chevron icon
- Position: Header area

**Dropdown Menu:**
- Glass effect (same as context menus)
- Environment items with radio indicator
- "Manage Environments" link at bottom
- Divider above manage link

**Environment Editor Modal:**
- Centered modal with backdrop blur
- Card styling for modal container
- Variable list as editable table
- Add/Remove variable buttons (ghost style)

### Auth Editor

**Tab in Request Builder:**
- Auth type selector (None, Bearer, API Key)
- Conditional fields based on type

**Bearer Token:**
- Single input for token value
- Support `{{variable}}` syntax

**API Key:**
- Key name input
- Key value input
- Placement toggle (Header / Query)

---

## Typography in Neo-Postman

| Element | Style | Class |
|---------|-------|-------|
| App title | Display, gradient | `text-2xl font-semibold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent` |
| Section headers | H2 | `text-xl font-semibold text-foreground` |
| Request name | H3 | `text-lg font-semibold text-foreground` |
| URL | Body, mono | `text-base font-mono text-foreground` |
| Labels | Label | `text-xs font-medium uppercase tracking-wider text-foreground-muted` |
| Body text | Body | `text-sm text-foreground-muted` |
| Code/JSON | Mono | `font-mono text-sm` |

---

## Animation Guidelines

### Request Send

1. **Button press:** `scale-[0.98]` for 100ms
2. **Loading state:** Glow pulse on send button (800ms loop)
3. **Response arrival:** Fade-up entrance (300ms, expo-out)

### Sidebar Interactions

- **Folder expand:** Height transition (200ms, expo-out)
- **Item hover:** Background fade (150ms)
- **Selection:** Immediate (no transition)

### Modal Open/Close

- **Open:** Fade in + scale from 0.95 (300ms)
- **Close:** Fade out + scale to 0.95 (200ms)
- **Backdrop:** Fade in/out (200ms)

### Tab Switching

- **Underline:** Slide to new position (200ms, expo-out)
- **Content:** Crossfade (150ms)

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 768px` | Sidebar hidden (toggle), stacked request/response |
| `768px - 1024px` | Sidebar visible, stacked request/response |
| `> 1024px` | Full layout, side-by-side option for request/response |

### Mobile Adaptations

- Sidebar becomes slide-out drawer
- Request/Response stack vertically
- Tabs become scrollable if needed
- Touch targets minimum 44px

---

## Accessibility Requirements

Per constitution (Principle V: User Experience Consistency):

- **Focus states:** Visible ring on all interactive elements
- **Color contrast:** Minimum 4.5:1 for text
- **Keyboard navigation:** All actions reachable via keyboard
- **Screen readers:** Proper ARIA labels on icons, status badges
- **Reduced motion:** Respect `prefers-reduced-motion`, disable parallax and ambient animations

---

## Tailwind Config Extensions

Add these to `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        'bg-deep': '#020203',
        'bg-base': '#050506',
        'bg-elevated': '#0a0a0c',
        'surface': 'rgba(255,255,255,0.05)',
        'surface-hover': 'rgba(255,255,255,0.08)',
        'foreground': '#EDEDEF',
        'foreground-muted': '#8A8F98',
        'accent': '#5E6AD2',
        'accent-bright': '#6872D9',
        'accent-glow': 'rgba(94,106,210,0.3)',
        'border-default': 'rgba(255,255,255,0.06)',
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1)',
        'accent-glow': '0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(94,106,210,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(94,106,210,0.5)' },
        },
      },
    },
  },
}
```

---

## Implementation Checklist

When building UI components, verify:

- [ ] Uses design tokens (no hardcoded colors)
- [ ] Has multi-layer shadow (not single shadow)
- [ ] Hover state includes subtle glow
- [ ] Focus state has visible ring
- [ ] Animations use expo-out easing
- [ ] Respects reduced motion preference
- [ ] Works on mobile breakpoints
- [ ] Has loading state for async operations
- [ ] Has error state with clear messaging
