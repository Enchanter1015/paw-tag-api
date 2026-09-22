-- CreateTable
CREATE TABLE "animal_image" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "animal_id" VARCHAR(8) NOT NULL,
    "s3_key" VARCHAR(255) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "animal_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_record_image" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medical_record_id" UUID NOT NULL,
    "s3_key" VARCHAR(255) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "medical_record_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_animal_image_animal" ON "animal_image"("animal_id");

-- CreateIndex
CREATE INDEX "idx_medical_record_image_record" ON "medical_record_image"("medical_record_id");

-- AddForeignKey
ALTER TABLE "animal_image" ADD CONSTRAINT "animal_image_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_image" ADD CONSTRAINT "animal_image_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_image" ADD CONSTRAINT "medical_record_image_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_image" ADD CONSTRAINT "medical_record_image_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
