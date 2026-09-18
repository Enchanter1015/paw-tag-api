import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loginSchema, logoutSchema, refreshSchema, registerSchema } from '../src/modules/auth/auth.schema.js';

describe('registerSchema', () => {
  it('accepts the minimum required fields', () => {
    assert.equal(
      registerSchema.safeParse({ name: 'Jane', email: 'jane@example.com', password: 'password123' }).success,
      true,
    );
  });

  it('rejects a password shorter than 8 characters', () => {
    assert.equal(
      registerSchema.safeParse({ name: 'Jane', email: 'jane@example.com', password: 'short' }).success,
      false,
    );
  });

  it('rejects an invalid email', () => {
    assert.equal(
      registerSchema.safeParse({ name: 'Jane', email: 'not-an-email', password: 'password123' }).success,
      false,
    );
  });
});

describe('loginSchema', () => {
  it('accepts a valid email + password', () => {
    assert.equal(loginSchema.safeParse({ email: 'jane@example.com', password: 'x' }).success, true);
  });

  it('rejects a missing password', () => {
    assert.equal(loginSchema.safeParse({ email: 'jane@example.com' }).success, false);
  });
});

describe('refreshSchema', () => {
  it('accepts a non-empty refreshToken', () => {
    assert.equal(refreshSchema.safeParse({ refreshToken: 'abc' }).success, true);
  });

  it('rejects a missing refreshToken', () => {
    assert.equal(refreshSchema.safeParse({}).success, false);
  });
});

describe('logoutSchema', () => {
  it('accepts a non-empty refreshToken', () => {
    assert.equal(logoutSchema.safeParse({ refreshToken: 'abc' }).success, true);
  });

  it('rejects a missing refreshToken', () => {
    assert.equal(logoutSchema.safeParse({}).success, false);
  });
});
