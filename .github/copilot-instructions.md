# GitHub Copilot Instructions - Hexagonal Architecture + TDD

## 🏗️ Arquitectura del Proyecto

Este proyecto sigue **Clean Architecture (Hexagonal Architecture)** con **Domain-Driven Design (DDD)** y **Test-Driven Development (TDD)**.

### Principios Fundamentales

1. **Independencia del Framework**: El core no depende de React, Vite, ni ningún framework
2. **Testeable**: El dominio y la aplicación son fácilmente testeables sin dependencias externas
3. **Independencia de la UI**: La lógica de negocio no depende de la presentación
4. **Independencia de la Base de Datos**: El dominio no conoce cómo se persisten los datos
5. **Independencia de Agentes Externos**: El dominio no depende de APIs externas

---

## 📦 Estructura de Capas

### 1️⃣ **Core (Dominio + Aplicación)**

**Ubicación**: `src/core/{module}/`

#### Domain Layer (`domain/`)

- **Entidades**: Objetos con identidad única (`*.entity.ts`)
- **Value Objects**: Objetos inmutables sin identidad (`*.vo.ts`)
- **Repositorios**: Interfaces de contratos (`*.repository.ts`)
- **Errores de Dominio**: Excepciones específicas (`*.errors.ts`)
- **Tipos**: Definiciones de tipos (`*.types.ts`)
- **Tests**: Tests unitarios del dominio (`__tests__/*.test.ts`)

**Reglas**:

- ❌ NO importar nada de `infrastructure` o `presentation`
- ❌ NO depender de librerías externas (excepto utilidades puras)
- ✅ Solo lógica de negocio pura
- ✅ Entities deben ser inmutables (readonly properties)
- ✅ Todos los métodos públicos deben tener tipo de retorno explícito

#### Application Layer (`application/`)

- **Use Cases**: Casos de uso de la aplicación (`usecases/*.usecase.ts`)
- **DTOs**: Data Transfer Objects (`dtos/*.dto.ts`)
- **Interfaces de Servicios**: Contratos de servicios externos
- **Tests**: Tests de casos de uso (`__tests__/*.test.ts`)

**Reglas**:

- ❌ NO importar nada de `infrastructure` o `presentation`
- ✅ Orquestar el dominio para cumplir casos de uso
- ✅ Recibir dependencias mediante inyección (constructor)
- ✅ Validar datos de entrada antes de pasar al dominio

---

### 2️⃣ **Infrastructure (Adaptadores Externos)**

**Ubicación**: `src/infrastructure/{module}/`

**Responsabilidades**:

- Implementaciones concretas de repositorios
- Clientes HTTP/API
- Servicios de almacenamiento (localStorage, IndexedDB)
- Mappers (conversión entre DTOs externos y entidades de dominio)
- Configuración de dependencias

**Reglas**:

- ✅ Implementar interfaces definidas en el dominio
- ✅ Usar mappers para transformar datos externos
- ❌ NO exponer detalles de implementación al dominio
- ✅ Manejar errores de infraestructura y transformarlos a errores de dominio

#### Dependency Injection Container (`di/container.ts`)

- Gestión centralizada de dependencias
- Configuración según entorno (dev/prod)
- Singleton pattern para servicios compartidos

---

### 3️⃣ **Presentation (UI Layer)**

**Ubicación**: `src/presentation/{module}/`

#### Estructura por Módulo:

```
presentation/{module}/
├── components/       # Componentes React específicos del módulo
├── pages/           # Páginas/Vistas del módulo
├── hooks/           # Custom hooks del módulo
├── view-models/     # ViewModels (lógica de presentación)
├── adapters/        # Adaptadores entre UI y Application Layer
└── assets/          # Recursos estáticos del módulo
```

#### Shared Presentation:

```
presentation/shared/
├── components/ui/   # Componentes UI reutilizables (shadcn/ui)
├── hooks/          # Hooks compartidos
├── lib/            # Utilidades de UI (cn, etc)
├── styles/         # Estilos globales
└── assets/         # Recursos compartidos
```

**Reglas**:

