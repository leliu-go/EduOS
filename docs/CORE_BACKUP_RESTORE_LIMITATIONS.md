# Core Backup Restore Limitations

The Admin local backup is intentionally limited.

## It Can Restore

- Core student and guardian records
- Teacher records
- Enrollment, class, course, and schedule structure
- Attendance and course consumption ledgers
- Finance records such as orders, payments, and refunds
- Activity and resource metadata

## It Cannot Restore

- OSS object bodies
- Homework photos
- Mistake photos
- Videos and audio
- Question-bank attachments
- Word-book file bodies
- Old sessions or browser state
- Old MFA secrets or backup codes
- Database passwords, OSS AccessKeys, or any server secret
- External payment, SMS, or messaging provider state

## Operational Risk

RDS snapshots remain the preferred restore path. Local backup restore should be used only after confirming cloud database restore is unavailable or insufficient.
