import { EnvVarUtils } from './EnvVarUtils';

describe('EnvVarUtils', () => {
  afterEach(() => {
    jest.resetModules(); // Clear any cached modules
  });

  describe('getString', () => {
    it('should return the environment variable value if it exists', () => {
      process.env.TEST_VAR = 'test value';
      expect(EnvVarUtils.getString('TEST_VAR')).toEqual('test value');
    });

    it('should return the default value if the environment variable does not exist', () => {
      expect(
        EnvVarUtils.getString('NON_EXISTENT_VAR', 'default value'),
      ).toEqual('default value');
    });

    it('should return undefined if the environment variable is not a string', () => {
      // @ts-ignore
      process.env.TEST_VAR = 1;
      expect(
        EnvVarUtils.getString('NON_EXISTENT_VAR', 'default value'),
      ).toEqual('default value');
    });
  });

  describe('getNumber', () => {
    it('should return the environment variable value as a number if it exists', () => {
      process.env.TEST_VAR = '123';
      expect(EnvVarUtils.getNumber('TEST_VAR')).toEqual(123);
    });

    it('should return the default value if the environment variable does not exist', () => {
      expect(EnvVarUtils.getNumber('NON_EXISTENT_VAR', 456)).toEqual(456);
    });

    it('should return undefined if the environment variable is not a number', () => {
      process.env.TEST_VAR = 'not a number';
      expect(EnvVarUtils.getNumber('TEST_VAR', 10)).toBeUndefined();
    });
  });

  describe('getBoolean', () => {
    it('should return the environment variable value as a boolean if it exists', () => {
      process.env.TEST_VAR = 'true';
      expect(EnvVarUtils.getBoolean('TEST_VAR')).toEqual(true);
    });

    it('should return the environment variable value as a boolean if it exists', () => {
      process.env.TEST_VAR = 'false';
      expect(EnvVarUtils.getBoolean('TEST_VAR')).toEqual(false);
    });

    it('should return the environment variable value as a boolean if it exists', () => {
      process.env.TEST_VAR = 'TRUE';
      expect(EnvVarUtils.getBoolean('TEST_VAR')).toEqual(true);
    });

    it('should return the environment variable value as a boolean if it exists', () => {
      process.env.TEST_VAR = 'FALSE';
      expect(EnvVarUtils.getBoolean('TEST_VAR')).toEqual(false);
    });

    it('should return the default value if the environment variable does not exist', () => {
      expect(EnvVarUtils.getBoolean('NON_EXISTENT_VAR', true)).toEqual(true);
    });

    it('should return the default value if the environment variable does not exist', () => {
      expect(EnvVarUtils.getBoolean('NON_EXISTENT_VAR', false)).toEqual(false);
    });

    it('should return false if the environment variable is not a boolean', () => {
      // @ts-ignore
      process.env.TEST_VAR = 1;
      expect(EnvVarUtils.getBoolean('TEST_VAR')).toEqual(false);
    });
  });

  describe('getStringArray', () => {
    it('should return the environment variable value as an array if it exists', () => {
      process.env.TEST_VAR = 'value1,value2,value3';
      expect(EnvVarUtils.getStringArray('TEST_VAR')).toEqual([
        'value1',
        'value2',
        'value3',
      ]);
    });

    it('should return the default value if the environment variable does not exist', () => {
      expect(
        EnvVarUtils.getStringArray('NON_EXISTENT_VAR', ['default value']),
      ).toEqual(['default value']);
    });

    it('should return the an array with one value if the environment variable has one value', () => {
      // @ts-ignore
      process.env.TEST_VAR = 1;
      expect(EnvVarUtils.getStringArray('TEST_VAR', ['default value'])).toEqual(
        ['1'],
      );
    });
  });

  describe('getMs', () => {
    it('should return the environment variable value as milliseconds if it exists', () => {
      process.env.TEST_VAR = '1s';
      expect(EnvVarUtils.getMs('TEST_VAR')).toEqual(1000);
    });

    it('should return the environment variable value as milliseconds if it exists', () => {
      process.env.TEST_VAR = '100';
      expect(EnvVarUtils.getMs('TEST_VAR')).toEqual(100);
    });

    it('should return the default value as milliseconds if the environment variable does not exist', () => {
      expect(EnvVarUtils.getMs('NON_EXISTENT_VAR', '1s')).toEqual(1000);
    });

    it('should return undefined if the environment variable is not a valid time string', () => {
      process.env.TEST_VAR = 'not a valid time string';
      expect(EnvVarUtils.getMs('TEST_VAR', '1d')).toBeUndefined();
    });
  });
});
