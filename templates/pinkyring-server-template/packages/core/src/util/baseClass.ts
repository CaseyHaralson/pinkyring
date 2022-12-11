import {ConfigKey} from '../interfaces/IConfig';
import {ILoggableClass} from '../interfaces/ILog';
import ConfigHelper from './configHelper';
import Logger from './logger';

export interface IBaseParams {
  logger: Logger;
  configHelper: ConfigHelper;
}

/**
 * The base class for any internal classes in the project.
 * Gives access to a logger, central configurations, and the environment type.
 */
export default abstract class BaseClass implements ILoggableClass {
  private _baseParams;
  private _className;
  protected _logger;
  /**
   *
   * @param baseParams base params
   * @param className the name of the class that is extending the BaseClass
   * @param configKeys the keys for any configurations that will be needed
   */
  constructor(
    baseParams: IBaseParams,
    className: string,
    configKeys?: ConfigKey[]
  ) {
    this._baseParams = baseParams;
    this._className = className;
    this._logger = baseParams.logger;

    if (this._logger) {
      this.setLoggerValues();
    }

    if (configKeys) {
      this.registerNeededConfigurations(configKeys);
    }
  }

  /** returns the name of the class */
  className(): string {
    return this._className;
  }

  private setLoggerValues() {
    this._logger.setLoggableClass(this);
  }

  private registerNeededConfigurations(configKeys: ConfigKey[]) {
    this._baseParams.configHelper.registerNeededConfigurations(configKeys);
  }

  /**
   * Gets the config value for a key.
   * @param keyName the key that needs to be retrieved
   * @returns the configured value (can be blank if the config key allows undefined and the value was undefined)
   */
  protected getConfigValue(keyName: string) {
    return this._baseParams.configHelper.getConfigValue(keyName);
  }

  /** Returns the configured environment type for where the project is running. */
  protected getEnvironment() {
    return this._baseParams.configHelper.getEnvironment();
  }
}
