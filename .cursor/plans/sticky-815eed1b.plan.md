<!-- 815eed1b-4d20-4552-9402-94b0ec4c380f 2114afbc-9d7c-435d-9e03-3b2c91668a11 -->
# Add Comprehensive Footer to Landing Page

## Scope

- Create `src/components/landing/Footer.tsx` with:
- Newsletter signup (Input + Button)
- 4-column grid (Brand, Product, Resources, Legal), stacks on mobile
- Bottom bar with copyright, tagline, and status indicator
- Social icons (lucide-react) with placeholder links
- Integrate `<Footer />` at the bottom of `src/app/page.tsx`.
- Keep styles aligned with design system (depth, borders, muted backgrounds).

## Files to Change

- `src/components/landing/Footer.tsx` (new)
- Export `Footer: React.FC`
- Use shadcn `Input`, `Button`
- Tailwind utility classes per spec: `bg-muted/30 border-t py-12 px-4`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`
- Text: `text-sm text-muted-foreground`
- Links: `hover:text-primary transition-colors`
- Icons: `h-5 w-5 hover:text-primary`
- `src/app/page.tsx`
- Import `{ Footer }` from `@/components/landing/Footer`
- Render `<Footer />` after all sections

## Column Details

- Brand
- Logo + “Context Wizard” (`text-lg font-bold`)
- Tagline and short description
- Social icons linking to Twitter/X, GitHub, LinkedIn, Discord
- Product
- Links: `#features`, `#how-it-works`, `#pricing`, `/dashboard`, “Changelog (soon)”, “Roadmap (soon)`
- Resources
- Links: `/docs`, `/api-docs`, `/blog`, `/tutorials`, Discord, `mailto:support@contextwizard.com`
- Legal
- Links: `/privacy`, `/terms`, `/cookies`, `/gdpr`

## Newsletter Section (above columns)

- Heading: “Stay Updated”
- Text: “Get the latest features and updates delivered to your inbox”
- Form: email `Input` + `Subscribe` `Button`
- Disclaimer: “No spam. Unsubscribe anytime.”

## Bottom Bar

- Left: `© 2025 Context Wizard. All rights reserved.`
- Center: `Built with ❤️ for developers`
- Right: Status: green dot + `All systems operational`

## Acceptance Criteria

- Footer renders responsively (1/2/4 columns by breakpoint)
- All specified links and icons present with correct styles
- Newsletter form styled (no backend wiring required)
- Footer appears after all landing sections and matches design system

## Completed (Navbar and Sections)

- Sticky glassmorphism Navbar with Clerk auth
- Smooth scrolling via `globals.css`
- IDs added (`#features`, `#how-it-works`, `#pricing`, `#faq`)
- Mobile sheet menu and active link highlighting
- Header spacing adjustments

### Done Checklist

- [x] Create Navbar.tsx with sticky glassmorphism and Clerk auth
- [x] Add smooth scroll CSS to globals.css
- [x] Import and render Navbar in src/app/page.tsx
- [x] Add id="features" to features section
- [x] Add new how-it-works section with 3 steps
- [x] Add pricing section with Free vs Pro placeholders
- [x] Add FAQ section with common questions
- [x] Implement mobile hamburger sheet menu closing on link click
- [x] Implement active link highlight via IntersectionObserver
- [x] Ensure hero/sections account for sticky header spacing

---

## Footer Plan (Next)

### Scope
- Create `src/components/landing/Footer.tsx` with:
  - Newsletter signup (Input + Button)
  - Four columns (Brand, Product, Resources, Legal), stacking on mobile
  - Social links (Twitter, GitHub, LinkedIn, Discord)
  - Bottom bar with copyright, tagline, and status
- Integrate `<Footer />` at the end of `src/app/page.tsx`.

### Design
- Container: `bg-muted/30 border-t py-12 px-4`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`
- Text: `text-sm text-muted-foreground`
- Links: `hover:text-primary transition-colors`
- Icons: `h-5 w-5 hover:text-primary`

### Content Details
- Brand column:
  - Logo + "Context Wizard" (text-lg font-bold)
  - Tagline: AI-powered context generation for better code
  - Description: Short product value description
  - Social: Twitter/X, GitHub, LinkedIn, Discord
- Product column:
  - `#features`, `#how-it-works`, `#pricing`, `/dashboard`, Changelog (soon), Roadmap (soon)
- Resources column:
  - `/docs`, `/api-docs`, `/blog`, `/tutorials`, Discord, `mailto:support@contextwizard.com`
- Legal column:
  - `/privacy`, `/terms`, `/cookies`, `/gdpr`
- Newsletter (above columns):
  - Heading: Stay Updated
  - Text: Get the latest features and updates delivered to your inbox
  - Form: email Input + Subscribe Button
  - Note: No spam. Unsubscribe anytime.
- Bottom bar:
  - Left: © 2025 Context Wizard. All rights reserved.
  - Center: Built with ❤️ for developers
  - Right: Green dot + All systems operational

### Footer Todos
- [ ] Create Footer.tsx with newsletter, 4 columns, bottom bar
- [ ] Import and render Footer in src/app/page.tsx