# Dual-Mode Repository Pattern

## 🎯 Objetivo

Este proyecto implementa un **patrón de repositorio dual** que permite trabajar con **dos fuentes de datos diferentes** sin cambiar una línea de código en tu aplicación:

1. **LocalStorage Mode** (Desarrollo/Offline) - `UserLocalRepository`
2. **API Mode** (Producción/Backend real) - `UserApiRepository`

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                     Presentation Layer                        │
│  (React Components, Hooks, TanStack Query)                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ usa
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   Application Layer                           │
│  (Use Cases: CreateUser, GetUserById, etc.)                  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ depende de
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                     Domain Layer                              │
│              UserRepository Interface                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ implementado por
                        ▼
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│  UserLocal      │          │   UserApi       │
│  Repository     │          │   Repository    │
│                 │          │                 │
│  (localStorage) │          │  (Axios/API)    │
└─────────────────┘          └─────────────────┘
```

**Principio clave**: El código de la aplicación (Use Cases, Hooks, Components) **nunca sabe** qué repositorio está usando. El **Dependency Injection Container** decide qué implementación inyectar.

---

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Modo de desarrollo (usa LocalStorage)
VITE_USE_LOCAL_STORAGE=true

# Modo de producción (usa API real)
# VITE_USE_LOCAL_STORAGE=false
# VITE_API_URL=https://api.tuapp.com/v1
```

### 2. DI Container

El container (`src/infrastructure/di/container.ts`) decide qué repositorio usar:

```typescript
public getUserRepository(): UserRepository {
  if (this.userRepository === null) {
    const useLocal: boolean =
      this.environment === Environment.TEST ||
      import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

    this.userRepository = useLocal 
      ? new UserLocalRepository()  // 👈 LocalStorage
      : new UserApiRepository();   // 👈 API HTTP
  }
  return this.userRepository;
}
```

**Lógica**:
- `TEST` environment: **Siempre** usa LocalStorage
- `DEVELOPMENT/PRODUCTION`: Lee `VITE_USE_LOCAL_STORAGE` del `.env`

---

## 🚀 Modos de Operación

### Modo 1: LocalStorage (Desarrollo/Offline)

**Cuándo usarlo:**
- Desarrollo local sin backend
- Testing rápido de la UI
- Trabajo offline
- Demos/Prototipos

**Configuración:**
```bash
VITE_USE_LOCAL_STORAGE=true
```

**Ventajas:**
✅ No requiere backend funcionando  
✅ Datos persisten en el navegador  
✅ Desarrollo más rápido (sin latencia de red)  
✅ Perfecto para prototipado  

**Desventajas:**
❌ Datos solo en el navegador local  
❌ Sin sincronización entre dispositivos  
❌ Límite de ~10MB de storage  

**Implementación:**
```typescript
// src/infrastructure/user/UserLocal.repository.ts
export class UserLocalRepository implements UserRepository {
  private readonly STORAGE_KEY: string = 'hexagonal-tdd:users';

  // Lee/escribe en localStorage
  private getAllFromStorage(): User[] {
    const data: string | null = localStorage.getItem(this.STORAGE_KEY);
    // ...
  }

  public async findById(id: string): Promise<User | null> {
    const users: User[] = this.getAllFromStorage();
    return users.find((u: User) => u.id === id) ?? null;
  }
}
```

---

### Modo 2: API (Producción/Backend real)

**Cuándo usarlo:**
- Producción con backend real
- Integración con API REST
- Datos compartidos entre usuarios
- Autenticación/Autorización

**Configuración:**
```bash
VITE_USE_LOCAL_STORAGE=false
VITE_API_URL=https://api.tuapp.com/v1
```

**Ventajas:**
✅ Datos centralizados en el servidor  
✅ Sincronización entre dispositivos  
✅ Autenticación real  
✅ Escalable  

**Desventajas:**
❌ Requiere backend funcionando  
❌ Latencia de red  
❌ Dependencia de conexión a internet  

**Implementación:**
```typescript
// src/infrastructure/user/UserApi.repository.ts
export class UserApiRepository implements UserRepository {
  private readonly basePath: string = '/users';

  public async findById(id: string): Promise<User | null> {
    try {
      const response: UserResponseDTO = await httpClient.get<UserResponseDTO>(
        `${this.basePath}/${id}`
      );
      return this.mapToEntity(response);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
```

**HTTP Client (Axios):**
```typescript
// src/infrastructure/shared/http/axios.client.ts
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticación
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token: string | null = localStorage.getItem('auth_token');
  if (token !== null && config.headers !== undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🔄 Cómo Cambiar de Modo

### Durante Desarrollo

**1. LocalStorage → API:**
```bash
# .env
VITE_USE_LOCAL_STORAGE=false
VITE_API_URL=http://localhost:3000/api
```

**2. Reinicia el servidor de desarrollo:**
```bash
pnpm dev
```

### En Producción

**Build con Variables de Entorno:**
```bash
# Producción con API
VITE_USE_LOCAL_STORAGE=false VITE_API_URL=https://api.tuapp.com pnpm build

# O definir en .env.production
echo "VITE_USE_LOCAL_STORAGE=false" > .env.production
echo "VITE_API_URL=https://api.tuapp.com" >> .env.production
pnpm build
```

---

## 🧪 Testing

Los tests **siempre** usan LocalStorage (no requieren backend):

```typescript
// vitest.config.ts detecta environment === 'test'
// DIContainer automáticamente usa UserLocalRepository

