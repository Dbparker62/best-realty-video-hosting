# Moving the site to a new domain

The brand name, contact details and site URL live in `frontend/lib/site.ts`.
To move from `www.bestacademyofrealestate.com` to a new domain:

## Website (Vercel)
1. Vercel → Project → Settings → Domains: add the new domain, make it primary.
2. Set the old domain to **redirect (308)** to the new one, so old links and Google rankings carry over.
3. Environment variables: set `NEXT_PUBLIC_SITE_URL=https://www.<new-domain>` and redeploy.

## Backend (Lambda environment variables)
- `FRONTEND_URL=https://www.<new-domain>` (checkout return links, emails)
- `CORS_ALLOWED_ORIGINS=https://www.<new-domain>,https://<new-domain>`
- `COGNITO_REDIRECT_URI=https://www.<new-domain>/auth/callback`
- If the API moves too (`api.<new-domain>`): set `BACKEND_URL` in Vercel and add the custom domain in API Gateway.

## Login (Cognito)
- App client → add the new callback URL and sign-out URL (keep the old ones until the switch is done).

## Payments (Stripe)
- Check success/cancel URLs and the business website listed in Stripe settings.

## Email (SES)
- Add the new domain as an SES identity (DKIM + custom MAIL FROM + DMARC, same as before).
- Wait for **Verified**, then change `EMAIL_FROM` to `...@<new-domain>`.
- Keep the old identity until the switch is finished.

## Google
- Search Console: add the new domain, then **Settings → Change of address** from the old property.
- Submit `https://www.<new-domain>/sitemap.xml`.
- GA4: update the web stream URL.

## Meta (Facebook / Instagram)
- Business settings → Brand safety → Domains: verify the new domain.
- Update the link in bios and ad destinations.
- Re-scrape shared links in the Sharing Debugger.
