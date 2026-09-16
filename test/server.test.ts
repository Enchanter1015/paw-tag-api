import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';

const tsxBin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
);
const harness = path.join(process.cwd(), 'test', 'helpers', 'server-harness.ts');

type ScenarioResult = {
  signal: NodeJS.Signals | null;
  status: number | null;
  stderr: string;
  stdout: string;
};

const waitForServerListening = async (
  child: ReturnType<typeof spawn>,
  stdoutChunks: string[],
): Promise<void> =>
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for server startup.\n${stdoutChunks.join('')}`));
    }, 10_000);

    const onStdout = (chunk: string | Buffer) => {
      stdoutChunks.push(String(chunk));
      if (stdoutChunks.join('').includes('Server listening')) {
        clearTimeout(timeout);
        child.stdout?.off('data', onStdout);
        child.off('exit', onExit);
        resolve();
      }
    };

    const onExit = () => {
      clearTimeout(timeout);
      child.stdout?.off('data', onStdout);
      reject(new Error(`Server exited before startup.\n${stdoutChunks.join('')}`));
    };

    child.stdout?.on('data', onStdout);
    child.once('exit', onExit);
  });

const runSignalScenario = async (
  signal: NodeJS.Signals,
  secondSignal?: NodeJS.Signals,
): Promise<ScenarioResult> => {
  const child = spawn(process.platform === 'win32' ? `"${tsxBin}"` : tsxBin, [harness], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, NODE_ENV: 'development' },
  });
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.stdout?.on('data', (chunk) => stdoutChunks.push(String(chunk)));
  child.stderr?.on('data', (chunk) => stderrChunks.push(String(chunk)));

  await waitForServerListening(child, stdoutChunks);

  child.kill(signal);
  if (secondSignal) {
    child.kill(secondSignal);
  }

  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(
        new Error(
          `Timed out waiting for server shutdown.\nstdout:\n${stdoutChunks.join('')}\nstderr:\n${stderrChunks.join('')}`,
        ),
      );
    }, 10_000);

    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.once('close', (status, closeSignal) => {
      clearTimeout(timeout);
      resolve({
        signal: closeSignal,
        status,
        stderr: stderrChunks.join(''),
        stdout: stdoutChunks.join(''),
      });
    });
  });
};

const runScenario = (scenario: string) =>
  spawnSync(process.platform === 'win32' ? `"${tsxBin}"` : tsxBin, [harness, scenario], {
    encoding: 'utf8',
    timeout: 10_000,
    shell: process.platform === 'win32',
    env: { ...process.env, NODE_ENV: 'development' },
  });

describe('server bootstrap and shutdown', () => {
  it('starts listening and logs on startup', async () => {
    const result = await runSignalScenario('SIGTERM');

    assert.match(result.stdout, /Server listening/);
  });

  it('shuts down cleanly on SIGTERM', async () => {
    const result = await runSignalScenario('SIGTERM');

    assert.match(result.stdout, /Shutting down/);
    assert.match(result.stdout, /Shutdown complete/);
    assert.equal(result.status, 0);
  });

  it('shuts down cleanly on SIGINT', async () => {
    const result = await runSignalScenario('SIGINT');

    assert.match(result.stdout, /Shutting down/);
    assert.match(result.stdout, /Shutdown complete/);
    assert.equal(result.status, 0);
  });

  it('ignores a second signal once shutdown is already in progress', async () => {
    const result = await runSignalScenario('SIGTERM', 'SIGTERM');

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
