# SMA Hope database recovery

The `smahope-backup.timer` runs daily at 02:45 UTC with up to 300 seconds of jitter. It invokes `/usr/local/sbin/smahope-backup`, which takes a transaction-consistent dump of **only smahope**, compresses it, encrypts it, and records a checksum. Completed encrypted backups are retained for 30 days in `/var/backups/smahope`, accessible only to root. The encryption key is in `/etc/smahope-backup/encryption-key`.

`python3 /usr/local/sbin/smahope-verify-restore` restores the latest backup into a unique `smahope_restore_*` schema, verifies the SQL re-export and column metadata, then removes only that temporary schema. It never overwrites the live database. The initial rehearsal passed on 22 October 2026.

An initial encrypted recovery copy and key were copied privately into the ignored local `.local/backups/mysql` directory. Store a separate copy of the recovery key in the owner's password manager. Daily snapshots can lose up to roughly 24 hours of changes. Local VPS backups alone do not survive total VPS loss; automatic off-server replication and alert delivery are not configured.

Review `systemctl status smahope-backup.timer` and `/var/backups/smahope/last-success` operationally. Do not restore over production without taking a new backup and planning the reconciliation of payments and other writes.
