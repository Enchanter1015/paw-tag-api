-- Seed permission (idempotent by name)
INSERT INTO "permission" ("name") VALUES
  ('dashboard:read')
ON CONFLICT ("name") DO NOTHING;

-- 'Admin' gets every permission
INSERT INTO "role_permission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "role" r
CROSS JOIN "permission" p
WHERE r."name" = 'Admin'
ON CONFLICT DO NOTHING;
