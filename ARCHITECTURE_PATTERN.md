# 🏗️ Patrón de Arquitectura - Guía Completa

Este documento describe el **patrón arquitectónico estándar** que debes seguir para todos los módulos del proyecto.

---

## 📦 Estructura de Carpetas

```
src/
├── core/{module}/                    # Lógica de negocio pura
│   ├── domain/
│   │   ├── types/                    # 🆕 Tipos separados del código
│   │   │   ├── {entity}.types.ts
│   │   │   ├── repository.types.ts
│   │   │   └── index.ts
│   │   ├── {Entity}.entity.ts
│   │   ├── {Entity}.errors.ts
│   │   └── __tests__/
│   │       └── {Entity}.entity.test.ts
│   ├── application/
│   │   ├── types/                    # 🆕 DTOs y tipos de aplicación
│   │   │   ├── dto.types.ts
│   │   │   └── index.ts
│   │   ├── usecases/
│   │   │   ├── Create{Entity}.usecase.ts
│   │   │   ├── Get{Entity}ById.usecase.ts
│   │   │   ├── GetAll{Entities}.usecase.ts
│   │   │   ├── Update{Entity}.usecase.ts
│   │   │   ├── Delete{Entity}.usecase.ts
│   │   │   └── index.ts
│   │   ├── mappers/
│   │   │   └── {Entity}.mapper.ts
│   │   └── __tests__/
│   └── index.ts
│
├── infrastructure/
│   ├── {module}/
│   │   ├── {Entity}Local.repository.ts    # LocalStorage
│   │   ├── {Entity}Api.repository.ts      # API con Axios
│   │   ├── mappers/
│   │   └── __tests__/
│   ├── di/
│   │   └── container.ts
│   └── shared/
│       ├── http/
│       │   └── axios.client.ts            # 🆕 Axios configurado
│       └── react-query/
│           └── config.ts                   # 🆕 React Query config
│
└── presentation/
    ├── {module}/
    │   ├── hooks/
    │   │   └── use{Entity}.query.ts       # 🆕 React Query hooks
    │   ├── components/
    │   ├── pages/
    │   └── types/                          # 🆕 Tipos de presentación
    └── shared/
        ├── components/ui/
        ├── hooks/
        └── types/
```

---

## 🎯 Paso a Paso: Crear un Nuevo Módulo

### 1️⃣ **Domain Layer - Tipos Separados**

#### `src/core/{module}/domain/types/{entity}.types.ts`

```typescript
/**
 * {Entity} Domain Types
 * Tipos puros del dominio sin lógica de negocio
 */

export interface Create{Entity}Data {
  readonly field1: string;
  readonly field2: number;
}

export interface Restore{Entity}Data {
  readonly id: string;
  readonly field1: string;
  readonly field2: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface {Entity}Filters {
  readonly field1?: string;
  readonly field2Min?: number;
  readonly field2Max?: number;
}
```

#### `src/core/{module}/domain/types/repository.types.ts`

```typescript
import type { {Entity} } from '../{Entity}.entity';
import type { {Entity}Filters } from './{entity}.types';

export interface {Entity}Repository {
  findById(id: string): Promise<{Entity} | null>;
  findAll(filters?: {Entity}Filters): Promise<{Entity}[]>;
  save(entity: {Entity}): Promise<{Entity}>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

#### `src/core/{module}/domain/types/index.ts`

```typescript
export type { Create{Entity}Data, Restore{Entity}Data, {Entity}Filters } from './{entity}.types';
export type { {Entity}Repository } from './repository.types';
```

---

### 2️⃣ **Domain Layer - Entity**

#### `src/core/{module}/domain/{Entity}.entity.ts`

```typescript
import { InvalidArgumentError } from '../../shared/errors';
import type { Create{Entity}Data, Restore{Entity}Data } from './types';

export class {Entity} {
  public readonly id: string;
  public readonly field1: string;
  public readonly field2: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    field1: string,
    field2: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.field1 = field1;
    this.field2 = field2;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(data: Create{Entity}Data): {Entity} {
    // Validaciones de dominio
    if (data.field1.trim().length === 0) {
      throw new InvalidArgumentError('field1', 'Field1 is required');
    }

    if (data.field2 < 0) {
      throw new InvalidArgumentError('field2', 'Field2 must be positive');
    }

    return new {Entity}(
      crypto.randomUUID(),
      data.field1.trim(),
      data.field2,
      new Date(),
      new Date()
    );
  }

  public static restore(data: Restore{Entity}Data): {Entity} {
    return new {Entity}(
      data.id,
      data.field1,
      data.field2,
      data.createdAt,
      data.updatedAt
    );
  }

  public updateField1(newValue: string): {Entity} {
    if (newValue.trim().length === 0) {
      throw new InvalidArgumentError('field1', 'Field1 is required');
    }

    return new {Entity}(
      this.id,
      newValue.trim(),
      this.field2,
      this.createdAt,
      new Date()
    );
  }

