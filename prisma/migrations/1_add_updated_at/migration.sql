-- AlterTable
ALTER TABLE "animal" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "animal_weight" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "medical_record" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "vet_hospital" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE "vet_hospital_member" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now();
