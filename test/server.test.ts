import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';

const tsxBin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
);
const harness = path.join(process.cwd(), 'test', 'helpers', 'server-harness.ts');

const runScenario = (scenario: string) =>
  spawnSync(process.platform === 'win32' ? `"${tsxBin}"` : tsxBin, [harness, scenario], {
    encoding: 'utf8',
    timeout: 10_000,
    shell: process.platform === 'win32',
    env: { ...process.env, NODE_ENV: 'development' },
  });

describe('server bootstrap and shutdown', () => {
  it('starts listening and logs on startup', () => {
    const result = runScenario('sigterm');

    assert.match(result.stdout, /Server listening/);
  });

  it('shuts down cleanly on SIGTERM', () => {
    const result = runScenario('sigterm');

    assert.match(result.stdout, /Shutting down/);
    assert.match(result.stdout, /Shutdown complete/);
    assert.equal(result.status, 0);
  });

  it('shuts down cleanly on SIGINT', () => {
    const result = runScenario('sigint');

    assert.match(result.stdout, /Shutting down/);
    assert.match(result.stdout, /Shutdown complete/);
    assert.equal(result.status, 0);
  });

  it('ignores a second signal once shutdown is already in progress', () => {
    const result = runScenario('double-signal');

    const shuttingDownCount = (result.stdout.match(/Shutting down/g) ?? []).length;
    assert.equal(shuttingDownCount, 1);
    assert.equal(result.status, 0);
  });

  it('logs and shuts down on an unhandled promise rejection', () => {
    const result = runScenario('unhandled-rejection');

    assert.match(result.stdout, /Unhandled promise rejection/);
    assert.match(result.stdout, /Shutdown complete/);
    assert.equal(result.status, 0);
  });

  it('logs and shuts down on an uncaught exception', () => {
    const result = runScenario('uncaught-exception');

    assert.match(result.stdout, /Uncaught exception/);
    assert.match(result.stdout, /Shutdown complete/);
    assert.equal(result.status, 0);
  });
});
