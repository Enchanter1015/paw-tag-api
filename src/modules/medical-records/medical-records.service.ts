import type {
  CreateVaccinationRecordInput,
  UpdateVaccinationRecordInput,
  VerifyMedicalRecordInput,
} from './medical-records.schema.js';
import { medicalRecordsRepository } from './medical-records.repository.js';
import { BadRequestError, NotFoundError } from '../../lib/errors.js';

// Type ids are environment-seeded data, so the vaccination type is resolved by name rather than a fixed id.
const VACCINATION_TYPE_NAME = 'Vaccination';

const getVaccinationTypeId = async () => {
  const type = await medicalRecordsRepository.findTypeByName(VACCINATION_TYPE_NAME);
  if (!type) {
    throw new BadRequestError(`Medical record type '${VACCINATION_TYPE_NAME}' is not configured`);
  }
  return type.id;
};

const assertAnimalExists = async (animalId: string) => {
  const animal = await medicalRecordsRepository.findAnimalById(animalId);
  if (!animal) {
    throw new NotFoundError(`Animal ${animalId} not found`);
  }
};

const assertVetHospitalMemberExists = async (memberId: string) => {
  const member = await medicalRecordsRepository.findVetHospitalMemberById(memberId);
  if (!member) {
    throw new NotFoundError(`Vet hospital member ${memberId} not found`);
  }
};

const assertMedicalRecordTypeExists = async (medicalRecordTypeId: number) => {
  const type = await medicalRecordsRepository.findTypeById(medicalRecordTypeId);
  if (!type) {
    throw new NotFoundError(`Medical record type ${medicalRecordTypeId} not found`);
  }
};

export const medicalRecordsService = {
  addVaccinationRecord: async (animalId: string, input: CreateVaccinationRecordInput, createdBy: string) => {
    await assertAnimalExists(animalId);
    await assertVetHospitalMemberExists(input.prescribedBy);
    await assertMedicalRecordTypeExists(input.medicalRecordTypeId);
    return medicalRecordsRepository.create({
      ...input,
      animalId,
      createdBy,
    });
  },
  getById: async (id: string) => {
    const record = await medicalRecordsRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Medical record ${id} not found`);
    }
    return record;
  },
  listVaccinationRecords: async (animalId: string) => {
    await assertAnimalExists(animalId);
    const medicalRecordTypeId = await getVaccinationTypeId();
    return medicalRecordsRepository.listByAnimal(animalId, medicalRecordTypeId);
  },
  updateVaccinationRecord: async (id: string, input: UpdateVaccinationRecordInput) => {
    await medicalRecordsService.getById(id);
    if (input.prescribedBy) {
      await assertVetHospitalMemberExists(input.prescribedBy);
    }
    if (input.medicalRecordTypeId) {
      await assertMedicalRecordTypeExists(input.medicalRecordTypeId);
    }
    return medicalRecordsRepository.update(id, input);
  },
  verify: async (id: string, input: VerifyMedicalRecordInput) => {
    await medicalRecordsService.getById(id);
    await assertVetHospitalMemberExists(input.verifiedBy);
    return medicalRecordsRepository.update(id, { verifiedBy: input.verifiedBy, verifiedAt: new Date() });
  },
};
