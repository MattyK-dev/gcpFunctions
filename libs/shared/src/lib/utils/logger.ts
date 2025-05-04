import { VARS, getEnvs } from "./init";

export enum Severity {
  INFO = "INFO",
  WARN = "WARNING",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
  ALERT = "ALERT",
  EMERGENCY = "EMERGENCY",
}

export interface LogPayload {
  message: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, any>;
  domain?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  }
}

export function log(
  payload: LogPayload,
  severity: Severity = Severity.INFO,
): void {
  try {
    const logFn = getConsoleMethod(severity);
    logFn(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Logging failed:', error);
    console.error('Original payload:', payload);
  }
}

function getConsoleMethod(severity: Severity) {
  switch (severity) {
    case Severity.WARN:
      return console.warn;
    case Severity.DEBUG:
      return console.debug;
    case Severity.ALERT:
    case Severity.EMERGENCY:
    case Severity.ERROR:
      return console.error;
    default:
      return console.log;
  }
}