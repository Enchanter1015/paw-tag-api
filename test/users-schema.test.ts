import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  changeUserRoleSchema,
  createUserSchema,
  findUserQuerySchema,
  updateUserSchema,
  userIdParamsSchema,
} from '../src/modules/users/users.schema.js';

describe('userIdParamsSchema', () => {
  it('accepts a valid uuid', () => {
    assert.equal(userIdParamsSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' }).success, true);
  });

  it('rejects a non-uuid id', () => {
    assert.equal(userIdParamsSchema.safeParse({ id: 'not-a-uuid' }).success, false);
  });
});

describe('createUserSchema', () => {
  it('accepts the minimum required fields', () => {
    const result = createUserSchema.safeParse({ name: 'Jane', email: 'jane@example.com' });

    assert.equal(result.success, true);
  });

  it('rejects a missing email', () => {
    assert.equal(createUserSchema.safeParse({ name: 'Jane' }).success, false);
  });

  it('rejects an invalid email', () => {
    assert.equal(createUserSchema.safeParse({ name: 'Jane', email: 'not-an-email' }).success, false);
  });
});

describe('updateUserSchema', () => {
  it('accepts a partial update with one field', () => {
    assert.equal(updateUserSchema.safeParse({ name: 'Jane Updated' }).success, true);
  });

  it('rejects an empty update', () => {
    assert.equal(updateUserSchema.safeParse({}).success, false);
  });
});

describe('findUserQuerySchema', () => {
  it('accepts a valid email', () => {
    assert.equal(findUserQuerySchema.safeParse({ email: 'jane@example.com' }).success, true);
  });

  it('rejects a missing email', () => {
    assert.equal(findUserQuerySchema.safeParse({}).success, false);
  });
});

describe('changeUserRoleSchema', () => {
  it('accepts a positive integer roleId', () => {
    assert.equal(changeUserRoleSchema.safeParse({ roleId: 1 }).success, true);
  });

  it('rejects a missing roleId', () => {
    assert.equal(changeUserRoleSchema.safeParse({}).success, false);
  });

  it('rejects a non-positive roleId', () => {
    assert.equal(changeUserRoleSchema.safeParse({ roleId: 0 }).success, false);
  });
});
