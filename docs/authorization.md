# Sistema de Autorización en Neltrik

Documentación de las capas de autorización implementadas en Neltrik.
Solo se documenta lo específico del proyecto: decisiones de diseño,
listas de modelos, flujos y convenciones propias.

> Nota: Conceptos genéricos como RBAC, JWT o RLS no se documentan
> aquí porque ya existen en documentación oficial.

## Tabla de Contenidos

1. Las 5 capas de autorización
2. Authentication
3. Email Verification
4. RBAC
5. Tenant Scope
6. Resource Scope
7. Decisiones de diseño
8. Troubleshooting

## Las 5 capas de autorización

Neltrik implementa 5 capas de seguridad que se aplican en orden:

| Capa                  | Pregunta            | Implementación                 | Estado |
| --------------------- | ------------------- | ------------------------------ | ------ |
| 1. Authentication     | ¿Quién eres?        | AuthenticationGuard            | ✅     |
| 2. Email Verification | ¿Email verificado?  | EmailVerifiedGuard             | ✅     |
| 3. RBAC               | ¿Qué puedes hacer?  | PermissionsGuard               | ✅     |
| 4. Tenant Scope       | ¿En qué tenant?     | TenantInterceptor + Middleware | ✅     |
| 5. Resource Scope     | ¿Sobre qué recurso? | Middleware de Prisma           | 🚧     |

## 1. Authentication

Responsabilidad: Validar que el usuario esté autenticado.

Implementación: AuthenticationGuard

Default: Todos los endpoints son privados.

Excepción: Usar @Public() para endpoints públicos (login, register, etc.).

Resultado: El guard inyecta en el request:

- user.userId
- user.tenantId
- user.roleCode
- user.sessionId
- account.emailVerified

## 2. Email Verification

Responsabilidad: Validar que el email del usuario esté verificado.

Implementación: EmailVerifiedGuard

Default: Todos los endpoints requieren email verificado.

Excepción: Usar @SkipEmailVerification() para endpoints que no requieren
email verificado (ej: reenviar verificación, cambiar email, etc.).

Orden de ejecución: Se ejecuta DESPUÉS de Authentication y ANTES de RBAC.

Razón: Un usuario con email no verificado no debería poder ejecutar
acciones sensibles aunque tenga los permisos necesarios.

Ejemplo de uso:

// Default: requiere email verificado
@Get('profile')
@Permissions('users:read')
public async getProfile() { ... }

// Excepción: no requiere email verificado
@Post('resend-verification')
@SkipEmailVerification()
public async resendVerification() { ... }

## 3. RBAC

Responsabilidad: Validar que el usuario tenga los permisos necesarios.

Implementación: PermissionsGuard

Default: Todos los endpoints requieren permisos.

Excepción: Usar @PublicPermission() para endpoints sin permisos.

## 4. Tenant Scope

Responsabilidad: Garantizar que un usuario solo vea datos de su tenant.

### ¿Cómo funciona?

```text
Request con JWT
    ↓
TenantInterceptor
    - Lee tenantId del JWT
    - Si es PLATFORM_ADMIN → tenantId = null
    - Guarda en AsyncLocalStorage
    ↓
Repositorios usan this.prisma.tenantClient
    ↓
Middleware de Prisma
    - Lee tenantId del AsyncLocalStorage
    - Si tenantId = null → NO filtra
    - Si tenantId existe → agrega WHERE tenantId
    ↓
Usuario solo ve datos de su tenant
```

### Modelos con tenantId

| Modelo                  | ¿Tiene tenantId? | Razón                                |
| ----------------------- | ---------------- | ------------------------------------ |
| User                    | ✅ Sí            | Un user pertenece a un tenant        |
| Role                    | ✅ Sí            | Un role pertenece a un tenant        |
| Permission              | ❌ No            | Es global, no pertenece a un tenant  |
| TenantRoleConfiguration | ✅ Sí            | Config específica del tenant         |
| Invitation              | ✅ Sí            | Invitación de un tenant específico   |
| AuthenticationAccount   | ✅ Sí            | Cuenta de un tenant específico       |
| AuthenticationSession   | ✅ Sí            | Sesión de un tenant específico       |
| EmailVerification       | ✅ Sí            | Verificación de un tenant específico |

