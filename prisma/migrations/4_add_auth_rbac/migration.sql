-- Auth: password + platform role on user (nullable password_hash: existing rows have none yet)
ALTER TABLE "user" ADD COLUMN     "password_hash" VARCHAR(255);
ALTER TABLE "user" ADD COLUMN     "role_id" INTEGER;

-- Seed platform-level roles (idempotent by name; existing hospital-scoped role rows are untouched)
INSERT INTO "role" ("name")
VALUES ('Admin'), ('User')
ON CONFLICT ("name") DO NOTHING;

-- Backfill existing users to the 'User' role before enforcing NOT NULL
UPDATE "user"
SET "role_id" = (SELECT "id" FROM "role" WHERE "name" = 'User')
WHERE "role_id" IS NULL;

ALTER TABLE "user" ALTER COLUMN "role_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_token_user" ON "refresh_token"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_role" ON "user"("role_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed permissions (idempotent by name)
INSERT INTO "permission" ("name") VALUES
  ('animals:write'),
  ('animals:manage'),
  ('users:manage'),
  ('vet-hospitals:write'),
  ('vet-hospitals:manage'),
  ('medical-records:write'),
  ('medical-records:verify')
ON CONFLICT ("name") DO NOTHING;

-- Default role permissions: 'User' gets standard write access
INSERT INTO "role_permission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "role" r
CROSS JOIN "permission" p
WHERE r."name" = 'User'
  AND p."name" IN ('animals:write', 'vet-hospitals:write', 'medical-records:write')
ON CONFLICT DO NOTHING;

-- 'Admin' gets every permission
INSERT INTO "role_permission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "role" r
CROSS JOIN "permission" p
WHERE r."name" = 'Admin'
ON CONFLICT DO NOTHING;
