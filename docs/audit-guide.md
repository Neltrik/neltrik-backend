# Cuándo Auditar

Guía para decidir qué acciones deben auditarse en Neltrik.

## Objetivo

Garantizar que todas las acciones relevantes del sistema sean auditadas de forma consistente.

## Características para auditar

### 1. ¿Es una acción de negocio?

Ejemplos:

| Endpoint                   | ¿Auditar?        |
| -------------------------- | ---------------- |
| `POST /users`              | ✅ Sí (crea)     |
| `PATCH /users/:id/suspend` | ✅ Sí (modifica) |
| `GET /users`               | ❌ No (lee)      |

### 2. ¿Modifica el estado del sistema?

Ejemplos:

| Endpoint            | ¿Auditar?       |
| ------------------- | --------------- |
| `POST /users`       | ✅ Sí (crea)    |
| `DELETE /users/:id` | ✅ Sí (elimina) |
| `GET /users`        | ❌ No (lee)     |

### 3. ¿Tiene implicaciones de seguridad?

Ejemplos:

| Endpoint                | ¿Auditar?           |
| ----------------------- | ------------------- |
| `POST /auth/login`      | ✅ Sí               |
| `PATCH /users/:id/role` | ✅ Sí (privilegios) |
| `GET /users`            | ❌ No               |

### 4. ¿Es una acción administrativa?

Ejemplos:

| Endpoint            | ¿Auditar? |
| ------------------- | --------- |
| `POST /tenants`     | ✅ Sí     |
| `POST /invitations` | ✅ Sí     |
| `GET /tenants`      | ❌ No     |

## Ejemplos

### ✅ Auditar

| Endpoint                   | ¿Por qué?      |
| -------------------------- | -------------- |
| `POST /auth/login`         | Seguridad      |
| `POST /auth/register`      | Seguridad      |
| `PATCH /users/:id/suspend` | Seguridad      |
| `PATCH /users/:id/role`    | Seguridad      |
| `DELETE /users/:id`        | Negocio        |
| `POST /tenants`            | Administrativo |
| `POST /invitations`        | Administrativo |

### ❌ NO auditar

| Endpoint            | ¿Por qué?     |
| ------------------- | ------------- |
| `GET /users`        | Solo lee      |
| `GET /audit-events` | Solo lee      |
| `GET /health`       | No es negocio |

## Reglas de oro

1. ✅ **Auditar** acciones que modifican el estado
2. ✅ **Auditar** acciones de seguridad
3. ✅ **Auditar** acciones administrativas
4. ❌ **NO auditar** lecturas (GET)
5. ❌ **NO auditar** health checks
6. ❌ **NO auditar** endpoints técnicos (metrics)

## Implementación

Ver guía técnica en `core/audit/docs/`.
