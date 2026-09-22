-- Admin deactivate/reactivate support (see users:manage permission from 4_add_auth_rbac)
ALTER TABLE "user" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
