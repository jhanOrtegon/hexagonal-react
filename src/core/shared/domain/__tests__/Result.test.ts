import { describe, it, expect } from 'vitest';

import { Failure, ok, fail, combine, fromPromise } from '../Result';

import type { Result } from '../Result';

describe('Result Type', () => {
  describe('Success', () => {
    it('should create success with value', () => {
      const result: Result<number, never> = ok(42);

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);

      if (result.isSuccess()) {
        expect(result.value).toBe(42);
      }
    });

    it('should map value successfully', () => {
      const result: Result<number, never> = ok(10);
      const mapped: Result<number, never> = result.map((n: number) => n * 2);

      expect(mapped.isSuccess()).toBe(true);
      if (mapped.isSuccess()) {
        expect(mapped.value).toBe(20);
      }
    });

    it('should flatMap successfully', () => {
      const result: Result<number, never> = ok(5);
      const flatMapped: Result<string, Error> = result.flatMap((n: number) =>
        n > 0 ? ok(`positive: ${n}`) : fail(new Error('negative'))
      );

      expect(flatMapped.isSuccess()).toBe(true);
      if (flatMapped.isSuccess()) {
        expect(flatMapped.value).toBe('positive: 5');
      }
    });

    it('should getOrElse return value', () => {
      const result: Result<number, never> = ok(42);
      const value: number = result.getOrElse(0);

      expect(value).toBe(42);
    });
  });

  describe('Failure', () => {
    it('should create failure with error', () => {
      const error: Error = new Error('Something went wrong');
      const result: Result<never, Error> = fail(error);

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);

      if (result.isFailure()) {
        expect(result.error).toBe(error);
      }
    });

    it('should propagate error on map', () => {
      const error: Error = new Error('Error');
      const result: Result<number, Error> = fail(error);
      const mapped: Result<number, Error> = result.map((n: number) => n * 2);

      expect(mapped.isFailure()).toBe(true);
      if (mapped.isFailure()) {
        expect(mapped.error).toBe(error);
      }
    });

    it('should propagate error on flatMap', () => {
      const error: Error = new Error('Error');
      const result: Result<number, Error> = fail(error);
      const flatMapped: Result<string, Error> = result.flatMap((n: number) => ok(`value: ${n}`));

      expect(flatMapped.isFailure()).toBe(true);
      if (flatMapped.isFailure()) {
        expect(flatMapped.error).toBe(error);
      }
    });

    it('should getOrElse return default value', () => {
      const error: Error = new Error('Error');
      const result: Result<number, Error> = fail(error);
      const value: number = result.getOrElse(99);

      expect(value).toBe(99);
    });

    it('should mapError transform error', () => {
      const originalError: Error = new Error('Original');
      const result: Failure<Error> = fail(originalError);
      const mapped: Failure<string> = result.mapError((err: Error) => `Wrapped: ${err.message}`);

      expect(mapped.isFailure()).toBe(true);
      expect(mapped.error).toBe('Wrapped: Original');
    });
  });

  describe('combine', () => {
    it('should combine successful results', () => {
      const results: Result<number, Error>[] = [ok(1), ok(2), ok(3)];
      const combined: Result<number[], Error> = combine(results);

      expect(combined.isSuccess()).toBe(true);
      if (combined.isSuccess()) {
        expect(combined.value).toEqual([1, 2, 3]);
      }
    });

    it('should return first failure', () => {
      const error1: Error = new Error('Error 1');
      const error2: Error = new Error('Error 2');
      const results: Result<number, Error>[] = [ok(1), fail(error1), fail(error2)];
      const combined: Result<number[], Error> = combine(results);

      expect(combined.isFailure()).toBe(true);
      if (combined.isFailure()) {
        expect(combined.error).toBe(error1);
      }
    });

    it('should handle empty array', () => {
      const results: Result<number, Error>[] = [];
      const combined: Result<number[], Error> = combine(results);

      expect(combined.isSuccess()).toBe(true);
      if (combined.isSuccess()) {
        expect(combined.value).toEqual([]);
      }
    });
  });

  describe('fromPromise', () => {
    it('should convert resolved promise to Success', async () => {
      const promise: Promise<number> = Promise.resolve(42);
      const result: Result<number, Error> = await fromPromise(promise);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe(42);
      }
    });

    it('should convert rejected promise to Failure', async () => {
      const error: Error = new Error('Promise failed');
      const promise: Promise<number> = Promise.reject(error);
      const result: Result<number, Error> = await fromPromise(promise);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBe(error);
      }
    });

    it('should use error handler when provided', async () => {
      const promise: Promise<number> = Promise.reject('String error');
      const result: Result<number, string> = await fromPromise(
        promise,
        (err: unknown) => `Handled: ${String(err)}`
      );

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBe('Handled: String error');
      }
    });
  });

  describe('Type Guards', () => {
    it('should narrow type with isSuccess', () => {
      const result: Result<number, Error> = ok(42);

      if (result.isSuccess()) {
        // TypeScript debería saber que result.value existe
        const value: number = result.value;
        expect(value).toBe(42);
      }
    });

    it('should narrow type with isFailure', () => {
      const result: Result<number, Error> = fail(new Error('Test'));

      if (result.isFailure()) {
        // TypeScript debería saber que result.error existe
        const error: Error = result.error;
        expect(error.message).toBe('Test');
      }
    });
  });

  describe('Real World Scenarios', () => {
    class DomainError extends Error {
      constructor(
        public readonly code: string,
        message: string
      ) {
        super(message);
      }
    }

    function divide(a: number, b: number): Result<number, DomainError> {
      if (b === 0) {
        return fail(new DomainError('DIVISION_BY_ZERO', 'Cannot divide by zero'));
      }
      return ok(a / b);
    }

    it('should handle domain operations', () => {
      const success: Result<number, DomainError> = divide(10, 2);
      expect(success.isSuccess()).toBe(true);

      const failure: Result<number, DomainError> = divide(10, 0);
      expect(failure.isFailure()).toBe(true);
      if (failure.isFailure()) {
        expect(failure.error.code).toBe('DIVISION_BY_ZERO');
      }
    });

    it('should chain operations', () => {
      const result: Result<string, DomainError> = divide(10, 2)
        .map((n: number) => n * 2)
        .map((n: number) => `Result: ${n}`);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe('Result: 10');
      }
    });

    it('should short-circuit on failure', () => {
      const result: Result<string, DomainError> = divide(10, 0)
        .map((n: number) => n * 2) // No se ejecuta
        .map((n: number) => `Result: ${n}`); // No se ejecuta

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.code).toBe('DIVISION_BY_ZERO');
      }
    });
  });
});
