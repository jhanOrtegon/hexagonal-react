# 🔍 Análisis de Arquitectura y Mejoras Recomendadas

## ✅ Fortalezas Actuales

### 1. Estructura de Capas
- ✅ Separación clara entre Core, Infrastructure y Presentation
- ✅ Módulos bien organizados (user, product, order)
- ✅ Domain Layer correctamente aislado
- ✅ Dependency Injection Container implementado

### 2. TypeScript & ESLint
- ✅ Configuración super estricta de TypeScript
- ✅ ESLint con reglas exhaustivas
- ✅ Tipado obligatorio con `@typescript-eslint/typedef`
- ✅ Strict null checks y validaciones de flujo

### 3. Patrones de Diseño
- ✅ Entities inmutables con readonly properties
- ✅ Repository pattern correctamente implementado
- ✅ Factory methods en entities
- ✅ Interfaces segregadas

---

## 🚨 Problemas Identificados

### 1. **Entity Pattern Inconsistente**

**Problema**: La entidad `User` usa constructor público en vez de privado.

**Ubicación**: `src/core/user/domain/User.entity.ts`

**Actual**:
```typescript
export class User {
  constructor(
    id: string,
    email: string,
    name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
```

**Recomendado**:
```typescript
export class User {
  private constructor(
    id: string,
    email: string,
    name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  
  // Forzar uso de factory methods
  public static create(data: CreateUserData): User { ... }
  public static restore(data: RestoreUserData): User { ... }
}
```

---

### 2. **Falta de Value Objects**

**Problema**: Usar strings primitivos para Email y UserId en vez de Value Objects.

**Riesgo**: 
- Sin validación automática
- Posibles bugs al pasar strings incorrectos
- Pérdida de semántica del dominio

**Recomendación**: Crear Value Objects

**Crear**: `src/core/shared/value-objects/Email.vo.ts`
```typescript
export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new InvalidEmailError(value);
    }
    return new Email(value.toLowerCase().trim());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
```

**Crear**: `src/core/shared/value-objects/UserId.vo.ts`
```typescript
export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(): UserId {
    return new UserId(crypto.randomUUID());
  }

  public static fromString(value: string): UserId {
    if (!value || value.trim().length === 0) {
      throw new InvalidUserIdError('UserId cannot be empty');
    }
    return new UserId(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
```

---

### 3. **Falta Capa de Application (Use Cases)**

**Problema**: No hay Use Cases implementados en `application/usecases/`

**Impacto**:
- No hay orquestación de lógica de aplicación
- Componentes podrían acceder directamente a repositorios
- Testing más complejo

**Crear**: 
- `src/core/user/application/usecases/CreateUser.usecase.ts`
- `src/core/user/application/usecases/GetUserById.usecase.ts`
- `src/core/user/application/usecases/UpdateUser.usecase.ts`
- `src/core/user/application/usecases/DeleteUser.usecase.ts`
- `src/core/user/application/usecases/GetAllUsers.usecase.ts`

**Ejemplo**: `CreateUser.usecase.ts`
```typescript
import type { UserRepository } from '../../domain/User.repository';
import type { CreateUserDTO } from '../dtos/CreateUser.dto';
import type { UserResponseDTO } from '../dtos/UserResponse.dto';
import { User } from '../../domain/User.entity';
import { UserEmailAlreadyExistsError } from '../../domain/User.errors';

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existingUser: User | null = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser !== null) {
      throw new UserEmailAlreadyExistsError(dto.email);
    }

    const user: User = User.create({
      email: dto.email,
      name: dto.name,
    });

    const savedUser: User = await this.userRepository.save(user);

    return UserResponseDTO.fromEntity(savedUser);
  }
}
```

---

### 4. **Falta de DTOs**

**Problema**: No hay DTOs definidos en `application/dtos/`

**Crear**:
- `src/core/user/application/dtos/CreateUser.dto.ts`
- `src/core/user/application/dtos/UpdateUser.dto.ts`
- `src/core/user/application/dtos/UserResponse.dto.ts`

