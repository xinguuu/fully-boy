# Xingu Design System Guide

## 📌 Design Philosophy

> **"Energetic, Polished, and Production-Ready"**

Xingu's design system combines vibrant energy with meticulous attention to UX details:
- **Energetic**: Bold colors, smooth animations, and responsive interactions
- **Polished**: Professional hover states, transitions, and cursor management
- **Production-Ready**: Copy-paste code examples that work immediately

---

## 🎨 Brand Colors

### Primary Palette

#### Main - Vibrant Orange
```css
--primary-50:  #FFF4ED  /* Lightest - backgrounds */
--primary-100: #FFE8D6
--primary-200: #FFD1B3
--primary-300: #FFB38F
--primary-400: #FF946B
--primary-500: #FF6B35  /* Main brand color */
--primary-600: #E55A2A
--primary-700: #CC4920
--primary-800: #B23815
--primary-900: #99280B
```

**Usage:**
- Primary buttons, CTAs
- Active states, selected items
- Game host indicators
- Important notifications

#### Secondary - Electric Blue
```css
--secondary-50:  #EFF6FF
--secondary-100: #DBEAFE
--secondary-200: #BFDBFE
--secondary-300: #93C5FD
--secondary-400: #60A5FA
--secondary-500: #0EA5E9  /* Main secondary */
--secondary-600: #0284C7
--secondary-700: #0369A1
--secondary-800: #075985
--secondary-900: #0C4A6E
```

**Usage:**
- Secondary buttons
- Links, informational elements
- Player indicators
- Cool-toned backgrounds

#### Accent - Lime Green
```css
--accent-50:  #F7FEE7
--accent-100: #ECFCCB
--accent-200: #D9F99D
--accent-300: #BEF264
--accent-400: #A3E635
--accent-500: #84CC16  /* Main accent */
--accent-600: #65A30D
--accent-700: #4D7C0F
--accent-800: #3F6212
--accent-900: #365314
```

**Usage:**
- Success states
- Correct answers
- Winning indicators
- Trending content badges

### System Colors

#### Neutrals (Gray Scale)
```css
--gray-50:  #FAFAFA
--gray-100: #F5F5F5
--gray-200: #E5E5E5
--gray-300: #D4D4D4
--gray-400: #A3A3A3
--gray-500: #737373  /* Base gray */
--gray-600: #525252
--gray-700: #404040
--gray-800: #262626
--gray-900: #171717
```

#### Semantic Colors

```css
/* Success */
--success:       #10B981
--success-light: #D1FAE5
--success-dark:  #047857

/* Warning */
--warning:       #F59E0B
--warning-light: #FEF3C7
--warning-dark:  #D97706

/* Error */
--error:       #EF4444
--error-light: #FEE2E2
--error-dark:  #DC2626

/* Info */
--info:       #3B82F6
--info-light: #DBEAFE
--info-dark:  #1E40AF
```

### Dark Mode Colors

```css
/* Backgrounds */
--dark-1: #0F0F0F  /* Main background */
--dark-2: #1A1A1A  /* Cards, elevated surfaces */
--dark-3: #262626  /* Hover states */

/* Text */
--text-primary:   #FAFAFA
--text-secondary: #A3A3A3
--text-tertiary:  #737373

/* Borders */
--border-default: #404040
--border-subtle:  #262626
```

---

## ✍️ Typography

### Font Stack

#### Primary Font - Pretendard (Korean + English)
```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui,
             Roboto, sans-serif;
```

**Why Pretendard?**
- Optimized for Korean readability
- Modern, clean, and highly legible
- Open source and free
- Excellent web performance

#### Monospace Font - Fira Code
```css
font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
```

**Usage:** Code snippets, game IDs, room codes

### Type Scale

```css
--text-hero:       64px (4rem)     / line-height: 1.1  / font-weight: 800
--text-h1:         48px (3rem)     / line-height: 1.2  / font-weight: 700
--text-h2:         36px (2.25rem)  / line-height: 1.3  / font-weight: 700
--text-h3:         30px (1.875rem) / line-height: 1.3  / font-weight: 600
--text-h4:         24px (1.5rem)   / line-height: 1.4  / font-weight: 600
--text-h5:         20px (1.25rem)  / line-height: 1.5  / font-weight: 600
--text-body-lg:    18px (1.125rem) / line-height: 1.6  / font-weight: 400
--text-body:       16px (1rem)     / line-height: 1.6  / font-weight: 400
--text-body-sm:    14px (0.875rem) / line-height: 1.5  / font-weight: 400
--text-caption:    12px (0.75rem)  / line-height: 1.4  / font-weight: 500
```

