# Cockatiel Finances – Design Guide (shadcn/ui Adapted)

This document defines how **Cockatiel Finances customizes shadcn/ui**.
It intentionally **reuses shadcn standards** and only overrides what is necessary.

Audience:
- AI code agents
- Frontend developers using shadcn/ui
- Designers aligning UI decisions with implementation

---

## 1. Design Philosophy (Aligned with shadcn)

- Use shadcn/ui defaults wherever possible
- Override tokens, not components
- Green = money & positive actions
- Gold = rewards & value
- Mascot colors = accents only
- Dark mode = comfortable, not pitch black

---

## 2. shadcn/ui Color Token Mapping

shadcn/ui relies on **semantic CSS variables**, not raw colors.
We adapt those variables to match Cockatiel Finances branding.

---

## 3. Light Mode (shadcn Tokens)

```css
:root {
  /* Base */
  --background:  #ECFDF5; /* light green tint */
  --foreground:  #1F2937;

  --card:        #FFFFFF;
  --card-foreground: #1F2937;

  --popover:     #FFFFFF;
  --popover-foreground: #1F2937;

  /* Primary (Money Green) */
  --primary:     #22C55E;
  --primary-foreground: #FFFFFF;

  /* Secondary (Soft Green) */
  --secondary:   #DCFCE7;
  --secondary-foreground: #14532D;

  /* Muted */
  --muted:       #ECFDF5;
  --muted-foreground: #6B7280;

  /* Accent (Mascot support) */
  --accent:      #FACC15; /* cockatiel yellow */
  --accent-foreground: #422006;

  /* Destructive (Mascot Cheeks - Orange) */
  --destructive: #F97316; /* Orange-500 */
  --destructive-foreground: #FFFFFF;

  /* Borders & Inputs */
  --border:      #E5E7EB;
  --input:       #E5E7EB;
  --ring:        #22C55E;

  /* Radius */
  --radius: 0.75rem;
}
```

Notes:
- Primary maps directly to money-green
- Accent is allowed to be yellow (mascot-safe)
- Background stays slightly green-tinted

---

## 4. Dark Mode (shadcn Tokens)

```css
.dark {
  /* Base */
  --background:  #0C0A09; /* stone-950 */
  --foreground:  #F5F5F4; /* stone-50 */

  --card:        #1C1917; /* stone-900 */
  --card-foreground: #F5F5F4;

  --popover:     #1C1917; /* stone-900 */
  --popover-foreground: #F5F5F4;

  /* Primary (Muted Green) */
  --primary:     #34D399;
  --primary-foreground: #064E3B;

  /* Secondary */
  --secondary:   #292524; /* stone-800 */
  --secondary-foreground: #D1FAE5;

  /* Muted */
  --muted:       #292524; /* stone-800 */
  --muted-foreground: #A8A29E; /* stone-400 */

  /* Accent */
  --accent:      #FDE047;
  --accent-foreground: #422006;

  /* Destructive */
  --destructive: #FB923C; /* Orange-400 for dark mode visibility */
  --destructive-foreground: #431407; /* Orange-950 */

  /* Borders & Inputs */
  --border:      #44403C; /* stone-700 */
  --input:       #44403C;
  --ring:        #34D399;
}
```

Dark mode rules:
- ❌ No pure black backgrounds
- ❌ No pure white text blocks
- ✅ Greens are slightly muted
- ✅ Gold/yellow stays readable

---

## 5. Reward & Gold Usage (Non-semantic)

Gold is **not mapped** to shadcn semantic tokens.
It is used explicitly where value is communicated.

```css
--gold-primary: #F59E0B;
--gold-soft:    #FDE68A;
```

Usage:
- Savings goals
- Rewards
- Premium indicators

---

## 6. Typography (shadcn-compatible)

### Primary Font

```css
--font-sans: 'Inter', system-ui, sans-serif;
```

Used by all shadcn components by default.

---

### Optional Mono Font

```css
--font-mono: 'JetBrains Mono', monospace;
```

Usage:
- Balances
- Transaction IDs
- Tables with numbers

Rule:
- ❌ Never use mono for paragraphs

---

## 7. Component Behavior Guidelines

- Buttons: use shadcn variants (default, secondary, ghost)
- Do NOT introduce custom button styles
- Prefer `cn()` + variants over new CSS
- Accent color only for badges, icons, illustrations

---

## 8. Accessibility Rules

- Follow shadcn defaults (WCAG AA)
- Do not encode meaning by color alone
- Status = icon + text

---

## 9. One Rule to Enforce

> Customize tokens, not components.

If a change cannot be done via tokens, reconsider it.

---

**End of shadcn-adapted Design Guide**

