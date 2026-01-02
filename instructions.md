# 🧱 Arquitectura Frontend – Hexagonal + TDD

Este proyecto utiliza **React + Vite + TypeScript** siguiendo:
- **Clean Architecture (Hexagonal Architecture)**
- **Domain-Driven Design (DDD)**
- **Test-Driven Development (TDD)**
- **SOLID Principles**

## 🎯 Objetivos

- ✅ Alta escalabilidad y mantenibilidad
- ✅ Bajo acoplamiento entre capas
- ✅ Testeable al 100%
- ✅ Independencia de frameworks y librerías
- ✅ Tipado super estricto (TypeScript + ESLint)
- ✅ Separación clara de responsabilidades

---

## 🚀 Stack Tecnológico

### Core
- 🟦 **TypeScript 5.9+** (strict mode + ESLint typedef)
- 🧠 **Clean Architecture** (Hexagonal)
- 🧩 **Domain-Driven Design** (DDD)
- 🧪 **Test-Driven Development** (TDD)
- 🔌 **Dependency Injection Container**

### Frontend
- ⚛️ **React 19** (con TypeScript estricto)
- ⚡ **Vite 7** (build tool)
- 🎨 **Tailwind CSS 4** (estilos)
- 🎭 **shadcn/ui** (componentes)
- 📦 **pnpm** (package manager)

### Code Quality
- 🔍 **ESLint** (configuración super estricta)
- 📐 **TypeScript** (strict + noImplicitAny + typedef)
- 🧪 **Vitest** (unit tests - pendiente configurar)
- 🎭 **React Testing Library** (component tests - pendiente)

---

## 📁 Estructura de Carpetas

```txt
src/
├── core/
│   ├── user/
│   │   ├── domain/
│   │   │   ├── User.entity.ts
│   │   │   ├── User.repository.ts
│   │   │   ├── User.types.ts
│   │   │   ├── User.errors.ts
│   │   │   └── __tests__/
│   │   ├── application/
│   │   │   ├── usecases/
│   │   │   ├── dtos/
│   │   │   └── __tests__/
│   │   └── index.ts
│   │
│   ├── product/
│   │   ├── domain/
│   │   ├── application/
│   │   └── index.ts
│   │
│   ├── order/
│   │   ├── domain/
│   │   ├── application/
│   │   └── index.ts
│   │
│   └── shared/
│       ├── value-objects/
│       ├── errors/
│       └── utils/
│
├── infrastructure/
│   ├── user/
│   │   ├── UserApi.repository.ts
│   │   ├── UserLocal.repository.ts
│   │   └── mappers/
│   │
│   ├── product/
│   ├── order/
│   │
│   ├── shared/
│   │   ├── http/
│   │   ├── storage/
│   │   └── config/
│   │
│   └── di/
│       └── container.ts
│
└── presentation/
    ├── user/
    │   ├── components/
    │   ├── hooks/
    │   ├── adapters/
    │   ├── view-models/
    │   └── pages/
    │
    ├── product/
    └── shared/
        ├── components/
        └── hooks/
