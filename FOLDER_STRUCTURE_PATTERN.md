# 📁 Estructura de Carpetas Homogénea - Hexagonal Architecture

## ✅ Estructura Estandarizada por Módulo

Todos los módulos (User, Product, Order) siguen **EXACTAMENTE** la misma estructura:

```
src/
├── core/
│   └── {module}/                    # User | Product | Order
│       ├── index.ts                 # Barrel export del módulo
│       ├── domain/
│       │   ├── {Entity}.entity.ts   # User.entity.ts | Product.entity.ts | Order.entity.ts
│       │   ├── {Entity}.errors.ts   # Errores de dominio
│       │   ├── types/               # ⚠️ TODOS los tipos en carpeta types/
│       │   │   ├── index.ts         # Re-exporta todos los tipos
│       │   │   ├── {entity}.types.ts      # CreateData, RestoreData, UpdateData
│       │   │   └── repository.types.ts    # Repository interface + Filters
│       │   └── __tests__/           # Tests de entidades y VOs
│       │       └── {Entity}.entity.test.ts
│       └── application/
│           ├── dtos/                # Data Transfer Objects
│           │   ├── {Entity}Response.dto.ts
│           │   └── dto.types.ts     # DTOs de entrada (CreateDTO, UpdateDTO)
│           ├── types/               # Re-export de DTOs
│           │   └── index.ts
│           ├── usecases/            # Casos de uso
│           │   ├── Create{Entity}.usecase.ts
│           │   ├── Get{Entity}ById.usecase.ts
│           │   ├── GetAll{Entities}.usecase.ts
│           │   ├── Update{Entity}.usecase.ts
│           │   ├── Delete{Entity}.usecase.ts
│           │   └── index.ts         # Exporta todos los use cases
│           └── __tests__/           # Tests de use cases
│               └── *.usecase.test.ts
│
├── infrastructure/
│   └── {module}/                    # user | product | order
│       ├── {Entity}Local.repository.ts   # Implementación localStorage
│       ├── {Entity}Api.repository.ts     # Implementación HTTP API
│       ├── mappers/                      # Transformación API ↔️ Domain
│       │   ├── {Entity}.mapper.ts
│       │   └── index.ts
│       └── __tests__/                    # Tests de repositorios
│           └── {Entity}Local.repository.test.ts
│
└── presentation/
    └── {module}/                    # user | product | order
        ├── .eslintrc.cjs           # Configuración ESLint específica
        ├── hooks/                  # Custom hooks (React Query)
        │   ├── use{Entity}.query.ts
        │   └── index.ts
        ├── pages/                  # Páginas/Vistas
        │   └── {Entity}ListPage.tsx
        ├── components/             # Componentes específicos del módulo
        ├── adapters/               # Adaptadores Presentation ↔️ Application
        ├── view-models/            # ViewModels (lógica de presentación)
        └── assets/                 # Recursos estáticos del módulo
```

---

## 📋 Checklist de Homogeneidad

### ✅ CORE Layer

#### Domain (`src/core/{module}/domain/`)
- ✅ `{Entity}.entity.ts` - Entidad principal
- ✅ `{Entity}.errors.ts` - Errores de dominio
- ✅ `types/` - **CARPETA** con todos los tipos
  - ✅ `{entity}.types.ts` - CreateData, RestoreData, UpdateData
  - ✅ `repository.types.ts` - Repository interface + Filters
  - ✅ `index.ts` - Re-exporta todo
- ✅ `__tests__/` - Tests unitarios de dominio
- ❌ **NO** archivos `{Entity}.repository.ts` en raíz
- ❌ **NO** archivos `{Entity}.types.ts` en raíz

#### Application (`src/core/{module}/application/`)
- ✅ `dtos/` - DTOs de respuesta y entrada
  - ✅ `{Entity}Response.dto.ts` - Mapper para respuestas
  - ✅ `dto.types.ts` - CreateDTO, UpdateDTO
