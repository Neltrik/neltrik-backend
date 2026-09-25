# Sistema de Autorización en Neltrik

Documentación de las capas de autorización implementadas en Neltrik.
Solo se documenta lo específico del proyecto: decisiones de diseño,
listas de modelos, flujos y convenciones propias.

> Nota: Conceptos genéricos como RBAC, JWT o RLS no se documentan
> aquí porque ya existen en documentación oficial.

## Las 8 capas de autorización

Neltrik implementa 8 capas de seguridad que se aplican en orden:

| Capa                  | Pregunta            | Implementación                 | Default            | Excepción                |
| --------------------- | ------------------- | ------------------------------ | ------------------ | ------------------------ |
| 1. Authentication     | ¿Quién eres?        | AuthenticationGuard            | Privado            | @Public()                |
| 2. Email Verification | ¿Email verificado?  | EmailVerifiedGuard             | Requerido          | @SkipEmailVerification() |
| 3. User State         | ¿Cuenta activa?     | UserStateGuard                 | Requerido          | @SkipUserState()         |
| 4. Tenant State       | ¿Tenant activo?     | TenantStateGuard               | Requerido          | @SkipTenantState()       |
| 5. CSRF               | ¿Request legítimo?  | CsrfGuard                      | Requerido          | @Public()                |
| 6. RBAC               | ¿Qué puedes hacer?  | PermissionsGuard               | Requerido          | @PublicPermission()      |
| 7. Tenant Scope       | ¿En qué tenant?     | TenantInterceptor + Middleware | Filtra             | tenantId = null          |
| 8. Resource Scope     | ¿Sobre qué recurso? | Middleware de Prisma           | Filtra por ownerId | PLATFORM_ADMIN           |

## 1. Authentication

Valida que el usuario esté autenticado. Excepción: `@Public()`.

Inyecta en el request: `userId`, `tenantId`, `roleCode`, `sessionId`, `userState`, `accountState`, `tenantState`.

El JWT solo lleva identidad (`userId`, `tenantId`, `roleCode`, `sessionId`). El estado (`userState`, `accountState`, `tenantState`) se lee fresco desde DB en cada request vía `SessionValidator.resolve()`.

## 2. Email Verification

Valida que el email esté verificado. Excepción: `@SkipEmailVerification()`.

## 3. User State

Valida que el usuario esté `ACTIVE`. Excepción: `@SkipUserState()`.

Estados: `ACTIVE` (permite), `SUSPENDED` (403).

El estado se lee fresco desde DB en cada request, no del JWT. Esto garantiza
que una suspensión se refleje inmediatamente, incluso si se hace directo en DB.

Estados como `PENDING_VERIFICATION` o intentos fallidos de login pertenecen
a `AuthenticationAccount`, no a `User`, y se validan en otras capas o flujos.

## 4. Tenant State

Valida que el tenant esté `ACTIVE`. Excepción: `@SkipTenantState()`.

Estados: `ACTIVE` (permite), `SUSPENDED` (403).

Cuando un tenant es suspendido, todos sus usuarios quedan inhabilitados automáticamente, sin importar su estado individual. `PLATFORM_ADMIN` omite esta validación.

El estado se lee fresco desde DB en cada request, no del JWT. Esto garantiza que una suspensión se refleje inmediatamente, incluso si se hace directo en DB.

## 5. CSRF

Valida que los requests mutantes (POST, PUT, PATCH, DELETE) provengan de un origen legítimo. Excepción: `@Public()`.

Aplica a requests mutantes. Los `GET` y endpoints públicos no requieren validación.

Cada request mutante debe incluir:

- Header `X-CSRF-Token` con el token firmado.
- Header `X-Requested-With: XMLHttpRequest`.
- Header `Origin` con el dominio del front.

El token CSRF se genera al autenticar (login y refresh), está firmado con HMAC y atado al `sessionId`. Se expone al cliente mediante cookie no httpOnly (`csrfToken`), para que el front lo lea y lo envíe en el header.

Configuración por entorno:

- `CSRF_SECRET` → secret para firmar los tokens (mínimo 32 caracteres).
- `COOKIE_SAME_SITE` → `strict` | `lax` | `none`. Cuando es `none`, `secure` se fuerza a `true`.