### Font Weights

```
Thin:       100 (rarely used)
Light:      300 (secondary text)
Regular:    400 (body text)
Medium:     500 (emphasized text)
SemiBold:   600 (headings, buttons)
Bold:       700 (main headings)
ExtraBold:  800 (hero, display)
```

---

## 🧩 Component Design

### Buttons

#### Primary Button
```tsx
// Tailwind classes
className="
  bg-primary-500 hover:bg-primary-600 active:bg-primary-700
  text-white font-semibold
  px-6 py-3 rounded-lg
  transition-all duration-200 ease-out
  hover:scale-105 hover:shadow-lg
  active:scale-100
  disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100
  cursor-pointer
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
"

// CSS equivalent
.btn-primary {
  background-color: #FF6B35;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #E55A2A;
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(255, 107, 53, 0.25);
}

.btn-primary:active {
  background-color: #CC4920;
  transform: scale(1.0);
}

.btn-primary:disabled {
  background-color: #D4D4D4;
  cursor: not-allowed;
  transform: scale(1.0);
}

.btn-primary:focus-visible {
  outline: 2px solid #FF6B35;
  outline-offset: 2px;
}
```

#### Secondary Button (Outline)
```tsx
className="
  bg-transparent hover:bg-primary-50 active:bg-primary-100
  text-primary-500 font-semibold
  border-2 border-primary-500
  px-6 py-3 rounded-lg
  transition-all duration-200 ease-out
  hover:scale-105 hover:shadow-md
  active:scale-100
  disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed
  cursor-pointer
"
```

#### Ghost Button
```tsx
className="
  bg-transparent hover:bg-gray-100 active:bg-gray-200
  text-gray-700 font-medium
  px-4 py-2 rounded-lg
  transition-all duration-150 ease-out
  cursor-pointer
"
```

#### Icon Button
```tsx
className="
  w-10 h-10 rounded-full
  bg-transparent hover:bg-gray-100 active:bg-gray-200
  flex items-center justify-center
  transition-all duration-150 ease-out
  hover:scale-110
  cursor-pointer
"
```

#### Loading Button (with spinner)
```tsx
<button
  disabled
  className="
    bg-primary-500 text-white
    px-6 py-3 rounded-lg
    flex items-center gap-2
    cursor-wait
  "
>
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
  Loading...
</button>
```

### Input Fields

```tsx
// Text Input
className="
  h-11 w-full px-4
  border border-gray-300 rounded-lg
  bg-white
  text-gray-900 placeholder:text-gray-400
  transition-all duration-200 ease-out
  hover:border-gray-400
  focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
  focus:outline-none
  disabled:bg-gray-100 disabled:cursor-not-allowed
"

// Error State
className="
  h-11 w-full px-4
  border-2 border-error rounded-lg
  bg-error-light/30
  text-gray-900
  focus:ring-4 focus:ring-error/10
  focus:outline-none
"

// Success State
className="
  h-11 w-full px-4
  border-2 border-success rounded-lg
  bg-success-light/30
  focus:ring-4 focus:ring-success/10
  focus:outline-none
"
```

#### Input with Icon
```tsx
<div className="relative">
  <input
    type="text"
    className="h-11 w-full pl-10 pr-4 border border-gray-300 rounded-lg"
    placeholder="Search games..."
  />
  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
</div>
```

#### Textarea
```tsx
className="
  w-full px-4 py-3
  border border-gray-300 rounded-lg
  min-h-[120px] resize-y
  transition-all duration-200
  hover:border-gray-400
  focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
  focus:outline-none
"
```

### Cards

#### Default Card
```tsx
className="
  bg-white dark:bg-dark-2
  border border-gray-200 dark:border-dark-3
  rounded-xl p-6
  shadow-sm
  transition-all duration-300 ease-out
  hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1
  cursor-pointer
"
```

