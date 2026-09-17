# Plan: Postgres (Prisma) + TypeScript for paw-tag-api

Status: in progress — Phases 1-4 complete, Phases 5-7 not yet implemented.
Last updated: 2026-09-17

## Locked decisions

- ORM: **Prisma**; **Prisma owns the schema** going forward (introspect + baseline).
- Language: **full JS → TS conversion now** (strict).
- Integration tests: **Testcontainers**, image **postgres:18-alpine** (dump is from PG 18.6).
- Host: **Layerbase Cloud**, `postgresql://...?sslmode=require`, no PgBouncer in front
  (prepared statements are safe). Free tier sleeps when idle and wakes on connection, so
  connect retry + backoff is required.
- Schema is **already applied** in Layerbase. `pawtag-20260914-104111.dump` is reference only.
- Modules: **animals (+owners), users, vet hospitals (+members), medical records**.
- Add **`updated_at`** columns via a Prisma migration.
- Out of scope: auth layer, a tags module (no such table), Layerbase HTTP query API, caching.

## Verified schema

Decoded from `pawtag-20260914-104111.dump` (PostgreSQL 18.6). Extension: `pgcrypto`.

| Table | PK | Notes |
| --- | --- | --- |
| `user` | uuid `gen_random_uuid()` | **Quoted reserved word.** Unique email / google_id / apple_id. No password column |
| `role` | int seq (4) | unique name |
| `animal_type` | int seq (5) | unique name |
| `medical_record_type` | int seq (6) | unique name |
| `vet_hospital_type` | int seq (4) | unique name |
| `animal` | **varchar(8)** | default `substr(replace(gen_random_uuid()::text,'-',''),1,8)` |
| `animal_owner` | **composite (user_id, animal_id)** | join table |
| `animal_weight` | int seq (45) | `numeric(6,2)` weight, `date_time` timestamptz |
| `medical_record` | uuid | `prescribed_by` → **vet_hospital_member**, not user |
| `vet_hospital` | uuid | `is_verified` bool |
| `vet_hospital_member` | uuid | unique (vet_hospital_id, user_id), has role_id |

**FK policy.** All `ON UPDATE CASCADE`. `ON DELETE CASCADE` for `animal_owner` (both sides),
`animal_weight → animal`, `medical_record → animal`, and `vet_hospital_member → hospital`/`user`.
`ON DELETE RESTRICT` for every lookup FK and every `created_by` / `prescribed_by` audit FK.

**Indexes.** `idx_animal_created_by`, `idx_animal_is_street`, `idx_animal_name`,
`idx_animal_type`, `idx_animal_owner_animal`, `idx_animal_weight_animal_date(animal_id, date_time)`,
`idx_medical_record_animal_created(animal_id, created_at DESC)`, `idx_medical_record_created_by`,
`idx_medical_record_prescribed_by`, `idx_medical_record_type`, `idx_user_phone_no`,
`idx_vet_hospital_created_by`, `idx_vet_hospital_type`, `idx_vet_hospital_verified`,
`idx_vhm_role`, `idx_vhm_user`.

Every table has `created_at timestamptz DEFAULT now()`. **None have `updated_at`.**

## Phase 1 — TypeScript conversion (blocks everything) — ✅ Done (2026-09-16)

