import {
  ConfigKey,
  IConfigFileReader,
  ISecretRepository,
} from '../interfaces/IConfig';
import {CONFIGKEYNAME_PROJECTDATA_PREFIX} from '../interfaces/IConfig';

export enum Environment {
  DEVELOPMENT = 'development',
  TEST = 'test',
  QAT = 'qat',
  UAT = 'uat',
  PRODUCTION = 'production',
}

const CONFIGKEYNAME_ENVIRONMENT = 'NODE_ENV';

/** Helper class to get configuration values for the project from one central location. */
// can't extend the BaseClass because the base class needs this object as a parameter
export default class ConfigHelper {
  private _secretRepository;
  private _configFileReader;
  constructor(
    secretRepository: ISecretRepository,
    configFileReader: IConfigFileReader
  ) {
    this._secretRepository = secretRepository;
    this._configFileReader = configFileReader;
  }

  private _registeredKeys = new Map<string, ConfigKey>();

  /**
   * Registers the needed configurations and makes sure the values can be found.
   * @param keys the configuration keys that need to be registered
   */
  registerNeededConfigurations(keys: ConfigKey[]) {
    const missingConfigurations: string[] = [];
    let secretKeyInList = false;
    let projectDataKeyInList = false;
    for (const key of keys) {
      if (this._registeredKeys.has(key.name)) {
        throw new Error(
          `Multiple of the same config key were registered with the ConfigHelper. Only one key by name can be registered at a time. Key: ${key.name}`
        );
      } else {
        this._registeredKeys.set(key.name, key);
      }

      const mustBeDefined = !(key.canBeUndefined === true);
      if (
        mustBeDefined &&
        this.getPossiblyUndefinedConfigValue(key.name) === undefined
      ) {
        missingConfigurations.push(key.name);
      }

      if (key.isSecret) secretKeyInList = true;
      if (key.name.startsWith(CONFIGKEYNAME_PROJECTDATA_PREFIX)) {
        projectDataKeyInList = true;
      }
    }

    if (missingConfigurations.length > 0) {
      let devMessage = '';
      if (this.getEnvironment() === Environment.DEVELOPMENT) {
        devMessage = `For the development environment, you may need to add the values to the .env file.`;
      }

      let secretMessage = '';
      if (secretKeyInList) {
        secretMessage = `If the keys should be secret, they will need to be configured with the secret repository.`;
      }

      let missingPackageFileMessage = '';
      if (projectDataKeyInList) {
        missingPackageFileMessage = `Also, check to make sure a package.json file exists at the root of the project.`;
      }

      const message =
        `The following keys' configurations weren't found. Maybe they weren't added to the environment?` +
        (devMessage.length > 0 ? ` ${devMessage}` : ``) +
        (secretMessage.length > 0 ? ` ${secretMessage}` : ``) +
        (missingPackageFileMessage.length > 0
          ? ` ${missingPackageFileMessage}`
          : ``) +
        ` Keys: ${missingConfigurations.join('; ')}`;

      throw new Error(message);
    }
  }

  /**
   * Gets the configuration by key.
   * The key must be registered before it can be retrieved.
   *
   * If the key is registered as secret, then the value will only be retrieved from the secret repo.
   * Else, the value is retrieved from the environment first, then from the .env file.
   *
   * @param keyName the key that needs to retrieved
   * @returns the value found in the configuration source or blank if the value was undefined
   */
  getConfigValue(keyName: string): string {
    const value = this.getPossiblyUndefinedConfigValue(keyName);
    return value ?? '';
  }

  private getPossiblyUndefinedConfigValue(keyName: string): string | undefined {
    const configKey = this._registeredKeys.get(keyName);
    if (configKey === undefined) {
      throw new Error(
        `The key [${keyName}] for the requested config value wasn't found in the registered configurations. Register the key with the ConfigHelper before requesting the value.`
      );
    }

    // try and get the value from a secret first
    if (configKey.isSecret) {
      return this._secretRepository.getSecret(configKey.name);
    }

    // then try from the environment
    const environmentValue = process.env[configKey.name];
    if (environmentValue !== undefined) {
      return environmentValue;
    }

    // lastly try to read from a file
    const fileValue = this._configFileReader.getValue(configKey.name);
    if (fileValue !== undefined) {
      if (configKey.loadIntoEnv) {
        this._configFileReader.addValueToEnv(keyName);
      }

      return fileValue;
    }

    return undefined;
  }

  /** Returns the configured environment type for where the project is running. */
  getEnvironment() {
    this.registerEnvironmentAsNeededConfig();
    const env =
      this.getPossiblyUndefinedConfigValue(CONFIGKEYNAME_ENVIRONMENT) ??
      'development';
    return env as Environment;
  }

  /** Registers the environment as a needed config so each class doesn't need to do it. */
  private registerEnvironmentAsNeededConfig() {
    if (this._registeredKeys.get(CONFIGKEYNAME_ENVIRONMENT) === undefined) {
      this._registeredKeys.set(CONFIGKEYNAME_ENVIRONMENT, {
        name: CONFIGKEYNAME_ENVIRONMENT,
      });
    }
  }
}
