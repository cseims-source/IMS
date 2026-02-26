# Dark Mode & Text Visibility Implementation Guide

## Overview
This guide outlines the dark mode implementation in your AIET application and best practices for ensuring text remains visible across light and dark modes.

## Current Setup

### Theme System
- **Location**: `frontend/src/contexts/ThemeContext.jsx`
- **Method**: Class-based dark mode using Tailwind CSS
- **Storage**: LocalStorage persistence
- **Trigger**: Manual toggle in header component

### Tailwind Configuration
- **Dark Mode**: `class` strategy in `tailwind.config.js`
- **Color Palette**: Customized indigo/violet primary colors
- **Responsive**: Full dark mode support across all utilities

## Text Color Best Practices

### Rule 1: Always Pair Text Colors in Dark Mode
When setting text color, use the pattern: `text-{color}-{shade}` + `dark:text-{color}-{different-shade}`

**Good Examples:**
```jsx
// Headings
<h1 className="text-gray-900 dark:text-white">Title</h1>

// Body text
<p className="text-gray-700 dark:text-gray-100">Description</p>

// Muted/secondary text
<span className="text-gray-600 dark:text-gray-400">Meta</span>

// Subtle text
<p className="text-gray-500 dark:text-gray-500">Caption</p>
```

**Avoid:**
```jsx
// ❌ Missing dark mode variant
<p className="text-gray-900">Text</p>

// ❌ Insufficient contrast
<p className="text-gray-800">Text</p> 

// ❌ No visible text in dark mode
<p className="text-white dark:text-gray-500">Text</p>
```

### Rule 2: Text Color Mapping

| Purpose | Light Mode | Dark Mode | Class |
|---------|-----------|----------|-------|
| Primary Headings | `text-gray-900` | `dark:text-white` | `.heading-dark` |
| Secondary Headings | `text-gray-800` | `dark:text-gray-100` | `.heading-secondary` |
| Body Text | `text-gray-700` | `dark:text-gray-200` | `.text-body` |
| Secondary Body | `text-gray-600` | `dark:text-gray-400` | `.text-muted` |
| Subtle/Caption | `text-gray-500` | `dark:text-gray-500` | `.text-subtle` |
| Labels | `text-gray-700` | `dark:text-gray-300` | `.label-primary` |
| Disabled/Muted Labels | `text-gray-500` | `dark:text-gray-400` | `.label-muted` |

## Utility Classes Added

We've added convenient utility classes for semantic text styling:

### Text Utilities
```jsx
<p className="heading-dark">Main Title</p>
<p className="heading-secondary">Subtitle</p>
<p className="text-body">Body paragraph</p>
<p className="text-muted">Secondary text</p>
<p className="text-subtle">Subtle caption</p>
```

### Form & Label Utilities
```jsx
<label className="label-primary">Primary Label</label>
<label className="label-muted">Secondary Label</label>
<input className="input-text" type="text" />
```

### Table Utilities
```jsx
<thead>
  <tr className="table-header">
    <th>Header</th>
  </tr>
</thead>
<tbody>
  <tr className="table-row">
    <td>Data</td>
  </tr>
</tbody>
```

### Background Utilities
```jsx
<div className="bg-card-light">Content</div>
<div className="bg-card-subtle">Subtle background</div>
```

## Component-Wide Updates

### Global Input Styling
All input elements now automatically style for dark mode:
- Text color adjusts based on mode
- Placeholder text becomes visible in dark mode
- Focus states maintain visibility
- Border colors match the color scheme

### Form Elements
- `<input>` - Auto-styled text and border colors
- `<textarea>` - Consistent styling with inputs
- `<select>` - Options visible in both modes
- Radio/Checkbox - Auto-styled with dark mode support

### Table Elements
- Headers have proper contrast in both modes
- Row text remains readable
- Hover states work in both modes
- Cell borders adapt to background

## Implementation Timeline

✅ **Phase 1: Complete** - Global CSS enhancements
- Added dark mode base layer styles
- Enhanced input/form element styling
- Added utility class library
- Scrollbar styling for dark mode

