import Principal from './IPrincipal';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/** A class that wants to use the logger should implement this interface */
export interface ILoggableClass {
  className(): string;
}

export interface ILogHandler {
  log(level: LogLevel, context: LogContext, message: string): void;
}

/** Data the logger can use to generate logs with context */
export interface LogContext {
  sessionId: string;
  principal: Principal;
  currentObj: ILoggableClass;
}