- ✅ Usar ViewModels para lógica de presentación compleja
- ✅ Inyectar casos de uso mediante hooks
- ✅ Mantener componentes tontos (dumb components)
- ❌ NO incluir lógica de negocio en componentes
- ✅ Tipos explícitos solo cuando sea necesario para claridad
- ✅ Props interfaces siempre definidas
- ✅ Aprovechar inferencia de tipos de TypeScript

---

## 🎯 Convenciones de Código

### Naming Conventions

#### Archivos:

- **Entidades**: `{Entity}.entity.ts` → `User.entity.ts`
- **Value Objects**: `{ValueObject}.vo.ts` → `Email.vo.ts`
- **Repositorios (interface)**: `{Entity}.repository.ts` → `User.repository.ts`
- **Repositorios (impl)**: `{Entity}{Type}.repository.ts` → `UserApi.repository.ts`
- **Use Cases**: `{Action}{Entity}.usecase.ts` → `CreateUser.usecase.ts`
- **DTOs**: `{Entity}.dto.ts` → `UserResponse.dto.ts`
- **Errores**: `{Entity}.errors.ts` → `User.errors.ts`
- **Tipos**: `{Entity}.types.ts` → `User.types.ts`
- **Tests**: `{Filename}.test.ts` → `User.entity.test.ts`
- **Componentes**: `{Component}.tsx` → `UserCard.tsx`
- **Hooks**: `use{Feature}.ts` → `useUser.ts`
- **ViewModels**: `{Feature}.viewmodel.ts` → `UserList.viewmodel.ts`
- **Adapters**: `{feature}.{type}.ts` → `user.validation.ts`, `user.mapper.ts`

#### Clases e Interfaces:

- **Entidades**: PascalCase → `User`, `Product`, `Order`
- **Interfaces**: PascalCase → `UserRepository`, `EmailService`
- **Use Cases**: PascalCase → `CreateUser`, `UpdateUserEmail`
- **Errores**: PascalCase + Error suffix → `UserNotFoundError`
- **DTOs**: PascalCase + DTO/Data suffix → `CreateUserDTO`, `UserData`
- **Types**: PascalCase → `UserId`, `UserEmail`

#### Variables y Funciones:

- **camelCase** para todo: `findUserById`, `userRepository`, `createUser`
- **UPPER_SNAKE_CASE** para constantes: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

---

## 🧪 Testing Strategy

### Test-Driven Development (TDD)

**Proceso RED-GREEN-REFACTOR**:

1. 🔴 **Red**: Escribir test que falla
2. 🟢 **Green**: Escribir código mínimo para pasar el test
3. 🔵 **Refactor**: Mejorar el código manteniendo tests verdes

### Ubicación de Tests:

```
{module}/
├── domain/
│   ├── User.entity.ts
│   └── __tests__/
│       └── User.entity.test.ts
├── application/
│   ├── usecases/
│   │   └── CreateUser.usecase.ts
│   └── __tests__/
│       └── CreateUser.usecase.test.ts
```

### Tipos de Tests:

1. **Unit Tests** (Dominio y Application):
   - Testear entidades aisladas
   - Testear value objects
   - Testear use cases con mocks de repositorios

2. **Integration Tests** (Infrastructure):
   - Testear repositorios reales
   - Testear mappers
   - Testear servicios HTTP

3. **Component Tests** (Presentation):
   - Testear componentes con React Testing Library
   - Testear hooks personalizados
   - Testear view models

---

## 📝 Patterns y Best Practices

### Entities (Domain Layer)

```typescript
/**
 * Entity - User
 * Representa un usuario en el sistema
 */
export class User {
  // Propiedades readonly para inmutabilidad
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  // Constructor privado - usar factory methods
  private constructor(id: string, email: string, name: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method para crear nueva instancia
  public static create(data: CreateUserData): User {
    // Validaciones de dominio aquí
    return new User(crypto.randomUUID(), data.email, data.name, new Date(), new Date());
  }

  // Factory method para reconstruir desde persistencia
  public static restore(data: RestoreUserData): User {
    return new User(data.id, data.email, data.name, data.createdAt, data.updatedAt);
  }

  // Método de comportamiento - devuelve nueva instancia
  public updateName(newName: string): User {
    // Validaciones aquí
    return new User(this.id, this.email, newName, this.createdAt, new Date());
  }

  // Método de comparación
  public equals(other: User): boolean {
    return this.id === other.id;
  }

  // Métodos de validación
  public isActive(): boolean {
    // Lógica de negocio
    return true;
  }
}
```

