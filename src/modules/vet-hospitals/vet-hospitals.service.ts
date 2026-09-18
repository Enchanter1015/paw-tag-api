import type {
  AddVetHospitalMemberInput,
  CreateVetHospitalInput,
  UpdateVetHospitalInput,
  UpdateVetHospitalMemberInput,
} from './vet-hospitals.schema.js';
import { vetHospitalsRepository } from './vet-hospitals.repository.js';
import { NotFoundError } from '../../lib/errors.js';

export const vetHospitalsService = {
  register: (input: CreateVetHospitalInput, createdBy: string) =>
    vetHospitalsRepository.create({ ...input, createdBy }),
  getById: async (id: string) => {
    const vetHospital = await vetHospitalsRepository.findById(id);
    if (!vetHospital) {
      throw new NotFoundError(`Vet hospital ${id} not found`);
    }
    return vetHospital;
  },
  search: (name?: string) =>
    vetHospitalsRepository.search({
      isArchived: false,
      ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
    }),
  update: async (id: string, input: UpdateVetHospitalInput) => {
    // P2025 (not found) is mapped to 404 by the global error handler.
    return vetHospitalsRepository.update(id, input);
  },
  remove: async (id: string) => {
    await vetHospitalsService.getById(id);
    return vetHospitalsRepository.remove(id);
  },
  addMember: async (vetHospitalId: string, input: AddVetHospitalMemberInput) => {
    await vetHospitalsService.getById(vetHospitalId);
    // P2002 (vetHospitalId, userId) unique conflict is mapped to 409 by the global error handler.
    return vetHospitalsRepository.addMember({ vetHospitalId, ...input });
  },
  listMembers: async (vetHospitalId: string) => {
    await vetHospitalsService.getById(vetHospitalId);
    return vetHospitalsRepository.listMembers(vetHospitalId);
  },
  updateMember: async (vetHospitalId: string, memberId: string, input: UpdateVetHospitalMemberInput) => {
    const member = await vetHospitalsRepository.findMemberById(vetHospitalId, memberId);
    if (!member) {
      throw new NotFoundError(`Member ${memberId} not found for vet hospital ${vetHospitalId}`);
    }
    return vetHospitalsRepository.updateMember(memberId, input);
  },
  removeMember: async (vetHospitalId: string, memberId: string) => {
    const member = await vetHospitalsRepository.findMemberById(vetHospitalId, memberId);
    if (!member) {
      throw new NotFoundError(`Member ${memberId} not found for vet hospital ${vetHospitalId}`);
    }
    return vetHospitalsRepository.removeMember(memberId);
  },
};
