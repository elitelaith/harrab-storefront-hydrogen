# Harrab Hydrogen storefront

This is a standalone Shopify Hydrogen storefront for Harrab, a dark martial arts clothing brand.

The homepage uses a pinned mock.shop product snapshot in `app/routes/_index.tsx`. Live mock.shop queries through MiniOxygen were unstable in this Replit environment, so the snapshot keeps local development reliable without requiring real Shopify credentials. Root header and footer data fall back locally for `mock.shop` and switch to live Storefront API queries when a real store domain is configured.

## What's included

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Manual QA checklist

- Open the homepage and confirm the large animated HARRAB hero appears.
- Confirm the featured products render as a three-column grid on desktop.
- Hover a product card and confirm it lifts with a red glow.
- Hover the marquee and confirm the scrolling text pauses.
- Click Add to cart and confirm the cart drawer opens from the right.

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
