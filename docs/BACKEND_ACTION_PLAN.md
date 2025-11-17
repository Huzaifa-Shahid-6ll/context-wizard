# Backend Improvement Action Plan

## Quick Summary

**Security Issues Found:** 15 (5 Critical, 5 High, 5 Medium)  
**Inconsistencies Found:** 8 major areas  
**Feature Improvements:** 25+ opportunities  
**Estimated Timeline:** 12-16 weeks

---

## 🚨 IMMEDIATE ACTIONS (This Week)

### 1. Fix Critical Security Issues

#### A. Add Input Validation
**Files to Update:**
- `convex/mutations.ts` - Replace `v.any()` with structured validators
- `convex/appBuilderGenerations.ts` - Validate `formData`
- `convex/promptGenerators.ts` - Validate prompt content length

**Action:**
```typescript
// Before
context: v.optional(v.any())

// After
context: v.optional(v.object({
  projectDescription: v.string(),
  techStack: v.array(v.string()),
}))
```

#### B. Add Authorization to Queries
**Files to Update:**
- `convex/queries.ts:38-45` - Add userId check to `getPrompt`
- All queries that return user data

**Action:**
```typescript
export const getPrompt = query({
  args: { id: v.id("prompts"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const prompt = await ctx.db.get(id);
    if (!prompt) throw new Error("Prompt not found");
    if (prompt.userId !== userId) throw new Error("Unauthorized");
    return prompt;
  },
});
```

#### C. Implement Proper Rate Limiting
**Files to Update:**
- `src/app/api/webhooks/stripe/route.ts` - Replace in-memory rate limiting
- Create `lib/rateLimit.ts` utility

**Action:**
- Use Convex for persistent rate limiting
- Implement distributed rate limiting
- Add IP-based blocking

---

## 📋 WEEK 2-3: Consistency Fixes

### 1. Standardize Error Handling
**Create:** `lib/errors.ts`
**Update:** All error throwing code

### 2. Standardize User ID Naming
**Rename:** All `userId` parameters that are actually Clerk IDs to `clerkId`
**Create:** Type aliases for clarity

### 3. Standardize Date Handling
**Standardize:** All dates to Unix timestamps (numbers)
**Create:** `lib/dates.ts` utility

### 4. Standardize Tier Checks
**Create:** `lib/userTier.ts` with helper functions
**Update:** All tier checking code

---

## 🎯 WEEK 4-8: High-Impact Features

### Priority 1: Prompt Generation Progress
- Add WebSocket or polling
- Show real-time progress
- Estimated: 2 weeks

### Priority 2: Caching Strategy
- Cache user tier status
- Cache LLM responses
- Estimated: 1 week

### Priority 3: Comprehensive Error Recovery
- Retry logic for all external calls
- Circuit breakers
- Estimated: 1 week

### Priority 4: Monitoring & Observability
- Set up APM
- Error tracking (Sentry)
- Metrics dashboard
- Estimated: 1 week

---

## 📊 WEEK 9-12: Medium-Impact Features

1. Prompt sharing & collaboration
2. Prompt history search
3. Batch operations
4. API documentation
5. Health checks for all services

---

## 🔧 Quick Wins (Can Do Anytime)

1. ✅ Add input sanitization utility
2. ✅ Add request size limits
3. ✅ Improve error messages (generic for production)
4. ✅ Add audit logging
5. ✅ Create validation utilities

---

## 📈 Success Metrics

### Security
- [ ] Zero critical vulnerabilities
- [ ] 100% input validation coverage
- [ ] 100% query authorization

### Performance
- [ ] <200ms average API response
- [ ] <5s prompt generation
- [ ] 99.9% uptime

### User Experience
- [ ] <2s page load
- [ ] >90% satisfaction
- [ ] <5% churn

---

## 🛠️ Tools & Services Needed

1. **Redis** - For rate limiting and caching
2. **Sentry** - Error tracking
3. **APM Tool** - Performance monitoring
4. **Logging Service** - Structured logging
5. **Backup Service** - Data backups

---

## 📝 Code Review Checklist

Before merging any backend changes:

- [ ] Input validation added
- [ ] Authorization checks present
- [ ] Error handling consistent
- [ ] Logging added
- [ ] Tests written
- [ ] Documentation updated
- [ ] Security review passed

---

## 🚀 Getting Started

1. **This Week:** Fix critical security issues
2. **Next Week:** Start consistency improvements
3. **Week 3:** Begin high-impact features
4. **Ongoing:** Monitor and iterate

---

**Questions?** Review the full analysis in `BACKEND_ANALYSIS_AND_IMPROVEMENT_PLAN.md`

