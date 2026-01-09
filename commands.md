1. Core Moderation (Enhanced)

These extend standard actions with auditability and safeguards.

/warn – Issue structured warnings (points, expiry, reason templates)

/warnings – View user warning history

/clear-warnings – Remove warnings selectively or fully

/mute – Timeout with presets (5m, 1h, 24h, custom)

/unmute

/kick – With reason + DM preview

/ban – Temp or permanent, optional evidence attachment

/softban – Ban + auto-unban (message cleanup)

/massban – Ban users by ID list (raid response)

/purge – Delete messages by:

user

keyword

regex

attachments only

links only

2. Automod & Anti-Abuse (Advanced)

Automated protection without constant human oversight.

/automod enable|disable

/automod config

/automod rules list

Rule Types:

Anti-spam (rate limits, duplicate messages)

Anti-link / domain whitelist

Anti-mention (mass @everyone/@here)

Anti-caps / emoji spam

Anti-invite (Discord links)

Anti-raid (join rate detection)

AI toxicity / profanity detection

Actions:

Delete

Warn

Timeout

Kick

Quarantine role

Auto-lock channel

3. Role & Permission Control

Granular access management.

/role add|remove

/role temp – Temporary roles with expiry

/role lock – Prevent role changes

/role sync – Sync roles across servers

/permission snapshot – Backup permissions

/permission restore

4. Logging & Auditing

Enterprise-style traceability.

/modlog set

/modlog view

/case view <id>

/case edit

/case close

/evidence add – Attach screenshots/links

/audit user – Full moderation history

5. Channel & Server Control

Emergency and maintenance tools.

/lock – Lock channel

/unlock

/slowmode <time>

/nuke – Clone channel & delete old

/archive – Archive inactive channels

/server lockdown – Read-only mode

/server unlock

6. Verification & Security

Prevent bot raids and alt abuse.

/verify setup – Button / captcha / reaction

/verify reset <user>

/alt-check <user> – Account age, flags

/quarantine <user>

/trusted-role set

8. Appeals & Reports

User-friendly moderation flow.

/report <user|message>

/reports queue

/appeal ban

/appeal status

/appeal resolve

9. Utilities for Moderators

Reduce friction for staff.

/note <user> – Private staff notes

/sticky <message> – Auto-reposting message

/reminder mod

/handover – Shift change summary

/modstats – Staff activity metrics

10. Developer / Admin Commands

For production environments.

/config export|import

/debug guild

/cache clear

/feature toggle

/shard status

/healthcheck