### Value Objects

```typescript
/**
 * Value Object - Email
 * Representa un email válido
 */
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
}
```

### Repository Interface (Domain)

```typescript
/**
 * Repository Interface - UserRepository
 * Define el contrato para persistencia de usuarios
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface UserFilters {
  readonly name?: string;
  readonly email?: string;
  readonly isActive?: boolean;
}
```

### Use Case (Application)

```typescript
/**
 * Use Case - CreateUser
 * Caso de uso para crear un nuevo usuario
 */
export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    // 1. Validar que el email no exista
    const existingUser: User | null = await this.userRepository.findByEmail(dto.email);
    if (existingUser !== null) {
      throw new UserEmailAlreadyExistsError(dto.email);
    }

    // 2. Crear entidad de dominio
    const user: User = User.create({
      email: dto.email,
      name: dto.name,
    });

    // 3. Persistir
    const savedUser: User = await this.userRepository.save(user);

    // 4. Retornar DTO
    return UserResponseDTO.fromEntity(savedUser);
  }
}
```

### Repository Implementation (Infrastructure)

```typescript
/**
 * Repository Implementation - UserApiRepository
 * Implementación usando API HTTP
 */
export class UserApiRepository implements UserRepository {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly mapper: UserMapper
  ) {}

  public async findById(id: string): Promise<User | null> {
    try {
      const response: ApiUserResponse = await this.httpClient.get<ApiUserResponse>(`/users/${id}`);
      return this.mapper.toDomain(response);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  public async save(user: User): Promise<User> {
    const dto: ApiUserRequest = this.mapper.toApi(user);
    const response: ApiUserResponse = await this.httpClient.post<ApiUserResponse>('/users', dto);
    return this.mapper.toDomain(response);
  }
}
```

### Component (Presentation)

```typescript
/**
 * Component - UserCard
 * Componente para mostrar información de usuario
 */
interface UserCardProps {
  readonly userId: string;
  readonly onEdit?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  userId,
  onEdit,
  onDelete,
}: UserCardProps): React.JSX.Element => {
  const { user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return <Skeleton />;
  }

  if (error !== null) {
    return <ErrorMessage error={error} />;
  }

  if (user === null) {
    return <NotFound />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardFooter>
        {onEdit !== undefined && (
          <Button onClick={() => { onEdit(user.id); }}>Edit</Button>
        )}
        {onDelete !== undefined && (
          <Button onClick={() => { onDelete(user.id); }} variant="destructive">
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
```

### Custom Hook (Presentation)

```typescript
/**
 * Hook - useUser
 * Hook para gestionar estado de usuario
 */
interface UseUserReturn {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

export const useUser = (userId: string): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const repository = container.getUserRepository();
      const foundUser = await repository.findById(userId);
      setUser(foundUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect((): void => {
    void fetchUser();
  }, [fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
};
```

---

## ⚙️ TypeScript Configuration

### Configuración Estricta con Inferencia

El proyecto usa una configuración TypeScript estricta que balancea seguridad de tipos con productividad:

```jsonc
{
  "compilerOptions": {
    // Strict Mode completo
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "useUnknownInCatchVariables": true,

    // Validación de código no usado
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // Validación de flujo
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Validación de propiedades
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
  },
}
```

### ESLint - Inferencia de Tipos Permitida

La configuración de ESLint permite que TypeScript infiera tipos donde sea obvio, reduciendo ruido visual:

```javascript
{
  "@typescript-eslint/typedef": [
    "error",
    {
      // Permitir inferencia en la mayoría de casos
      "arrayDestructuring": false,
      "arrowParameter": false,
      "memberVariableDeclaration": false,
      "objectDestructuring": false,
      "parameter": false,
      "propertyDeclaration": false,
      "variableDeclaration": false,
      "variableDeclarationIgnoreFunction": true,
    }
  ]
}
```

