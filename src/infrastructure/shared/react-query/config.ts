import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration
 * Configuración global para TanStack Query
 */

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo en que los datos se consideran frescos (no se refetch automáticamente)
      staleTime: 1000 * 60 * 5, // 5 minutos

      // Tiempo en que los datos en caché se mantienen antes de ser eliminados
      gcTime: 1000 * 60 * 10, // 10 minutos (antes era cacheTime)

      // Reintentar peticiones fallidas
      retry: 1,

      // Refetch automático cuando la ventana recupera el foco
      refetchOnWindowFocus: false,

      // Refetch automático al reconectar
      refetchOnReconnect: true,
    },
    mutations: {
      // Configuración para mutaciones
      retry: 0,
    },
  },
});

/**
 * Query Keys Factory
 * Facilita la gestión de cache keys de manera tipada y consistente
 */
export const queryKeys: {
  readonly users: {
    readonly all: readonly ['users'];
    readonly lists: () => readonly ['users', 'list'];
    readonly list: (filters?: unknown) => readonly ['users', 'list', { filters: unknown }];
    readonly details: () => readonly ['users', 'detail'];
    readonly detail: (id: string) => readonly ['users', 'detail', string];
  };
  readonly products: {
    readonly all: readonly ['products'];
    readonly lists: () => readonly ['products', 'list'];
    readonly list: (filters?: unknown) => readonly ['products', 'list', { filters: unknown }];
    readonly details: () => readonly ['products', 'detail'];
    readonly detail: (id: string) => readonly ['products', 'detail', string];
  };
  readonly orders: {
    readonly all: readonly ['orders'];
    readonly lists: () => readonly ['orders', 'list'];
    readonly list: (filters?: unknown) => readonly ['orders', 'list', { filters: unknown }];
    readonly details: () => readonly ['orders', 'detail'];
    readonly detail: (id: string) => readonly ['orders', 'detail', string];
  };
} = {
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Products (ejemplo para futuros módulos)
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Orders (ejemplo para futuros módulos)
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.orders.lists(), { filters }] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
} as const;
