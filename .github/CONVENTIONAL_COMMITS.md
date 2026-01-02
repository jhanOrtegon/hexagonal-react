# 📝 Conventional Commits Guide

Este proyecto usa **Conventional Commits** para mantener un historial de commits limpio y generación automática de changelogs.

---

## 📖 ¿Qué son Conventional Commits?

**Conventional Commits** es una especificación para escribir mensajes de commit estructurados y legibles.

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Ejemplo Completo

```
feat(user): add email validation

Implement email validation using regex pattern.
Validates format and domain of email addresses.

Closes #123
```

---

## 🎯 Tipos de Commits

### **feat** - Nueva funcionalidad
```bash
git commit -m "feat(user): add user registration endpoint"
git commit -m "feat(product): implement product search"
```

### **fix** - Corrección de bugs
```bash
git commit -m "fix(api): resolve null pointer exception"
git commit -m "fix(user): prevent duplicate email registration"
```

### **docs** - Cambios en documentación
```bash
git commit -m "docs(readme): update installation instructions"
git commit -m "docs(api): add swagger documentation"
```

### **style** - Formato de código (no afecta lógica)
```bash
git commit -m "style(user): format code with prettier"
git commit -m "style: fix indentation in repository"
```

### **refactor** - Refactorización (sin cambios funcionales)
```bash
git commit -m "refactor(user): extract validation logic to separate class"
git commit -m "refactor(core): simplify entity creation"
```

### **perf** - Mejoras de rendimiento
```bash
git commit -m "perf(api): optimize database queries"
git commit -m "perf(user): add caching for user lookups"
```

### **test** - Agregar o actualizar tests
```bash
git commit -m "test(user): add unit tests for entity"
git commit -m "test(api): add integration tests for endpoints"
```

### **chore** - Tareas de mantenimiento
```bash
git commit -m "chore(deps): update dependencies"
git commit -m "chore(config): update eslint rules"
git commit -m "chore(hooks): configure git hooks"
```

### **ci** - Cambios en CI/CD
```bash
git commit -m "ci: add github actions workflow"
git commit -m "ci: update deployment pipeline"
```

### **build** - Cambios en sistema de build
```bash
git commit -m "build: update vite configuration"
git commit -m "build: add webpack optimization"
```

### **revert** - Revertir commit previo
```bash
git commit -m "revert: revert feat(user): add email validation"
```

---

## 🎯 Scopes (Alcance)

El **scope** indica qué parte del código afecta el commit:

### Módulos
- `user` - Módulo de usuarios
- `product` - Módulo de productos
- `order` - Módulo de órdenes

### Capas
- `core` - Capa de dominio/aplicación
- `infrastructure` - Capa de infraestructura
- `presentation` - Capa de presentación

### Otros
- `shared` - Código compartido
- `config` - Configuración
- `deps` - Dependencias
- `hooks` - Git hooks
- `tests` - Tests
- `docs` - Documentación

### Ejemplos

```bash
feat(user): add email validation
fix(product): resolve price calculation error
docs(readme): update getting started section
chore(deps): update react to v19
test(user): add integration tests
refactor(core): simplify repository pattern
```

---

## ✅ Reglas de Validación

### ❌ RECHAZADO

```bash
# Tipo inválido
git commit -m "added new feature"
❌ Error: type must be one of [feat, fix, docs, ...]

# Sin descripción
git commit -m "feat(user):"
❌ Error: subject may not be empty

# Descripción muy corta
git commit -m "feat(user): add"
❌ Error: subject must be at least 10 characters

# Mayúscula en descripción
git commit -m "feat(user): Add validation"
❌ Error: subject must be in lowercase

# Punto al final
git commit -m "feat(user): add validation."
❌ Error: subject may not end with period

# Scope con mayúscula
git commit -m "feat(User): add validation"
❌ Error: scope must be in lowercase
```

### ✅ ACEPTADO

```bash
git commit -m "feat(user): add email validation"
git commit -m "fix(api): resolve null pointer error"
git commit -m "docs(readme): update installation steps"
git commit -m "chore(deps): update dependencies to latest"
git commit -m "test(user): add unit tests for entity creation"
```

---

## 📝 Mensajes de Commit Completos

### Formato con Body y Footer

```
<type>(<scope>): <description>

<body>

<footer>
```

### Ejemplo