**Filosofía de Tipado:**

- ✅ Tipos explícitos en **interfaces públicas** (props, parámetros de funciones exportadas)
- ✅ Tipos explícitos en **retornos de funciones** para claridad
- ✅ Tipos explícitos en **estados con tipos complejos** (`useState<User | null>`)
- ✅ Inferencia automática en **variables locales** y **destructuring**
- ✅ Inferencia automática en **hooks de React** (`const navigate = useNavigate()`)
- ❌ Evitar tipos redundantes que TypeScript puede inferir obviosamente

**TODO debe estar tipado explícitamente**:

- Variables
- Parámetros de funciones
- Retornos de funciones
- Propiedades de clases
- Destructuring

---

## 🚨 Reglas Críticas para GitHub Copilot

### ✅ SIEMPRE HACER:

1. **Tipado Explícito en Interfaces Públicas**:

   ```typescript
   // ✅ CORRECTO - Tipo explícito en retorno de función pública
   export const useUser = (userId: string): UseUserReturn => {
     const user = useState<User | null>(null); // Explícito en tipos complejos
     const navigate = useNavigate(); // Inferencia permitida
     // ...
   };
   ```

2. **Propiedades Readonly en Entities**:

   ```typescript
   // ✅ CORRECTO
   export class User {
     public readonly id: string;
     public readonly email: string;
   }
   ```

3. **Retornos Explícitos en Funciones Exportadas**:

   ```typescript
   // ✅ CORRECTO
   public async findById(id: string): Promise<User | null> {
     // ...
   }
   ```

4. **Inyección de Dependencias en Constructor**:

   ```typescript
   // ✅ CORRECTO
   export class CreateUser {
     constructor(private readonly userRepository: UserRepository) {}
   }
   ```

5. **Tests Junto al Código**:

   ```
   domain/
   ├── User.entity.ts
   └── __tests__/
       └── User.entity.test.ts
   ```

6. **NO usar tipos explícitos en Zod schemas**:

   ```typescript
   // ❌ INCORRECTO - tipo demasiado genérico
   export const userSchema: ReturnType<typeof z.object> = z.object({...})

   // ✅ CORRECTO - Zod infiere el tipo exacto
   export const userSchema = z.object({...})
   ```

### ❌ NUNCA HACER:

1. **NO importar Infrastructure en Core**:

   ```typescript
   // ❌ PROHIBIDO en domain/ o application/
   import { UserApiRepository } from '../../infrastructure/user/UserApi.repository';
   ```

2. **NO usar `any` o `unknown` sin validación**:

   ```typescript
   // ❌ INCORRECTO
   catch (error: any) {
     console.log(error);
   }

   // ✅ CORRECTO
   catch (error: unknown) {
     if (error instanceof Error) {
       console.error(error.message);
     }
   }
   ```

3. **NO mutar entities**:

   ```typescript
   // ❌ INCORRECTO
   user.name = 'New Name';

   // ✅ CORRECTO
   const updatedUser = user.updateName('New Name');
   ```

4. **NO lógica de negocio en Presentation**:

   ```typescript
   // ❌ INCORRECTO - en un componente
   const isValid = user.email.includes('@');

   // ✅ CORRECTO - en entity
   public isValidEmail(): boolean {
     // lógica de validación
   }
   ```

5. **NO acceso directo a repositorios desde componentes**:

   ```typescript
   // ❌ INCORRECTO
   const UserComponent = () => {
     const repo = new UserApiRepository();
   };

   // ✅ CORRECTO
   const UserComponent = () => {
     const { user } = useUser(userId); // Hook abstrae el acceso
   };
   ```

6. **NO usar tipos explícitos redundantes en Zod**:

   ```typescript
   // ❌ INCORRECTO - pierde inferencia de tipos
   const schema: ReturnType<typeof z.object> = z.object({
     email: z.string().email(),
   });

   // ✅ CORRECTO - Zod infiere tipos correctamente
   const schema = z.object({
     email: z.string().email(),
   });
   ```