#### Game Card (Interactive)
```tsx
<div className="
  group
  bg-white dark:bg-dark-2
  border border-gray-200 dark:border-dark-3
  rounded-xl
  overflow-hidden
  shadow-sm
  transition-all duration-300 ease-out
  hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
  hover:border-primary-200
  cursor-pointer
">
  {/* Thumbnail with gradient */}
  <div className="relative h-48 overflow-hidden">
    <img
      src="/games/ox-quiz.jpg"
      alt="OX Quiz"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

    {/* Badge overlay */}
    <span className="absolute top-3 right-3 px-3 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full">
      인기
    </span>

    {/* Play icon on hover */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
        <Play className="w-8 h-8 text-primary-500" />
      </div>
    </div>
  </div>

  {/* Content */}
  <div className="p-6">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      OX 퀴즈
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      참/거짓으로 빠르게 정답을 맞히는 게임
    </p>

    {/* Meta info */}
    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <span className="flex items-center gap-1">
        <Users className="w-4 h-4" />
        2-50명
      </span>
      <span className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        10-15분
      </span>
      <span className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        4.8
      </span>
    </div>

    {/* Action button */}
    <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer">
      게임 만들기
    </button>
  </div>
</div>
```

#### Glass Card (Glassmorphism)
```tsx
className="
  bg-white/70 dark:bg-dark-2/70
  backdrop-blur-xl
  border border-white/20 dark:border-white/10
  rounded-2xl p-6
  shadow-2xl
  transition-all duration-300
  hover:bg-white/80 dark:hover:bg-dark-2/80
  cursor-pointer
"
```

### Badges

#### Status Badge
```tsx
// Success
className="inline-flex items-center gap-1 px-3 py-1 bg-success-light text-success-dark text-xs font-semibold rounded-full"

// Warning
className="inline-flex items-center gap-1 px-3 py-1 bg-warning-light text-warning-dark text-xs font-semibold rounded-full"

// Error
className="inline-flex items-center gap-1 px-3 py-1 bg-error-light text-error-dark text-xs font-semibold rounded-full"

// Info
className="inline-flex items-center gap-1 px-3 py-1 bg-info-light text-info-dark text-xs font-semibold rounded-full"

// Live indicator (pulsing)
<span className="inline-flex items-center gap-2 px-3 py-1 bg-error-light text-error-dark text-xs font-semibold rounded-full">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
  </span>
  LIVE
</span>
```

#### Count Badge
```tsx
className="
  absolute -top-1 -right-1
  min-w-[20px] h-5
  bg-error text-white
  text-xs font-bold
  rounded-full
  flex items-center justify-center
  px-1.5
  shadow-md
"
```

### Modal / Dialog

```tsx
// Overlay
<div className="
  fixed inset-0 z-50
  bg-black/50 backdrop-blur-sm
  flex items-center justify-center
  p-4
  animate-fade-in
">
  {/* Modal */}
  <div className="
    bg-white dark:bg-dark-2
    rounded-2xl
    max-w-md w-full
    p-8
    shadow-2xl
    animate-slide-up
  ">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        게임 만들기
      </h2>
      <button className="
        w-8 h-8 rounded-full
        bg-transparent hover:bg-gray-100
        flex items-center justify-center
        transition-colors
        cursor-pointer
      ">
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>

    {/* Content */}
    <div className="mb-6">
      <p className="text-gray-600 dark:text-gray-400">
        게임 템플릿을 선택하세요
      </p>
    </div>

    {/* Actions */}
    <div className="flex gap-3">
      <button className="flex-1 bg-transparent border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
        취소
      </button>
      <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all hover:scale-105 cursor-pointer">
        확인
      </button>
    </div>
  </div>
</div>
```

### Toast Notifications

```tsx
// Success Toast
<div className="
  fixed bottom-4 right-4 z-50
  bg-white dark:bg-dark-2
  border-l-4 border-success
  rounded-lg shadow-xl
  p-4 pr-6
  flex items-start gap-3
  max-w-sm
  animate-slide-up
">
  <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
    <Check className="w-3 h-3 text-white" />
  </div>
  <div>
    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
      게임이 생성되었습니다
    </h4>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      참가자를 초대하세요
    </p>
  </div>
  <button className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer">
    <X className="w-4 h-4 text-gray-400" />
  </button>
</div>

// Error Toast
<div className="
  fixed bottom-4 right-4 z-50
  bg-white dark:bg-dark-2
  border-l-4 border-error
  rounded-lg shadow-xl
  p-4 pr-6
  flex items-start gap-3
  max-w-sm
  animate-slide-up
">
  <div className="w-5 h-5 bg-error rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
    <AlertCircle className="w-3 h-3 text-white" />
  </div>
  <div>
    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
      오류가 발생했습니다
    </h4>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      다시 시도해주세요
    </p>
  </div>
</div>
```