### ¿Cómo agregar un nuevo modelo con tenantId?

1. Agregar tenantId al modelo en prisma/schema.prisma
2. Agregar el modelo a TENANT_MODELS en src/prisma/prisma.service.ts
3. Generar migración: pnpm prisma migrate dev
4. Listo

### Comportamiento de PLATFORM_ADMIN

| Aspecto              | Comportamiento                                          |
| -------------------- | ------------------------------------------------------- |
| tenantId en contexto | null                                                    |
| Middleware de Prisma | No filtra                                               |
| Resultado            | Ve datos de todos los tenants                           |
| Detección            | TenantInterceptor detecta roleCode === "PLATFORM_ADMIN" |

### Decisiones de diseño

| Decisión                            | Razón                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| AsyncLocalStorage                   | El tenantId se propaga automáticamente sin pasarlo por parámetros |
| Prisma Client Extension             | El filtro se aplica automáticamente en todas las queries          |
| tenantId = null para PLATFORM_ADMIN | Reutiliza la misma lógica sin código especial                     |
| Lista TENANT_MODELS                 | Control explícito de qué modelos tienen tenant                    |

## 5. Resource Scope

Responsabilidad: Garantizar que un usuario solo pueda ver, modificar
o eliminar recursos que le pertenecen.

### ¿Cómo funciona?

```text
Request con JWT
    ↓
TenantInterceptor
    - Lee userId del JWT
    - Lee isPlatformAdmin del JWT
    - Guarda en AsyncLocalStorage
    ↓
Repositorios usan this.prisma.tenantClient
    ↓
Middleware de Prisma
    - Lee userId del AsyncLocalStorage
    - Detecta si el modelo tiene ownerId
    - Si tiene → agrega WHERE ownerId = userId
    - Si es PLATFORM_ADMIN → NO filtra
    ↓
Usuario solo ve sus propios recursos
```

### Modelos con ownerId

| Modelo                | ¿Tiene ownerId? | Dueño                       |
| --------------------- | --------------- | --------------------------- |
| User                  | ✅ Sí           | Él mismo (ownerId = id)     |
| AuthenticationSession | ✅ Sí           | El user de la sesión        |
| Invitation            | ✅ Sí           | El user que la creó         |
| AuthenticationAccount | ❌ No           | 1:1 con User, no se lista   |
| EmailVerification     | ❌ No           | Temporal, no se lista       |
| Role                  | ❌ No           | Global, solo PLATFORM_ADMIN |
| Permission            | ❌ No           | Global, solo PLATFORM_ADMIN |
| Tenant                | ❌ No           | Global, solo PLATFORM_ADMIN |

### Metodología: ¿Cuándo agregar ownerId?

Antes de agregar ownerId a un modelo, responder estas 3 preguntas:

| Pregunta                                            | Agregar | No agregar |
| --------------------------------------------------- | ------- | ---------- |
| 1. ¿El recurso tiene un dueño claro?                | ✅      | ❌         |
| 2. ¿Un usuario normal puede modificarlo/eliminarlo? | ✅      | ❌         |
| 3. ¿El recurso tiene sentido sin un dueño?          | ❌      | ✅         |

Si las 3 respuestas apuntan a "agregar" → Agregar ownerId

Regla de oro:

✅ LLEVA ownerId si:

1. Tiene un dueño claro (user)
2. Un usuario normal puede modificarlo/eliminarlo
3. No tiene sentido sin un dueño

❌ NO LLEVA ownerId si:

1. Es global (Role, Permission, Tenant)
2. Solo PLATFORM_ADMIN lo gestiona
3. Es configuración del sistema

### ¿Cómo se genera el ownerId?

Se genera con idGenerator.generate() (igual que el id del recurso).