1. Dev deps: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/cors`,
   `@types/compression`, `@types/supertest`, `typescript-eslint`.
2. `tsconfig.json`: ES2023, `module`/`moduleResolution` NodeNext, `strict`,
   `noUncheckedIndexedAccess`, `rootDir: src`, `outDir: dist`, sourcemaps.
3. Rename `src/**/*.js` → `.ts`.
   **Gotcha:** NodeNext requires keeping the `.js` suffix in relative import specifiers.
4. Scripts: `dev` → `tsx watch src/server.ts`, `build` → `tsc -p .`,
   `start` → `node dist/server.js`, `test` → `tsx --test test/**/*.test.ts`.
5. Convert `eslint.config.js` to the typescript-eslint flat config.
6. Typing work: config as a frozen `as const` object; `validate` generic over `ZodType`;
   `errorHandler` typed `ErrorRequestHandler`; `src/types/express.d.ts` declaration-merges
   `Request.id`, `Request.log` (pino-http) and `Request.actorId`.

## Phase 2 — Prisma introspection + baseline (depends on 1) — ✅ Done (2026-09-17)

1. Deps: `@prisma/client`; dev: `prisma`.
2. `prisma db pull` against the live Layerbase DB to generate `prisma/schema.prisma`.
3. Hand-fix after introspection:
   - `model User { ... @@map("user") }` (reserved word).
   - `animal.id` → `@default(dbgenerated("substr(replace((gen_random_uuid())::text,'-'::text,''::text),1,8)"))`.
   - `animal_owner` → `@@id([userId, animalId])`.
   - Verify every relation carries `onUpdate: Cascade` and the correct `onDelete` per the table above.
   - camelCase fields with `@map` to snake_case columns.
4. **Baseline — do not run `migrate dev` against a populated DB:**
   ```bash
   mkdir prisma/migrations/0_init
   npx prisma migrate diff --from-empty \
     --to-schema-datamodel prisma/schema.prisma \
     --script > prisma/migrations/0_init/migration.sql
   npx prisma migrate resolve --applied 0_init
   ```
5. Generator client: `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` for the Alpine image.
6. `src/config/index.ts`: add `DATABASE_URL` (zod, must start with `postgres`),
   `DB_CONNECT_RETRIES`, `DB_CONNECT_BACKOFF_MS`.
   **Prisma pool tuning lives in URL params**, not code:
   `?sslmode=require&connection_limit=10&pool_timeout=20&connect_timeout=15`.
7. `src/db/prisma.ts`: one `PrismaClient`, log events piped into pino, cached on `globalThis`
   so `tsx watch` reloads don't leak connections.
8. `src/db/connect.ts`: `connectWithRetry()` with exponential backoff for Layerbase's cold wake.
9. `src/server.ts`: connect before `listen`; `$disconnect()` inside `shutdown()` after `server.close()`.

## Phase 3 — DB-aware plumbing (depends on 2; items parallel) — ✅ Done (2026-09-17)

1. `src/db/transaction.ts`: `withTransaction(fn: (tx: Prisma.TransactionClient) => Promise<T>)`.
2. Split health: `/api/v1/health` stays liveness (no DB);
   new `/api/v1/health/ready` runs a timed `SELECT 1`, returning 200 or 503.
3. `src/middleware/error-handler.ts`: map `PrismaClientKnownRequestError`
   P2002 → 409, P2025 → 404, P2003 → 400, P1001/P1008/P1017 → 503;
   `PrismaClientValidationError` → 400. Never leak `err.meta` in production.
4. **Actor placeholder.** `created_by` / `prescribed_by` are NOT NULL FKs but auth is out of scope.
   `src/middleware/actor.ts` reads `x-user-id`, validates it is a uuid that exists in `user`,
   sets `req.actorId`, else 401. Applied to write routes.
   Explicitly a temporary stand-in for real auth.

## Phase 4 — `updated_at` migration (depends on 2) — ✅ Done (2026-09-17)

1. Add `updatedAt DateTime @updatedAt @map("updated_at")` to `animal`, `user`, `vet_hospital`,
   `medical_record`, `animal_weight`, `vet_hospital_member`.
2. `prisma migrate dev --name add_updated_at`; the generated SQL must use
   `DEFAULT now() NOT NULL` so existing rows backfill.
3. Lookup tables (`role`, `*_type`) intentionally excluded.

## Phase 5 — API modules (depends on 3, 4)

Shape per module: `<name>.schema.ts` (zod), `.repository.ts` (prisma, accepts an optional tx
client), `.service.ts` (rules, throws `AppError` subclasses), `.controller.ts` (`asyncHandler`),
`.routes.ts`. Mount in `src/routes/index.ts`.

Each numbered item below is **one PR**, mapped to its Jira ticket (all currently "To Do").
Sub-bullets are the suggested commit sequence within that PR. PRs are ordered so each only
depends on schema/plumbing already merged (Phases 1-4) and, where noted, an earlier PR in this list.

1. **PR 1 — lookups module** *(no ticket; prerequisite seed data for every module below)* -  Done
   - `chore(lookups): add schema+repository+service+controller+routes for animal_type,
     medical_record_type, vet_hospital_type, role`
   - `feat(lookups): mount GET /animal-types, /medical-record-types, /vet-hospital-types, /roles`
   - `test(lookups): route + repository tests`

2. **PR 2 — SCRUM-26 Register street dog API** - Done
   - `feat(animals): zod schema for create (sex, approx age, colour, location, description, photo)`
   - `feat(animals): repository.create + service (never accept client-supplied id)`
   - `feat(animals): POST /animals controller + route`
   - `test(animals): required-field validation errors, successful create returns generated id`

3. **PR 3 — SCRUM-28 View dog information API** *(depends on PR 2)*
   - `feat(animals): repository.findById + service`
   - `feat(animals): GET /animals/:id controller + route`
   - `test(animals): 404 on unknown id, field-shape test per role placeholder`

4. **PR 4 — SCRUM-27 Update dog information API** *(depends on PR 2)*
   - `feat(animals): zod schema for partial update`
   - `feat(animals): repository.update + service (touches updated_at)`
   - `feat(animals): PATCH /animals/:id controller + route`
   - `test(animals): update persists, updated_at changes, rejects non-permitted fields`

5. **PR 5 — SCRUM-29 Search dogs API (by identifier and by location)** *(depends on PR 2)*
   - `feat(animals): repository.search by id/name/description using idx_animal_name`
   - `feat(animals): location/radius search (lat/lng + radius params)`
   - `feat(animals): GET /animals?query=&lat=&lng=&radius= controller + route`
   - `test(animals): text-match results, location results ordered by proximity`

6. **PR 6 — SCRUM-30 Administrator dog record management API** *(depends on PR 2, 4)*
   - `feat(animals): service.merge / service.remove with audit log (actor id + timestamp)`
   - `feat(animals): DELETE /animals/:id and POST /animals/:id/merge controller + routes`
   - `test(animals): merge/remove applies and is logged with actor identity`

7. **PR 7 — users module** *(no single ticket; groundwork consumed by SCRUM-48/49 below)*
   - `feat(users): zod schema, repository, service (409 on email/google_id/apple_id P2002)`
   - `feat(users): GET /users/:id, GET /users?email=, POST /users, PATCH /users/:id`
   - `test(users): duplicate-email 409, not-found 404, update flow`

8. **PR 8 — vet hospitals + members module** *(prerequisite for medical records `prescribed_by`)*
   - `feat(vet-hospitals): zod schema, repository, service; CRUD /vet-hospitals`
   - `feat(vet-hospitals): /vet-hospitals/:id/members POST/PATCH role/DELETE,
     409 on (vet_hospital_id, user_id) unique`
   - `test(vet-hospitals): CRUD + member uniqueness conflict`

9. **PR 9 — SCRUM-36 Vaccination record API (add, update, view)** *(depends on PR 8; medical_record_type = vaccination)*
   - `feat(medical-records): zod schema scoped to vaccination type (vaccine, date, next due, provider, notes)`
   - `feat(medical-records): repository/service — prescribed_by validated against vet_hospital_member`
   - `feat(medical-records): POST /animals/:animalId/medical-records, GET list via
     idx_medical_record_animal_created`
   - `feat(medical-records): PATCH /medical-records/:id verification flag`
   - `test(medical-records): create+link to animal, chronological list with next-due-date,
     verify toggles status`

10. **PR 10 — SCRUM-38 Sterilisation record API (add, update, view)** *(depends on PR 9)*
    - `feat(medical-records): sterilisation-type schema (date, location, verification)`
    - `feat(animals): derive/expose sterilisation status from latest sterilisation record`
    - `feat(medical-records): reuse add/update/view routes for sterilisation type`
    - `test(medical-records): status flips to sterilised, history + current status both retrievable`

11. **PR 11 — SCRUM-40 Medical treatment record API (add, update, view)** *(depends on PR 9)*
    - `feat(medical-records): treatment-type schema (condition/injury, treatment, medication, notes)`
    - `feat(medical-records): reuse add/update/view routes for treatment type`
    - `test(medical-records): stored with timestamp/provider/verification, chronological retrieval`

12. **PR 12 — SCRUM-41 Dog health summary aggregation API** *(depends on PR 9, 10, 11)*
    - `feat(animals): service.getHealthSummary aggregating latest vaccination/sterilisation/treatment`
    - `feat(animals): GET /animals/:id/health-summary controller + route`
    - `test(animals): summary reflects current status + most recent event date per category`

13. **PR 13 — SCRUM-48 Medical record verification API** *(depends on PR 9)*
    - `feat(medical-records): service.verify(id, verifierMemberId) — stores identity + timestamp`
    - `feat(medical-records): reject-without-delete flag (audit trail preserved)`
    - `feat(medical-records): PATCH /medical-records/:id/verify, /reject controller + routes`
    - `test(medical-records): verify sets verifier+timestamp, reject flags rather than deletes`

14. **PR 14 — SCRUM-49 User management API (administrator)** *(depends on PR 7)*
    - `feat(users): service.updateRole, service.deactivate`
    - `feat(users): GET /users (list), PATCH /users/:id/role, PATCH /users/:id/deactivate`
    - `test(users): role change takes effect, deactivated user denied on next auth check`

**Deferred / out of scope for this phase** (ticket exists but has no matching table or is explicitly
out of scope per "Locked decisions" above — revisit in a separate plan):
- SCRUM-19/20/21/22 (auth, sessions, RBAC, input-sanitisation middleware) — no auth layer yet;
  `x-user-id` actor header is the temporary stand-in (see Phase 3 notes).
- SCRUM-44/45 (QR generation/resolution) — no tag/QR table in the schema.
- SCRUM-52 (dashboard/KPI stats) — candidate for a later "reporting" module once Phase 5 data exists.
- SCRUM-54 (GPS location support) — check whether `animal` already has lat/lng columns before
  scoping a PR; if not, needs its own migration first.
- SCRUM-58/59 (offline sync, automated backups) — infrastructure/ops work, not a REST module.

## Phase 6 — Integration tests (depends on 5)

1. Dev deps: `testcontainers`, `@testcontainers/postgresql`.
   Image **postgres:18-alpine** — must match the 18.6 source.
2. `test/helpers/db.ts`: one container per run, `prisma migrate deploy`, seed the four lookup
   tables plus a baseline user, `TRUNCATE ... RESTART IDENTITY CASCADE` between tests.
3. Cover: animal CRUD, owner attach/detach, duplicate email 409, unknown id 404,
   FK RESTRICT when deleting a referenced user → 409, and cascade delete of an animal
   removing its weights and medical records.
4. Keep `test/health.test.ts` DB-free; add a readiness 503 test.

## Phase 7 — Build & deploy (depends on 1, 2)

1. `Dockerfile`: deps → build (`npm ci`, `prisma generate`, `tsc`) → runtime.
   **Alpine needs `openssl`** installed for Prisma's engines.
2. Run `prisma migrate deploy` as a release step, never in `CMD`.
3. Update `.env.example` and `README.md`: `DATABASE_URL` shape, pool params,
   migration and baseline commands.
4. Decide gitignore vs a `db/` folder for `pawtag-*.dump` (currently in the repo root).

## Verification

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean.
2. `npx prisma validate`, and
   `npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --exit-code`
   reports **no drift** against Layerbase.
3. `npm test` green against Testcontainers (postgres:18-alpine).
4. `npm run dev` on the real DB: liveness 200, readiness 200, readiness 503 on a dead URL.
5. Spot-check modules against real data: animal list filters, owner attach 409 on repeat,
   medical record list ordered `created_at DESC`.
6. SIGTERM logs shutdown + disconnect, exits 0, no lingering `pg_stat_activity` rows.
7. `docker build` and run the image against Layerbase; hit readiness.

## Further considerations

1. The `x-user-id` actor header is a deliberate stopgap; real Google/Apple auth is a separate plan.
2. The repo is named `paw-tag-api` but there is **no tag table**. Confirm whether a physical tag
   entity is still coming — it would likely be 1:1 with `animal`, using the 8-char id as the
   printed code.
3. The dump sits in the repo root with real-looking data. Decide: gitignore, move under `db/`,
   or remove.
