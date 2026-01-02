# 🏗️ Hexagonal Architecture + TDD - React + TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Proyecto frontend que implementa **Clean Architecture (Hexagonal)** + **Domain-Driven Design (DDD)** + **Test-Driven Development (TDD)** con React, TypeScript y Vite.

## 🎯 Características

- ✅ **Clean Architecture**: Separación completa entre dominio, aplicación, infraestructura y presentación
- ✅ **DDD**: Entidades, Value Objects, Repositories, Use Cases
- ✅ **TDD**: Tests unitarios e integración
- ✅ **TypeScript Super Estricto**: Tipado explícito obligatorio en TODO el código
- ✅ **Dependency Injection**: Container para inversión de dependencias
- ✅ **SOLID Principles**: Código mantenible y escalable
- ✅ **Inmutabilidad**: Entities y Value Objects inmutables

---

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18+
- pnpm 8+

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd hexagonal-tdd

# Instalar dependencias
pnpm install

# Iniciar en desarrollo
pnpm dev

# Build para producción
pnpm build

# Preview build
pnpm preview
```

### Scripts Disponibles

```bash
pnpm dev          # Desarrollo con HMR
pnpm build        # Build para producción
pnpm preview      # Preview del build
pnpm lint         # Ejecutar ESLint
pnpm lint:fix     # Auto-fix de errores
pnpm lint:strict  # ESLint sin warnings
pnpm type-check   # Validar tipos TypeScript
pnpm test         # Ejecutar tests (pendiente configurar)
pnpm prepare      # Inicializar git hooks (Husky)
```

### 🪝 Git Hooks (Husky)

El proyecto incluye **hooks de git automatizados** para mantener la calidad del código:

#### Pre-commit Hook 🔍
Ejecuta automáticamente **antes de cada commit**:
- ✅ **ESLint** con auto-fix en archivos staged
- ✅ **TypeScript type-check** para detectar errores de tipos

```bash
# Los hooks se ejecutan automáticamente, pero puedes probarlos manualmente:
pnpm lint-staged
```

#### Pre-push Hook 🏗️
Ejecuta automáticamente **antes de cada push**:
- ✅ **Build completo** (`tsc -b && vite build`)
- ✅ Verifica que el código compile correctamente
- ❌ Bloquea el push si el build falla

**Beneficios**:
- 🚫 Previene commits con errores de linting o tipos
- 🚫 Previene push de código que no compila
- ✅ Mantiene el repositorio siempre en estado deployable
- ⚡ Solo verifica archivos que cambiaron (lint-staged es rápido)

**Saltar hooks** (solo en casos excepcionales):
```bash
git commit --no-verify
git push --no-verify
```

---

## 📁 Estructura del Proyecto

```
src/
├── core/                    # ❤️ CORAZÓN - Lógica de negocio
│   ├── {module}/
│   │   ├── domain/         # Entidades, VOs, Repositorios (interfaces)
│   │   ├── application/    # Use Cases, DTOs
│   │   └── index.ts        # API pública del módulo
│   └── shared/             # Code compartido (VOs, errores, utils)
│
├── infrastructure/          # 🔌 ADAPTADORES - Implementaciones
│   ├── {module}/           # Repositorios concretos, Mappers
│   ├── shared/             # HttpClient, Storage, Config
│   └── di/                 # Dependency Injection Container
│
└── presentation/            # 🎨 UI - React Components
    ├── {module}/           # Componentes, Hooks, Pages, ViewModels
    └── shared/             # Componentes UI compartidos (shadcn/ui)
```

### Flujo de Dependencias

```
Presentation ──→ Application ──→ Domain
       ↓              ↓
