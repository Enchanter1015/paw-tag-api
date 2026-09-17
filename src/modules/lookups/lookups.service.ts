import { lookupsRepository } from './lookups.repository.js';

export const lookupsService = {
  listAnimalTypes: () => lookupsRepository.findAnimalTypes(),
  listMedicalRecordTypes: () => lookupsRepository.findMedicalRecordTypes(),
  listVetHospitalTypes: () => lookupsRepository.findVetHospitalTypes(),
  listRoles: () => lookupsRepository.findRoles(),
};
