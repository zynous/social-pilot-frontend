# GitHub Actions Workflows

Same pattern as zynous-frontend: build on push to main/feature/*, deploy to S3 + CloudFront on main only (OIDC).

## on-push-to-main.yaml

- **Triggers**: push to `main` or `feature/*`
- **Steps**: checkout → Node + pnpm → install & build → (on main) AWS OIDC → S3 sync → CloudFront invalidation
- **Config**: Set `S3_BUCKET` and `CLOUDFRONT_ALIAS` at the top of the workflow (or in repo variables). Uses same IAM role as zynous-frontend; ensure the role can access the bucket and CloudFront.