- ✅ `types/` - Re-export de DTOs
  - ✅ `index.ts`
- ✅ `usecases/` - Casos de uso
  - ✅ `Create{Entity}.usecase.ts`
  - ✅ `Get{Entity}ById.usecase.ts`
  - ✅ `GetAll{Entities}.usecase.ts`
  - ✅ `Update{Entity}.usecase.ts`
  - ✅ `Delete{Entity}.usecase.ts`
  - ✅ `index.ts` - Exporta todos
- ✅ `__tests__/` - Tests de use cases

---

### ✅ INFRASTRUCTURE Layer (`src/infrastructure/{module}/`)

- ✅ `{Entity}Local.repository.ts` - Implementación localStorage
  - ✅ Constante: `STORAGE_KEY` (UPPER_CASE)
  - ✅ Métodos privados: `getAllFromStorage()` / `saveAllToStorage()`
  - ✅ Retorna `Promise.resolve()` (sin async innecesario)
  - ✅ Try-catch con `console.error` en lectura
  - ✅ Try-catch con `throw Error` en escritura
  - ✅ Método público: `clear()` para testing

- ✅ `{Entity}Api.repository.ts` - Implementación API HTTP
  - ✅ Usa `axiosClient` de shared
  - ✅ Métodos privados: `toDomain()` / `toApi()`
  - ✅ Manejo de errores 404 → `null`

- ✅ `mappers/` - Transformadores API ↔️ Domain
  - ✅ `{Entity}.mapper.ts` (si es necesario)
  - ✅ `index.ts`

- ✅ `__tests__/` - Tests de repositorios
  - ✅ `{Entity}Local.repository.test.ts`

---

### ✅ PRESENTATION Layer (`src/presentation/{module}/`)

- ✅ `.eslintrc.cjs` - Configuración ESLint
  - ✅ Desactiva `@stylistic/no-inline-styles`
  - ✅ Desactiva `promise/prefer-await-to-then`
  - ✅ Desactiva `promise/prefer-await-to-callbacks`

- ✅ `hooks/` - Custom hooks con React Query
  - ✅ `use{Entity}.query.ts`
    - ✅ `use{Entities}Query()` - Lista
    - ✅ `use{Entity}Query(id)` - Detalle
    - ✅ `useCreate{Entity}Mutation()`
    - ✅ `useUpdate{Entity}Mutation()`
    - ✅ `useDelete{Entity}Mutation()`
  - ✅ `index.ts` - Exporta hooks

- ✅ `pages/` - Páginas/Vistas
  - ✅ `{Entity}ListPage.tsx` - CRUD completo

- ✅ `components/` - Componentes específicos
- ✅ `adapters/` - Adaptadores
- ✅ `view-models/` - ViewModels
- ✅ `assets/` - Recursos estáticos

---

## 🎯 Convenciones Aplicadas

### Nombres de Archivos
```
{Entity}.entity.ts       → User.entity.ts, Product.entity.ts, Order.entity.ts
{Entity}.errors.ts       → User.errors.ts, Product.errors.ts, Order.errors.ts
{entity}.types.ts        → user.types.ts, product.types.ts, order.types.ts
repository.types.ts      → (igual en todos)
dto.types.ts            → (igual en todos)
{Entity}Response.dto.ts  → UserResponse.dto.ts, ProductResponse.dto.ts
{Entity}Local.repository.ts  → UserLocal.repository.ts
{Entity}Api.repository.ts    → UserApi.repository.ts
use{Entity}.query.ts     → useUser.query.ts, useProduct.query.ts
{Entity}ListPage.tsx     → UserListPage.tsx, ProductListPage.tsx
```

### Nombres de Constantes
```typescript
// ✅ CORRECTO - Todos usan UPPER_CASE
private readonly STORAGE_KEY: string = 'hexagonal-tdd:users';
private readonly STORAGE_KEY: string = 'hexagonal-tdd:products';
private readonly STORAGE_KEY: string = 'hexagonal-tdd:orders';
```