  public equals(other: {Entity}): boolean {
    return this.id === other.id;
  }
}
```

---

### 3️⃣ **Application Layer - Tipos (DTOs)**

#### `src/core/{module}/application/types/dto.types.ts`

```typescript
export interface Create{Entity}DTO {
  readonly field1: string;
  readonly field2: number;
}

export interface Update{Entity}DTO {
  readonly field1?: string;
  readonly field2?: number;
}

export interface {Entity}ResponseDTO {
  readonly id: string;
  readonly field1: string;
  readonly field2: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

#### `src/core/{module}/application/mappers/{Entity}.mapper.ts`

```typescript
import type { {Entity} } from '../../domain/{Entity}.entity';
import type { {Entity}ResponseDTO } from '../types';

export const {Entity}ResponseMapper = {
  fromEntity(entity: {Entity}): {Entity}ResponseDTO {
    return {
      id: entity.id,
      field1: entity.field1,
      field2: entity.field2,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  },

  fromEntities(entities: {Entity}[]): {Entity}ResponseDTO[] {
    return entities.map((entity: {Entity}) => {Entity}ResponseMapper.fromEntity(entity));
  },
};
```

---

### 4️⃣ **Infrastructure - Repository LocalStorage**

#### `src/infrastructure/{module}/{Entity}Local.repository.ts`

```typescript
import { {Entity}, type {Entity}Repository, type {Entity}Filters } from '@/core/{module}';

export class {Entity}LocalRepository implements {Entity}Repository {
  private readonly storageKey: string = 'hexagonal-tdd:{entities}';

  private getAllFromStorage(): {Entity}[] {
    try {
      const data: string | null = localStorage.getItem(this.storageKey);
      if (data === null) return [];

      const parsed: {
        id: string;
        field1: string;
        field2: number;
        createdAt: string;
        updatedAt: string;
      }[] = JSON.parse(data);

      return parsed.map((item) =>
        {Entity}.restore({
          id: item.id,
          field1: item.field1,
          field2: item.field2,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
      );
    } catch (error: unknown) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private saveAllToStorage(entities: {Entity}[]): void {
    const data = entities.map((entity: {Entity}) => ({
      id: entity.id,
      field1: entity.field1,
      field2: entity.field2,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    }));

    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  public async findById(id: string): Promise<{Entity} | null> {
    const entities: {Entity}[] = this.getAllFromStorage();
    const entity: {Entity} | undefined = entities.find((e: {Entity}) => e.id === id);
    return await Promise.resolve(entity ?? null);
  }

  public async findAll(filters?: {Entity}Filters): Promise<{Entity}[]> {
    let entities: {Entity}[] = this.getAllFromStorage();

    if (filters?.field1 !== undefined) {
      entities = entities.filter((e: {Entity}) =>
        e.field1.toLowerCase().includes(filters.field1?.toLowerCase() ?? '')
      );
    }

    return await Promise.resolve(entities);
  }

  public async save(entity: {Entity}): Promise<{Entity}> {
    const entities: {Entity}[] = this.getAllFromStorage();
    const existingIndex: number = entities.findIndex((e: {Entity}) => e.id === entity.id);

    if (existingIndex !== -1) {
      entities[existingIndex] = entity;
    } else {
      entities.push(entity);
    }

    this.saveAllToStorage(entities);
    return await Promise.resolve(entity);
  }

  public async delete(id: string): Promise<void> {
    const entities: {Entity}[] = this.getAllFromStorage();
    const filteredEntities: {Entity}[] = entities.filter((e: {Entity}) => e.id !== id);
    this.saveAllToStorage(filteredEntities);
    await Promise.resolve();
  }

  public async exists(id: string): Promise<boolean> {
    const entities: {Entity}[] = this.getAllFromStorage();
    return await Promise.resolve(entities.some((e: {Entity}) => e.id === id));
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
```

---

### 5️⃣ **Presentation - React Query Hooks**

#### `src/presentation/{module}/hooks/use{Entity}.query.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Create{Entity}DTO, Update{Entity}DTO, {Entity}ResponseDTO } from '@/core/{module}/application/types';
import { Create{Entity} } from '@/core/{module}/application/usecases/Create{Entity}.usecase';
import { Delete{Entity} } from '@/core/{module}/application/usecases/Delete{Entity}.usecase';
import { GetAll{Entities} } from '@/core/{module}/application/usecases/GetAll{Entities}.usecase';
import { Get{Entity}ById } from '@/core/{module}/application/usecases/Get{Entity}ById.usecase';
import { Update{Entity} } from '@/core/{module}/application/usecases/Update{Entity}.usecase';
import type { {Entity}Filters, {Entity}Repository } from '@/core/{module}/domain/types';
import { container } from '@/infrastructure/di/container';
import { queryKeys } from '@/infrastructure/shared/react-query/config';

import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';

// Query: Obtener todos
export function use{Entities}Query(filters?: {Entity}Filters): UseQueryResult<{Entity}ResponseDTO[]> {
  return useQuery({
    queryKey: queryKeys.{entities}.list(filters),
    queryFn: async (): Promise<{Entity}ResponseDTO[]> => {
      const repository: {Entity}Repository = container.get{Entity}Repository();
      const useCase: GetAll{Entities} = new GetAll{Entities}(repository);
      return await useCase.execute(filters);
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Query: Obtener por ID
export function use{Entity}Query(id: string): UseQueryResult<{Entity}ResponseDTO> {
  return useQuery({
    queryKey: queryKeys.{entities}.detail(id),
    queryFn: async (): Promise<{Entity}ResponseDTO> => {
      const repository: {Entity}Repository = container.get{Entity}Repository();
      const useCase: Get{Entity}ById = new Get{Entity}ById(repository);
      return await useCase.execute(id);
    },
    enabled: Boolean(id),
  });
}

// Mutation: Crear
export function useCreate{Entity}Mutation(): UseMutationResult<{Entity}ResponseDTO, Error, Create{Entity}DTO> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Create{Entity}DTO): Promise<{Entity}ResponseDTO> => {
      const repository: {Entity}Repository = container.get{Entity}Repository();
      const useCase: Create{Entity} = new Create{Entity}(repository);
      return await useCase.execute(data);
    },
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.{entities}.all });
    },
  });
}

