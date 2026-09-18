import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

process.env.NODE_ENV = 'test';

const { medicalRecordsService } = await import('../src/modules/medical-records/medical-records.service.js');
const { medicalRecordsRepository } = await import('../src/modules/medical-records/medical-records.repository.js');
const { NotFoundError } = await import('../src/lib/errors.js');

describe('medicalRecordsService.addVaccinationRecord', () => {
  it('creates a record once the animal, prescriber and type exist', async () => {
    const animal = { id: 'a1b2c3d4' };
    const member = { id: 'member-1' };
    const type = { id: 6, name: 'Vaccination' };
    const created = { id: 'record-1', animalId: 'a1b2c3d4' };

    const findAnimalById = mock.method(medicalRecordsRepository, 'findAnimalById', async () => animal);
    const findVetHospitalMemberById = mock.method(
      medicalRecordsRepository,
      'findVetHospitalMemberById',
      async () => member,
    );
    const findTypeById = mock.method(medicalRecordsRepository, 'findTypeById', async () => type);
    const create = mock.method(medicalRecordsRepository, 'create', async () => created);

    const input = { title: 'Rabies vaccine', medicalRecordTypeId: 6, prescribedBy: 'member-1' };
    const result = await medicalRecordsService.addVaccinationRecord('a1b2c3d4', input, 'user-1');

    assert.deepEqual(create.mock.calls[0]!.arguments[0], {
      title: 'Rabies vaccine',
      medicalRecordTypeId: 6,
      prescribedBy: 'member-1',
      animalId: 'a1b2c3d4',
      createdBy: 'user-1',
    });
    assert.deepEqual(result, created);

    findAnimalById.mock.restore();
    findVetHospitalMemberById.mock.restore();
    findTypeById.mock.restore();
    create.mock.restore();
  });

  it('throws NotFoundError when the animal does not exist', async () => {
    const findAnimalById = mock.method(medicalRecordsRepository, 'findAnimalById', async () => null);

    await assert.rejects(
      () =>
        medicalRecordsService.addVaccinationRecord(
          'missing',
          { title: 'x', medicalRecordTypeId: 6, prescribedBy: 'member-1' },
          'user-1',
        ),
      NotFoundError,
    );

    findAnimalById.mock.restore();
  });

  it('throws NotFoundError when the prescriber does not exist', async () => {
    const findAnimalById = mock.method(medicalRecordsRepository, 'findAnimalById', async () => ({ id: 'a1b2c3d4' }));
    const findVetHospitalMemberById = mock.method(
      medicalRecordsRepository,
      'findVetHospitalMemberById',
      async () => null,
    );

    await assert.rejects(
      () =>
        medicalRecordsService.addVaccinationRecord(
          'a1b2c3d4',
          { title: 'x', medicalRecordTypeId: 6, prescribedBy: 'missing' },
          'user-1',
        ),
      NotFoundError,
    );

    findAnimalById.mock.restore();
    findVetHospitalMemberById.mock.restore();
  });

  it('throws NotFoundError when the medical record type does not exist', async () => {
    const findAnimalById = mock.method(medicalRecordsRepository, 'findAnimalById', async () => ({ id: 'a1b2c3d4' }));
    const findVetHospitalMemberById = mock.method(
      medicalRecordsRepository,
      'findVetHospitalMemberById',
      async () => ({ id: 'member-1' }),
    );
    const findTypeById = mock.method(medicalRecordsRepository, 'findTypeById', async () => null);

    await assert.rejects(
      () =>
        medicalRecordsService.addVaccinationRecord(
          'a1b2c3d4',
          { title: 'x', medicalRecordTypeId: 99, prescribedBy: 'member-1' },
          'user-1',
        ),
      NotFoundError,
    );

    findAnimalById.mock.restore();
    findVetHospitalMemberById.mock.restore();
    findTypeById.mock.restore();
  });
});

describe('medicalRecordsService.getById', () => {
  it('returns the record when found', async () => {
    const record = { id: 'record-1' };
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => record);

    const result = await medicalRecordsService.getById('record-1');

    assert.deepEqual(result, record);

    findById.mock.restore();
  });

  it('throws NotFoundError when missing', async () => {
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => null);

    await assert.rejects(() => medicalRecordsService.getById('missing'), NotFoundError);

    findById.mock.restore();
  });
});