Razón: Consistencia con el resto del proyecto. Si mañana cambias
el generador (UUID, CUID, etc.), solo cambias el IdGenerator.

| Modelo                | ¿ownerId = id? | Ejemplo                              |
| --------------------- | -------------- | ------------------------------------ |
| User                  | ✅ Sí          | ownerId = user.id                    |
| AuthenticationSession | ❌ No          | ownerId = user.id (no session.id)    |
| Invitation            | ❌ No          | ownerId = user.id (no invitation.id) |

### ¿Cómo agregar un nuevo modelo con ownerId?

1. Agregar ownerId y relación owner al modelo en prisma/schema.prisma
2. Generar migración: pnpm prisma migrate dev
3. Asignar ownerId al crear el recurso (idGenerator.generate())
4. Listo (el middleware lo detecta automáticamente)

### Comportamiento de PLATFORM_ADMIN

| Aspecto              | Comportamiento                                          |
| -------------------- | ------------------------------------------------------- |
| userId en contexto   | Se ignora                                               |
| Middleware de Prisma | No filtra por ownership                                 |
| Resultado            | Ve y modifica recursos de cualquier usuario             |
| Detección            | TenantInterceptor detecta roleCode === "PLATFORM_ADMIN" |

### Decisiones de diseño

| Decisión                | Razón                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| Campo ownerId estándar  | Evita listas estáticas de modelos en el middleware               |
| Reflexión del schema    | El middleware detecta automáticamente si un modelo tiene ownerId |
| Sin listas estáticas    | Si agregas un modelo con ownerId, funciona automáticamente       |
| PLATFORM_ADMIN bypass   | Reutiliza la lógica del Tenant Scope                             |
| ownerId generado en app | Consistencia y flexibilidad                                      |

## Decisiones de diseño

### ¿Por qué AsyncLocalStorage?

| Alternativa                   | Problema                                               |
| ----------------------------- | ------------------------------------------------------ |
| Pasar tenantId por parámetros | Contamina todas las firmas de métodos                  |
| Usar request.user             | Acoplado a HTTP, no funciona en background jobs        |
| Variables globales            | Race conditions                                        |
| AsyncLocalStorage             | ✅ Aislado por request, funciona en cualquier contexto |

### ¿Por qué Prisma Client Extension?

| Alternativa                 | Problema                                        |
| --------------------------- | ----------------------------------------------- |
| Filtrar en cada repositorio | Fácil olvidarse, código duplicado               |
| Usar RLS solamente          | No funciona para lógica de aplicación           |
| Prisma Client Extension     | ✅ Un solo lugar, automático, difícil olvidarse |

### ¿Por qué ownerId y no userId?

| Campo     | Problema                                     |
| --------- | -------------------------------------------- |
| userId    | No aplica a todos los modelos (ej: User)     |
| createdBy | No es consistente con el concepto de "dueño" |
| ownerId   | ✅ Estándar, consistente, genérico           |

## Troubleshooting

### Error: "tenantId is not defined"

Causa: El middleware no está leyendo el tenantId del contexto.
Solución: Verificar que TenantInterceptor esté guardando el contexto correctamente.

### Error: "No se encuentra el recurso aunque existe"

Causa: El middleware está aplicando ownerId pero el recurso no tiene ese campo asignado.
Solución: Verificar que el recurso se creó con ownerId = idGenerator.generate().

### PLATFORM_ADMIN no ve todos los datos

Causa: El interceptor no está detectando el rol correctamente.
Solución: Verificar que request.user.roleCode === "PLATFORM_ADMIN".

### El middleware no aplica tenant scope a un modelo nuevo

Causa: El modelo no está en TENANT_MODELS.
Solución: Agregar el modelo a TENANT_MODELS en prisma.service.ts.

### El middleware no aplica ownership a un modelo nuevo

Causa: El modelo no tiene el campo ownerId.
Solución: Agregar ownerId al modelo en schema.prisma. El middleware lo detecta automáticamente.
