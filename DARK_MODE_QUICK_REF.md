# Dark Mode Text Color Quick Reference

## Quick Copy-Paste Patterns

### Headings (H1, H2, H3, etc.)
```jsx
// Primary / Main Headings
<h1 className="text-gray-900 dark:text-white">Main Title</h1>

// Secondary Headings
<h2 className="text-gray-800 dark:text-gray-100">Subtitle</h2>

// Using utility class (recommended)
<h1 className="heading-dark">Main Title</h1>
```

### Body & Paragraph Text
```jsx
// Normal body text
<p className="text-gray-700 dark:text-gray-200">Body paragraph text</p>

// Secondary/muted body text
<p className="text-gray-600 dark:text-gray-400">Secondary information</p>

// Using utility class
<p className="text-body">Body text</p>
<p className="text-muted">Secondary text</p>
```

### Labels & Captions
```jsx
// Primary labels
<label className="text-gray-700 dark:text-gray-300">Label:</label>

// Secondary labels
<label className="text-gray-600 dark:text-gray-400">Hint text</label>

// Using utility class
<label className="label-primary">Label:</label>
```

### Buttons & Interactive Elements
```jsx
// Primary button text
<button className="text-gray-900 dark:text-white">Click me</button>

// Secondary button text
<button className="text-gray-600 dark:text-gray-300">Cancel</button>

// Disabled button
<button className="text-gray-400 dark:text-gray-500">Disabled</button>
```

### Form Inputs
```jsx
// Input fields (auto-styled)
<input className="input-text" type="text" placeholder="Enter text" />

// All inputs automatically get dark mode styling
<textarea className="input-text" placeholder="Message..."></textarea>
<select className="input-text">
  <option>Choose...</option>
</select>
```

### Tables
```jsx
// Table headers
<thead className="table-header">
  <tr>
    <th className="text-gray-700 dark:text-gray-200">Column</th>
  </tr>
</thead>

// Table rows
<tbody>
  <tr className="table-row">
    <td className="text-gray-700 dark:text-gray-300">Data</td>
  </tr>
</tbody>

// Secondary table data
<tr className="table-row">
  <td className="table-muted">Secondary info</td>
</tr>
```

### Icons & Secondary Elements
```jsx
// Muted icon
<Icon className="text-gray-400 dark:text-gray-600" size={20} />

// Primary icon
<Icon className="text-gray-600 dark:text-gray-400" size={20} />

// Using utility class
<Icon className="icon-muted" size={20} />
```

### Borders & Dividers
```jsx
// Normal border
<div className="border border-gray-200 dark:border-gray-700">Content</div>

// Subtle border
<div className="border border-gray-100 dark:border-gray-800">Content</div>

// Using utility class
<div className="border-muted">Content</div>
```

### Backgrounds with Text
```jsx
// Light background (white/light gray)
<div className="bg-card-light">
  <p>Automatically styled text</p>
</div>

// Subtle background
<div className="bg-card-subtle">
  <p>Automatically styled text</p>
</div>

// Custom background color example
<div className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
  Content
</div>
```

## Color Palette Quick Reference

### Standard Text Colors
| Shade | Light | Dark | Use Case |
|-------|-------|------|----------|
| 50 | #f9fafb | N/A | Not for text |
| 100 | #f3f4f6 | #f3f4f6 | Light backgrounds |
| 200 | #e5e7eb | #e5e7eb | Light backgrounds |
| 300 | #d1d5db | #d1d5db | Light backgrounds |
| 400 | #9ca3af | #9ca3af | Hints, disabled |
| 500 | #6b7280 | #9ca3af | Subtle text |
| 600 | #4b5563 | #9ca3af | Secondary text |
| 700 | #374151 | #d1d5db | Body text |
| 800 | #1f2937 | #e5e7eb | Secondary headings |
| 900 | #111827 | #ffffff | Main headings |

## Common Components Pattern

### Card Component
```jsx
<div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
  <h2 className="text-gray-900 dark:text-white font-bold mb-2">Card Title</h2>
  <p className="text-gray-600 dark:text-gray-400">Card content</p>
</div>

// Or with utility classes
<div className="bg-card-light p-4 rounded-lg">
  <h2 className="heading-dark font-bold mb-2">Card Title</h2>
  <p className="text-muted">Card content</p>
</div>
```

