# Client/Server Security Boundary

## Boundary Summary

EduOS security is enforced by the server, not by the installed client.

The client cannot connect directly to RDS, and the client must not hold OSS AccessKey or OSS AccessKeySecret. The client only calls EduOS backend/API routes. The backend applies server-side RBAC, `tenantId`, and ownership checks before returning data.

## Sensitive Data Rules

Never send these to the browser:

- `DATABASE_URL`,
- RDS passwords,
- OSS AccessKeySecret,
- `.env.production.local`,
- MFA secrets,
- tenant-wide data for unauthorized roles,
- signed URLs before resource authorization passes.

## Resource Download Boundary

1. Browser requests an EduOS resource download route.
2. Server checks login, permission, `tenantId`, and ownership/assignment.
3. Server asks `StorageProvider` for a signed URL only after authorization.
4. Unauthorized requests return 403/404 and never sign the object.

## PWA Cache Boundary

The service worker caches only public shell/static assets. It treats `/api/`, login, dashboard, teacher, student, parent, finance, and resource authorization paths as network-only.

## Operational Boundary

Production deployment, production migration, HTTPS certificate creation, forced update publishing, Tauri code signing, and real cloud secret rotation are human-approved operations. They are not triggered by the client.
