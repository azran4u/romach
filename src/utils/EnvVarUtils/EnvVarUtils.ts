import { isArray, isBoolean, isNil, isNumber, isString } from 'lodash';
import ms from 'ms';

export class EnvVarUtils {
  static getEnvVarOrDefault<T>(
    key: string,
    parse: (value: string) => T,
    validate: (value: T) => boolean,
    defaultValue?: T,
  ): T | undefined {
    try {
      const value = process.env[key];
      let parsedValue: T;
      if (isNil(value)) {
        if (isNil(defaultValue) || !validate(defaultValue)) return undefined;
        return defaultValue;
      }
      parsedValue = parse(value);
      if (!validate(parsedValue)) return undefined;
      return parsedValue;
    } catch (error) {
      return undefined;
    }
  }

  static getString(key: string, defaultValue?: string): string | undefined {
    return EnvVarUtils.getEnvVarOrDefault(
      key,
      (value) => value,
      isString,
      defaultValue,
    );
  }

  static getNumber(key: string, defaultValue?: number): number | undefined {
    return EnvVarUtils.getEnvVarOrDefault(
      key,
      parseInt,
      (x) => isNumber(x) && !isNaN(x),
      defaultValue,
    );
  }

  static getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    return EnvVarUtils.getEnvVarOrDefault(
      key,
      (value) => value.toLowerCase() === 'true',
      isBoolean,
      defaultValue,
    );
  }

  static getStringArray<T>(
    key: string,
    defaultValue?: string[],
  ): string[] | undefined {
    const delimiter = ',';
    return EnvVarUtils.getEnvVarOrDefault(
      key,
      (value) => {
        if (value.includes(delimiter))
          return value.split(delimiter).map((v) => v.trim());
        return [value];
      },
      isArray,
      defaultValue,
    );
  }

  static getMs(
    key: string,
    defaultValue?: string | number,
  ): number | undefined {
    const value = process.env[key];
    if (isNil(value)) {
      if (isNil(defaultValue)) return undefined;
      if (isNumber(defaultValue)) return defaultValue;
      return ms(defaultValue);
    }
    return ms(value);
  }
}
