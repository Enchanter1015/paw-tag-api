import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';

const { vetHospitalsService } = await import('../src/modules/vet-hospitals/vet-hospitals.service.js');
const { vetHospitalsRepository } = await import('../src/modules/vet-hospitals/vet-hospitals.repository.js');
const { NotFoundError } = await import('../src/lib/errors.js');

describe('vetHospitalsService.register', () => {
  it('delegates to the repository with createdBy', async () => {
    const created = { id: 'vh-1', name: 'Central Vet' };
    const create = mock.method(vetHospitalsRepository, 'create', async () => created);

    const result = await vetHospitalsService.register({ name: 'Central Vet', vetHospitalTypeId: 1 }, 'user-1');

    assert.deepEqual(create.mock.calls[0]!.arguments[0], {
      name: 'Central Vet',
      vetHospitalTypeId: 1,
      createdBy: 'user-1',
    });
    assert.deepEqual(result, created);

    create.mock.restore();
  });
});

describe('vetHospitalsService.getById', () => {
  it('returns the vet hospital when found', async () => {
    const vetHospital = { id: 'vh-1', name: 'Central Vet' };
    const findById = mock.method(vetHospitalsRepository, 'findById', async () => vetHospital);

    const result = await vetHospitalsService.getById('vh-1');

    assert.equal(findById.mock.calls[0]!.arguments[0], 'vh-1');
    assert.deepEqual(result, vetHospital);

    findById.mock.restore();
  });

  it('throws NotFoundError when missing', async () => {
    const findById = mock.method(vetHospitalsRepository, 'findById', async () => null);

    await assert.rejects(() => vetHospitalsService.getById('missing'), NotFoundError);

    findById.mock.restore();
  });
});

describe('vetHospitalsService.update', () => {
  it('delegates to the repository', async () => {
    const updated = { id: 'vh-1', name: 'Updated' };
    const update = mock.method(vetHospitalsRepository, 'update', async () => updated);

    const result = await vetHospitalsService.update('vh-1', { name: 'Updated' });

    assert.equal(update.mock.calls[0]!.arguments[0], 'vh-1');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { name: 'Updated' });
    assert.deepEqual(result, updated);

    update.mock.restore();
  });
});

describe('vetHospitalsService.remove', () => {
  it('removes an existing vet hospital', async () => {
    const vetHospital = { id: 'vh-1' };
    const findById = mock.method(vetHospitalsRepository, 'findById', async () => vetHospital);
    const remove = mock.method(vetHospitalsRepository, 'remove', async () => vetHospital);

    await vetHospitalsService.remove('vh-1');

    assert.equal(remove.mock.calls[0]!.arguments[0], 'vh-1');

    findById.mock.restore();
    remove.mock.restore();
  });

  it('throws NotFoundError instead of removing when missing', async () => {
    const findById = mock.method(vetHospitalsRepository, 'findById', async () => null);

    await assert.rejects(() => vetHospitalsService.remove('missing'), NotFoundError);

    findById.mock.restore();
  });
});

describe('vetHospitalsService.addMember', () => {
  it('adds a member once the vet hospital exists', async () => {
    const vetHospital = { id: 'vh-1' };
    const member = { id: 'member-1', vetHospitalId: 'vh-1', userId: 'user-1', roleId: 1 };
    const findById = mock.method(vetHospitalsRepository, 'findById', async () => vetHospital);
    const addMember = mock.method(vetHospitalsRepository, 'addMember', async () => member);

    const result = await vetHospitalsService.addMember('vh-1', { userId: 'user-1', roleId: 1 });

    assert.deepEqual(addMember.mock.calls[0]!.arguments[0], { vetHospitalId: 'vh-1', userId: 'user-1', roleId: 1 });
    assert.deepEqual(result, member);

    findById.mock.restore();
    addMember.mock.restore();
  });

  it('throws NotFoundError when the vet hospital does not exist', async () => {
    const findById = mock.method(vetHospitalsRepository, 'findById', async () => null);

    await assert.rejects(
      () => vetHospitalsService.addMember('missing', { userId: 'user-1', roleId: 1 }),
      NotFoundError,
    );

    findById.mock.restore();
  });
});

describe('vetHospitalsService.updateMember / removeMember', () => {
  it('updates a member when found', async () => {
    const member = { id: 'member-1', vetHospitalId: 'vh-1' };
    const updated = { ...member, roleId: 2 };
    const findMemberById = mock.method(vetHospitalsRepository, 'findMemberById', async () => member);
    const updateMember = mock.method(vetHospitalsRepository, 'updateMember', async () => updated);

    const result = await vetHospitalsService.updateMember('vh-1', 'member-1', { roleId: 2 });

    assert.equal(updateMember.mock.calls[0]!.arguments[0], 'member-1');
    assert.deepEqual(updateMember.mock.calls[0]!.arguments[1], { roleId: 2 });
    assert.deepEqual(result, updated);

    findMemberById.mock.restore();
    updateMember.mock.restore();
  });

  it('throws NotFoundError when the member is missing', async () => {
    const findMemberById = mock.method(vetHospitalsRepository, 'findMemberById', async () => null);

    await assert.rejects(() => vetHospitalsService.updateMember('vh-1', 'missing', { roleId: 2 }), NotFoundError);

    findMemberById.mock.restore();
  });

  it('removes a member when found', async () => {
    const member = { id: 'member-1', vetHospitalId: 'vh-1' };
    const findMemberById = mock.method(vetHospitalsRepository, 'findMemberById', async () => member);
    const removeMember = mock.method(vetHospitalsRepository, 'removeMember', async () => member);

    await vetHospitalsService.removeMember('vh-1', 'member-1');

    assert.equal(removeMember.mock.calls[0]!.arguments[0], 'member-1');

    findMemberById.mock.restore();
    removeMember.mock.restore();
  });

  it('throws NotFoundError instead of removing a missing member', async () => {
    const findMemberById = mock.method(vetHospitalsRepository, 'findMemberById', async () => null);

    await assert.rejects(() => vetHospitalsService.removeMember('vh-1', 'missing'), NotFoundError);

    findMemberById.mock.restore();
  });
});
