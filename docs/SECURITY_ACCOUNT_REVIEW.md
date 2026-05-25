# Account Security Review

Date: 2026-05-25

## Reviewed Files

- `app/(auth)/login/page.tsx`
- `app/api/auth/login/route.ts`
- `lib/auth/login-security.ts`
- `lib/auth/session.ts`
- `lib/auth/current-user.ts`
- `lib/rbac/require-permission.ts`
- `features/accounts/actions.ts`
- `tests/login-route-handler.test.ts`
- `tests/login-security-policy.test.ts`

## Findings

### P1 - Login redirect trusted forwarded host headers

Before this review, `app/api/auth/login/route.ts` built redirect origins from `x-forwarded-host` and `x-forwarded-proto`. If a deployment proxy ever passed untrusted values, login redirects could be influenced by request headers.

Fix applied:

- Prefer `APP_URL` when configured.
- Otherwise use `request.nextUrl.origin`.
- Do not trust `x-forwarded-host` or `x-forwarded-proto`.
- Updated `tests/login-route-handler.test.ts`.

### P1 - Duplicate login action path - fixed 2026-05-26

`app/api/auth/login/route.ts` is the active login endpoint. `lib/auth/actions.ts` previously contained a separate login action path, which increased drift risk for lockout, MFA, and cookie behavior.

Fix applied:

- Removed the unused `loginAction` from `lib/auth/actions.ts`.
- Kept `logoutAction`, which is used by student and teacher "Me" pages.
- Added source coverage in `tests/login-route-handler.test.ts` to keep login logic centralized in the route handler.

### P1 - Account import needs stronger preview controls

`features/accounts/actions.ts` supports account import and existing-user linking by email/phone under admin permissions. It is protected, but bulk import is sensitive enough to benefit from a preview-and-confirm step that shows cross-tenant existing-user matches before linking.

### P2 - Logout cache clearing is separate from logout

`public/sw.js` avoids caching sensitive routes and APIs. A clear-cache control exists, but logout currently focuses on clearing the auth cookie and redirecting. Because only static assets are cached, this is not a confirmed data leak. Still, a future logout UX should call the cache clear message.

## Positive Controls

- Password verification uses `lib/auth/password.ts`; no plaintext password storage was found in tracked app code.
- Failed login policy in `lib/auth/login-security.ts` implements 5 failures -> 5 minute lock, next lock -> 24 hours, then permanent lock.
- Session cookie is HTTP-only, `sameSite: "lax"`, secure in production, and bounded by `EDUOS_SESSION_MAX_AGE_SECONDS`.
- `getCurrentUser()` rejects inactive users, inactive memberships, inactive roles, tenant mismatch, role mismatch, and permanently locked accounts.
- Login errors are generic and do not disclose whether an email exists.

## Remaining Risks

- Add central rate limiting by IP and account identifier at the reverse proxy or app layer.
- Add audit logging for successful login, logout, and admin unlock operations.
- Add an admin-only permanent-lock recovery workflow with MFA step-up.
