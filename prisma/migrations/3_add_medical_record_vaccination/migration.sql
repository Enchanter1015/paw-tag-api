-- AlterTable
ALTER TABLE "medical_record" ADD COLUMN     "administered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
ADD COLUMN     "next_due_date" DATE,
ADD COLUMN     "verified_by" UUID,
ADD COLUMN     "verified_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "idx_medical_record_verified_by" ON "medical_record"("verified_by");

-- AddForeignKey
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "vet_hospital_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
