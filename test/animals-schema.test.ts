import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { animalIdParamsSchema, createAnimalSchema } from '../src/modules/animals/animals.schema.js';

describe('animalIdParamsSchema', () => {
  it('accepts an 8-char id', () => {
    assert.equal(animalIdParamsSchema.safeParse({ id: 'abcd1234' }).success, true);
  });

  it('rejects an id of the wrong length', () => {
    assert.equal(animalIdParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});

describe('createAnimalSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = createAnimalSchema.safeParse({ name: 'Rex', animalTypeId: 1 });

    assert.equal(result.success, true);
  });

  it('coerces optional fields', () => {
    const result = createAnimalSchema.safeParse({
      name: 'Rex',
      animalTypeId: '1',
      isStreet: 'true',
      breed: 'Mixed',
      dob: '2020-01-01',
    });

    assert.equal(result.success, true);
    assert.equal(result.data?.animalTypeId, 1);
    assert.equal(result.data?.isStreet, true);
  });

  it('rejects a missing required field', () => {
    const result = createAnimalSchema.safeParse({ animalTypeId: 1 });

    assert.equal(result.success, false);
  });
});
