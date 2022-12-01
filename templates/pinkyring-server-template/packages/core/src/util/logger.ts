import {
  ILoggableClass,
  ILogHandler,
  LogContext,
  LogLevel,
} from '../interfaces/ILog';
import ISessionHandler from '../interfaces/ISession';

/** Helps to handle the interaction with the logging framework. */
// can't extend the BaseClass because the base class needs this object as a parameter
export default class Logger {
  private _logHandler;
  private _sessionHandler;
  constructor(logHandler: ILogHandler, sessionHandler: ISessionHandler) {
    this._logHandler = logHandler;
    this._sessionHandler = sessionHandler;
  }

  private _loggableClass!: ILoggableClass;
  /**
   * Sets context around what class is doing logging.
   * @param currentClass the class that wan'ts to log
   */
  setLoggableClass(currentClass: ILoggableClass) {
    this._loggableClass = currentClass;
  }

  /** Log an error message. */
  error(message: string) {
    const context = this.getLogContext();
    this._logHandler.log(LogLevel.ERROR, context, message);
  }

  /** Log a warning message. */
  warn(message: string) {
    const context = this.getLogContext();
    this._logHandler.log(LogLevel.WARN, context, message);
  }

  /** Log an info message. */
  info(message: string) {
    const context = this.getLogContext();
    this._logHandler.log(LogLevel.INFO, context, message);
  }

  /** Log a debug message. */
  debug(message: string) {
    const context = this.getLogContext();
    this._logHandler.log(LogLevel.DEBUG, context, message);
  }

  private getLogContext() {
    if (this._loggableClass === undefined) {
      throw new Error(
        `The loggable class wasn't set before the logging functions were used. Call the setLoggableClass function before using the logging functions.`
      );
    }

    const session = this._sessionHandler.getSessionData();
    const context = {
      sessionId: session.sessionId,
      principal: session.principal,
      currentObj: this._loggableClass,
    } as LogContext;
    return context;
  }
}
