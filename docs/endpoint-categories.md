# Categorías de Endpoints

Guía para clasificar cada endpoint de Neltrik antes de escribir código.

## Las 4 Categorías

| #   | Categoría      | Quién                 | Ejemplo          |
| --- | -------------- | --------------------- | ---------------- |
| 1   | Público        | Cualquiera (sin auth) | Login, Register  |
| 2   | Sistema        | PLATFORM_ADMIN        | Crear tenant     |
| 3   | Administrativo | Admins del tenant     | Suspender user   |
| 4   | Ownership      | El propio user        | Ver mis sesiones |

## Cómo Identificar

Preguntar en orden:

1. ¿Requiere autenticación?
    - NO → Público
    - SÍ → siguiente

2. ¿El `userId` viene del token?
    - SÍ → Ownership
    - NO → siguiente

3. ¿Es para gestionar Neltrik (tenants)?
    - SÍ → Sistema
    - NO → Administrativo

## Capas de Seguridad por Categoría

| Categoría      | Auth | Email | RBAC | Tenant Scope | Ownership |
| -------------- | ---- | ----- | ---- | ------------ | --------- |
| Público        | ❌   | ❌    | ❌   | ❌           | ❌        |
| Sistema        | ✅   | ✅    | ✅   | ❌ (bypass)  | ❌        |
| Administrativo | ✅   | ✅    | ✅   | ✅           | ❌        |
| Ownership      | ✅   | ✅    | ✅   | ✅           | ✅        |