### Skeleton Loading

```tsx
// Card Skeleton
<div className="bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-xl p-6 animate-pulse">
  <div className="h-48 bg-gray-200 dark:bg-dark-3 rounded-lg mb-4"></div>
  <div className="h-6 bg-gray-200 dark:bg-dark-3 rounded w-3/4 mb-3"></div>
  <div className="h-4 bg-gray-200 dark:bg-dark-3 rounded w-full mb-2"></div>
  <div className="h-4 bg-gray-200 dark:bg-dark-3 rounded w-5/6 mb-4"></div>
  <div className="h-10 bg-gray-200 dark:bg-dark-3 rounded"></div>
</div>

// Text Skeleton
<div className="space-y-3 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-full"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
</div>
```

### Progress Bar

```tsx
// Determinate
<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div
    className="h-full bg-primary-500 transition-all duration-300 ease-out"
    style={{ width: '60%' }}
  ></div>
</div>

// Indeterminate (loading)
<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div className="h-full w-1/3 bg-primary-500 animate-progress"></div>
</div>

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

### Switch / Toggle

```tsx
<button
  role="switch"
  aria-checked="false"
  className="
    relative inline-flex h-6 w-11
    items-center rounded-full
    bg-gray-200 hover:bg-gray-300
    transition-colors duration-200
    cursor-pointer
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
  "
>
  <span className="
    inline-block h-4 w-4
    transform rounded-full
    bg-white
    transition-transform duration-200
    translate-x-1
  "></span>
</button>

// Active state
className="bg-primary-500 hover:bg-primary-600"
// Thumb moves to translate-x-6
```

### Dropdown Menu

```tsx
<div className="relative">
  <button className="
    px-4 py-2
    bg-white border border-gray-300
    rounded-lg
    flex items-center gap-2
    hover:bg-gray-50
    transition-colors
    cursor-pointer
  ">
    옵션
    <ChevronDown className="w-4 h-4" />
  </button>

  {/* Dropdown */}
  <div className="
    absolute top-full left-0 mt-2
    w-48
    bg-white dark:bg-dark-2
    border border-gray-200 dark:border-dark-3
    rounded-lg
    shadow-xl
    py-2
    z-50
    animate-slide-up
  ">
    <button className="
      w-full px-4 py-2
      text-left text-sm
      hover:bg-gray-100 dark:hover:bg-dark-3
      transition-colors
      cursor-pointer
    ">
      편집하기
    </button>
    <button className="
      w-full px-4 py-2
      text-left text-sm
      hover:bg-gray-100 dark:hover:bg-dark-3
      transition-colors
      cursor-pointer
    ">
      복제하기
    </button>
    <div className="h-px bg-gray-200 dark:bg-dark-3 my-1"></div>
    <button className="
      w-full px-4 py-2
      text-left text-sm text-error
      hover:bg-error-light
      transition-colors
      cursor-pointer
    ">
      삭제하기
    </button>
  </div>
</div>
```

### Tabs

```tsx
<div className="border-b border-gray-200 dark:border-dark-3">
  <nav className="flex gap-6">
    {/* Active Tab */}
    <button className="
      pb-3 px-1
      border-b-2 border-primary-500
      text-primary-500 font-semibold
      transition-colors
      cursor-pointer
    ">
      전체
    </button>

    {/* Inactive Tab */}
    <button className="
      pb-3 px-1
      border-b-2 border-transparent
      text-gray-500 hover:text-gray-700
      font-medium
      transition-colors
      cursor-pointer
    ">
      인기
    </button>

    <button className="
      pb-3 px-1
      border-b-2 border-transparent
      text-gray-500 hover:text-gray-700
      font-medium
      transition-colors
      cursor-pointer
    ">
      신규
    </button>
  </nav>