## 6. RBAC

Valida permisos. Excepción: `@PublicPermission()`.

## 7. Tenant Scope

Filtra por `tenantId` automáticamente vía Prisma Client Extension. `PLATFORM_ADMIN` ve todos los tenants (`tenantId = null`).

### Modelos con tenantId

User, Role, TenantRoleConfiguration, Invitation, AuthenticationAccount, AuthenticationSession, EmailVerification.

### Cómo agregar un modelo con tenantId

1. Agregar `tenantId` al schema.
2. Agregar el modelo a `TENANT_MODELS`.

## 8. Resource Scope

Filtra por `ownerId` automáticamente. `PLATFORM_ADMIN` ve todo.

### Modelos con ownerId

User, AuthenticationSession, Invitation.

### Cómo agregar un modelo con ownerId

1. Agregar `ownerId` al schema.
2. El middleware lo detecta automáticamente.

## Decisiones clave

- **JWT sin estado mutable.** El JWT solo lleva identidad (`userId`, `tenantId`, `roleCode`, `sessionId`). El estado (`userState`, `accountState`, `tenantState`) se lee fresco desde DB en cada request, aprovechando la validación de sesión que ya existe. Evita que un usuario suspendido siga operando con un token viejo.
- **`userState` y `accountState` separados.** `userState` agrupa campos del User (Identity). `accountState` agrupa campos del AuthenticationAccount. Cada uno se extiende sin afectar al otro (ej. `failedLoginAttempts` en `accountState`).
- **Join cross-módulo encapsulado.** La validación de sesión hace 1 query con joins a User, AuthenticationAccount y Tenant. El join está detrás del contrato `findByIdWithOwnerState`, así si Neltrik se parte en microservicios, solo cambia la implementación.
- **AsyncLocalStorage + Prisma Client Extension.** El `tenantId` y `userId` se propagan sin pasarlos por parámetros, y el filtro se aplica automáticamente en todas las queries.
- **`ownerId` y no `userId`.** Aplica a todos los modelos (incluido User), es consistente con el concepto de "dueño" y es genérico.
- **`tenantState` en el request.** El estado del tenant se lee fresco de DB en la misma query de validación de sesión (vía `owner.tenant`). Un tenant suspendido bloquea a todos sus usuarios. `PLATFORM_ADMIN` omite la validación.
- **CSRF con Signed Double-Submit (HMAC).** El token CSRF está firmado con HMAC y atado al `sessionId`. OWASP recomienda HMAC sobre double-submit simple porque el simple es bypassable si un atacante puede escribir cookies (ej. subdomain takeover). El token viaja en cookie (no httpOnly) y en header; el server verifica el HMAC contra la sesión actual.

## Troubleshooting

**Usuario suspendido sigue operando.**
Verificar que `AuthenticationGuard` lea `userState` desde `SessionValidator.resolve()` y no del JWT.

**UserStateGuard bloquea endpoints públicos.**
Agregar `@SkipUserState()` o `@Public()`.

**Suspensión en DB no se refleja.**
Verificar que `SessionValidator.resolve()` haga la query fresca con `include` a `User.status`.

**El middleware no aplica tenant scope/ownership a un modelo nuevo.**
Verificar que el modelo esté en `TENANT_MODELS` o tenga `ownerId` en el schema.

**Tenant suspendido sigue operando.**
Verificar que `AuthenticationGuard` lea `tenantState` desde `SessionValidator.resolve()` y no del JWT.

**TenantStateGuard bloquea endpoints públicos.**
Agregar `@SkipTenantState()` o `@Public()`.

**Suspensión de tenant en DB no se refleja.**
Verificar que `SessionValidator.resolve()` haga la query fresca con `include` a `owner.tenant.status`.

**Request mutante devuelve 403 "Invalid CSRF token".**
Verificar que el header `X-CSRF-Token` coincida con el token firmado para la sesión actual. Si el token expiró, hacer refresh.

**Request mutante devuelve 403 "Missing X-Requested-With header".**
Agregar el header `X-Requested-With: XMLHttpRequest` en el front.

**Request mutante devuelve 403 "Invalid origin".**
Verificar que el header `Origin` coincida con `FRONTEND_URL`.
