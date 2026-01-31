# TailoredAIResume Design System

## Brand Identity

**Product Name:** TailoredAIResume  
**Tagline:** AI-Powered Resume Builder  
**Logo Mark:** TAR (in gradient box)

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F9F9F7` | Page background (warm off-white, paper-like) |
| `--color-surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `--color-accent` | `#2C3E50` | Primary buttons, links, focus states |

### Brand Gradient

```css
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
```

**Usage:** Logo, primary CTAs, feature highlights, Auth page branding

| Stop | Color | Name |
|------|-------|------|
| 0% | `#6366F1` | Indigo |
| 50% | `#8B5CF6` | Violet |
| 100% | `#A855F7` | Purple |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text` | `#1F2223` | Primary text (soft charcoal) |
| `--color-text-muted` | `#5F6368` | Secondary text, descriptions |
| `--color-text-light` | `#9CA3AF` | Placeholder, tertiary text |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#15803D` | Success states, checkmarks |
| `--color-error` | `#B91C1C` | Errors, destructive actions |
| `#10B981` | - | ATS score good, positive badges |
| `#F59E0B` | - | Warning, medium scores |

### Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border` | `#E0E0E0` | Default borders |
| `--color-border-focused` | `#2C3E50` | Focus state borders |
| `#E2E8F0` | - | Subtle dividers |

---

## Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `--font-serif` | Playfair Display | Headings, brand text |
| `--font-sans` | Inter | Body text, UI elements |

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
```

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `--font-size-xs` | 0.75rem (12px) | Fine print, badges |
| `--font-size-sm` | 0.875rem (14px) | Small text, labels |
| `--font-size-base` | 1rem (16px) | Body text |
| `--font-size-lg` | 1.125rem (18px) | Subheadings |
| `--font-size-xl` | 1.25rem (20px) | Card titles |
| `--font-size-2xl` | 1.5rem (24px) | Section titles |
| `--font-size-3xl` | 1.875rem (30px) | Page titles |
| `--font-size-4xl` | 2.25rem (36px) | Hero text |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 | Body text |
| 500 | Labels, emphasized text |
| 600 | Buttons, subheadings |
| 700 | Headings, brand text |

---

## Spacing Scale

| Token | Size | Pixels |
|-------|------|--------|
| `--spacing-1` | 0.25rem | 4px |
| `--spacing-2` | 0.5rem | 8px |
| `--spacing-3` | 0.75rem | 12px |
| `--spacing-4` | 1rem | 16px |
| `--spacing-6` | 1.5rem | 24px |
| `--spacing-8` | 2rem | 32px |
| `--spacing-12` | 3rem | 48px |
| `--spacing-16` | 4rem | 64px |

---

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `--radius-sm` | 4px | Small chips, tags |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |

**Brand Shadow (Logo):**
```css
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
```

---

## Transitions

| Token | Duration | Usage |
|-------|----------|-------|
| `--transition-fast` | 150ms ease | Hovers, toggles |
| `--transition-base` | 250ms ease | Page transitions, modals |

---

## Component Patterns

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
color: white;
padding: 14px 24px;
border-radius: 10px;
box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
```

**Outline Button:**
```css
background: transparent;
border: 1px solid var(--color-border);
color: var(--color-text);
```

### Cards

```css
background: var(--color-surface);
border-radius: var(--radius-lg);
padding: var(--spacing-6);
box-shadow: var(--shadow-md);
border: 1px solid var(--color-border);
```

### Input Fields

```css
padding: 14px;
border: 1px solid #e2e8f0;
border-radius: 10px;
font-size: 1rem;
transition: border-color 0.2s;

/* Focus State */
border-color: #6366F1;
```

---

## Logo Specifications

**Sidebar Logo:**
```css
width: 40px;
height: 40px;
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
border-radius: 10px;
font: bold 14px Inter;
letter-spacing: -0.5px;
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
```

**Auth Page Logo:**
```css
width: 56px;
height: 56px;
border-radius: 14px;
box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
```

---

## Dark Mode (Optional)

```css
body.dark {
  --color-bg: #111;
  --color-surface: #1E1E1E;
  --color-text: #F3F4F6;
  --color-text-muted: #9CA3AF;
  --color-border: #333;
  --color-accent: #E2E8F0;
}
```

---

## Design Principles

1. **Clean & Professional** - Minimal clutter, generous whitespace
2. **Paper-like Warmth** - Off-white backgrounds, soft shadows
3. **Editorial Typography** - Playfair Display for elegance, Inter for readability
4. **Gradient Accents** - Purple gradient for premium feel and brand recognition
5. **Consistent Spacing** - 4px base unit, powers of 2 scale
6. **Accessible Contrast** - WCAG AA compliant color combinations