✅ **Phase 2: Required** - Update existing components
Components still needing updates for full compatibility:
- Form components with custom styling
- Data tables and grids
- Modal/dialog boxes
- Navigation elements

⏳ **Phase 3: Ongoing** - New feature consistency
- All new components should use the utility classes
- Test both modes during development
- Use browser DevTools to toggle dark mode

## Testing Dark Mode

### Manual Testing
1. Click the moon/sun icon in the header to toggle mode
2. Verify all text is readable in both modes
3. Check contrast ratios (should be 4.5:1 minimum for body text)
4. Test on different page sections

### Programmatic Testing
```javascript
// In console, toggle dark mode
document.documentElement.classList.toggle('dark')

// Check if dark mode is active
document.documentElement.classList.contains('dark')
```

### Browser DevTools
- Chrome: F12 → Rendering → Emulate CSS media feature prefers-color-scheme
- Firefox: Inspector → Inspector Settings → Simulate color scheme

## Color Contrast Reference

### WCAG AA (Minimum Recommended)
- Large text (18pt+): 3:1 contrast ratio
- Normal text: 4.5:1 contrast ratio

### Your Color Palette Safe Combinations

**Light Mode on White Background:**
- ✅ #111827 (gray-900) - 17.25:1 contrast
- ✅ #1f2937 (gray-800) - 14.43:1 contrast
- ✅ #374151 (gray-700) - 8.59:1 contrast
- ✅ #4b5563 (gray-600) - 6.7:1 contrast
- ✅ #6b7280 (gray-500) - 4.5:1 contrast

**Dark Mode on #111827 Background:**
- ✅ #ffffff (white) - 22.69:1 contrast
- ✅ #f3f4f6 (gray-100) - 19.17:1 contrast
- ✅ #e5e7eb (gray-200) - 16.27:1 contrast
- ✅ #d1d5db (gray-300) - 13.5:1 contrast
- ✅ #9ca3af (gray-400) - 6.78:1 contrast

## Quick Migration Guide

### For Existing Pages
Replace static text colors with paired variants:

**Before:**
```jsx
<h1 className="text-2xl font-bold text-gray-900">Heading</h1>
<p className="text-gray-600">Paragraph</p>
```

**After:**
```jsx
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Heading</h1>
<p className="text-gray-600 dark:text-gray-300">Paragraph</p>
```

Or use utility classes:

```jsx
<h1 className="text-2xl font-bold heading-dark">Heading</h1>
<p className="text-muted">Paragraph</p>
```

## File Locations

- **Theme Context**: `frontend/src/contexts/ThemeContext.jsx`
- **Global Styles**: `frontend/src/index.css`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Dark Mode Toggle**: `frontend/src/components/Header.jsx`

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE 11: Not supported (class-based dark mode)

## Common Issues & Solutions

### Issue: Text is invisible in dark mode
**Solution**: Check if the element has a static text color without a `dark:` variant.

### Issue: Placeholder text not visible
**Solution**: Ensure `<input>` elements use the `.input-text` class or have explicit `dark:placeholder-gray-400` variant.

### Issue: White text on white background in dark mode
**Solution**: Verify the background color has a corresponding `dark:bg-` variant.

### Issue: Focus states hard to see
**Solution**: Test focus states in both modes; use visible outline/ring styles with `dark:ring-` variants.

## Future Enhancements

1. **System Preference Detection**: Auto-detect OS dark mode preference
2. **Theme Variants**: Add additional color themes beyond dark/light
3. **Accessibility Audit**: Run WCAG AA compliance check
4. **Custom Theme Builder**: Allow users to customize colors
5. **Print Stylesheet**: Ensure dark mode doesn't affect printing

## Performance Notes

- Dark mode toggle uses CSS classes (no JS performance impact)
- Colors are cached in localStorage (instant load)
- Transitions use GPU acceleration
- No additional bundle size for dark mode utilities

## References

- [Tailwind Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [CSS Transitions for Smooth Mode Switching](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)

---

**Last Updated**: February 23, 2026
**Maintainer**: Development Team
**Status**: Active Implementation
