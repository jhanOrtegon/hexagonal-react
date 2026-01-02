/* eslint-disable @typescript-eslint/typedef */
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncQueryOptions<T> {
  readonly initialData?: T;
  readonly enabled?: boolean;
}

interface UseAsyncQueryReturn<T> {
  readonly data: T | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

/**
 * Hook genérico para queries asíncronas con manejo de estado
 * Útil para reutilizar lógica común en todos los hooks de consulta
 */
export function useAsyncQuery<T>(
  queryFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncQueryOptions<T> = {}
): UseAsyncQueryReturn<T> {
  const { initialData = null, enabled = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const execute = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: T = await queryFn();

      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const errorObj: Error = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        setData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect((): (() => void) => {
    isMountedRef.current = true;

    if (enabled) {
      execute().catch((err: unknown): void => {
        console.error('Error in useAsyncQuery:', err);
      });
    }

    return (): void => {
      isMountedRef.current = false;
    };
  }, [execute, enabled]);

  return { data, isLoading, error, refetch: execute };
}

interface UseAsyncMutationReturn<TArgs extends unknown[], TResult> {
  readonly mutate: (...args: TArgs) => Promise<TResult>;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly reset: () => void;
}

/**
 * Hook genérico para mutaciones asíncronas (create, update, delete)
 * Útil para reutilizar lógica común en todos los hooks de acción
 */
export function useAsyncMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>
): UseAsyncMutationReturn<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result: TResult = await mutationFn(...args);
        return result;
      } catch (err: unknown) {
        const errorObj: Error = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback((): void => {
    setError(null);
  }, []);

  return { mutate, isLoading, error, reset };
}
