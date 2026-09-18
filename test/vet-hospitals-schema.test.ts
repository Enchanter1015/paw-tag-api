import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addVetHospitalMemberSchema,
  createVetHospitalSchema,
  updateVetHospitalMemberSchema,
  updateVetHospitalSchema,
  vetHospitalIdParamsSchema,
  vetHospitalMemberParamsSchema,
} from '../src/modules/vet-hospitals/vet-hospitals.schema.js';

describe('vetHospitalIdParamsSchema', () => {
  it('accepts a valid uuid', () => {
    assert.equal(vetHospitalIdParamsSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' }).success, true);
  });

  it('rejects a non-uuid id', () => {
    assert.equal(vetHospitalIdParamsSchema.safeParse({ id: 'nope' }).success, false);
  });
});

describe('vetHospitalMemberParamsSchema', () => {
  it('accepts valid uuids for both ids', () => {
    const result = vetHospitalMemberParamsSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      memberId: '223e4567-e89b-12d3-a456-426614174000',
    });

    assert.equal(result.success, true);
  });
});

describe('createVetHospitalSchema', () => {
  it('accepts the minimum required fields', () => {
    assert.equal(createVetHospitalSchema.safeParse({ name: 'Central Vet', vetHospitalTypeId: 1 }).success, true);
  });

  it('rejects a missing vetHospitalTypeId', () => {
    assert.equal(createVetHospitalSchema.safeParse({ name: 'Central Vet' }).success, false);
  });
});

describe('updateVetHospitalSchema', () => {
  it('accepts a partial update with one field', () => {
    assert.equal(updateVetHospitalSchema.safeParse({ isVerified: true }).success, true);
  });

  it('rejects an empty update', () => {
    assert.equal(updateVetHospitalSchema.safeParse({}).success, false);
  });
});

describe('addVetHospitalMemberSchema', () => {
  it('accepts a valid userId and roleId', () => {
    const result = addVetHospitalMemberSchema.safeParse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      roleId: 1,
    });

    assert.equal(result.success, true);
  });

  it('rejects a missing roleId', () => {
    assert.equal(
      addVetHospitalMemberSchema.safeParse({ userId: '123e4567-e89b-12d3-a456-426614174000' }).success,
      false,
    );
  });
});

describe('updateVetHospitalMemberSchema', () => {
  it('accepts a valid roleId', () => {
    assert.equal(updateVetHospitalMemberSchema.safeParse({ roleId: 2 }).success, true);
  });

  it('rejects a missing roleId', () => {
    assert.equal(updateVetHospitalMemberSchema.safeParse({}).success, false);
  });
});
