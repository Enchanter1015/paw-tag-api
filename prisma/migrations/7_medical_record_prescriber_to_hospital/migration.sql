-- Change medical_record.prescribed_by from referencing vet_hospital_member(id)
-- to referencing vet_hospital(id): prescribing is recorded per hospital, not per staff member.

-- DropForeignKey
ALTER TABLE "medical_record" DROP CONSTRAINT "medical_record_prescribed_by_fkey";

-- Backfill: point each record at the hospital of its previously-selected member
UPDATE "medical_record" mr
SET "prescribed_by" = vhm."vet_hospital_id"
FROM "vet_hospital_member" vhm
WHERE mr."prescribed_by" = vhm."id";

-- AddForeignKey
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_prescribed_by_fkey" FOREIGN KEY ("prescribed_by") REFERENCES "vet_hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
