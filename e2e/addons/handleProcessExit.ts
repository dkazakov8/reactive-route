import globalTeardown from './globalTeardown';

const formatLog = (label: string) => `\x1b[32m[e2e]\x1b[0m ${label}`;

export function handleProcessExit() {
  let didTeardown = false;

  const runOnce = (label: string, err?: unknown) => {
    if (didTeardown) return;

    didTeardown = true;

    if (err) console.error(formatLog(label), err);
    else console.warn(formatLog(label));

    try {
      globalTeardown();
    } catch (teardownError) {
      console.error(formatLog('teardown failed'), teardownError);
    }
  };

  const exitWith = (label: string, err?: unknown) => {
    runOnce(label, err);
    process.exitCode = 1;
  };

  (['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK'] as const).forEach((signal) => {
    process.once(signal, () => exitWith(`received ${signal}`));
  });

  // process.once('beforeExit', () => runOnce('beforeExit'));
  // process.once('exit', () => runOnce('exit'));
  // process.once('uncaughtException', (err) => exitWith('uncaughtException', err));
  // process.once('unhandledRejection', (reason) => exitWith('unhandledRejection', reason));
}
