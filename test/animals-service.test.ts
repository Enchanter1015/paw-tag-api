import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';

const { animalsService } = await import('../src/modules/animals/animals.service.js');
const { animalsRepository } = await import('../src/modules/animals/animals.repository.js');
const { NotFoundError } = await import('../src/lib/errors.js');

describe('animalsService.getById', () => {
  it('returns the animal when found', async () => {
    const animal = { id: 'abcd1234', name: 'Rex' };
    const findById = mock.method(animalsRepository, 'findById', async () => animal);

    const result = await animalsService.getById('abcd1234');

    assert.equal(findById.mock.calls[0]!.arguments[0], 'abcd1234');
    assert.deepEqual(result, animal);

    findById.mock.restore();
  });

  it('throws NotFoundError when missing', async () => {
    const findById = mock.method(animalsRepository, 'findById', async () => null);

    await assert.rejects(() => animalsService.getById('missing1'), NotFoundError);

    findById.mock.restore();
  });
});

describe('animalsService.update', () => {
  it('delegates to the repository with the given id and fields', async () => {
    const updated = { id: 'abcd1234', name: 'Rex Updated' };
    const update = mock.method(animalsRepository, 'update', async () => updated);

    const result = await animalsService.update('abcd1234', { name: 'Rex Updated' });

    assert.equal(update.mock.calls[0]!.arguments[0], 'abcd1234');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { name: 'Rex Updated' });
    assert.deepEqual(result, updated);

    update.mock.restore();
  });
});

describe('animalsService.search', () => {
  it('builds an OR filter on id/name for a text query and passes through other filters', async () => {
    const results = [{ id: 'abcd1234', name: 'Rex' }];
    const search = mock.method(animalsRepository, 'search', async () => results);

    const result = await animalsService.search({ query: 'Rex', animalTypeId: 1, isStreet: true });

    assert.deepEqual(search.mock.calls[0]!.arguments[0], {
      OR: [{ id: 'Rex' }, { name: { contains: 'Rex', mode: 'insensitive' } }],
      animalTypeId: 1,
      isStreet: true,
    });
    assert.deepEqual(result, results);

    search.mock.restore();
  });

  it('passes an empty filter when no query params are given', async () => {
    const search = mock.method(animalsRepository, 'search', async () => []);

    await animalsService.search({});

    assert.deepEqual(search.mock.calls[0]!.arguments[0], {});

    search.mock.restore();
  });
});