### Nombres de Métodos Privados
```typescript
// ✅ CORRECTO - Todos usan el mismo patrón
private getAllFromStorage(): Entity[]
private saveAllToStorage(entities: Entity[]): void
```

### Patrón de Promesas
```typescript
// ✅ CORRECTO - Sin async innecesario en operaciones síncronas
public findById(id: string): Promise<Entity | null> {
  const entities: Entity[] = this.getAllFromStorage();
  return Promise.resolve(entities.find(e => e.id === id) ?? null);
}

// ✅ CORRECTO - async solo cuando hay await real
public async exists(id: string): Promise<boolean> {
  const entity: Entity | null = await this.findById(id);
  return entity !== null;
}
```

### Manejo de Errores
```typescript
// ✅ CORRECTO - Try-catch con console.error en lectura
private getAllFromStorage(): Entity[] {
  try {
    const data: string | null = localStorage.getItem(this.STORAGE_KEY);
    // ... parsing
  } catch (error: unknown) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// ✅ CORRECTO - Try-catch con throw en escritura
private saveAllToStorage(entities: Entity[]): void {
  try {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  } catch (error: unknown) {
    console.error('Error writing to localStorage:', error);
    throw new Error('Failed to save to localStorage');
  }
}
```

---

## 📊 Resumen de Cambios Aplicados

### ✅ Eliminados (Duplicados)
- ❌ `src/core/user/domain/User.repository.ts` → Movido a `types/repository.types.ts`
- ❌ `src/core/user/domain/User.types.ts` → Movido a `types/user.types.ts`

### ✅ Creados (Estructura Completa)

#### Core Layer
- ✅ `src/core/product/domain/__tests__/`
- ✅ `src/core/order/domain/__tests__/`
- ✅ `src/core/product/application/__tests__/`
- ✅ `src/core/order/application/__tests__/`

#### Infrastructure Layer
- ✅ `src/infrastructure/product/mappers/`
- ✅ `src/infrastructure/product/__tests__/`
- ✅ `src/infrastructure/order/mappers/`
- ✅ `src/infrastructure/order/__tests__/`

#### Presentation Layer
- ✅ `src/presentation/product/components/`
- ✅ `src/presentation/product/adapters/`
- ✅ `src/presentation/product/view-models/`
- ✅ `src/presentation/order/pages/`
- ✅ `src/presentation/order/components/`
- ✅ `src/presentation/order/adapters/`
- ✅ `src/presentation/order/assets/`
- ✅ `src/presentation/order/view-models/`
- ✅ `src/presentation/order/.eslintrc.cjs`

### ✅ Estandarizados
- ✅ `UserLocal.repository.ts` - STORAGE_KEY en UPPER_CASE
- ✅ `OrderLocal.repository.ts` - Métodos renombrados a `getAllFromStorage()` / `saveAllToStorage()`
- ✅ Todos los repositorios usan el mismo patrón de promesas
- ✅ Todos los repositorios tienen método `clear()` para testing

---

## 🎓 Beneficios de la Homogeneidad

1. **Consistencia**: Cualquier desarrollador sabe dónde encontrar cada archivo
2. **Escalabilidad**: Agregar un nuevo módulo es copiar la estructura
3. **Mantenibilidad**: Los cambios se aplican de forma uniforme
4. **Onboarding**: Nuevos desarrolladores aprenden la estructura una vez
5. **Testing**: Todos los módulos tienen la misma estrategia de pruebas
6. **Refactoring**: Más fácil aplicar cambios globales

---

## 📝 Notas Finales

- ✅ Todos los módulos ahora siguen **EXACTAMENTE** la misma estructura
- ✅ No hay archivos duplicados ni inconsistencias
- ✅ Todos los métodos y constantes usan los mismos nombres
- ✅ Patrón de manejo de errores unificado
- ✅ Estructura preparada para agregar tests en el futuro

**La arquitectura ahora es completamente homogénea y escalable** 🎉