</div>
```

---

## 📐 Layout System

### Spacing Scale (8px Base)

```css
--space-0:   0px
--space-1:   4px   (0.25rem)  /* xs */
--space-2:   8px   (0.5rem)   /* sm */
--space-3:   12px  (0.75rem)
--space-4:   16px  (1rem)     /* md */
--space-5:   20px  (1.25rem)
--space-6:   24px  (1.5rem)   /* lg */
--space-8:   32px  (2rem)     /* xl */
--space-10:  40px  (2.5rem)
--space-12:  48px  (3rem)     /* 2xl */
--space-16:  64px  (4rem)     /* 3xl */
--space-20:  80px  (5rem)
--space-24:  96px  (6rem)     /* 4xl */
```

### Container Widths

```
sm:   640px   /* Mobile landscape */
md:   768px   /* Tablet portrait */
lg:   1024px  /* Tablet landscape / small laptop */
xl:   1280px  /* Desktop */
2xl:  1536px  /* Large desktop */

Default Max Width: 1280px (xl)
Content Padding:   16px (mobile) / 24px (tablet) / 32px (desktop)
```

### Grid System

```
Columns:      12 (default)
Gutter:       16px (mobile) / 24px (tablet) / 32px (desktop)
```

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

---

## 🎯 Icons & Illustrations

### Icon System

**Library:** Lucide React (https://lucide.dev/)

**Sizes:**
```
xs:  12px
sm:  16px
md:  20px
lg:  24px
xl:  32px
2xl: 48px
```

**Stroke Width:** 2px (default)

**Color Variants:**
- Default: `currentColor` (inherits text color)
- Primary: `#FF6B35`
- Secondary: `#0EA5E9`
- Muted: `#737373`

### Illustration Style

**Characteristics:**
- Flat design with subtle gradients
- Rounded corners (friendly feel)
- Primary color accents
- Maximum 3 colors per illustration
- Playful and approachable

**Use Cases:**
- Empty states
- Onboarding screens
- Error pages
- Feature highlights

---

## 🌓 Dark Mode

### CSS Variables Approach

```css
/* Light mode (default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #171717;
  --text-secondary: #737373;
  --border-default: #E5E5E5;
}

/* Dark mode */
.dark {
  --bg-primary: #0F0F0F;
  --bg-secondary: #1A1A1A;
  --text-primary: #FAFAFA;
  --text-secondary: #A3A3A3;
  --border-default: #404040;
}

/* Usage */
.card {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
```

### Tailwind Dark Mode

```tsx
// Enable dark mode in tailwind.config.ts
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
}

// Usage
<div className="bg-white dark:bg-dark-1 text-gray-900 dark:text-white">
  Content
</div>
```

### Theme Toggle Component

```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="
        w-10 h-10 rounded-full
        bg-gray-100 dark:bg-dark-3
        hover:bg-gray-200 dark:hover:bg-dark-2
        flex items-center justify-center
        transition-all duration-200
        cursor-pointer
      "
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </button>
  );
}
```

---

## 📱 Responsive Design

### Mobile First Approach

```css
/* Mobile (default) */
.container { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { padding: 32px; }
}
```

### Touch Targets

**Minimum Size:** 44x44px (iOS) / 48x48px (Android)

**Spacing:** Minimum 8px between interactive elements

### Typography Scaling

```
Mobile:  Base 16px
Tablet:  Base 16px (scale up headings by 10%)
Desktop: Base 16px (scale up headings by 20%)
```

---

## 🎬 Animation & Transitions

### Timing Functions

```typescript
const easings = {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Tailwind's ease-out
};
```

### Duration Scale

```
instant: 100ms  /* Micro-interactions */
fast:    200ms  /* Button hovers, tooltips */
normal:  300ms  /* Modal opens, dropdown */
slow:    500ms  /* Page transitions */
slower:  700ms  /* Complex animations */
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 300ms ease-out;
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slideUp 400ms ease-out;
}
```

#### Slide Down
```css
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-down {
  animation: slideDown 400ms ease-out;
}
```

#### Scale In
```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-scale-in {
  animation: scaleIn 300ms ease-out;
}
```

#### Bounce
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce 2s ease-in-out infinite;
}
```

#### Spin (Loading)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
```

#### Pulse (Live Indicator)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Ping (Notification Dot)
```css
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

### Micro-interactions

#### Button Press
```css
.btn:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

