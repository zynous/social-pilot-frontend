# Social Pilot Frontend

Brand-focused UI for managing brand configuration. Uses the same backend API as the admin (`social-pilot-backend`).

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local` and set `SOCIAL_PILOT_API_BASE_URL` if the API is on another origin (optional; defaults to same origin).
3. Backend must expose `POST /api/v1/auth/login` (email + password) and return a JWT with `user.brandId`. Until `validateLogin` is implemented in the backend, login will fail with "Invalid email or password".

## Run

- `pnpm dev` – dev server on port 3001
- `pnpm build` && `pnpm start` – production

## Production (GitHub Actions → S3)

`SOCIAL_PILOT_API_BASE_URL` is baked in at build time. Set it in the repo so the workflow has it:

1. GitHub → repo **Settings** → **Secrets and variables** → **Actions**
2. **Variables** tab → **New repository variable**
3. Name: `SOCIAL_PILOT_API_BASE_URL`, Value: your production API base URL (e.g. `https://api.socialpilot.com`)

The workflow passes this into the build step; if unset, the app falls back to the origin the user is on (or the URL they enter at sign-in).

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
