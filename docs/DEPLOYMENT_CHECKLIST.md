# Pre-Deployment Checklist

## Environment Setup

- [ ] All env vars set in Vercel

- [ ] Convex production deployment created

- [ ] Clerk production instance configured

- [ ] OpenRouter production keys obtained

- [ ] Domain configured in Vercel

- [ ] SSL certificate active

## Feature Testing

### Authentication

- [ ] User can sign up

- [ ] User can sign in

- [ ] User can sign out

- [ ] Protected routes work

- [ ] Session persists across refresh

### Core Functionality

- [ ] GitHub URL analysis works

- [ ] Public repos generate context

- [ ] Generated files are high quality

- [ ] Download as .zip works

- [ ] History saves correctly

- [ ] Delete generations works

### Billing

- [ ] Free plan limits enforce (5/day)

- [ ] Upgrade button redirects to Clerk

- [ ] Can complete payment (test mode)

- [ ] Webhook fires after payment

- [ ] isPro field updates in database

- [ ] Pro users get unlimited access

- [ ] Billing page shows correct status

### UI/UX

- [ ] All pages load < 3 seconds

- [ ] Mobile responsive on all pages

- [ ] No console errors

- [ ] All links work

- [ ] Forms validate properly

- [ ] Error messages are clear

- [ ] Loading states show

### Security

- [ ] Debug endpoints removed/protected

- [ ] Environment secrets not exposed

- [ ] HTTPS enforced

- [ ] Rate limiting works

- [ ] Input validation present

## Performance

- [ ] Lighthouse score > 90

- [ ] Core Web Vitals pass

- [ ] Images optimized

- [ ] Bundle size reasonable

## Legal

- [ ] Terms of Service accessible

- [ ] Privacy Policy accessible

- [ ] Refund policy clear

- [ ] Contact information present

## Monitoring

- [ ] Error tracking configured

- [ ] Analytics tracking events

- [ ] Webhook logs accessible

- [ ] Database backups enabled

## Launch

- [ ] Remove test data from database

- [ ] Announce on Twitter/X

- [ ] Post on Product Hunt

- [ ] Share in Discord/Slack communities

- [ ] Update README with live URL

Run through this checklist before going live!

