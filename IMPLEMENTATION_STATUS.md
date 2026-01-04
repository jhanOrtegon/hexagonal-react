# 🎯 CONTINUACIÓN: Result Type + Domain Events

## ✅ COMPLETADO

### 1. Tests de Application Layer (45 tests ✅)

- CreateUser.usecase.test.ts
- UpdateUser.usecase.test.ts
- DeleteUser.usecase.test.ts
- GetAllUsers.usecase.test.ts
- GetUserById.usecase.test.ts

### 2. Result Type Infrastructure (20 tests ✅)

- Result.ts con Success/Failure
- Factory functions (ok, fail)
- Utilities (combine, fromPromise)
- Tests completos

## 🚧 PENDIENTE

### 3. Aplicar Result Type a Entities

**Modificar User.entity.ts:**

```typescript
// Cambiar:
public static create(data: CreateUserData): User {
  if (invalid) throw new Error();
  return new User(...);
}

// Por:
public static create(data: CreateUserData): Result<User, InvalidArgumentError> {
  if (invalid) return fail(new InvalidArgumentError(...));
  return ok(new User(...));
}
```

**Archivos a modificar:**

- `src/core/user/domain/User.entity.ts` - métodos create, updateEmail, updateName
- `src/core/user/application/usecases/*.usecase.ts` - todos los use cases
- `src/presentation/user/hooks/*.ts` - adaptar hooks para manejar Result

### 4. Domain Events

**Crear infraestructura:**

```typescript
// src/core/shared/domain/DomainEvent.ts
export interface DomainEvent {
  eventId: string;
  occurredOn: Date;
  aggregateId: string;
  eventName: string;
}

// src/core/shared/domain/AggregateRoot.ts
export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];
  protected addDomainEvent(event: DomainEvent): void;
  public getDomainEvents(): readonly DomainEvent[];
  public clearDomainEvents(): void;
}
```

**Crear eventos específicos:**

- `src/core/user/domain/events/UserCreated.event.ts`
- `src/core/user/domain/events/UserEmailChanged.event.ts`
- `src/core/user/domain/events/UserNameChanged.event.ts`

**Modificar User.entity.ts:**

```typescript
export class User extends AggregateRoot {
  public static create(...): Result<User, ...> {
    const user = new User(...);
    user.addDomainEvent(new UserCreated(user.id, user.email, user.name));
    return ok(user);
  }
}
```

**Crear EventBus:**

- `src/infrastructure/events/EventBus.ts`
- `src/infrastructure/events/handlers/*` - handlers para cada evento

## 📝 PRÓXIMOS PASOS

1. **Modificar User.entity.ts** para usar Result
2. **Actualizar Use Cases** para manejar Result
3. **Adaptar React Hooks** para manejar Result en UI
4. **Crear infraestructura de eventos**
5. **Agregar eventos a entities**
6. **Crear event handlers**
7. **Integrar EventBus en Use Cases**

## 🎓 COMANDOS ÚTILES

```bash
# Ejecutar todos los tests
pnpm test:run

# Ejecutar tests específicos
pnpm test:run src/core/user/application/__tests__

# Lint
pnpm lint

# Build
pnpm build
```

## 📊 PROGRESO

- ✅ Tests Application Layer: 100%
- ✅ Result Type Infrastructure: 100%
- ⏳ Result Type en Entities: 0%
- ⏳ Result Type en Use Cases: 0%
- ⏳ Result Type en UI: 0%
- ⏳ Domain Events Infrastructure: 0%
- ⏳ Domain Events en Entities: 0%
- ⏳ Event Handlers: 0%

**Total: 40% completado**
