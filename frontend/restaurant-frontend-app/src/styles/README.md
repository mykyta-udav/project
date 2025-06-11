# Style Guide - Green & Tasty Restaurant App

## Overview
This document outlines the reusable styles and patterns established to maintain consistency and avoid code duplication across the application.

## Brand Colors
The brand colors are defined in `tailwind.config.js` and can be used throughout the application:

```css
/* Available as Tailwind classes */
text-brand-green    /* #00AD0C - Primary green */
text-brand-dark     /* #232323 - Dark text */
border-brand-green  /* Green borders */
bg-brand-green      /* Green backgrounds */
```

## Typography
Use the predefined typography classes from `index.css`:

### Headers
- `.text-h1` - Main page headings (48px, medium)
- `.text-h2` - Section headings (24px, medium) 
- `.text-h3` - Subsection headings (18px, medium)

### Body Text
- `.text-navigation` - Navigation links (20px, medium)
- `.text-body-text` - Emphasized body text (14px, medium)
- `.text-body` - Regular body text (14px, light)
- `.text-button-primary` - Primary button text (14px, bold)
- `.text-button-secondary` - Secondary button text (14px, medium)

### Small Text
- `.text-caption` - Small descriptive text (12px, light)
- `.text-link` - Small links (12px, bold)

## Component Classes

### Header Components
```css
.header-container     /* Main header wrapper */
.header-content       /* Header content layout */
.logo-container       /* Logo section wrapper */
.logo-icon           /* Logo icon container */
.logo-text           /* Logo text styling */
.logo-green          /* Green part of logo */
.logo-dark           /* Dark part of logo */
.nav-container       /* Navigation wrapper */
.nav-links-wrapper   /* Navigation links container */
.nav-link            /* Base navigation link */
.nav-link-active     /* Active navigation state */
.nav-link-inactive   /* Inactive navigation state */
.sign-in-wrapper     /* Sign in button container */
.btn-sign-in         /* Sign in button styling */
```

### Button Components
```css
.btn-primary         /* Primary action buttons */
.btn-secondary       /* Secondary action buttons */
```

## Custom Spacing
Custom spacing values are defined in `tailwind.config.js`:

```css
h-18    /* 72px height - Used for header */
ml-120  /* 480px margin - Used for sign-in positioning */
```

## Usage Examples

### Creating a New Navigation Link
```tsx
// Active link
<a href="#" className="nav-link-active mr-4">
  Page Name
</a>

// Inactive link  
<a href="#" className="nav-link-inactive">
  Page Name
</a>
```

### Using Brand Colors
```tsx
// Green text
<span className="text-brand-green">Green Text</span>

// Dark text
<span className="text-brand-dark">Dark Text</span>

// Green border
<div className="border border-brand-green">Content</div>
```

### Typography Consistency
```tsx
// Page heading
<h1 className="text-h1">Page Title</h1>

// Navigation text
<a className="text-navigation">Navigation Item</a>

// Body text
<p className="text-body">Regular paragraph text</p>
```

## Font Setup
- **Poppins**: Used for headings and navigation (`font-poppins`)
- **Inter**: Used for body text (default)

Both fonts are imported in `index.css` and configured in `tailwind.config.js`.

## Benefits of This Approach

1. **Consistency**: All similar elements use the same styling
2. **Maintainability**: Change one class definition to update all instances
3. **Reusability**: Easy to apply consistent styling to new components
4. **Scalability**: Easy to extend with new component classes
5. **Performance**: Smaller CSS bundle due to class reuse

## Adding New Component Classes

When creating new reusable components, follow this pattern in `index.css`:

```css
@layer components {
  .component-name {
    @apply tailwind-classes-here;
  }
  
  .component-variant {
    @apply component-name additional-classes;
  }
}
```

## Color Palette Extension
To add new brand colors, update `tailwind.config.js`:

```js
colors: {
  brand: {
    green: '#00AD0C',
    dark: '#232323',
    // Add new colors here
    light: '#F5F5F5',
    accent: '#FF6B35',
  }
}
``` 