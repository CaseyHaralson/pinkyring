import {
  IConfigFileReader,
  ISecretRepository,
} from '@pinkyring-server-template/core/interfaces/IConfig';
import ConfigHelper, {
  Environment,
} from '@pinkyring-server-template/core/util/configHelper';
import {mock, mockReset} from 'jest-mock-extended';

describe('config helper unit tests', () => {
  const OLD_ENV = process.env;
  const secretRepo = mock<ISecretRepository>();
  const configFileReader = mock<IConfigFileReader>();
  let configHelper: ConfigHelper;

  beforeEach(() => {
    jest.resetModules(); // clears the cache?
    process.env = {...OLD_ENV};

    mockReset(secretRepo);
    mockReset(configFileReader);

    configHelper = new ConfigHelper(secretRepo, configFileReader);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('register needed configurations function', () => {
    test('should throw error if duplicate configurations are registered', () => {
      try {
        configHelper.registerNeededConfigurations([
          {
            name: 'samekey',
          },
          {
            name: 'samekey',
          },
        ]);
        expect('Should never get here').toBe('Got here...');
      } catch (e) {
        expect((e as Error).message).toContain(
          'Multiple of the same config key were registered'
        );
      }
    });

    test('should notify if there are missing configurations', () => {
      try {
        configHelper.registerNeededConfigurations([
          {
            name: 'somekey',
          },
        ]);
        expect('Should never get here').toBe('Got here...');
      } catch (e) {
        expect((e as Error).message).toContain(`configurations weren't found`);
      }
    });

    test('should allow missing configurations if canBeUndefined is set', () => {
      try {
        configHelper.registerNeededConfigurations([
          {
            name: 'somekey',
            canBeUndefined: true,
          },
        ]);
        expect('Should get here').toBe('Should get here');
      } catch (e) {
        expect('Should never get here').toBe('Got here...');
      }
    });
  });

  describe('get config value function', () => {
    test('should throw error if configuration isnt registered', () => {
      try {
        configHelper.getConfigValue('somekey');
        expect('Should never get here').toBe('Got here...');
      } catch (e) {
        expect((e as Error).message).toContain(
          `the requested config value wasn't found in the registered configurations`
        );
      }
    });

    test('should get value from secret repo if key is secret', () => {
      secretRepo.getSecret.mockReturnValue('secretvalue');
      configHelper.registerNeededConfigurations([
        {
          name: 'secretkey',
          isSecret: true,
        },
      ]);
      const result = configHelper.getConfigValue('secretkey');

      expect(secretRepo.getSecret).toBeCalled();
      expect(result).toBe('secretvalue');
    });

    test('should only get value from secret repo if key is secret', () => {
      process.env.SECRETKEY = 'not secret value';
      secretRepo.getSecret.mockReturnValue(undefined);
      try {
        configHelper.registerNeededConfigurations([
          {
            name: 'SECRETKEY',
            isSecret: true,
          },
        ]);
      } catch (e) {
        // eat the exception that will occur when registering a value that can't be found
      }
      const result = configHelper.getConfigValue('SECRETKEY');

      expect(secretRepo.getSecret).toBeCalled();
      expect(result).toBe('');
    });

    test('should not get value from secret repo if key isnt secret', () => {
      process.env.NOTSECRETKEY = 'not secret value';
      configHelper.registerNeededConfigurations([
        {
          name: 'NOTSECRETKEY',
        },
      ]);
      configHelper.getConfigValue('NOTSECRETKEY');

      expect(secretRepo.getSecret).toBeCalledTimes(0);
    });

    test('should get value from process env if available', () => {
      process.env.SOMEKEY = 'some value';
      configHelper.registerNeededConfigurations([
        {
          name: 'SOMEKEY',
        },
      ]);
      const result = configHelper.getConfigValue('SOMEKEY');

      expect(result).toBe('some value');
    });

    test('should lastly get value from file if available', () => {
      configFileReader.getValue.mockReturnValue('some value');
      configHelper.registerNeededConfigurations([
        {
          name: 'SOMEKEY',
        },
      ]);
      const result = configHelper.getConfigValue('SOMEKEY');

      expect(configFileReader.getValue).toBeCalled();
      expect(result).toBe('some value');
    });

    test('should return blank if config value cant be found', () => {
      configHelper.registerNeededConfigurations([
        {
          name: 'somekey',
          canBeUndefined: true,
        },
      ]);
      const result = configHelper.getConfigValue('somekey');

      expect(result).toBe('');
    });
  });

  describe('get environment function', () => {
    test('should return development environment by default', () => {
      process.env.NODE_ENV = undefined;
      const result = configHelper.getEnvironment();

      expect(result).toBe(Environment.DEVELOPMENT);
    });

    test('should return environment if configured', () => {
      process.env.NODE_ENV = 'test';
      const result = configHelper.getEnvironment();

      expect(result).toBe(Environment.TEST);
    });
  });
});