### List Items
```jsx
<ul>
  {items.map(item => (
    <li key={item.id} className="text-gray-700 dark:text-gray-300 py-2 border-b border-gray-200 dark:border-gray-700">
      {item.name}
    </li>
  ))}
</ul>
```

### Badge/Tag
```jsx
// Primary badge
<span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
  Badge
</span>

// Secondary badge
<span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
  Tag
</span>
```

### Alert/Notification
```jsx
<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
  <p className="text-blue-900 dark:text-blue-200">Alert message</p>
</div>
```

### Modal/Overlay
```jsx
<div className="fixed inset-0 bg-black/50 dark:bg-black/75 flex items-center justify-center z-50">
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
    <h2 className="text-gray-900 dark:text-white font-bold mb-4">Modal Title</h2>
    <p className="text-gray-600 dark:text-gray-400">Modal content</p>
  </div>
</div>
```

## Testing Checklist

When building/updating components, verify:

- [ ] Headings are visible in both modes
- [ ] Body text has sufficient contrast (4.5:1 minimum)
- [ ] Labels are readable in both modes
- [ ] Placeholder text shows in dark mode
- [ ] Form focus states are visible
- [ ] Table headers have proper styling
- [ ] Icons don't disappear in dark mode
- [ ] Buttons have readable text in both modes
- [ ] Modal/overlay text is clear
- [ ] Links are distinguishable and clickable
- [ ] Disabled states show in both modes
- [ ] Error messages are readable

## Utility Classes Summary

| Class | Light | Dark | Purpose |
|-------|-------|------|---------|
| `.heading-dark` | gray-900 | white | Main headings |
| `.heading-secondary` | gray-700 | gray-100 | Sub-headings |
| `.text-body` | gray-700 | gray-200 | Body text |
| `.text-muted` | gray-600 | gray-400 | Secondary text |
| `.text-subtle` | gray-500 | gray-500 | Subtle text |
| `.label-primary` | gray-700 | gray-300 | Form labels |
| `.label-muted` | gray-500 | gray-400 | Hint labels |
| `.btn-text-primary` | gray-900 | white | Button text |
| `.btn-text-secondary` | gray-600 | gray-300 | Secondary buttons |
| `.input-text` | Full styling | Full styling | Form inputs |
| `.table-header` | Styled | Styled | Table headers |
| `.table-row` | Styled | Styled | Table rows |
| `.table-muted` | gray-500 | gray-400 | Secondary table data |
| `.icon-muted` | gray-400 | gray-600 | Muted icons |
| `.icon-primary` | gray-600 | gray-400 | Primary icons |
| `.border-muted` | gray-200 | gray-700 | Borders |
| `.border-subtle` | gray-100 | gray-800 | Subtle borders |
| `.bg-card-light` | white bg | gray-800 bg | Light cards |
| `.bg-card-subtle` | gray-50 bg | gray-900 bg | Subtle cards |

## Pro Tips

1. **Always test in both modes** - Use the toggle in the header
2. **Use DevTools to force dark mode** - Even during development
3. **Copy-paste patterns above** - Consistency is key
4. **Use utility classes** - Easier to maintain
5. **Test with different screen sizes** - Responsiveness matters in both modes
6. **Check contrast ratios** - Use tools like WCAG Color Contrast Checker
7. **Test with keyboard** - Focus states should be visible in both modes
8. **Test with screen readers** - Ensure color isn't the only indicator

## Common Mistakes to Avoid

❌ **Don't do this:**
```jsx
<p className="text-gray-900">Text</p>  // Invisible in dark mode!
<p className="text-white dark:text-gray-500">Text</p>  // Bad contrast
<div className="bg-gray-100 dark:bg-gray-900 text-gray-900">Text</div>  // Can't read it
```

✅ **Do this instead:**
```jsx
<p className="text-gray-700 dark:text-gray-200">Text</p>
<p className="text-white dark:text-gray-100">Text</p>
<div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">Text</div>
```

---

**Save this file for quick reference when coding!**
