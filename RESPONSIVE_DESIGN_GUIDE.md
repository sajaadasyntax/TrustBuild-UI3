# Responsive Design Guide for TrustBuild Contractor Dashboard

This guide outlines the responsive design patterns and best practices used in the TrustBuild contractor dashboard to ensure optimal mobile experience.

## Design Principles

1. **Mobile-First**: Start with mobile layout and enhance for larger screens
2. **Touch-Friendly**: Buttons and interactive elements should be at least 44x44px
3. **Readable Text**: Minimum font size of 14px for body text on mobile
4. **Flexible Layouts**: Use flexbox and grid for adaptive layouts
5. **Performance**: Optimize images and lazy-load content where appropriate

## Breakpoints

TrustBuild uses Tailwind CSS breakpoints:

- `sm`: 640px - Small tablets and large phones
- `md`: 768px - Tablets
- `lg`: 1024px - Desktops
- `xl`: 1280px - Large desktops
- `2xl`: 1536px - Extra large screens

## Common Responsive Patterns

### 1. Responsive Containers

Use responsive padding and max-width for consistent spacing:

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
  {/* Content */}
</div>
```

Or use the ResponsiveContainer component:

```tsx
import { ResponsiveContainer } from '@/components/ui/responsive-container';

<ResponsiveContainer maxWidth="xl">
  {/* Content */}
</ResponsiveContainer>
```

### 2. Responsive Grids

Transform single column layouts to multi-column on larger screens:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

Or use the ResponsiveGrid component:

```tsx
import { ResponsiveGrid } from '@/components/ui/responsive-container';

<ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</ResponsiveGrid>
```

### 3. Responsive Flexbox Layouts

Stack elements vertically on mobile, horizontally on desktop:

```tsx
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

Or use the ResponsiveStack component:

```tsx
import { ResponsiveStack } from '@/components/ui/responsive-container';

<ResponsiveStack direction="row" breakpoint="md" gap={4}>
  <div>Left content</div>
  <div>Right content</div>
</ResponsiveStack>
```

### 4. Responsive Button Groups

```tsx
<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
  <Button className="w-full sm:w-auto">Primary Action</Button>
  <Button variant="outline" className="w-full sm:w-auto">Secondary</Button>
</div>
```

### 5. Responsive Tables

For mobile, use card layouts instead of tables:

```tsx
{/* Desktop: Table */}
<div className="hidden md:block">
  <Table>
    {/* Table content */}
  </Table>
</div>

{/* Mobile: Card list */}
<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>
      <CardContent className="p-4">
        {/* Card content */}
      </CardContent>
    </Card>
  ))}
</div>
```

### 6. Responsive Text

Adjust text sizes for different screen sizes:

```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

<p className="text-sm sm:text-base">
  Body text that scales appropriately
</p>
```

### 7. Responsive Dialogs

Ensure dialogs are scrollable and fit mobile screens:

```tsx
<DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle className="text-lg sm:text-xl">Dialog Title</DialogTitle>
  </DialogHeader>
  {/* Dialog content */}
</DialogContent>
```

### 8. Responsive Images

Use responsive image sizing:

```tsx
<div className="relative w-full aspect-video">
  <Image
    src={imageSrc}
    alt={altText}
    fill
    className="object-cover rounded-lg"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

### 9. Hide/Show Content

Show or hide elements based on screen size:

```tsx
{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">
  Desktop only content
</div>

{/* Show on mobile, hide on desktop */}
<div className="md:hidden">
  Mobile only content
</div>
```

### 10. Responsive Navigation

```tsx
<nav className="flex flex-col md:flex-row gap-2 md:gap-4">
  <Link href="/" className="w-full md:w-auto">
    <Button variant="ghost" className="w-full md:w-auto">
      Home
    </Button>
  </Link>
  {/* More links */}
</nav>
```

## Component-Specific Guidelines

### Contractor Dashboard

The main contractor dashboard page (`/dashboard/contractor`) uses:

- **Stats Grid**: `grid-cols-1 md:grid-cols-3 gap-6`
- **Header Actions**: `flex-col sm:flex-row gap-2`
- **Content Layout**: `flex-col-reverse md:flex-row` to show most important content first on mobile

### Job Details Page

Job details pages use:

- **Max Width Container**: `max-w-4xl mx-auto` for readable line length
- **Header**: `flex-col md:flex-row` to stack badges on mobile
- **Action Buttons**: `w-full` on all buttons for easy tapping

### Job Workflow Buttons

All workflow buttons use:

- **Full Width**: `w-full` class for easy tapping on mobile
- **Clear Icons**: Icons are sized at `h-4 w-4` for visibility
- **Dialog Forms**: Scrollable with `max-h-[90vh] overflow-y-auto`

### Job Application Dialog

- **Responsive Width**: `max-w-[95vw] sm:max-w-[425px]`
- **Scrollable Content**: For long forms on small screens
- **Form Fields**: Stack vertically with adequate spacing

## Testing Responsive Design

### Browser DevTools

1. Open Chrome/Edge DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test these breakpoints:
   - 375px (iPhone SE)
   - 390px (iPhone 12 Pro)
   - 768px (iPad)
   - 1024px (Desktop)

### Mobile Testing

1. Test on actual devices when possible
2. Use Expo preview for mobile app
3. Check touch targets are large enough
4. Verify text is readable without zooming

### Common Issues to Check

- [ ] Horizontal scrolling (should not exist)
- [ ] Text overflow and truncation
- [ ] Button sizes (min 44x44px)
- [ ] Form inputs are easily tappable
- [ ] Dialogs fit on screen
- [ ] Images load and scale properly
- [ ] Navigation is accessible
- [ ] Content is readable without zooming

## Mobile App Considerations

When using contractor dashboard components in the mobile app (via WebView):

1. **Viewport**: Ensure viewport meta tag is set correctly
2. **Touch Events**: All click events work with touch
3. **Safe Areas**: Account for notches and home indicators
4. **Performance**: Minimize animations on low-end devices
5. **Offline**: Handle network errors gracefully

## Best Practices Checklist

- [ ] Use mobile-first approach (start with smallest screen)
- [ ] Test on real devices, not just browser emulation
- [ ] Ensure touch targets are at least 44x44px
- [ ] Use semantic HTML for accessibility
- [ ] Optimize images with next/image
- [ ] Lazy load below-the-fold content
- [ ] Use CSS Grid and Flexbox for layouts
- [ ] Avoid fixed widths, use max-width instead
- [ ] Test with slow 3G connection
- [ ] Verify forms are easy to fill on mobile

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)
- [Material Design Touch Targets](https://m2.material.io/design/usability/accessibility.html#layout-and-typography)

## Future Improvements

1. Add responsive data visualization components
2. Implement PWA features for offline support
3. Add gesture support for mobile (swipe, pinch-to-zoom)
4. Optimize bundle size for faster mobile loading
5. Add skeleton loading states for better perceived performance

