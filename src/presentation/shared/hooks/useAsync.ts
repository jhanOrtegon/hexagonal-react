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
  const { initialData, enabled = true }: UseAsyncQueryOptions<T> = options;

  const [data, setData]: [T | null, React.Dispatch<React.SetStateAction<T | null>>] =
    useState<T | null>(initialData ?? null);
  const [isLoading, setIsLoading]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(enabled);
  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);
  const isMountedRef: { readonly current: { value: boolean } } = useRef<{ value: boolean }>({
    value: true,
  });

  const execute: () => Promise<void> = useCallback(async (): Promise<void> => {
    const mountedRef: { value: boolean } = isMountedRef.current;
    if (!mountedRef.value) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: T = await queryFn();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref value can change
      if (mountedRef.value) {
        setData(result);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref value can change
      if (mountedRef.value) {
        const errorObj: Error = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        setData(null);
      }
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref value can change
      if (mountedRef.value) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are passed as parameter
  }, deps);

  useEffect((): (() => void) => {
    const mountedRef: { value: boolean } = isMountedRef.current;
    mountedRef.value = true;

    if (enabled) {
      // eslint-disable-next-line promise/prefer-await-to-then, promise/prefer-await-to-callbacks -- useEffect requires promise chain
      execute().catch((err: unknown): void => {
        console.error('Error in useAsyncQuery:', err);
      });
    }

    return (): void => {
      mountedRef.value = false;
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
  const [isLoading, setIsLoading]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);
  const [error, setError]: [Error | null, React.Dispatch<React.SetStateAction<Error | null>>] =
    useState<Error | null>(null);

  const mutate: (...args: TArgs) => Promise<TResult> = useCallback(
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

  const reset: () => void = useCallback((): void => {
    setError(null);
  }, []);

  return { mutate, isLoading, error, reset };
}
