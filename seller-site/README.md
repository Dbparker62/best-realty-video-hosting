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

## Analytics

GA4 uses the existing property measurement ID G-5QN8C82W42 by default. In the seller Vercel project, set NEXT_PUBLIC_GA_MEASUREMENT_ID to that value if an existing blank environment variable overrides the default. Redeploy after changing build-time variables.

Page views use GA4 enhanced measurement. In the existing web stream, keep page views based on browser history changes enabled for client-side navigation. Do not add a second manual page-view tag. Use the built-in Hostname dimension to distinguish bestrealtynewjersey.org from the academy website.

Seller custom events include site_brand=best_realty and site_role=seller. Events: quiz_start, quiz_step_view, quiz_complete (contact form reached), quiz_submit (successful submission), generate_lead (GA4 successful submission), quiz_submit_error, and contact_click (phone/email). No contact form values or quiz answers are sent in these event payloads. Optional event-scoped custom dimensions can expose site_brand, site_role, and contact_method in reports.

Check Realtime/DebugView after deployment. Mark generate_lead as a key event in GA4 if not already configured; quiz_complete alone is not a captured lead. Dashboard settings are not changed by deploying this code.

The Vercel Analytics component is already installed. To collect Vercel page views, enable Web Analytics in the seller project's Analytics tab. Custom event availability depends on the Vercel plan. Meta Pixel remains disabled unless its environment variable is explicitly set.

The academy frontends redirect the retired seller quiz URL permanently to this site's quiz and no longer include seller pages, navigation, or sitemap entries. Deploy both Vercel projects after pushing these changes. Shared AWS seller endpoints remain in use.