7. **NO usar async handlers directamente en eventos de React**:

   ```typescript
   // ❌ INCORRECTO - async handler sin manejo de promesa
   const handleSubmit = async (data: FormData): Promise<void> => {
     await createUser(data);
     navigate('/users');
   };
   <form onSubmit={form.handleSubmit(handleSubmit)}>

   // ✅ CORRECTO - usar IIFE o callback sync con async interno
   const handleSubmit = (data: FormData): void => {
     // eslint-disable-next-line @typescript-eslint/no-floating-promises
     (async (): Promise<void> => {
       try {
         await createUser(data);
         navigate('/users');
       } catch (error: unknown) {
         handleError(error);
       }
     })();
   };
   ```

---

## 📋 Checklist al Crear Nuevos Módulos

Cuando crees un nuevo módulo (ej: `product`, `order`), sigue estos pasos:

### 1. Domain Layer

- [ ] `{Entity}.entity.ts` - Entidad principal
- [ ] `{Entity}.repository.ts` - Interface del repositorio
- [ ] `{Entity}.types.ts` - Tipos y interfaces
- [ ] `{Entity}.errors.ts` - Errores específicos del dominio
- [ ] `__tests__/{Entity}.entity.test.ts` - Tests de la entidad
- [ ] Value Objects si son necesarios (`*.vo.ts`)

### 2. Application Layer

- [ ] `usecases/Create{Entity}.usecase.ts`
- [ ] `usecases/Update{Entity}.usecase.ts`
- [ ] `usecases/Delete{Entity}.usecase.ts`
- [ ] `usecases/Get{Entity}.usecase.ts`
- [ ] `dtos/{Entity}.dto.ts`
- [ ] `__tests__/*.usecase.test.ts`

### 3. Infrastructure Layer

- [ ] `{Entity}Api.repository.ts` - Implementación con API
- [ ] `{Entity}Local.repository.ts` - Implementación local (opcional)
- [ ] `mappers/{Entity}.mapper.ts` - Mapeo entre API y Domain
- [ ] Actualizar `di/container.ts` con nuevas dependencias

### 4. Presentation Layer

- [ ] `components/` - Componentes específicos
- [ ] `hooks/use{Entity}.ts` - Hook principal
- [ ] `pages/` - Páginas del módulo
- [ ] `view-models/` - Si hay lógica compleja de presentación

### 5. Module Index

- [ ] `core/{module}/index.ts` - Exportar API pública del módulo

---

## 🔄 Flujo de Datos

```
User Interaction (Presentation)
      ↓
  Custom Hook
      ↓
  Use Case (Application)
      ↓
  Entity/Repository (Domain)
      ↓
  Repository Implementation (Infrastructure)
      ↓
  External API/Storage
```

---

## 🚀 Características Avanzadas Implementadas

### 1. **React Query con Optimistic Updates**

- Gestión de estado de servidor con caché inteligente
- Optimistic updates para mejor UX
- Auto-revalidación y sincronización
- Estados de loading, error y success automáticos

### 2. **Axios Interceptors con Retry Logic**

- Interceptor de request: auto-inyección de token JWT
- Interceptor de response: manejo automático de errores 401
- Retry logic para errores de red temporales
- Event system para comunicación entre capas

### 3. **JWT Authentication**

- Login/logout con token persistence
- Protected routes con guards
- Auto-logout en 401 errors
- AuthContext con React Context API
- useAuth hook para consumir auth state

### 4. **Form Validation con Zod**

- Schemas de validación type-safe
- Integración con react-hook-form
- Validación client-side antes de enviar al backend
- Mensajes de error personalizados

### 5. **Error Boundary**

- Captura de errores en componentes React
- Fallback UI amigable
- Logging de errores para debugging
- Reset de estado de error

### 6. **Toast Notifications (Sonner)**

- Notificaciones para feedback de usuario
- Success, error, warning, info
- Animaciones suaves
- Auto-dismiss configurable

---

## 📚 Referencias

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)

---

## 🎓 Ejemplos de Implementación

Ver el módulo `user` como referencia completa de implementación siguiendo todos estos patrones.
