// Test harness: boots src/server.ts in a child process and triggers a shutdown scenario,
// so shutdown/signal-handling side effects can be observed via exit code and stdout.
export {};

process.env.PORT ??= '4173';
process.env.HOST ??= '127.0.0.1';

const scenario = process.argv[2];

await import('../../src/server.js');

if (scenario === 'unhandled-rejection' || scenario === 'uncaught-exception') {
  setTimeout(() => {
    switch (scenario) {
      case 'unhandled-rejection':
        process.emit('unhandledRejection', new Error('boom'), Promise.resolve());
        break;
      case 'uncaught-exception':
        process.emit('uncaughtException', new Error('boom'));
        break;
      default:
        break;
    }
  }, 300);
}
