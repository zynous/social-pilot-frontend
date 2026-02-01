# Social Pilot Frontend

Brand-focused UI for managing brand configuration. Uses the same backend API as the admin (`social-pilot-backend`).

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local` and set `SOCIAL_PILOT_API_BASE_URL` if the API is on another origin (optional; defaults to same origin).
3. Backend must expose `POST /api/v1/auth/login` (email + password) and return a JWT with `user.brandId`. Until `validateLogin` is implemented in the backend, login will fail with "Invalid email or password".

## Run

- `pnpm dev` – dev server on port 3001
- `pnpm build` && `pnpm start` – production

## Static website setup (AWS S3 + CloudFront)

The app is built as a static export (`output: 'export'` in `next.config.mjs`). The workflow deploys the `out/` folder to S3 and invalidates CloudFront. Here’s what you need in place.

### 1. S3 bucket

- Create a bucket whose name matches the domain you’ll use (e.g. `socialpilot.zynous.com`), or use any name and point CloudFront at it.
- **Block public access**: can stay on if you use CloudFront with an Origin Access Control (OAC) or Origin Access Identity (OAI) so only CloudFront can read from S3.
- The workflow runs `aws s3 sync out s3://<bucket> --delete`, so the bucket must exist and the GitHub OIDC role must have permission to write to it.

### 2. CloudFront distribution

- **Origin**: the S3 bucket (S3 origin or website endpoint). If using the S3 website endpoint, enable “Static website hosting” on the bucket.
- **Default root object**: `index.html` (for `/`).
- **Error pages**: add a custom error response for 403 and 404 that returns `index.html` with 200 (so client-side routing works for direct URLs and refreshes).
- **Alternate domain (CNAME)**: e.g. `socialpilot.zynous.com`.
- **SSL**: attach an ACM certificate (request/validate in **us-east-1** for CloudFront).

### 3. DNS

- Add a CNAME (or ALIAS/A record if your DNS supports it) for your domain pointing to the CloudFront distribution domain (e.g. `d1234abcd.cloudfront.net`).

### 4. IAM (GitHub OIDC)

- The workflow uses `role-to-assume: arn:aws:iam::324037318957:role/ZynousGithubControlledAccessRole`. That role must:
  - Have a trust policy allowing the GitHub OIDC provider to assume it (for this repo).
  - Allow `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the deploy bucket.
  - Allow `cloudfront:CreateInvalidation` and `cloudfront:ListDistributions` (so the workflow can invalidate the distribution).
- If you use a different role or bucket, update the workflow’s `role-to-assume` and the `aws s3 sync` bucket name; adjust the CloudFront invalidation step if your distribution is identified differently.

### 5. GitHub

- **Repository variable** (optional but recommended):  
  **Settings** → **Secrets and variables** → **Actions** → **Variables** → New variable:  
  Name: `SOCIAL_PILOT_API_BASE_URL`, Value: your production API base URL (e.g. `https://api.socialpilot.com`).  
  The workflow passes this into the build step so the client uses this API URL. If unset, the app falls back to the current origin or the URL users enter at sign-in.

### Same domain for frontend + backend (e.g. socialpilot.zynous.com on ALB today)

If `socialpilot.zynous.com` already points at an ALB (for API and email response links), you can serve both frontend and backend on the same host using **one CloudFront distribution** and path-based routing.

1. **Create a CloudFront distribution** with **two origins**:
   - **Origin 1 – Frontend**: Your S3 bucket (static site). Use the S3 REST endpoint (not website) if you use OAC; set default root object `index.html` and custom error responses 403/404 → `index.html` (200) for SPA routing.
   - **Origin 2 – Backend**: Your existing ALB. Origin domain = ALB DNS name; HTTP only is fine (CloudFront → ALB on your VPC).

2. **Cache behaviors** (order matters; more specific paths first):
   - **Path pattern** `/api/*` (and any other paths that must hit the backend, e.g. email callback paths): Origin = ALB. Cache policy = CachingDisabled or short TTL so API/email responses are not cached.
   - **Default behavior** `*`: Origin = S3. Serves the static frontend; requests for `/`, `/sign-in`, `/setup`, etc. go to S3 (and 404s from S3 return `index.html` via error pages).

3. **Domain and SSL**: Add alternate domain `socialpilot.zynous.com` and attach the ACM certificate (us-east-1).

4. **DNS**: Change `socialpilot.zynous.com` from the ALB to the **CloudFront distribution** (CNAME or ALIAS to the CloudFront domain, e.g. `dxxxx.cloudfront.net`). All traffic for that hostname now goes to CloudFront; CloudFront sends `/api/*` (and your other backend paths) to the ALB and everything else to S3.

5. **Frontend API base URL**: Set `SOCIAL_PILOT_API_BASE_URL` (or the repo variable) to `https://socialpilot.zynous.com` so the app calls the same origin; CloudFront will route those requests to the ALB via the `/api/*` behavior.

Result: `https://socialpilot.zynous.com/` → frontend (S3), `https://socialpilot.zynous.com/api/v1/...` and your email endpoints → backend (ALB), same domain.

## Structure (extensible)

- `src/app/(auth)/` – sign-in (no shell)
- `src/app/(app)/` – dashboard, onboarding, settings (with AppShell + AuthGate)
- `src/components/onboarding/` – wizard steps; add steps in `constants/onboarding.ts` and step components
- `src/components/settings/` – section editors; add sections in settings page and new section components
- `src/contexts/` – auth and brand; add more contexts for future features
- `src/lib/` – API client, types, storage

## Flow

1. Sign in → if onboarding not complete, redirect to `/onboarding`; else `/dashboard`.
2. Onboarding: 4 steps (basic info, brand voice, visual, notifications). Each step saves to the backend; last step marks onboarding complete and redirects to dashboard.
3. Dashboard: summary cards and "Edit" links to settings sections.
4. Settings: section-based (Details, Brand voice, Visual, Notifications). Add sections in `SECTIONS` and new `SettingsSection*` components.
