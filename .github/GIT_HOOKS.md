# 🪝 Git Hooks Configuration

Este proyecto usa **Husky** y **lint-staged** para automatizar validaciones de código antes de commits y pushes.

---

## 📦 Dependencias

```json
{
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.2.7"
  }
}
```

---

## ⚙️ Configuración

### Husky

Husky gestiona los git hooks. Se inicializa automáticamente con:

```bash
pnpm prepare
```

Esto crea la carpeta `.husky/` con los hooks configurados.

### Lint-staged

Configuración en `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "tsc --noEmit"
    ]
  }
}
```

**Qué hace**:
- Ejecuta **ESLint** con auto-fix en archivos TypeScript/TSX staged
- Ejecuta **type-check** de TypeScript sin generar archivos
- Solo procesa archivos que están en el staging area (rápido)

---

## 🔍 Pre-commit Hook

**Archivo**: `.husky/pre-commit`

```bash
pnpm lint-staged
```

### ¿Qué verifica?

1. **ESLint**: Analiza y corrige automáticamente:
   - Errores de sintaxis
   - Imports no usados
   - Reglas de estilo
   - Errores de TypeScript ESLint
   - Best practices

2. **TypeScript Type-Check**: Verifica:
   - Tipos correctos
   - No errores de compilación
   - Strict mode compliance
   - No implicit any
   - Todas las reglas estrictas

### Flujo de ejecución

```
git add .
git commit -m "feat: new feature"
    ↓
🔍 Pre-commit hook se ejecuta
    ↓
✅ ESLint --fix en archivos staged
    ↓
✅ TypeScript type-check
    ↓
✅ Si todo pasa → Commit exitoso
❌ Si hay errores → Commit bloqueado
```

### Ejemplo de salida

```bash
$ git commit -m "feat: add user validation"

✔ Preparing lint-staged...
✔ Running tasks for staged files...
  ✔ *.{ts,tsx} — 3 files
    ✔ eslint --fix
    ✔ tsc --noEmit
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

[main 1a2b3c4] feat: add user validation
 3 files changed, 45 insertions(+), 10 deletions(-)
```

### Si hay errores

```bash
$ git commit -m "feat: add user validation"

✖ Running tasks for staged files...
  ✖ *.{ts,tsx} — 2 files
    ✖ eslint --fix [FAILED]
    ✖ tsc --noEmit [FAILED]

✖ eslint --fix:
  src/user/User.entity.ts
    12:5  error  Missing return type on function  @typescript-eslint/explicit-function-return-type

✖ tsc --noEmit:
  src/user/User.entity.ts(15,10): error TS2322: Type 'string | undefined' is not assignable to type 'string'.

✖ lint-staged failed due to errors
husky - pre-commit hook exited with code 1 (error)
```

---

## 🏗️ Pre-push Hook

**Archivo**: `.husky/pre-push`

```bash
#!/bin/sh

# Pre-push hook: Run build to ensure code compiles before pushing
echo "🏗️  Running build before push..."
pnpm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before pushing."
  exit 1
fi

echo "✅ Build successful! Proceeding with push..."
```

### ¿Qué verifica?

1. **TypeScript Compilation**: Compila todo el proyecto (`tsc -b`)
2. **Vite Build**: Genera el bundle de producción
3. **Build Errors**: Cualquier error de build bloquea el push

### Flujo de ejecución

```
git push origin main
    ↓
🏗️ Pre-push hook se ejecuta
    ↓
✅ tsc -b (TypeScript compilation)
    ↓
✅ vite build (Production bundle)
    ↓
✅ Si build exitoso → Push procede
❌ Si build falla → Push bloqueado
```

### Ejemplo de salida exitosa

```bash
$ git push origin main

🏗️  Running build before push...

> hexagonal-tdd@0.0.0 build
> tsc -b && vite build

vite v7.0.0 building for production...
✓ 234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-a1b2c3d4.css    5.23 kB │ gzip:  1.89 kB
dist/assets/index-e5f6g7h8.js   143.21 kB │ gzip: 46.12 kB
✓ built in 2.34s

✅ Build successful! Proceeding with push...

Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (7/7), done.
Writing objects: 100% (7/7), 1.23 KiB | 1.23 MiB/s, done.
Total 7 (delta 5), reused 0 (delta 0)
To github.com:user/repo.git
   abc123..def456  main -> main
```

### Si el build falla

```bash
$ git push origin main

🏗️  Running build before push...

> hexagonal-tdd@0.0.0 build
> tsc -b && vite build

src/user/User.entity.ts:15:10 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.

15   const email: string = data.email;
            ~~~~~

Found 1 error in src/user/User.entity.ts:15

error Command failed with exit code 1.

❌ Build failed! Fix errors before pushing.
error: failed to push some refs to 'github.com:user/repo.git'
```

---

## 🚀 Beneficios

### 1. **Calidad del Código Garantizada**
- ❌ Imposible commitear código con errores de linting
- ❌ Imposible commitear código con errores de tipos
- ❌ Imposible pushear código que no compila
- ✅ Repositorio siempre en estado deployable

### 2. **Feedback Rápido**
- ⚡ Pre-commit solo verifica archivos modificados (lint-staged)
- ⚡ Feedback inmediato antes de subir código
- ⚡ No necesitas esperar al CI/CD

### 3. **Estandarización del Equipo**
- 👥 Todos los desarrolladores tienen las mismas validaciones
- 👥 Configuración consistente en todos los entornos
- 👥 No depende de configuración local de VS Code

### 4. **Ahorro de Tiempo**
- 🚫 Evita pushes que van a fallar en CI/CD
- 🚫 Evita code reviews con errores obvios
- ✅ Auto-fix de ESLint arregla problemas automáticamente

---

## 🛠️ Mantenimiento

### Desactivar temporalmente (NO RECOMENDADO)

```bash
# Saltar pre-commit
git commit --no-verify -m "WIP: work in progress"

# Saltar pre-push
git push --no-verify
```

⚠️ **Advertencia**: Solo usar en casos excepcionales (WIP, emergency hotfix, etc.)

### Actualizar hooks

Si modificas los hooks en `.husky/`, asegúrate de que tengan permisos de ejecución:

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Re-instalar hooks

Si clonaste el repo y los hooks no funcionan:

```bash
pnpm prepare
```

---

## 🔧 Configuración Avanzada

### Agregar más validaciones al pre-commit

Edita `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "tsc --noEmit",
      "prettier --write"  // ← Agregar Prettier
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Agregar tests al pre-push

Edita `.husky/pre-push`:

```bash
#!/bin/sh

echo "🧪 Running tests..."
pnpm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

echo "🏗️  Running build..."
pnpm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ All checks passed!"
```

### Crear hook personalizado

Ejemplo: `.husky/commit-msg` para validar mensajes de commit:

```bash
#!/bin/sh

commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ Invalid commit message format!"
  echo "Format: type(scope): description"
  echo "Example: feat(user): add email validation"
  exit 1
fi
```

---

## 📊 Estadísticas

Con estos hooks, el proyecto garantiza:

- ✅ **0 errores de ESLint** en cada commit
- ✅ **0 errores de TypeScript** en cada commit
- ✅ **Build exitoso** en cada push
- ✅ **100% de archivos validados** antes de subir

---

## 📚 Referencias

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

**Fecha de configuración**: Enero 2026
**Husky version**: 9.1.7
**lint-staged version**: 16.2.7
