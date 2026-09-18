import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';

const { usersService } = await import('../src/modules/users/users.service.js');
const { usersRepository } = await import('../src/modules/users/users.repository.js');
const { BadRequestError, NotFoundError } = await import('../src/lib/errors.js');

describe('usersService.register', () => {
  it('delegates to the repository with the default role', async () => {
    const created = { id: 'user-1', name: 'Jane', email: 'jane@example.com' };
    const findDefaultRole = mock.method(usersRepository, 'findDefaultRole', async () => ({ id: 2, name: 'User' }));
    const create = mock.method(usersRepository, 'create', async () => created);

    const result = await usersService.register({ name: 'Jane', email: 'jane@example.com' });

    assert.deepEqual(create.mock.calls[0]!.arguments[0], { name: 'Jane', email: 'jane@example.com', roleId: 2 });
    assert.deepEqual(result, created);

    findDefaultRole.mock.restore();
    create.mock.restore();
  });

  it('throws BadRequestError when the default role is not configured', async () => {
    const findDefaultRole = mock.method(usersRepository, 'findDefaultRole', async () => null);

    await assert.rejects(
      () => usersService.register({ name: 'Jane', email: 'jane@example.com' }),
      BadRequestError,
    );

    findDefaultRole.mock.restore();
  });
});

describe('usersService.getById', () => {
  it('returns the user when found', async () => {
    const user = { id: 'user-1', name: 'Jane' };
    const findById = mock.method(usersRepository, 'findById', async () => user);

    const result = await usersService.getById('user-1');

    assert.equal(findById.mock.calls[0]!.arguments[0], 'user-1');
    assert.deepEqual(result, user);

    findById.mock.restore();
  });

  it('throws NotFoundError when missing', async () => {
    const findById = mock.method(usersRepository, 'findById', async () => null);

    await assert.rejects(() => usersService.getById('missing'), NotFoundError);

    findById.mock.restore();
  });
});

describe('usersService.getByEmail', () => {
  it('returns the user when found', async () => {
    const user = { id: 'user-1', email: 'jane@example.com' };
    const findByEmail = mock.method(usersRepository, 'findByEmail', async () => user);

    const result = await usersService.getByEmail('jane@example.com');

    assert.equal(findByEmail.mock.calls[0]!.arguments[0], 'jane@example.com');
    assert.deepEqual(result, user);

    findByEmail.mock.restore();
  });

  it('throws NotFoundError when missing', async () => {
    const findByEmail = mock.method(usersRepository, 'findByEmail', async () => null);

    await assert.rejects(() => usersService.getByEmail('missing@example.com'), NotFoundError);

    findByEmail.mock.restore();
  });
});

describe('usersService.update', () => {
  it('delegates to the repository with the given id and fields', async () => {
    const updated = { id: 'user-1', name: 'Jane Updated' };
    const update = mock.method(usersRepository, 'update', async () => updated);

    const result = await usersService.update('user-1', { name: 'Jane Updated' });

    assert.equal(update.mock.calls[0]!.arguments[0], 'user-1');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { name: 'Jane Updated' });
    assert.deepEqual(result, updated);

    update.mock.restore();
  });
});