describe('CreateUser Use Case', () => {
  it('should create a user', async () => {
    const repository: UserRepository = container.getUserRepository();
    // 👆 Devuelve UserLocalRepository en tests
    
    const useCase: CreateUser = new CreateUser(repository);
    const dto: CreateUserDTO = { name: 'Test', email: 'test@example.com' };
    
    const result: UserResponseDTO = await useCase.execute(dto);
    expect(result.name).toBe('Test');
  });
});
```

---

## 📋 Checklist de Integración

### Para el Repository LocalStorage:
- ✅ Implementa `UserRepository` interface
- ✅ Métodos síncronos (inmediatos) con retorno `Promise` para consistencia
- ✅ Persistencia en `localStorage` con `JSON.stringify/parse`
- ✅ Manejo de errores (storage full, parse errors)
- ✅ Método `clear()` para testing

### Para el Repository API:
- ✅ Implementa `UserRepository` interface
- ✅ Usa `httpClient` de Axios configurado
- ✅ Maneja errores HTTP (404 → `null`, otros → throw)
- ✅ Mapea responses de API a entidades de dominio
- ✅ Envía requests con DTOs serializables

### Para ambos:
- ✅ **Misma firma de métodos** (mismo interface)
- ✅ **Mismo comportamiento semántico** (ej: `findById` devuelve `null` si no existe)
- ✅ **Mismos tipos de retorno** (User entity, no DTOs)
- ✅ **Manejo de errores consistente**

---

## 🎓 Ventajas del Patrón

### 1. **Desarrollo Independiente**
Puedes desarrollar la UI completa **antes** de tener el backend listo.

### 2. **Testing más Fácil**
Los tests no necesitan mock de HTTP - usan LocalStorage real.

### 3. **Flexibilidad**
Cambias de modo con **una variable de entorno**, sin tocar código.

### 4. **Demos Offline**
Puedes mostrar la app sin conexión a internet.

### 5. **Migración Gradual**
Puedes migrar de LocalStorage a API **módulo por módulo**:
```typescript
// Usuarios en API, Productos en LocalStorage
public getUserRepository(): UserRepository {
  return new UserApiRepository(); // API
}

public getProductRepository(): ProductRepository {
  return new ProductLocalRepository(); // Local
}
```

---

## 🔍 Debugging

### Ver qué repositorio se está usando:

```typescript
// En cualquier componente/hook
const repository: UserRepository = container.getUserRepository();
console.log('Repository type:', repository.constructor.name);
// Output: "UserLocalRepository" o "UserApiRepository"
```

### Inspeccionar LocalStorage:

```javascript
// En DevTools Console
localStorage.getItem('hexagonal-tdd:users');
// Ver todos los usuarios guardados
```

### Monitorear llamadas HTTP (modo API):

TanStack Query DevTools está habilitado:
```tsx
// src/presentation/main.tsx
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

Abre DevTools y verás:
- Queries activas
- Cache hits/misses
- Network requests
- Invalidaciones

---

## 🚨 Errores Comunes

### 1. "Cannot read property of undefined"
**Causa**: `.env` no está configurado  
**Solución**: Crea `.env` con `VITE_USE_LOCAL_STORAGE=true`

### 2. "Network Error" en modo API
**Causa**: Backend no está corriendo o `VITE_API_URL` es incorrecta  
**Solución**: Verifica que el backend esté corriendo en la URL configurada

### 3. "localStorage is not defined" en tests
**Causa**: Vitest no tiene localStorage por defecto  
**Solución**: Ya configurado en `src/test/setup.ts`:
```typescript
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  // ...
};
```

### 4. Datos inconsistentes entre recargas
**Causa**: Cache de TanStack Query  
**Solución**: Borra cache manualmente:
```typescript
queryClient.clear(); // Borra todo el cache
```

---

## 📚 Próximos Pasos

### Para agregar un nuevo módulo (ej: Products):

1. **Crea interfaces en Domain**:
```typescript
// src/core/product/domain/types/repository.types.ts
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

2. **Implementa LocalRepository**:
```typescript
// src/infrastructure/product/ProductLocal.repository.ts
export class ProductLocalRepository implements ProductRepository {
  // Igual que UserLocalRepository pero con 'products' key
}
```

3. **Implementa ApiRepository**:
```typescript
// src/infrastructure/product/ProductApi.repository.ts
export class ProductApiRepository implements ProductRepository {
  private readonly basePath: string = '/products';
  // Igual que UserApiRepository
}
```

4. **Agrega al DI Container**:
```typescript
// src/infrastructure/di/container.ts
public getProductRepository(): ProductRepository {
  const useLocal: boolean = 
    this.environment === Environment.TEST || 
    import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

  return useLocal
    ? new ProductLocalRepository()
    : new ProductApiRepository();
}
```

5. **Listo!** Todos los Use Cases y Hooks funcionan con ambos modos automáticamente.

---

## 🎉 Conclusión

Este patrón te permite:
- ✅ Desarrollar sin backend
- ✅ Testing sin mocks complejos
- ✅ Cambiar de modo sin reescribir código
- ✅ Escalar de prototipo a producción
- ✅ Mantener código limpio y desacoplado

**¿Preguntas?** Revisa el código en:
- `src/infrastructure/di/container.ts` - Inyección de dependencias
- `src/infrastructure/user/UserLocal.repository.ts` - Implementación LocalStorage
- `src/infrastructure/user/UserApi.repository.ts` - Implementación API
- `ARCHITECTURE_PATTERN.md` - Guía completa de arquitectura