// Mutation: Actualizar
export function useUpdate{Entity}Mutation(): UseMutationResult<
  {Entity}ResponseDTO,
  Error,
  { id: string; data: Update{Entity}DTO }
> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Update{Entity}DTO }): Promise<{Entity}ResponseDTO> => {
      const repository: {Entity}Repository = container.get{Entity}Repository();
      const useCase: Update{Entity} = new Update{Entity}(repository);
      return await useCase.execute(id, data);
    },
    onSuccess: async (_data, variables): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.{entities}.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.{entities}.lists() });
    },
  });
}

// Mutation: Eliminar
export function useDelete{Entity}Mutation(): UseMutationResult<void, Error, string> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const repository: {Entity}Repository = container.get{Entity}Repository();
      const useCase: Delete{Entity} = new Delete{Entity}(repository);
      await useCase.execute(id);
    },
    onSuccess: async (_data, id): Promise<void> => {
      queryClient.removeQueries({ queryKey: queryKeys.{entities}.detail(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.{entities}.lists() });
    },
  });
}
```

---

### 6️⃣ **Actualizar Query Keys**

#### `src/infrastructure/shared/react-query/config.ts`

```typescript
export const queryKeys = {
  // ... otros módulos

  {entities}: {
    all: ['{entities}'] as const,
    lists: () => [...queryKeys.{entities}.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.{entities}.lists(), { filters }] as const,
    details: () => [...queryKeys.{entities}.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.{entities}.details(), id] as const,
  },
};
```

---

## 🎓 Principios Clave

### ✅ **DO's (Hacer)**

1. **Separar tipos del código** - Carpetas `/types/` dedicadas
2. **Usar TanStack Query** - Para todas las operaciones asíncronas
3. **Usar Axios** - Para comunicación HTTP
4. **Invalidar queries** - Después de mutaciones
5. **Tests unitarios** - Para entities y use cases
6. **Tests de integración** - Para repositorios
7. **Readonly properties** - En entities y DTOs
8. **Factory methods** - `create()` y `restore()` en entities
9. **Mappers** - Para transformar entre capas
10. **Query keys centralizados** - En `config.ts`

### ❌ **DON'Ts (No Hacer)**

1. **NO mezclar tipos con código**
2. **NO usar `useState` para data fetching** - Usar React Query
3. **NO usar `fetch` directamente** - Usar Axios
4. **NO mutar entities** - Son inmutables
5. **NO poner lógica de negocio en componentes**
6. **NO importar Infrastructure en Core**
7. **NO usar `any` - Tipar todo**
8. **NO duplicar lógica de queries** - Reutilizar hooks

---

## 🚀 Ventajas de Este Patrón

### **Con TanStack Query + Axios**

✅ **Caching automático** - No refetch innecesarios  
✅ **Optimistic updates** - UI instantánea  
✅ **Retry logic** - Reintentos automáticos  
✅ **DevTools** - Debugging visual  
✅ **Invalidación inteligente** - Refetch cuando es necesario  
✅ **Type-safety** - TypeScript en toda la cadena  
✅ **Interceptors** - Manejo centralizado de errores  
✅ **Request cancellation** - Cancelación automática  
✅ **Polling** - Actualización periódica  
✅ **Infinite scroll** - Paginación fácil  

---

## 📝 Ejemplo Completo

Ver el módulo **`user`** como referencia completa de implementación.

---

## 🧪 Testing

```bash
# Tests unitarios (Domain + Application)
pnpm test src/core/{module}

# Tests de integración (Infrastructure)
pnpm test src/infrastructure/{module}

# Tests de componentes (Presentation)
pnpm test src/presentation/{module}

# Todos los tests
pnpm test:run
```

---

## 📚 Referencias

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD](https://www.domainlanguage.com/ddd/)
