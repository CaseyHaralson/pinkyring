import {IConfigFileReader} from '@pinkyring-server-template/core/interfaces/IConfig';
import findUp from 'find-up';
import dotenv, {DotenvParseOutput} from 'dotenv';
import fs from 'fs';
import {CONFIGKEYNAME_PROJECTDATA_PREFIX} from '@pinkyring-server-template/core/interfaces/IConfig';

/** Config file reader using multiple tools to find and read files */
// can't extend the BaseClass because one of the the base class parameters needs this as a parameter
export default class ConfigFileReader implements IConfigFileReader {
  private _envProps;
  private _packageData;
  constructor() {
    const envFilePath = this.findEnvFile();
    this._envProps = this.parseEnvFile(envFilePath);

    const packageJsonPath = this.findRootLevelPackageJson(envFilePath);
    this._packageData = this.loadProjectPackageJsonData(packageJsonPath);
  }

  getValue(key: string): string | undefined {
    if (key.startsWith(CONFIGKEYNAME_PROJECTDATA_PREFIX)) {
      const temp = this.tryGetValueFromPackageData(key);
      return temp;
    }

    const value = this._envProps[key];
    return value;
  }

  /** find the .env file if it exists */
  private findEnvFile() {
    return findUp.sync('.env');
  }

  /** find the root level package.json file in case some config value needs to be pulled from there */
  private findRootLevelPackageJson(envFilePath: string | undefined) {
    let rootLevelFilePath = envFilePath;
    if (rootLevelFilePath !== undefined) {
      rootLevelFilePath = rootLevelFilePath.replace('.env', '');
    }

    if (rootLevelFilePath === undefined || rootLevelFilePath.length == 0) {
      rootLevelFilePath = findUp.sync('.env.example');
      if (rootLevelFilePath !== undefined) {
        rootLevelFilePath = rootLevelFilePath.replace('.env.example', '');
      }
    }

    if (rootLevelFilePath === undefined || rootLevelFilePath.length == 0) {
      rootLevelFilePath = findUp.sync('package.json');
    } else {
      rootLevelFilePath = rootLevelFilePath + 'package.json';
    }

    return rootLevelFilePath;
  }

  /** read the .env file and return a set of key/values */
  private parseEnvFile(filePath: string | undefined) {
    let parsed = {} as DotenvParseOutput;
    if (filePath) {
      parsed = dotenv.parse(fs.readFileSync(filePath, {encoding: 'utf8'}));
    }
    return parsed;
  }

  addValueToEnv(key: string): void {
    const value = this.getValue(key);
    if (value) {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = value;
      }
    }
  }

  /** read the root level package.json file and return the values */
  private loadProjectPackageJsonData(filePath: string | undefined) {
    if (filePath) {
      const json = JSON.parse(fs.readFileSync(filePath, 'utf8')) as JSONObject;

      // console.log(
      //   `Got data from the package.json file: ${JSON.stringify(json)}`
      // );

      return json;
    }
  }

  private tryGetValueFromPackageData(key: string) {
    const packageKey = key
      .substring(CONFIGKEYNAME_PROJECTDATA_PREFIX.length)
      .toLowerCase();
    const value = this._packageData?.[packageKey];

    if (value === undefined) return value;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return String(value);

    return JSON.stringify(value);
  }
}

type JSONValue = string | number | boolean | JSONObject | JSONArray | undefined;

interface JSONObject {
  [x: string]: JSONValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JSONArray extends Array<JSONValue> {}
