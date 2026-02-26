# Dark Mode Testing & Verification Guide

## Test Checklist

### 1. Core Functionality Tests

#### Theme Toggle
- [ ] Click the sun/moon icon in header
- [ ] Theme switches immediately
- [ ] Icon changes to show current mode
- [ ] Change persists after page refresh
- [ ] LocalStorage persists preference

#### Text Visibility
- [ ] All headings readable in both modes
- [ ] Body text has sufficient contrast
- [ ] Labels are clearly visible
- [ ] Captions/hints are readable
- [ ] Error messages stand out

#### Form Elements
- [ ] Text inputs show text in both modes
- [ ] Placeholder text visible in dark mode
- [ ] Textareas are readable
- [ ] Select dropdowns show options
- [ ] Focus states visible in both modes
- [ ] Disabled state clearly indicated

#### Buttons & Links
- [ ] Button text visible in both modes
- [ ] Links are distinguishable
- [ ] Hover states work in both modes
- [ ] Active/pressed states clear
- [ ] Disabled buttons show as disabled

#### Tables & Lists
- [ ] Table headers properly styled
- [ ] Table rows alternate (if applicable)
- [ ] List items readable
- [ ] Row separators visible
- [ ] Sorting indicators work

#### Navigation
- [ ] Sidebar visible and readable
- [ ] Active page indicator clear
- [ ] Hover states work
- [ ] Icons visible
- [ ] Breadcrumbs readable

### 2. Component-Specific Tests

#### Dashboard Components
- [ ] Stat cards display properly
- [ ] Charts/graphs are readable
- [ ] Colors distinguish data series
- [ ] Tooltips show correctly
- [ ] Legend items readable

#### User Profile Pages
- [ ] Profile photo visible
- [ ] Text information readable
- [ ] Status badges show properly
- [ ] Edit buttons clear
- [ ] Settings toggles visible

#### Forms & Input Sections
- [ ] Field labels clear
- [ ] Input fields have good contrast
- [ ] Validation messages visible
- [ ] Required field indicators clear
- [ ] Error states stand out

#### Modals & Dialogs
- [ ] Modal background appropriate
- [ ] Modal text readable
- [ ] Close button visible
- [ ] Action buttons clear
- [ ] Overlay proper opacity

#### Notifications & Alerts
- [ ] Alert text readable
- [ ] Alert type colors distinguishable
- [ ] Icons visible
- [ ] Close buttons visible
- [ ] Animation smooth in both modes

### 3. Accessibility Tests

#### Contrast Ratios
Test with WebAIM Contrast Checker:
- [ ] Headings: 4.5:1 minimum
- [ ] Body text: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] Icons: 3:1 minimum (if conveying info)
- [ ] Disabled text: 3:1 minimum

#### Focus States
- [ ] Tab navigation works smoothly
- [ ] Focus indicators visible in both modes
- [ ] Focus order logical
- [ ] No keyboard traps
- [ ] Focus doesn't disappear

#### Color Dependency
- [ ] Meaning not conveyed by color alone
- [ ] Error states have text + color
- [ ] Status badges have text + color
- [ ] Links underlined or otherwise marked
- [ ] Icons have labels if needed

### 4. Page-Specific Tests

#### Landing/Home Page
- [ ] Hero section text visible
- [ ] Cards properly styled
- [ ] Buttons stand out
- [ ] Links distinguishable
- [ ] Call-to-action clear

#### Admin Dashboard
- [ ] Stat cards readable
- [ ] Chart axis labels visible
- [ ] Legend items clear
- [ ] Status indicators work
- [ ] Notifications display

#### Student Dashboard
- [ ] Widget titles visible
- [ ] Data readable
- [ ] Links clickable
- [ ] Status badges clear
- [ ] Schedule readable

#### Teacher Dashboard
- [ ] Student list readable
- [ ] Grade inputs clear
- [ ] Buttons visible
- [ ] Insights readable
- [ ] Quick actions clear

#### Forms (Admission, Faculty, etc.)
- [ ] All fields readable
- [ ] Labels visible
- [ ] Placeholders visible (dark mode)
- [ ] Required indicators clear
- [ ] Submit button visible

#### Tables/Data Grids
- [ ] Headers readable
- [ ] Row text visible
- [ ] Alternate rows distinguishable
- [ ] Sort indicators clear
- [ ] Row selection visible

#### Library/Resources
- [ ] Item cards readable
- [ ] Status badges clear
- [ ] Due dates visible
- [ ] Action buttons clear
- [ ] Item details readable

### 5. Cross-Browser Tests

#### Chrome/Chromium
- [ ] [x] Test Settings → Preferences → Emulate CSS media feature prefers-color-scheme
- [ ] Dark mode works
- [ ] Light mode works
- [ ] Transitions smooth

#### Firefox
- [ ] Open Inspector → Styling tab
- [ ] Use color scheme emulation
- [ ] Dark mode works
- [ ] Light mode works
- [ ] Form elements render correctly

#### Safari
- [ ] Open Web Inspector
- [ ] Toggle dark mode
- [ ] All text visible
- [ ] No rendering issues
- [ ] Inputs work properly

### 6. Device-Specific Tests

#### Desktop
- [ ] Multiple monitor setups
- [ ] Different screen sizes (1920x1080, 1366x768, etc.)
- [ ] High DPI screens (Retina)
- [ ] Projector/presentation mode

#### Mobile (if applicable)
- [ ] Phone landscape mode
- [ ] Phone portrait mode
- [ ] Tablet landscape
- [ ] Tablet portrait
- [ ] Touch interactions

### 7. Performance Tests