describe('medicalRecordsService.listVaccinationRecords', () => {
  it('lists records for an existing animal', async () => {
    const records = [{ id: 'record-1' }];
    const findAnimalById = mock.method(medicalRecordsRepository, 'findAnimalById', async () => ({ id: 'a1b2c3d4' }));
    const findTypeByName = mock.method(medicalRecordsRepository, 'findTypeByName', async () => ({ id: 5 }));
    const listByAnimal = mock.method(medicalRecordsRepository, 'listByAnimal', async () => records);

    const result = await medicalRecordsService.listVaccinationRecords('a1b2c3d4');

    assert.equal(listByAnimal.mock.calls[0]!.arguments[0], 'a1b2c3d4');
    assert.equal(listByAnimal.mock.calls[0]!.arguments[1], 5);
    assert.deepEqual(result, records);

    findAnimalById.mock.restore();
    findTypeByName.mock.restore();
    listByAnimal.mock.restore();
  });

  it('throws NotFoundError when the animal does not exist', async () => {
    const findAnimalById = mock.method(medicalRecordsRepository, 'findAnimalById', async () => null);

    await assert.rejects(() => medicalRecordsService.listVaccinationRecords('missing'), NotFoundError);

    findAnimalById.mock.restore();
  });
});

describe('medicalRecordsService.updateVaccinationRecord', () => {
  it('updates an existing record', async () => {
    const record = { id: 'record-1' };
    const updated = { ...record, title: 'Updated' };
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => record);
    const update = mock.method(medicalRecordsRepository, 'update', async () => updated);

    const result = await medicalRecordsService.updateVaccinationRecord('record-1', { title: 'Updated' });

    assert.equal(update.mock.calls[0]!.arguments[0], 'record-1');
    assert.deepEqual(update.mock.calls[0]!.arguments[1], { title: 'Updated' });
    assert.deepEqual(result, updated);

    findById.mock.restore();
    update.mock.restore();
  });

  it('validates the prescriber when it changes', async () => {
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => ({ id: 'record-1' }));
    const findVetHospitalMemberById = mock.method(
      medicalRecordsRepository,
      'findVetHospitalMemberById',
      async () => null,
    );

    await assert.rejects(
      () => medicalRecordsService.updateVaccinationRecord('record-1', { prescribedBy: 'missing' }),
      NotFoundError,
    );

    findById.mock.restore();
    findVetHospitalMemberById.mock.restore();
  });

  it('validates the medical record type when it changes', async () => {
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => ({ id: 'record-1' }));
    const findTypeById = mock.method(medicalRecordsRepository, 'findTypeById', async () => null);

    await assert.rejects(
      () => medicalRecordsService.updateVaccinationRecord('record-1', { medicalRecordTypeId: 99 }),
      NotFoundError,
    );

    findById.mock.restore();
    findTypeById.mock.restore();
  });

  it('throws NotFoundError when the record is missing', async () => {
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => null);

    await assert.rejects(
      () => medicalRecordsService.updateVaccinationRecord('missing', { title: 'Updated' }),
      NotFoundError,
    );

    findById.mock.restore();
  });
});

describe('medicalRecordsService.verify', () => {
  it('sets verifiedBy and verifiedAt', async () => {
    const record = { id: 'record-1' };
    const verified = { ...record, verifiedBy: 'member-1' };
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => record);
    const findVetHospitalMemberById = mock.method(
      medicalRecordsRepository,
      'findVetHospitalMemberById',
      async () => ({ id: 'member-1' }),
    );
    const update = mock.method(medicalRecordsRepository, 'update', async () => verified);

    const result = await medicalRecordsService.verify('record-1', { verifiedBy: 'member-1' });

    assert.equal(update.mock.calls[0]!.arguments[0], 'record-1');
    assert.equal(update.mock.calls[0]!.arguments[1].verifiedBy, 'member-1');
    assert.ok(update.mock.calls[0]!.arguments[1].verifiedAt instanceof Date);
    assert.deepEqual(result, verified);

    findById.mock.restore();
    findVetHospitalMemberById.mock.restore();
    update.mock.restore();
  });

  it('throws NotFoundError when the verifier does not exist', async () => {
    const findById = mock.method(medicalRecordsRepository, 'findById', async () => ({ id: 'record-1' }));
    const findVetHospitalMemberById = mock.method(
      medicalRecordsRepository,
      'findVetHospitalMemberById',
      async () => null,
    );

    await assert.rejects(
      () => medicalRecordsService.verify('record-1', { verifiedBy: 'missing' }),
      NotFoundError,
    );

    findById.mock.restore();
    findVetHospitalMemberById.mock.restore();
  });
});
