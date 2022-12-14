import winston, {format, transports} from 'winston';
import {
  ILogHandler,
  LogContext,
  LogLevel,
} from '@pinkyring-server-template/core/interfaces/ILog';
import BaseClass, {
  IBaseParams,
} from '@pinkyring-server-template/core/util/baseClass';
import {CONFIGKEYNAME_PROJECTDATA_PREFIX} from '@pinkyring-server-template/core/interfaces/IConfig';
import {Environment} from '@pinkyring-server-template/core/util/configHelper';

const CONFIGKEYNAME_PROJECT_NAME = `${CONFIGKEYNAME_PROJECTDATA_PREFIX}NAME`;
const CONFIGKEYNAME_PROJECT_VERSION = `${CONFIGKEYNAME_PROJECTDATA_PREFIX}VERSION`;
const CONFIGKEYNAME_PACKAGE_NAME = 'npm_package_name';
const CONFIGKEYNAME_PACKAGE_VERSION = 'npm_package_version';

/** Log handler using winston */
export default class LogHandler extends BaseClass implements ILogHandler {
  private _realLogger;
  constructor(baseParams: IBaseParams) {
    super(baseParams, 'LogHandler', [
      {
        name: CONFIGKEYNAME_PROJECT_NAME,
      },
      {
        name: CONFIGKEYNAME_PROJECT_VERSION,
      },
      {
        name: CONFIGKEYNAME_PACKAGE_NAME,
        canBeUndefined: true,
      },
      {
        name: CONFIGKEYNAME_PACKAGE_VERSION,
        canBeUndefined: true,
      },
    ]);

    // add color to the console logs if in development
    let consoleFormat = format.combine(logFormat);
    if (this.getEnvironment() === Environment.DEVELOPMENT) {
      consoleFormat = format.combine(format.colorize(), logFormat);
    }

    // create a winston logger
    this._realLogger = winston.createLogger({
      level:
        this.getEnvironment() === Environment.PRODUCTION
          ? 'info'
          : this.getEnvironment() === Environment.TEST
          ? 'warn'
          : 'debug',
      format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
        // Format the metadata object
        format.metadata({
          fillExcept: ['message', 'level', 'timestamp', 'label'],
        })
      ),
      transports: [
        new transports.Console({
          format: consoleFormat,
        }),
      ],
    });
  }

  /** Convert the log method in the interface into calling the real logger */
  log(level: LogLevel, context: LogContext, message: string): void {
    const meta = {
      env: this.getEnvironment(),
      projectName: this.getConfigValue(CONFIGKEYNAME_PROJECT_NAME),
      projectVersion: this.getConfigValue(CONFIGKEYNAME_PROJECT_VERSION),
      packageName: this.getConfigValue(CONFIGKEYNAME_PACKAGE_NAME),
      packageVersion: this.getConfigValue(CONFIGKEYNAME_PACKAGE_VERSION),
      context: context,
    };

    if (level == LogLevel.ERROR) this._realLogger.error(message, meta);
    else if (level == LogLevel.WARN) this._realLogger.warn(message, meta);
    else if (level == LogLevel.INFO) this._realLogger.info(message, meta);
    else if (level == LogLevel.DEBUG) this._realLogger.debug(message, meta);
  }
}

// when changing the log format
// make sure that whatever is parsing the logs can handle the new format

const logFormat = format.printf((info) => {
  let s = '';
  s = `${info.timestamp}`;
  s += ' ';
  s += `${info.metadata.env}`;
  s += ' ';
  s += `${info.level}`;
  s += ' ';

  if (info.metadata.projectName) {
    s += `[${info.metadata.projectName}`;
    s += info.metadata.projectVersion
      ? `:${info.metadata.projectVersion}]`
      : ']';
  } else {
    s += '[]';
  }

  if (info.metadata.packageName) {
    s += `[${info.metadata.packageName}`;
    s += info.metadata.packageVersion ? `:${info.metadata.packageVersion}` : ``;
    s += '.';
  } else {
    s += `[Unknown Package.`;
  }

  s += info.metadata.context?.currentObj
    ? `${info.metadata.context.currentObj.className()}]`
    : `Unknown Class]`;

  if (info.metadata.context?.sessionId) {
    s += `[Session:${info.metadata.context.sessionId}]`;
    s += ': ';
  } else {
    s += '[]: ';
  }

  if (info.metadata.context?.subject) {
    s += `${info.metadata.context.subject} - `;
  }

  s += `${info.message}`;
  s += ' ... ';

  if (info.metadata.context?.principal) {
    s += `Principal: ${JSON.stringify(info.metadata.context?.principal)}`;
  }

  return s;
});
