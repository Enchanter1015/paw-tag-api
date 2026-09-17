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
