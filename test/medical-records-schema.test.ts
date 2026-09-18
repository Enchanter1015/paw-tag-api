import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  animalMedicalRecordsParamsSchema,
  createVaccinationRecordSchema,
  medicalRecordIdParamsSchema,
  updateVaccinationRecordSchema,
  verifyMedicalRecordSchema,
} from '../src/modules/medical-records/medical-records.schema.js';

describe('medicalRecordIdParamsSchema', () => {
  it('accepts a valid uuid', () => {
    assert.equal(medicalRecordIdParamsSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' }).success, true);
  });

  it('rejects a non-uuid id', () => {
    assert.equal(medicalRecordIdParamsSchema.safeParse({ id: 'nope' }).success, false);
  });
});

describe('animalMedicalRecordsParamsSchema', () => {
  it('accepts an 8-char animal id', () => {
    assert.equal(animalMedicalRecordsParamsSchema.safeParse({ animalId: 'a1b2c3d4' }).success, true);
  });

  it('rejects a wrong-length animal id', () => {
    assert.equal(animalMedicalRecordsParamsSchema.safeParse({ animalId: 'short' }).success, false);
  });
});

describe('createVaccinationRecordSchema', () => {
  it('accepts the minimum required fields', () => {
    const result = createVaccinationRecordSchema.safeParse({
      title: 'Rabies vaccine',
      medicalRecordTypeId: 6,
      prescribedBy: '123e4567-e89b-12d3-a456-426614174000',
    });

    assert.equal(result.success, true);
  });

  it('rejects a missing prescribedBy', () => {
    assert.equal(
      createVaccinationRecordSchema.safeParse({ title: 'Rabies vaccine', medicalRecordTypeId: 6 }).success,
      false,
    );
  });

  it('rejects a missing medicalRecordTypeId', () => {
    assert.equal(
      createVaccinationRecordSchema.safeParse({
        title: 'Rabies vaccine',
        prescribedBy: '123e4567-e89b-12d3-a456-426614174000',
      }).success,
      false,
    );
  });

  it('treats an empty string nextDueDate as not provided', () => {
    const result = createVaccinationRecordSchema.safeParse({
      title: 'Rabies vaccine',
      medicalRecordTypeId: 6,
      prescribedBy: '123e4567-e89b-12d3-a456-426614174000',
      nextDueDate: '',
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.nextDueDate, undefined);
    }
  });
});

describe('updateVaccinationRecordSchema', () => {
  it('accepts a partial update with one field', () => {
    assert.equal(updateVaccinationRecordSchema.safeParse({ title: 'Updated title' }).success, true);
  });

  it('rejects an empty update', () => {
    assert.equal(updateVaccinationRecordSchema.safeParse({}).success, false);
  });
});

describe('verifyMedicalRecordSchema', () => {
  it('accepts a valid verifiedBy uuid', () => {
    assert.equal(
      verifyMedicalRecordSchema.safeParse({ verifiedBy: '123e4567-e89b-12d3-a456-426614174000' }).success,
      true,
    );
  });

  it('rejects a missing verifiedBy', () => {
    assert.equal(verifyMedicalRecordSchema.safeParse({}).success, false);
  });
});