#### Theme Toggle Performance
- [ ] Switching modes is instantaneous
- [ ] No flickering or repainting
- [ ] Network request for theme (if applicable)
- [ ] LocalStorage write speed

#### Page Load
- [ ] Dark mode loads correctly on first visit
- [ ] Saved preference applies immediately on reload
- [ ] No flash of wrong mode
- [ ] CSS transitions work smoothly

## Manual Testing Steps

### Basic Flow
1. **Open Application** in browser
2. **Navigate to Home/Dashboard**
3. **Check text visibility** in current mode
4. **Click Theme Toggle** (Sun/Moon icon)
5. **Verify immediate switch**
6. **Check all text readable**
7. **Refresh page** - confirms persistence
8. **Verify saved theme applies**
9. **Repeat on different pages**

### Color Contrast Testing
1. **Open WCAG Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
2. **For light mode text**:
   - Foreground: Use actual color code (e.g., #111827)
   - Background: White (#FFFFFF)
   - Verify ratio ≥ 4.5:1
3. **For dark mode text**:
   - Foreground: Use dark mode color (e.g., #f3f4f6)
   - Background: Dark background (e.g., #111827)
   - Verify ratio ≥ 4.5:1

### Browser DevTools Method

#### Chrome/Edge
1. Press `F12` to open DevTools
2. Go to `Rendering` tab
3. Find "Emulate CSS media feature prefers-color-scheme"
4. Select "prefers-color-scheme: dark"
5. Toggle back to "prefers-color-scheme: light"
6. Verify switching works

#### Firefox
1. Press `F12` to open Inspector
2. Right-click any element
3. Select "Inspect Accessibility Properties"
4. Check color contrast ratios shown
5. Use Accessibility Inspector for full audit

### Manual Toggle Testing
1. Click Sun/Moon icon in header
2. Watch for:
   - Immediate color change
   - No flickering or flash
   - All text becoming readable
   - Smooth CSS transitions
   - Icon changing appropriately
3. Repeat clicking 5-10 times
4. Verify stability and performance

## Expected Results

### Light Mode (Default)
- White/light gray backgrounds
- Dark text (gray-900, gray-800, etc.)
- Clear, high contrast
- Professional appearance
- Easy to read

### Dark Mode
- Dark backgrounds (gray-900, gray-800)
- Light text (white, gray-100, gray-200)
- Good contrast ratio (4.5:1+)
- Eye-friendly appearance
- Clear readability

## Bug Report Template

If you find an issue, document it as:

```
**Component**: [Page/Component Name]
**Mode**: Light / Dark / Both
**Issue**: [Description]
**Expected**: [What should happen]
**Actual**: [What happened instead]
**Steps to Reproduce**:
1. Open [page]
2. Switch to [mode]
3. Look at [element]
4. Observe [problem]

**Screenshots**: [If possible, attach]
**Browser**: [Chrome/Firefox/Safari/Edge version]
**OS**: [Windows/macOS/Linux]
```

## Common Issues & Solutions

### Issue: Text is invisible in dark mode

**Solution**:
1. Check element has `dark:text-` class
2. Verify background also has `dark:bg-` variant
3. Use contrast checker to verify ratio
4. Ensure parent doesn't override colors
5. Check for inline styles overriding classes

### Issue: Placeholder text not visible in dark mode

**Solution**:
1. Ensure input has `.input-text` class OR
2. Add `dark:placeholder-gray-400` variant
3. Check opacity isn't being set to 0

### Issue: Focus states hard to see

**Solution**:
1. Add `dark:ring-primary-500` for dark mode
2. Ensure outline is visible in both modes
3. Test with keyboard navigation

### Issue: Color changes too slowly

**Solution**:
1. Check Tailwind config for transition settings
2. Ensure CSS is loading correctly
3. Clear browser cache and reload
4. Check for JavaScript conflicts

### Issue: Theme doesn't persist

**Solution**:
1. Check localStorage is enabled
2. Verify browser privacy settings
3. Check for localStorage quota exceeded
4. Test in incognito/private mode

## Validation Checklist Before Deployment

- [ ] All pages tested in both modes
- [ ] All forms work properly
- [ ] All buttons readable
- [ ] All tables display correctly
- [ ] All alerts/notifications visible
- [ ] No console errors
- [ ] Theme persists across sessions
- [ ] Toggle works smoothly
- [ ] Contrast ratios verified
- [ ] Mobile responsiveness checked
- [ ] Cross-browser testing complete
- [ ] Accessibility audit passed
- [ ] Performance is acceptable
- [ ] Documentation complete
- [ ] Team trained on standards

## Quick Testing Commands

### CSS Validation
```javascript
// In browser console, check computed styles:
const el = document.querySelector('p');
console.log(window.getComputedStyle(el).color);

// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Check if active
console.log(document.documentElement.classList.contains('dark'));
```

### Contrast Ratio Check
```javascript
// Install and use accessibility libraries:
// WebAim's WAVE: https://wave.webaim.org/
// Axe DevTools: https://www.deque.com/axe/devtools/
// Lighthouse: Chrome DevTools → Lighthouse
```

## Testing Schedule

- **Development**: Test continuously as building
- **Code Review**: Reviewer tests both modes
- **QA**: Comprehensive testing before release
- **Regression**: Test after updates
- **Quarterly**: Full accessibility audit

## Sign-Off

Component tested and verified:
- [ ] Developer signature
- [ ] Tester signature
- [ ] Accessibility check
- [ ] Performance verified
- [ ] Documentation complete

Date: ___________
Status: ✅ PASS / ❌ NEEDS FIXES

---

**Keep this guide handy during dark mode testing!**
