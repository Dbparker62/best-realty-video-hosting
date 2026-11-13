# Best Realty New Jersey seller site

Standalone Next.js frontend for https://bestrealtynewjersey.org. The existing school frontend and AWS backend are unchanged.

## Local development

Run `npm ci`, then `npm run dev` from this directory. Copy `.env.example` to `.env.local` if overrides are needed. Run `npm run typecheck` and `npm run build` before deploying.

## Future Vercel project

Set Root Directory to `seller-site`, use the Next.js preset, and set the variables in `.env.example`. Leave NEXT_PUBLIC_API_URL unset; this app uses same-origin `/api` requests. Its rewrite forwards only seller questionnaire routes to the existing backend. No Cognito or Stripe variables are required.

Routes: `/`, `/questionnaire/home-sale`, `/privacy`. The sitemap contains only these pages. There are no login, course, checkout, or admin pages.

The homepage retains the original layout, palette, typography, and UI components with seller-specific copy and a text/home-icon brand. Existing contact information is retained until updated by the owner. School logos and social profiles are not reused.

Quiz components were copied from the root frontend; future shared quiz fixes should be applied to both copies. Submitting a quiz against the configured backend saves a real lead and may send emails.

Sender names, email templates, Lambda variables, DNS, redirects on the old site, and deployment are deferred to subsequent steps. Existing backend email branding remains in effect until then.