```
feat(user): add email validation

Implement comprehensive email validation:
- Regex pattern validation
- Domain verification
- Disposable email detection

Closes #123
BREAKING CHANGE: Email validation now rejects disposable email providers
```

### Body (Opcional)

- Explica **QUÉ** y **POR QUÉ** (no cómo)
- Separado por línea en blanco
- Múltiples párrafos permitidos
- Max 200 caracteres por línea

### Footer (Opcional)

- Referencias a issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Revisores: `Reviewed-by: John Doe`

---

## 🚀 Ejemplos Reales

### Feature con Breaking Change

```bash
git commit -m "feat(api): migrate to REST API v2

Replace GraphQL implementation with REST API.
Improves performance and simplifies client integration.

BREAKING CHANGE: All GraphQL endpoints are removed. 
Clients must migrate to REST API v2."
```

### Bug Fix

```bash
git commit -m "fix(user): prevent duplicate email registration

Add unique constraint check before user creation.
Prevents race condition in concurrent requests.

Closes #234"
```

### Refactor

```bash
git commit -m "refactor(core): extract repository interface

Move repository interfaces to domain layer.
Improves dependency inversion and testability."
```

### Documentation

```bash
git commit -m "docs(architecture): add hexagonal architecture guide

Document clean architecture principles and patterns.
Include examples and best practices."
```

---

## 🔧 Configuración del Proyecto

### commitlint.config.js

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'build', 'revert'
    ]],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [2, 'always', 'lower-case'],
  }
};
```

### Commit-msg Hook

El hook `.husky/commit-msg` valida automáticamente cada commit:

```bash
#!/bin/sh
npx --no -- commitlint --edit "$1"
```

---

## 🧪 Probar Validación

### Test Manual

```bash
# Crear commit válido
git commit -m "feat(user): add email validation logic"

# Crear commit inválido (para probar validación)
git commit -m "Added feature"
# ❌ Error: type-enum: type must be one of [feat, fix, ...]

# Ver reglas de commitlint
npx commitlint --help-rules
```

### Bypass (Solo Emergencias)

```bash
# Saltar validación (NO RECOMENDADO)
git commit --no-verify -m "emergency hotfix"
```

---

## 📊 Beneficios

### 1. **Historial Limpio**
```bash
git log --oneline
feat(user): add email validation
fix(api): resolve timeout error
docs(readme): update setup instructions
```

### 2. **Changelog Automático**
Herramientas como `standard-version` pueden generar changelogs:

```markdown
## [1.2.0] - 2026-01-02

### Features
- **user**: add email validation
- **product**: implement search functionality

### Bug Fixes
- **api**: resolve timeout error
- **user**: prevent duplicate registration
```

### 3. **Semantic Versioning Automático**
- `feat`: → Minor version (1.1.0 → 1.2.0)
- `fix`: → Patch version (1.1.0 → 1.1.1)
- `BREAKING CHANGE`: → Major version (1.1.0 → 2.0.0)

### 4. **Mejor Comunicación**
- Commits auto-explicativos
- Fácil de revisar en PRs
- Búsqueda eficiente en historial

---

## 🎓 Mejores Prácticas

### ✅ DO

```bash
# Específico y descriptivo
feat(user): add email validation with regex pattern

# Presente imperativo
fix(api): resolve null pointer exception

# Scope apropiado
refactor(core): simplify entity factory methods

# Minúsculas en descripción
docs(readme): update installation steps
```

### ❌ DON'T

```bash
# Muy vago
git commit -m "fix: fixed bug"

# Pasado
git commit -m "feat: added new feature"

# Mayúsculas
git commit -m "feat: Add validation"

# Sin scope cuando es específico
git commit -m "feat: add validation"  # ¿dónde?

# Muy largo
git commit -m "feat(user): add email validation and also refactor the entire user module and update tests and documentation"
```

---

## 📚 Recursos

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Semantic Versioning](https://semver.org/)

---

## 🔗 Integración con Tools

### Standard Version (Changelog Automation)

```bash
# Instalar
pnpm add -D standard-version

# Generar changelog y bump version
pnpm standard-version

# First release
pnpm standard-version --first-release
```

### Commitizen (Interactive Commits)

```bash
# Instalar
pnpm add -D commitizen cz-conventional-changelog

# Usar
pnpm exec git-cz
# Wizard interactivo para crear commits
```

---

**Fecha de implementación**: Enero 2, 2026  
**Versión**: 1.0.0  
**Status**: ✅ Activo y Funcionando
