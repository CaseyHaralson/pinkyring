/** Keys used to get configuration values */
export interface ConfigKey {
  /** the key used in the config */
  name: string;
  /** should the key always come from a secret? */
  isSecret?: boolean;
  /**
   * should the value be loaded into the environment?
   * (probably don't need to set this except for very specific circumstances)
   */
  loadIntoEnv?: boolean;
  /**
   * can the value be undefined?
   * (this could mean the value wasn't configured or was configured incorrectly, so be careful)
   * (no errors will be thrown if the value can't be found)
   */
  canBeUndefined?: boolean;
}

/** A repository where secret configurations can be retrieved */
export interface ISecretRepository {
  getSecret(key: string): string | undefined;
}

/** A configuration file reader */
export interface IConfigFileReader {
  /** get the value, if it exists, from one of the configuration files */
  getValue(key: string): string | undefined;
  /** add the value to the environment if it doesn't already exist */
  addValueToEnv(key: string): void;
}

/** The config key prefix for retrieving data from the project package.json file */
export const CONFIGKEYNAME_PROJECTDATA_PREFIX = 'PROJECTDATA.';
