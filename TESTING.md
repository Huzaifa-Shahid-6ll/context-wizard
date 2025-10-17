# Testing Guide

## Setup

1. Install dev dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest babel-jest identity-obj-proxy
```

2. Scripts:

- `npm run test` — run all tests once
- `npm run test:watch` — watch mode
- `npm run test:ci` — CI-friendly

## Unit Tests

- GitHub utilities
  - parseGitHubUrl: valid/invalid URLs
  - fetchRepoStructure: mocked GitHub API
  - detectTechStack: sample files and package.json
- OpenRouter utilities
  - generateWithOpenRouter: mocked response, Authorization header
  - analyzePrompt: structured JSON handling
  - predictOutput: fast model path

## Integration/Convex Diagnostics

- `convex/testActions.ts`
  - `testEnvVars`: confirms env availability (no values logged)
  - `testCallOpenRouter`: validates key presence by tier
  - `testCallGithub`: simple request status check

## Manual Testing Checklist

- GitHub URL Parsing
  - [ ] Valid URLs parse to `{ owner, repo }`
  - [ ] Non-GitHub or malformed URLs throw
- Repository Structure Fetching
  - [ ] Public repo returns a non-empty tree
  - [ ] Handles 404 and rate limits gracefully
- Technology Stack Detection
  - [ ] Detects Next.js, React, TypeScript, Tailwind, Convex when present
- OpenRouter Integration
  - [ ] Uses correct key per tier (FREE/PRO)
  - [ ] Handles API errors (401/429/503) with clear messages
- Convex Env Access
  - [ ] Actions can read server env vars (no NEXT_PUBLIC needed)
  - [ ] Sensitive vars are not exposed to client

## Notes

- All external fetches in tests are mocked to avoid rate limits.
- Keep `.env`/`.env.local` populated locally for manual tests (do not commit).


