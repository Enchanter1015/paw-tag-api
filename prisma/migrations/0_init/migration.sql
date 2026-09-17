-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "animal" (
    "id" VARCHAR(8) NOT NULL DEFAULT substr(replace((gen_random_uuid())::text, '-'::text, ''::text), 1, 8),
    "name" VARCHAR(100) NOT NULL,
    "dob" DATE,
    "animal_type_id" INTEGER NOT NULL,
    "breed" VARCHAR(100),
    "is_street" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_owner" (
    "user_id" UUID NOT NULL,
    "animal_id" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_owner_pkey" PRIMARY KEY ("user_id","animal_id")
);

-- CreateTable
CREATE TABLE "animal_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "animal_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_weight" (
    "id" SERIAL NOT NULL,
    "animal_id" VARCHAR(8) NOT NULL,
    "weight" DECIMAL(6,2) NOT NULL,
    "date_time" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "animal_weight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_record" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medical_record_type_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "prescribed_by" UUID NOT NULL,
    "animal_id" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "medical_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_record_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "medical_record_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "dob" DATE,
    "google_id" VARCHAR(255),
    "apple_id" VARCHAR(255),
    "phone_no" VARCHAR(20),
    "address" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vet_hospital" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "phone_no" VARCHAR(20),
    "address" VARCHAR(255),
    "business_email" VARCHAR(255),
    "vet_hospital_type_id" INTEGER NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "vet_hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vet_hospital_member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vet_hospital_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vet_hospital_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vet_hospital_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "vet_hospital_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_animal_created_by" ON "animal"("created_by");

-- CreateIndex
CREATE INDEX "idx_animal_is_street" ON "animal"("is_street");

-- CreateIndex
CREATE INDEX "idx_animal_name" ON "animal"("name");

-- CreateIndex
CREATE INDEX "idx_animal_type" ON "animal"("animal_type_id");

-- CreateIndex
CREATE INDEX "idx_animal_owner_animal" ON "animal_owner"("animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "animal_type_name_key" ON "animal_type"("name");

-- CreateIndex
CREATE INDEX "idx_animal_weight_animal_date" ON "animal_weight"("animal_id", "date_time");

-- CreateIndex
CREATE INDEX "idx_medical_record_animal_created" ON "medical_record"("animal_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_medical_record_created_by" ON "medical_record"("created_by");

-- CreateIndex
CREATE INDEX "idx_medical_record_prescribed_by" ON "medical_record"("prescribed_by");

-- CreateIndex
CREATE INDEX "idx_medical_record_type" ON "medical_record"("medical_record_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_record_type_name_key" ON "medical_record_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_apple_id_key" ON "user"("apple_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_phone_no" ON "user"("phone_no");

-- CreateIndex
CREATE INDEX "idx_vet_hospital_created_by" ON "vet_hospital"("created_by");

-- CreateIndex
CREATE INDEX "idx_vet_hospital_type" ON "vet_hospital"("vet_hospital_type_id");

-- CreateIndex
CREATE INDEX "idx_vet_hospital_verified" ON "vet_hospital"("is_verified");

-- CreateIndex
CREATE INDEX "idx_vhm_role" ON "vet_hospital_member"("role_id");

-- CreateIndex
CREATE INDEX "idx_vhm_user" ON "vet_hospital_member"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vet_hospital_member_vet_hospital_id_user_id_key" ON "vet_hospital_member"("vet_hospital_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vet_hospital_type_name_key" ON "vet_hospital_type"("name");

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_animal_type_id_fkey" FOREIGN KEY ("animal_type_id") REFERENCES "animal_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_owner" ADD CONSTRAINT "animal_owner_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_owner" ADD CONSTRAINT "animal_owner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_weight" ADD CONSTRAINT "animal_weight_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_medical_record_type_id_fkey" FOREIGN KEY ("medical_record_type_id") REFERENCES "medical_record_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_prescribed_by_fkey" FOREIGN KEY ("prescribed_by") REFERENCES "vet_hospital_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vet_hospital" ADD CONSTRAINT "vet_hospital_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vet_hospital" ADD CONSTRAINT "vet_hospital_vet_hospital_type_id_fkey" FOREIGN KEY ("vet_hospital_type_id") REFERENCES "vet_hospital_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vet_hospital_member" ADD CONSTRAINT "vet_hospital_member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vet_hospital_member" ADD CONSTRAINT "vet_hospital_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vet_hospital_member" ADD CONSTRAINT "vet_hospital_member_vet_hospital_id_fkey" FOREIGN KEY ("vet_hospital_id") REFERENCES "vet_hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