#### Card Hover
```css
.card {
  transition: all 300ms ease-out;
}
.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

#### Input Focus
```css
.input {
  transition: all 200ms ease-out;
}
.input:focus {
  border-color: #FF6B35;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
}
```

#### Link Hover
```css
.link {
  position: relative;
  cursor: pointer;
}
.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 200ms ease-out;
}
.link:hover::after {
  width: 100%;
}
```

#### Ripple Effect (Advanced)
```tsx
function RippleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples([...ripples, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      className="relative overflow-hidden bg-primary-500 text-white px-6 py-3 rounded-lg cursor-pointer"
      onClick={addRipple}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}
      {children}
    </button>
  );
}

// CSS
@keyframes ripple {
  to {
    width: 500px;
    height: 500px;
    margin-left: -250px;
    margin-top: -250px;
    opacity: 0;
  }
}
.animate-ripple {
  animation: ripple 600ms ease-out;
}
```

---

## ♿ Accessibility (a11y)

### Color Contrast

**WCAG AA Compliance (Minimum):**
- Normal text (16px): 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Testing Tools:**
- Chrome DevTools (Lighthouse)
- axe DevTools Extension
- Contrast Checker (webaim.org)

### Focus States

```css
/* Visible focus indicator - ALWAYS include */
*:focus-visible {
  outline: 2px solid #FF6B35;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom focus ring for buttons */
.btn:focus-visible {
  outline: 2px solid #FF6B35;
  outline-offset: 2px;
}

/* Tailwind utility */
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
```

### ARIA Labels

```tsx
// Button with icon only
<button aria-label="Close dialog">
  <X size={20} />
</button>

// Image with alt text
<img src="game.png" alt="OX Quiz game preview" />

// Form input with label
<label htmlFor="username">Username</label>
<input id="username" type="text" aria-describedby="username-help" />
<span id="username-help" className="text-sm text-gray-500">
  Choose a unique username
</span>

// Loading state
<button aria-busy="true" aria-label="Loading">
  <Loader className="animate-spin" />
</button>

// Toggle switch
<button
  role="switch"
  aria-checked={isEnabled}
  onClick={() => setIsEnabled(!isEnabled)}
>
  {isEnabled ? 'On' : 'Off'}
</button>

// Modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">게임 만들기</h2>
  {/* content */}
</div>
```

### Keyboard Navigation

**Essential:**
- Tab order follows visual flow
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys navigate lists/grids

```tsx
// Keyboard-accessible dropdown
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <button onClick={() => setIsOpen(!isOpen)}>
        Options
      </button>
      {isOpen && (
        <div role="menu">
          <button role="menuitem">Edit</button>
          <button role="menuitem">Delete</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🖱️ Cursor Management (CRITICAL)

**IMPORTANT:** All interactive elements MUST have appropriate cursor styles.

### Cursor Types

```css
/* Clickable elements */
.clickable {
  cursor: pointer;
}

/* Links */
a {
  cursor: pointer;
}

/* Buttons */
button {
  cursor: pointer;
}

/* Disabled state */
button:disabled,
.disabled {
  cursor: not-allowed;
}

/* Loading state */
.loading {
  cursor: wait;
}

/* Text input */
input[type="text"],
textarea {
  cursor: text;
}

/* Drag and drop */
.draggable {
  cursor: grab;
}
.dragging {
  cursor: grabbing;
}

/* Help/Info */
.help {
  cursor: help;
}

/* Resize */
.resizable {
  cursor: nwse-resize;
}

/* Move */
.movable {
  cursor: move;
}

/* Not allowed */
.forbidden {
  cursor: not-allowed;
}

/* Zoom */
.zoomable {
  cursor: zoom-in;
}
```

### Interactive Element Checklist

```tsx
// ✅ Correct - All interactive elements have cursor pointer
<button className="cursor-pointer">Click me</button>
<a href="/games" className="cursor-pointer">Browse games</a>
<div onClick={handleClick} className="cursor-pointer">Card</div>
<input type="checkbox" className="cursor-pointer" />

// ❌ Wrong - Missing cursor styles
<button>Click me</button>
<div onClick={handleClick}>Card</div>
```

---

## 🎨 Advanced Patterns

### Glassmorphism Card

```tsx
<div className="
  relative
  bg-white/70 dark:bg-dark-2/70
  backdrop-blur-xl backdrop-saturate-150
  border border-white/20 dark:border-white/10
  rounded-2xl
  p-6
  shadow-2xl
  transition-all duration-300
  hover:bg-white/80 dark:hover:bg-dark-2/80
  cursor-pointer
">
  <h3 className="text-xl font-semibold mb-2">Glassmorphism Card</h3>
  <p className="text-gray-600 dark:text-gray-300">
    Modern, frosted glass effect
  </p>
</div>
```

### Gradient Border Card

```tsx
<div className="relative p-[2px] rounded-xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500">
  <div className="bg-white dark:bg-dark-2 rounded-[10px] p-6">
    <h3 className="text-xl font-semibold mb-2">Gradient Border</h3>
    <p className="text-gray-600 dark:text-gray-400">
      Vibrant gradient outline effect
    </p>
  </div>
</div>
```

### Neumorphism Button (Soft UI)

```css
.neomorphic-btn {
  background: #e0e5ec;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow:
    6px 6px 12px #b8bcc4,
    -6px -6px 12px #ffffff;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.neomorphic-btn:active {
  box-shadow:
    inset 6px 6px 12px #b8bcc4,
    inset -6px -6px 12px #ffffff;
}
```

### Parallax Card Hover

```tsx
'use client';

import { useRef, useState } from 'react';

export function ParallaxCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 200ms ease-out',
      }}
    >
      {children}
    </div>
  );
}
```

### Shimmer Effect (Loading)

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #f8f8f8 40px,
    #f0f0f0 80px
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

### Confetti Animation (Celebration)

```tsx
'use client';

import confetti from 'canvas-confetti';

export function CelebrationButton() {
  const handleClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B35', '#0EA5E9', '#84CC16'],
    });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 cursor-pointer"
    >
      Celebrate!
    </button>
  );
}
```

---

## 📦 Implementation with Tailwind CSS

### Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF4ED',
          100: '#FFE8D6',
          200: '#FFD1B3',
          300: '#FFB38F',
          400: '#FF946B',
          500: '#FF6B35',
          600: '#E55A2A',
          700: '#CC4920',
          800: '#B23815',
          900: '#99280B',
        },
        secondary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        accent: {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        dark: {
          1: '#0F0F0F',
          2: '#1A1A1A',
          3: '#262626',
        },
        success: '#10B981',
        'success-light': '#D1FAE5',
        'success-dark': '#047857',
        warning: '#F59E0B',
        'warning-light': '#FEF3C7',
        'warning-dark': '#D97706',
        error: '#EF4444',
        'error-light': '#FEE2E2',
        'error-dark': '#DC2626',
        info: '#3B82F6',
        'info-light': '#DBEAFE',
        'info-dark': '#1E40AF',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        hero: ['64px', { lineHeight: '1.1', fontWeight: '800' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'slide-down': 'slideDown 400ms ease-out',
        'scale-in': 'scaleIn 300ms ease-out',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'ripple': 'ripple 600ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ripple: {
          '0%': { width: '0', height: '0', opacity: '0.5' },
          '100%': { width: '500px', height: '500px', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'inner-soft': 'inset 6px 6px 12px #b8bcc4, inset -6px -6px 12px #ffffff',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
```

### Component Class Examples

```tsx
// Button variants (production-ready)
const buttonVariants = {
  primary: `
    bg-primary-500 hover:bg-primary-600 active:bg-primary-700
    text-white font-semibold
    px-6 py-3 rounded-lg
    transition-all duration-200 ease-out
    hover:scale-105 hover:shadow-lg
    active:scale-100
    disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100
    cursor-pointer
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
  `.trim().replace(/\s+/g, ' '),

  secondary: `
    bg-transparent hover:bg-primary-50 active:bg-primary-100
    text-primary-500 font-semibold
    border-2 border-primary-500
    px-6 py-3 rounded-lg
    transition-all duration-200 ease-out
    hover:scale-105 hover:shadow-md
    active:scale-100
    disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed
    cursor-pointer
  `.trim().replace(/\s+/g, ' '),

  ghost: `
    bg-transparent hover:bg-gray-100 active:bg-gray-200
    text-gray-700 font-medium
    px-4 py-2 rounded-lg
    transition-all duration-150 ease-out
    cursor-pointer
  `.trim().replace(/\s+/g, ' '),
};

// Card
const cardClass = `
  bg-white dark:bg-dark-2
  border border-gray-200 dark:border-dark-3
  rounded-xl p-6
  shadow-sm
  transition-all duration-300 ease-out
  hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1
  cursor-pointer
`.trim().replace(/\s+/g, ' ');

// Input
const inputClass = `
  h-11 w-full px-4
  border border-gray-300 rounded-lg
  bg-white
  text-gray-900 placeholder:text-gray-400
  transition-all duration-200 ease-out
  hover:border-gray-400
  focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
  focus:outline-none
  disabled:bg-gray-100 disabled:cursor-not-allowed
`.trim().replace(/\s+/g, ' ');
```

---

## 📚 Design Resources

### Figma File Structure (Recommended)

```
📁 Xingu Design System
  📄 01-Foundation (Colors, Typography, Spacing)
  📄 02-Components (Buttons, Inputs, Cards)
  📄 03-Patterns (Navigation, Forms, Modals)
  📄 04-Screens (Browse, Play, Results)
  📄 05-Icons (Lucide icon set)
```

### Tools & Libraries

- **UI Components**: Shadcn UI (Tailwind + Radix)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Confetti**: canvas-confetti
- **Color Palette**: Coolors.co, Realtime Colors
- **Contrast Check**: WebAIM Contrast Checker
- **Dark Mode**: next-themes

---

## ✅ Design Checklist

Before launching any new feature:

### Visual & Layout
- [ ] Follows color system (primary, secondary, accent)
- [ ] Typography uses correct scale and weights
- [ ] Spacing follows 8px grid system
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode tested and working

### Interactivity & States
- [ ] All clickable elements have `cursor: pointer`
- [ ] Buttons have hover/active/disabled states
- [ ] Focus states visible for keyboard navigation
- [ ] Loading states show spinner or skeleton
- [ ] Error states clearly communicated
- [ ] Success states provide feedback

### Accessibility
- [ ] WCAG AA contrast ratios met (4.5:1 for text)
- [ ] Focus indicators visible (2px outline)
- [ ] ARIA labels on icon-only buttons
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Touch targets minimum 44x44px
- [ ] Alt text on all images

### Performance
- [ ] Animations feel smooth (300ms default)
- [ ] No layout shift during loading
- [ ] Images optimized and lazy loaded
- [ ] Icons use Lucide with 2px stroke

### Polish
- [ ] Micro-interactions add delight
- [ ] Transitions are consistent
- [ ] Empty states designed
- [ ] Error pages styled
- [ ] Tooltips helpful

---

## 🔄 Recent Changes

### 2025-11-11: Enhanced Design System (v2)
- **Status**: ✅ Complete
- **Changes**:
  1. ✅ Added explicit cursor management for all interactive elements
  2. ✅ Enhanced button states (hover, active, disabled, loading)
  3. ✅ Added production-ready code examples (copy-paste ready)
  4. ✅ Added advanced patterns (glassmorphism, gradient borders, parallax)
  5. ✅ Added practical components (toast, skeleton, progress, dropdown)
  6. ✅ Enhanced animations (shimmer, ripple, confetti)
  7. ✅ Added CSS variables for theme management
  8. ✅ Expanded accessibility guidelines
  9. ✅ Added cursor types reference (pointer, wait, not-allowed, etc.)
  10. ✅ Added comprehensive Tailwind config with all tokens

- **Key Improvements**:
  - **Cursor Management**: All interactive elements explicitly define cursor styles
  - **State Coverage**: Loading, success, error, disabled states for all components
  - **Code Quality**: Production-ready, copy-paste examples that work immediately
  - **Modern Patterns**: Glassmorphism, gradient borders, parallax effects
  - **Micro-interactions**: Ripple, shimmer, scale, shadow effects
  - **Practical Components**: Toast notifications, skeleton loaders, dropdowns
  - **Accessibility**: WCAG AA compliance, keyboard navigation, ARIA labels

### 2025-11-11: Initial Design System Created
- **Status**: ✅ Complete
- **Changes**:
  1. Defined brand color palette (Orange, Blue, Lime)
  2. Typography system with Pretendard font
  3. Component design patterns (buttons, cards, inputs)
  4. Layout system with 8px spacing scale
  5. Dark mode specifications
  6. Responsive design guidelines
  7. Animation & transition standards
  8. Accessibility (a11y) requirements
  9. Tailwind CSS implementation guide

---

**Remember**: Consistency and attention to detail create professional experiences. Always use `cursor: pointer` on clickable elements!
