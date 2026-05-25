# PWA Cache Security Review

Date: 2026-05-25

## Reviewed Files

- `public/sw.js`
- `components/install/clear-cache-button.tsx`
- `components/install/install-pwa-prompt.tsx`
- `components/version/update-available-banner.tsx`

## Findings

### P0

No sensitive API caching was found in `public/sw.js`.

### P2 - Logout does not automatically invoke cache clear

The service worker only caches app shell/static assets, so this is not a confirmed data exposure. Still, logout UX should call the existing `CLEAR_EDUOS_CACHES` flow for defense in depth.

## Positive Controls

- All `/api/` requests are network-only.
- `/login`, `/dashboard`, `/teacher`, `/student`, `/parent`, and `/unauthorized` are network-only.
- Non-GET requests are network-only.
- Cross-origin requests are not cached.
- Cache clear message deletes `eduos-*` caches.

## Remaining Risks

- Add an e2e or unit source test that asserts sensitive prefixes remain network-only.
- Wire cache clearing into logout or account-switch flows.

