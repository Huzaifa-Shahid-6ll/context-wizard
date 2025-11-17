# Component Replacement Plan - shadcn/studio Migration

**Status:** 🟢 In Progress  
**Last Updated:** $(date)

---

## Overview

This document tracks the replacement of existing components with shadcn/studio components while preserving all existing CSS styles and customizations.

---

## Custom Styles to Preserve

### Button Component
- ✅ Custom depth layers (`depth-top`, `depth-layer-2`, etc.)
- ✅ Custom shadows (`shadow-depth-lg`, `shadow-elevated`, etc.)
- ✅ Hover effects (`hover:scale-105`, `active:scale-95`)
- ✅ Text shadows (`text-shadow-sm`)
- ✅ Custom transitions

### Card Component
- ✅ Depth layers (`depth-layer-1`, `depth-layer-2`)
- ✅ Custom shadows (`shadow-depth-md`, `shadow-depth-lg`)
- ✅ Hover effects (`hover:-translate-y-1`)
- ✅ Custom transitions

### Input/Textarea Components
- ✅ Custom depth styling
- ✅ Focus states
- ✅ Border styles

### Tabs Component
- ✅ Custom styling
- ✅ Active states

### Dialog/Sheet Components
- ✅ Custom animations
- ✅ Overlay styles

---

## Component Replacement Status

### ✅ Installed Components
- [x] Tooltip
- [x] Popover
- [x] Calendar
- [x] Switch
- [x] Slider
- [x] Toggle
- [x] Collapsible
- [x] Command
- [x] Context Menu
- [x] Pagination
- [x] Breadcrumb

### 🔄 Components to Replace (Preserving Styles)
- [ ] Button - Keep depth layers, shadows, hover effects
- [ ] Card - Keep depth layers, shadows, hover effects
- [ ] Input - Keep depth styling, focus states
- [ ] Textarea - Keep depth styling, focus states
- [ ] Label - Keep existing styles
- [ ] Tabs - Keep custom styling
- [ ] Dialog - Keep animations, overlay
- [ ] Sheet - Keep animations
- [ ] Select - Keep styling
- [ ] Checkbox - Keep styling
- [ ] Radio Group - Keep styling
- [ ] Badge - Keep styling
- [ ] Table - Keep styling
- [ ] Accordion - Keep styling
- [ ] Avatar - Keep styling
- [ ] Progress - Keep styling
- [ ] Alert - Keep styling
- [ ] Separator - Keep styling
- [ ] Scroll Area - Keep styling
- [ ] Skeleton - Keep styling

### 📦 Components to Install from shadcn/studio
- [ ] Form (with react-hook-form integration)
- [ ] Input Mask
- [ ] Input OTP
- [ ] Date and Time Picker
- [ ] Toggle Group
- [ ] Menubar
- [ ] Navigation Menu
- [ ] Drawer
- [ ] Carousel

---

## Strategy

1. **Preserve Styles**: Extract custom CSS classes and apply them to shadcn/studio components
2. **Gradual Migration**: Replace components one at a time, testing each
3. **Style Wrapper**: Create wrapper components that apply custom styles
4. **Documentation**: Document all style customizations

---

## Next Steps

1. Create style preservation utilities
2. Replace Button component (highest usage)
3. Replace Card component
4. Replace Form components (Input, Textarea, Label)
5. Replace remaining components systematically