**Ejemplo**: `CreateUser.dto.ts`
```typescript
export interface CreateUserDTO {
  readonly email: string;
  readonly name: string;
}
```

**Ejemplo**: `UserResponse.dto.ts`
```typescript
import type { User } from '../../domain/User.entity';

export interface UserResponseDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class UserResponseDTO {
  public static fromEntity(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
```

---

### 5. **Infrastructure: Falta HTTP Client**

**Problema**: `UserApiRepository` no tiene un HttpClient inyectado

**Crear**: `src/infrastructure/shared/http/HttpClient.ts`

```typescript
export interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

export interface RequestConfig {
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean>;
  readonly timeout?: number;
}

export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {}
  ) {}

  public async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...config?.headers },
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  public async post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...config?.headers,
      },
      body: JSON.stringify(data),
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  // ... más métodos

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, this.baseUrl);
    
    if (params !== undefined) {
      Object.entries(params).forEach(([key, value]: [string, string | number | boolean]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    return await response.json() as T;
  }

  private createAbortSignal(timeout?: number): AbortSignal | undefined {
    if (timeout === undefined) {
      return undefined;
    }

    const controller: AbortController = new AbortController();
    setTimeout(() => { controller.abort(); }, timeout);
    return controller.signal;
  }
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}
```

---

### 6. **Falta de Mappers**

**Problema**: No hay mappers implementados en `infrastructure/user/mappers/`

**Crear**: `src/infrastructure/user/mappers/User.mapper.ts`

```typescript
import { User } from '../../../core/user/domain/User.entity';

export interface ApiUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ApiUserRequest {
  readonly email: string;
  readonly name: string;
}

export class UserMapper {
  public static toDomain(apiUser: ApiUserResponse): User {
    return User.create({
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
    });
  }

  public static toApi(user: User): ApiUserRequest {
    return {
      email: user.email,
      name: user.name,
    };
  }

  public static toApiWithId(user: User): ApiUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };
  }
}
```

---

### 7. **DI Container Mejorable**

**Problema**: El container actual es muy básico y no usa lazy loading correctamente

**Mejorar**: `src/infrastructure/di/container.ts`

```typescript
import { UserApiRepository } from '../user/UserApi.repository';
import { UserLocalRepository } from '../user/UserLocal.repository';
import { FetchHttpClient } from '../shared/http/HttpClient';
import { UserMapper } from '../user/mappers/User.mapper';

import type { UserRepository } from '../../core/user';
import type { HttpClient } from '../shared/http/HttpClient';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class DIContainer {
  private userRepository: UserRepository | null = null;
  private httpClient: HttpClient | null = null;
  private readonly environment: Environment;

  constructor() {
    this.environment = this.detectEnvironment();
  }

  public getHttpClient(): HttpClient {
    if (this.httpClient === null) {
      const apiUrl: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
      this.httpClient = new FetchHttpClient(apiUrl, {
        'Content-Type': 'application/json',
      });
    }
    return this.httpClient;
  }

  public getUserRepository(): UserRepository {
    if (this.userRepository === null) {
      const useLocal: boolean = 
        this.environment === Environment.TEST || 
        import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

      this.userRepository = useLocal
        ? new UserLocalRepository()
        : new UserApiRepository(this.getHttpClient(), new UserMapper());
    }
    return this.userRepository;
  }

  public setUserRepository(repository: UserRepository): void {
    this.userRepository = repository;
  }

  public reset(): void {
    this.userRepository = null;
    this.httpClient = null;
  }

  private detectEnvironment(): Environment {
    const mode: string = import.meta.env.MODE;
    
    if (mode === 'test') {
      return Environment.TEST;
    }
    
    if (mode === 'production') {
      return Environment.PRODUCTION;
    }
    
    return Environment.DEVELOPMENT;
  }
}

export const container = new DIContainer();
```

---

### 8. **Falta de Tests**

**Problema**: Solo hay 1 test para User entity

**Crear Tests**:

#### Domain Layer Tests
- `src/core/user/domain/__tests__/User.entity.test.ts` ✅ (existe)
- `src/core/shared/value-objects/__tests__/Email.vo.test.ts` ⚠️ (crear)
- `src/core/shared/value-objects/__tests__/UserId.vo.test.ts` ⚠️ (crear)

#### Application Layer Tests
- `src/core/user/application/__tests__/CreateUser.usecase.test.ts` ⚠️ (crear)
- `src/core/user/application/__tests__/GetUserById.usecase.test.ts` ⚠️ (crear)
- `src/core/user/application/__tests__/UpdateUser.usecase.test.ts` ⚠️ (crear)

#### Infrastructure Layer Tests
- `src/infrastructure/user/__tests__/UserApi.repository.test.ts` ⚠️ (crear)
- `src/infrastructure/user/__tests__/UserLocal.repository.test.ts` ⚠️ (crear)

---

### 9. **Falta Configuración de Testing**

**Problema**: No hay Vitest configurado en el proyecto

**Instalar**:
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Crear**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/__tests__/**',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Crear**: `vitest.setup.ts`
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

**Actualizar**: `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### 10. **Falta Validaciones en Entity**

**Problema**: La entity User no valida los datos de entrada

**Mejorar**: `src/core/user/domain/User.entity.ts`

```typescript
public static create(data: CreateUserData): User {
  // Validaciones
  if (!data.email || data.email.trim().length === 0) {
    throw new InvalidUserDataError('Email is required');
  }

  if (!data.name || data.name.trim().length === 0) {
    throw new InvalidUserDataError('Name is required');
  }

  if (data.name.length > 100) {
    throw new InvalidUserDataError('Name is too long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new InvalidUserDataError('Invalid email format');
  }

  return new User(
    crypto.randomUUID(),
    data.email.toLowerCase().trim(),
    data.name.trim(),
    new Date(),
    new Date()
  );
}
```

---

### 11. **Repository Sin Método `exists`**

**Problema**: La interface `UserRepository` no tiene método `exists`

**Agregar**: `src/core/user/domain/User.repository.ts`

```typescript
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}

export interface UserFilters {
  readonly name?: string;
  readonly email?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}
```

---

### 12. **Falta Shared Domain Errors**

**Problema**: Errores comunes no están centralizados

**Crear**: `src/core/shared/errors/DomainError.ts`

```typescript
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }
}

export class AlreadyExistsError extends DomainError {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} ${value} already exists`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}

export class InvalidArgumentError extends DomainError {
  constructor(argument: string, message: string) {
    super(`Invalid argument ${argument}: ${message}`);
  }
}
```

---

## 📋 Plan de Mejoras Prioritarias

### Prioridad ALTA 🔴
1. ✅ Implementar Value Objects (Email, UserId)
2. ✅ Crear Use Cases completos
3. ✅ Implementar DTOs
4. ✅ Configurar Vitest
5. ✅ Hacer constructor de Entity privado

### Prioridad MEDIA 🟡
6. ✅ Implementar HttpClient
7. ✅ Crear Mappers
8. ✅ Mejorar DI Container
9. ✅ Agregar validaciones en Entities
10. ✅ Crear Shared Domain Errors

### Prioridad BAJA 🟢
11. ✅ Escribir tests completos
12. ✅ Documentar patrones con JSDoc
13. ✅ Agregar filtros avanzados en repositorios
14. ✅ Implementar logging/tracing
15. ✅ Setup CI/CD con GitHub Actions

---

## 🎯 Siguientes Pasos

1. Implementar mejoras de prioridad ALTA
2. Actualizar documentación con ejemplos reales
3. Implementar módulo `product` o `order` como ejemplo
4. Configurar pre-commit hooks (husky + lint-staged)
5. Agregar GitHub Actions para CI/CD
6. Documentar patrones con ejemplos visuales

---

## 📚 Recursos Adicionales

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Value Objects - Martin Fowler](https://martinfowler.com/bliki/ValueObject.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
