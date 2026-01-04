/**
 * Result Type Pattern
 * Representa el resultado de una operación que puede ser exitosa o fallar
 * Similar a Either en programación funcional o Result en Rust
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Success - Representa una operación exitosa
 */
export class Success<T> {
  public readonly success: boolean = true;
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  public isSuccess(): this is Success<T> {
    return true;
  }

  public isFailure(): this is Failure<never> {
    return false;
  }

  /**
   * Map - Transforma el valor de éxito si existe
   */
  public map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  /**
   * FlatMap - Transforma el valor y aplana el resultado
   */
  public flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }

  /**
   * GetOrElse - Retorna el valor (siempre existe en Success)
   */
  public getOrElse(_defaultValue: T): T {
    return this.value;
  }
}

/**
 * Failure - Representa una operación fallida
 */
export class Failure<E> {
  public readonly success: boolean = false;
  public readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  public isSuccess(): this is Success<never> {
    return false;
  }

  public isFailure(): this is Failure<E> {
    return true;
  }

  /**
   * Map - No hace nada en Failure, propaga el error
   */
  public map<U>(_fn: (value: never) => U): Result<U, E> {
    return new Failure(this.error);
  }

  /**
   * FlatMap - No hace nada en Failure, propaga el error
   */
  public flatMap<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E> {
    return new Failure(this.error);
  }

  /**
   * GetOrElse - Retorna el valor por defecto
   */
  public getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }

  /**
   * MapError - Transforma el error
   */
  public mapError<F>(fn: (error: E) => F): Failure<F> {
    return new Failure(fn(this.error));
  }
}

/**
 * Factory Functions - Para crear Results de forma más concisa
 */

/**
 * ok - Crea un Success
 */
export function ok<T>(value: T): Success<T> {
  return new Success(value);
}

/**
 * fail - Crea un Failure
 */
export function fail<E>(error: E): Failure<E> {
  return new Failure(error);
}

/**
 * Combine - Combina múltiples Results
 * Si todos son Success, retorna Success con array de valores
 * Si alguno es Failure, retorna el primer Failure
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (result.isFailure()) {
      return result;
    }
    values.push(result.value);
  }

  return ok(values);
}

/**
 * fromPromise - Convierte una Promise en un Result
 * Útil para wrappear operaciones async que pueden fallar
 */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  errorHandler?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value: T = await promise;
    return ok(value);
  } catch (error: unknown) {
    const mappedError: E =
      errorHandler !== undefined
        ? errorHandler(error)
        : error instanceof Error
          ? (error as E)
          : (new Error(String(error)) as E);
    return fail(mappedError);
  }
}
