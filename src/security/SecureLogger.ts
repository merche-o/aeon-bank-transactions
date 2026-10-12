import { redactPiiValue } from './redactPii';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SecureLoggerOptions {
  /** When true, log payloads without redaction. Defaults to React Native __DEV__. */
  devMode?: boolean;
}

function resolveDevMode(options?: SecureLoggerOptions): boolean {
  if (options?.devMode !== undefined) {
    return options.devMode;
  }
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function formatArgs(args: unknown[], devMode: boolean): unknown[] {
  if (devMode) {
    return args;
  }
  return args.map((arg) => redactPiiValue(arg));
}

export interface SecureLoggerApi {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function createSecureLogger(options?: SecureLoggerOptions): SecureLoggerApi {
  const devMode = resolveDevMode(options);

  const logWith =
    (level: LogLevel) =>
    (...args: unknown[]): void => {
      const payload = formatArgs(args, devMode);
      console[level](...payload);
    };

  return {
    debug: logWith('debug'),
    info: logWith('info'),
    warn: logWith('warn'),
    error: logWith('error'),
  };
}

/** Default app logger; redacts PII outside development builds. */
export const SecureLogger = createSecureLogger();
