import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { animalIdParamsSchema, createAnimalSchema, mergeAnimalBodySchema, searchAnimalsQuerySchema, updateAnimalSchema } from '../src/modules/animals/animals.schema.js';

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

describe('updateAnimalSchema', () => {
  it('accepts a partial update', () => {
    const result = updateAnimalSchema.safeParse({ name: 'Rex' });

    assert.equal(result.success, true);
  });

  it('rejects an empty body', () => {
    const result = updateAnimalSchema.safeParse({});

    assert.equal(result.success, false);
  });

  it('strips fields not permitted for update', () => {
    const result = updateAnimalSchema.safeParse({ name: 'Rex', createdBy: 'abc' });

    assert.equal(result.success, true);
    assert.equal((result.data as { createdBy?: string }).createdBy, undefined);
  });
});

describe('searchAnimalsQuerySchema', () => {
  it('accepts an empty query', () => {
    assert.equal(searchAnimalsQuerySchema.safeParse({}).success, true);
  });

  it('accepts a text query and coerced filters', () => {
    const result = searchAnimalsQuerySchema.safeParse({ query: 'Rex', animalTypeId: '1', isStreet: 'true' });

    assert.equal(result.success, true);
    assert.equal(result.data?.animalTypeId, 1);
    assert.equal(result.data?.isStreet, true);
  });

  it('parses isStreet=false as false, not a truthy string', () => {
    const result = searchAnimalsQuerySchema.safeParse({ isStreet: 'false' });

    assert.equal(result.success, true);
    assert.equal(result.data?.isStreet, false);
  });
});

describe('mergeAnimalBodySchema', () => {
  it('accepts a valid 8-char targetId', () => {
    assert.equal(mergeAnimalBodySchema.safeParse({ targetId: 'abcd1234' }).success, true);
  });

  it('rejects a missing targetId', () => {
    assert.equal(mergeAnimalBodySchema.safeParse({}).success, false);
  });
});