Infrastructure ←──────┘
```

**Regla de oro**: Las capas internas NO conocen las externas.

---

## 🏛️ Arquitectura Hexagonal

### 1. Core Layer (Dominio + Aplicación)

#### Domain (`core/{module}/domain/`)

Contiene la **lógica de negocio pura**:

- **Entities**: Objetos con identidad única e inmutables
- **Value Objects**: Objetos sin identidad, inmutables
- **Repository Interfaces**: Contratos de persistencia
- **Domain Errors**: Excepciones del dominio
- **Types**: Tipos del dominio

**Ejemplo - Entity**:
```typescript
export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;

  private constructor(id: string, email: string, name: string) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  public static create(data: CreateUserData): User {
    // Validaciones aquí
    return new User(crypto.randomUUID(), data.email, data.name);
  }

  public updateName(newName: string): User {
    return new User(this.id, this.email, newName);
  }
}
```

#### Application (`core/{module}/application/`)

Orquesta el dominio:

- **Use Cases**: Casos de uso de la aplicación
- **DTOs**: Data Transfer Objects
- **Service Interfaces**: Contratos de servicios externos

**Ejemplo - Use Case**:
```typescript
export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existingUser: User | null = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser !== null) {
      throw new UserEmailAlreadyExistsError(dto.email);
    }

    const user: User = User.create(dto);
    const savedUser: User = await this.userRepository.save(user);

    return UserResponseDTO.fromEntity(savedUser);
  }
}
```

---

### 2. Infrastructure Layer

Implementa los **adaptadores externos**:

- **Repository Implementations**: API, LocalStorage, IndexedDB
- **HTTP Client**: Cliente para APIs REST
- **Mappers**: Conversión API ↔ Domain
- **DI Container**: Inyección de dependencias

**Ejemplo - Repository**:
```typescript
export class UserApiRepository implements UserRepository {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly mapper: UserMapper
  ) {}

  public async findById(id: string): Promise<User | null> {
    try {
      const response: ApiUserResponse = await this.httpClient.get(`/users/${id}`);
      return this.mapper.toDomain(response);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  }
}
```

---

### 3. Presentation Layer

Capa de **UI con React**:

- **Components**: Componentes React (dumb components)
- **Hooks**: Custom hooks para lógica de UI
- **Pages**: Páginas/vistas
- **ViewModels**: Lógica de presentación compleja

**Ejemplo - Hook**:
```typescript
export const useUser = (userId: string): UseUserReturn => {
  const [user, setUser]: [User | null, Dispatch<SetStateAction<User | null>>] = 
    useState<User | null>(null);

  useEffect((): void => {
    const repository: UserRepository = container.getUserRepository();
    void repository.findById(userId).then(setUser);
  }, [userId]);

  return { user };
};
```

---

## 🎯 Convenciones de Código

### TypeScript Super Estricto

El proyecto usa **tipado explícito obligatorio**:

```typescript
// ❌ INCORRECTO - Inferencia de tipos
const user = await repository.findById(id);

// ✅ CORRECTO - Tipo explícito
const user: User | null = await repository.findById(id);
```

### Naming Conventions

- **Entities**: `User.entity.ts`
- **Value Objects**: `Email.vo.ts`
- **Repositories**: `User.repository.ts` (interface), `UserApi.repository.ts` (impl)
- **Use Cases**: `CreateUser.usecase.ts`
- **DTOs**: `CreateUser.dto.ts`
- **Tests**: `User.entity.test.ts`

### Reglas Críticas

1. ❌ **NO** importar Infrastructure en Core
2. ❌ **NO** usar `any`
3. ❌ **NO** mutar entities
4. ✅ **SÍ** usar tipos explícitos siempre
5. ✅ **SÍ** inyectar dependencias en constructores

---

## 🧪 Testing

### TDD - Red, Green, Refactor

1. 🔴 **Red**: Escribir test que falla
2. 🟢 **Green**: Implementar código mínimo
3. 🔵 **Refactor**: Mejorar manteniendo tests verdes

### Estructura de Tests

```
domain/
├── User.entity.ts
└── __tests__/
    └── User.entity.test.ts

application/
├── usecases/
│   └── CreateUser.usecase.ts
└── __tests__/
    └── CreateUser.usecase.test.ts
```

---

## 📚 Documentación

- 📖 [Instrucciones Completas](./instructions.md)
- 🧠 [GitHub Copilot Instructions](./.github/copilot-instructions.md)
- 🔍 [Architecture Review](./ARCHITECTURE_REVIEW.md)

---

## 🛠️ Stack Tecnológico

### Core
- TypeScript 5.9+
- Clean Architecture
- Domain-Driven Design
- Test-Driven Development

### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- shadcn/ui

### Code Quality
- ESLint (super strict)
- TypeScript (strict mode + typedef)
- Vitest (tests)

---

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📞 Contacto

Para preguntas o sugerencias, abrir un issue.

---

**⭐ Si te gusta el proyecto, dale una estrella!**

