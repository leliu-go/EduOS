# EduOS Productization Human Actions

## Cloud Resource Management

- Stage or PZ task: Stage 4 / PZ06-PZ07 cloud resource management
- Risk type: Paid cloud storage, production credentials, and future provider migration
- Risky action intentionally not executed: No paid cloud storage account, bucket, credentials, production provider, or irreversible migration was created.
- Safe fallback implemented: `ResourceStorageProvider` interface, `LocalResourceStorageProvider`, cloud placeholder provider, resource access policy, `.env.example` placeholders, and RFC.
- Files created or updated: `lib/resources/*`, `docs/rfcs/RFC-CloudResourceManagement.md`, `.env.example`
- What the user should do later: choose a storage vendor, create a bucket/container, create least-privilege credentials, define signed URL TTL, then approve a non-destructive migration for provider metadata.
- Whether later tasks can continue: Yes.

When a high-risk item is downgraded, record:

- Stage or PZ task
- Risk type
- Risky action intentionally not executed
- Safe fallback implemented
- Files created or updated
- What the user should do later
- Whether later tasks can continue
