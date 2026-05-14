# Plan: Import phidigital_rafael users into Training Platform staging

## Goal
Import users from Railway project `phydigital-rafael` / environment `production` into Railway project `Platform-Training` / environment `staging`, enroll them into course `PHYGITAL-OC`, and preserve their existing passwords where possible.

## Read-only findings

### Railway links
- Source repo `C:\Users\andre\Code\phidigital_rafael` is linked to Railway project `phydigital-rafael`, environment `production`, service `phidigital_rafael`.
- Target repo `C:\Users\andre\Code\training-plataform\Training-platform-dashboard` is linked to Railway project `Platform-Training`, environment `staging`, service `Training-platform-dashboard`.

### Source app/database
Source app uses:
- `bcryptjs` dependency.
- Login: `bcrypt.compare(password, user.password)`.
- User creation/seed: `bcrypt.hash(password, 12)`.
- DB table: `users`.
- Columns: `id`, `username`, `password`, `is_superuser`, `created_at`.
- Production DB count: 36 users, 36 password hashes.
- All 36 source hashes are bcrypt-like, prefix `$2a$`, length 60.
- Source DB has no `email` column. Also, 0 usernames currently look like emails using `username LIKE '%@%'`.

### Target app/database
Target app uses:
- `bcrypt` dependency.
- Registration: `bcrypt.hash(password, 10)` into `User.password_hash`.
- Login: `bcrypt.compare(password, user.password_hash)`.
- Prisma model `User`: `id`, `username`, `email`, `password_hash`, `role`, `isVerified`, etc.
- Target staging DB has bcrypt-like hashes, prefix `$2b$`, length 60.
- Target course exists: `Course.id = 14`, `title = PHYGITAL-OC`, `status = PUBLISHED`.
- Enrollment table/model: `Enrollment` with unique `(courseId, userId)`, default status `ENROLLED`.
- Student role is represented as `User.role = USER` plus `UserRoleAssignment.role = STUDENT`.
- `REQUIRE_EMAIL_VERIFICATION` is not present in Railway variables for the dashboard service, so target config defaults it to true. Imported users should be created with `isVerified = true` unless we intentionally want verification blocking login.

## Compatibility conclusion
Passwords are compatible. Source has bcrypt `$2a$` hashes from `bcryptjs`; target verifies with `bcrypt.compare`, which supports standard bcrypt hashes including `$2a$`/`$2b$` 60-character hashes. So the source `users.password` can be copied directly into target `User.password_hash`.

The blocker is not the password hash; it is identity mapping. Source has no email column and usernames are not email addresses. Training Platform login expects email. To preserve access cleanly, choose one of these strategies before import:

1. Preferred if real emails exist elsewhere: provide/import a username-to-email CSV mapping.
2. If old credentials should remain exactly username + password: import usernames and add a small target login compatibility change to allow login by email OR username.
3. If neither is desired: generate placeholder emails, but users would need to know those emails to log in, so this does not really preserve access.

## Recommended plan

### Step 1: Decide identity mapping
Recommended: use the source `username` as target `username`, preserve source bcrypt hash as `password_hash`, set `role = USER`, set `isVerified = true`, add `STUDENT` role assignment, and enroll into PHYGITAL-OC.

But we need either:
- real email mapping, or
- a Training Platform auth change to allow username login.

Given the source app currently logs users in by username, the best preservation path is: **support target login by email OR username**, then import users with generated stable emails such as `<username>@phidigital.local` only to satisfy the unique required email field. Users would still log in with their old username/password.

### Step 2: Backup target staging DB
Before writes:
```bash
cd "C:\Users\andre\Code\training-plataform\Training-platform-dashboard"
railway connect Postgres
```
Or use `pg_dump` through a connection string if available. Create a timestamped dump before import.

### Step 3: Build dry-run import script
Create a temporary script that:
- Reads source users from `phidigital_rafael` production via Railway/Postgres.
- Reads target users/course/enrollments from Training Platform staging.
- Does not print passwords/hashes.
- Normalizes usernames.
- Detects duplicates/conflicts.
- Reports:
  - source users found: 36
  - source superusers to skip or import as students: TBD by policy
  - would create target users
  - would skip existing usernames/emails
  - would enroll users into `Course.id = 14`

### Step 4: Dry run
Run with no writes and show summary.

### Step 5: Execute transactional import after approval
Inside one transaction:
- Insert target `User` rows for non-existing users:
  - `username = source.username`
  - `email = mapped email` or generated placeholder
  - `password_hash = source.password`
  - `role = 'USER'`
  - `isVerified = true`
- Ensure `UserProfile` exists.
- Ensure `UserPreference` exists.
- Ensure `UserRoleAssignment(userId, STUDENT)` exists, `active = true`, `isPrimary = true` when appropriate.
- Upsert `Enrollment(courseId = 14, userId, status = ENROLLED)`.

### Step 6: Verify
Run read-only checks:
```sql
select count(*) from "Enrollment" where "courseId" = 14;
select count(*) from "UserRoleAssignment" where role = 'STUDENT' and active = true;
select count(*) from "User" where "isVerified" = true;
```
Then test login for one imported account if a known password/test user is available.

## Risks / decisions needed
1. Source has no emails; decide mapping or username-login compatibility.
2. Decide whether to import source `is_superuser = true` users as students too, or skip them.
3. Existing target user conflicts: decide whether to enroll existing matching usernames only, or overwrite nothing.
4. Imported users should probably be `isVerified = true`; otherwise email verification blocks login.

## Proposed next action
Do not import yet. First get approval on the identity mapping strategy. My recommendation is to add/support login by username-or-email in Training Platform staging, then import source usernames/password hashes as student users enrolled into PHYGITAL-OC.
