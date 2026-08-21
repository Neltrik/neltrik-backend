# Invitation Entity

## 1. Entidad

La entidad **Invitation** representa el mecanismo mediante el cual un **Tenant** invita a un usuario específico a unirse a su organización dentro de **Neltrik**.

Cada Invitation está vinculada a un Tenant específico y está dirigida a un destinatario concreto. La invitación solo puede ser utilizada por el destinatario al que fue dirigida, ya que durante el registro Neltrik valida que el identificador de contacto proporcionado coincida con el `recipient` de la invitación.

La Invitation es extensible por diseño: el mecanismo de entrega puede variar (manual, email, sms, etc.) sin modificar la estructura fundamental de la entidad.

### Invitation

| Campo       | Descripción                                                                                                                                                                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | Identificador único de la Invitation.                                                                                                                                                                                                                                                                            |
| `tenantId`  | Identificador del Tenant que genera la invitación.                                                                                                                                                                                                                                                               |
| `roleId`    | Identificador del rol que se asignará al usuario cuando se registre usando esta invitación.                                                                                                                                                                                                                      |
| `recipient` | Identificador de contacto del destinatario al que va dirigida la invitación. Puede ser un email o un número de teléfono (o cualquier otro identificador que el sistema soporte en el futuro). Durante el registro, el sistema valida que el identificador proporcionado coincida exactamente con el `recipient`. |
| `mechanism` | Mecanismo de entrega utilizado (manual, email, sms, whatsapp, etc.). Es extensible y no está limitado a un conjunto cerrado de valores.                                                                                                                                                                          |
| `token`     | Token único utilizado para generar el enlace mágico de la invitación.                                                                                                                                                                                                                                            |
| `expiresAt` | Fecha y hora en que la invitación expira y deja de ser válida.                                                                                                                                                                                                                                                   |
| `status`    | Estado actual de la invitación (PENDING, USED, REVOKED, EXPIRED).                                                                                                                                                                                                                                                |
| `usedAt`    | Fecha y hora en que la invitación fue utilizada (null si no ha sido usada).                                                                                                                                                                                                                                      |
| `revokedAt` | Fecha y hora en que la invitación fue revocada (null si no ha sido revocada).                                                                                                                                                                                                                                    |
| `createdAt` | Fecha de creación de la Invitation.                                                                                                                                                                                                                                                                              |
| `updatedAt` | Fecha de la última actualización de la Invitation.                                                                                                                                                                                                                                                               |

---

### Consideraciones

- El `token` constituye el identificador único que se incluye en el enlace mágico: `https://neltrik.com/auth/register?token={token}`.
- El `recipient` es el identificador de contacto del destinatario. Durante el registro, Neltrik valida que el identificador proporcionado coincida con el `recipient` de la invitación.
- El `mechanism` determina cómo se entrega la invitación al destinatario. Es extensible y no está limitado a un conjunto cerrado de valores.
- La invitación se considera **pendiente** mientras no haya sido usada ni revocada, y su fecha de expiración no haya pasado.
- Una invitación **usada** o **revocada** no puede ser utilizada nuevamente.
- Una invitación **expirada** no puede ser utilizada, incluso si no ha sido usada ni revocada.
- El enlace mágico siempre contiene el `token`. La validación del `recipient` ocurre durante el registro, cuando el usuario proporciona su identificador de contacto.
- **La invitación es inmutable una vez creada.** Si se necesita un cambio (ej: `recipient` incorrecto), se debe revocar y crear una nueva.

---

## 2. Relaciones

La entidad **Invitation** mantiene las siguientes relaciones:

```text
Tenant (1) ──── (N) Invitation
```

## Descripción

- Una **Invitación** pertenece a un único **Tenant**.
- Un **Tenant** puede generar múltiples **Invitaciones**.
- La relación se establece mediante `tenantId`.
- La invitación está asociada a un rol (`roleId`) que se asignará al usuario cuando se registre.

> **Nota:** La relación con `Role` es referencial. La validación de que el `roleId` exista y sea válido dentro del Tenant es responsabilidad del caso de uso que crea la invitación.

## 3. Enums

### 3.1 InvitationStatus

Representa el estado actual de la invitación.

| Estado    | Descripción                                                             |
| --------- | ----------------------------------------------------------------------- |
| `PENDING` | La invitación está activa y puede ser utilizada.                        |
| `USED`    | La invitación ya fue utilizada para registrar un usuario.               |
| `REVOKED` | La invitación fue revocada por un administrador antes de ser utilizada. |
| `EXPIRED` | La invitación ha superado su fecha de expiración y ya no es válida.     |

#### Reglas de transición

| Transición          | Descripción                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `PENDING → USED`    | Ocurre cuando la invitación es utilizada exitosamente.                |
| `PENDING → REVOKED` | Ocurre cuando un administrador revoca la invitación.                  |
| `PENDING → EXPIRED` | Ocurre automáticamente cuando `expiresAt` es menor a la fecha actual. |
| `USED → *`          | No se permiten transiciones desde `USED`.                             |
| `REVOKED → *`       | No se permiten transiciones desde `REVOKED`.                          |
| `EXPIRED → *`       | No se permiten transiciones desde `EXPIRED`.                          |

> **Nota:** El `recipient` puede ser un email, número de teléfono u otro identificador de contacto. Su formato y tipo dependen del mecanismo de entrega y de la estrategia de registro soportada por la plataforma.

# 4. Reglas de negocio

## 4.1 Creación

- Toda **Invitación** debe pertenecer a un **Tenant** existente.
- Toda **Invitación** debe tener un `recipient` válido (email o número de teléfono).
- Toda **Invitación** debe tener un `roleId` que corresponda a un rol válido dentro del Tenant.
- Toda **Invitación** debe tener un `mechanism` válido.
- El `token` debe ser generado automáticamente por el sistema y ser único.
- El `token` no puede ser modificado después de su creación.
- La invitación debe tener una fecha de expiración (`expiresAt`) calculada al momento de la creación.
- La fecha de expiración por defecto es **7 días después de la creación**.
- Toda **Invitación** se crea con `status = PENDING`.
- `usedAt` debe ser `NULL` al momento de la creación.
- `revokedAt` debe ser `NULL` al momento de la creación.

## 4.2 Actualización

- No hay campos actualizables.
- Una vez creada, la invitación es **inmutable**.
- Si se necesita realizar un cambio, se debe revocar la invitación y crear una nueva.

## 4.3 Uso (Consumo)

- Una **Invitación** solo puede ser utilizada por el destinatario al que fue dirigida.
- Para usar una invitación, el sistema debe validar que el identificador de contacto proporcionado coincida exactamente con el `recipient`.
- Una **Invitación** solo puede ser utilizada si `status = PENDING`.
- Al utilizar una invitación exitosamente, el sistema debe:
    - Cambiar `status` a `USED`.
    - Registrar la fecha y hora en `usedAt`.
- Una vez utilizada, la invitación no puede ser reutilizada.

## 4.4 Revocación

- Solo un usuario con rol **TenantAdmin** o superior puede revocar invitaciones.
- Un **TenantAdmin** solo puede revocar invitaciones de su propio Tenant.
- Un **PlatformAdmin** puede revocar invitaciones de cualquier Tenant.
- Solo una invitación con `status = PENDING` puede ser revocada.
- Al revocar una invitación, el sistema debe:
    - Cambiar `status` a `REVOKED`.
    - Registrar la fecha y hora en `revokedAt`.
- Una vez revocada, la invitación no puede ser utilizada.

## 4.5 Expiración

- La fecha de expiración (`expiresAt`) se establece al momento de la creación.
- La fecha de expiración por defecto es **7 días después de la creación**.
- La fecha de expiración no se puede modificar.
- Cuando `expiresAt` es menor a la fecha actual y `status = PENDING`, el sistema debe considerar la invitación como `EXPIRED`.
- Una invitación expirada no puede ser utilizada.
- La expiración no elimina la invitación de la base de datos.

### 4.6 Resumen de estados

| Estado      | ¿Puede usarse? | ¿Se puede actualizar? | ¿Se puede revocar? | ¿Se puede modificar expiresAt? |
| ----------- | -------------- | --------------------- | ------------------ | ------------------------------ |
| **PENDING** | ✅ Sí          | ✅ Sí                 | ❌ No              | ✅ Sí                          |
| **USED**    | ❌ No          | ❌ No                 | ❌ No              | ❌ No                          |
| **REVOKED** | ❌ No          | ❌ No                 | ❌ No              | ❌ No                          |
| **EXPIRED** | ❌ No          | ❌ No                 | ❌ No              | ❌ No                          |

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
invitations
```

---

## 5.2 Columnas

| Columna      | Tipo         | Null | Default             | Observación                        |
| ------------ | ------------ | ---- | ------------------- | ---------------------------------- |
| `id`         | UUID         | ❌   | `gen_random_uuid()` | PK                                 |
| `tenant_id`  | UUID         | ❌   | —                   | FK → tenants(id)                   |
| `role_id`    | UUID         | ❌   | —                   | Referencia al rol que se asignará  |
| `recipient`  | VARCHAR(255) | ❌   | —                   | Email o número de teléfono         |
| `mechanism`  | VARCHAR(50)  | ❌   | —                   | manual, email, sms, whatsapp, etc. |
| `token`      | VARCHAR(255) | ❌   | —                   | Token único                        |
| `expires_at` | TIMESTAMP    | ❌   | —                   | Fecha de expiración                |
| `status`     | ENUM         | ❌   | `'PENDING'`         | pending, used, revoked, expired    |
| `used_at`    | TIMESTAMP    | ✅   | `NULL`              | Fecha de uso                       |
| `revoked_at` | TIMESTAMP    | ✅   | `NULL`              | Fecha de revocación                |
| `created_at` | TIMESTAMP    | ❌   | `NOW()`             |                                    |
| `updated_at` | TIMESTAMP    | ❌   | `NOW()`             |                                    |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` es obligatorio y debe referenciar un Tenant existente.
- `role_id` es obligatorio.
- `recipient` es obligatorio.
- `mechanism` es obligatorio.
- `token` es único y obligatorio.
- `expires_at` es obligatorio.
- `status` es obligatorio y debe contener un valor válido (`PENDING`, `USED`, `REVOKED`, `EXPIRED`).
- `status` inicia con el valor `PENDING`.
- `used_at` puede ser `NULL`.
- `revoked_at` puede ser `NULL`.
- La transición de `status` debe cumplir con las reglas de negocio definidas en el Paso 4.
- `used_at` solo debe contener un valor cuando `status = USED`.
- `revoked_at` solo debe contener un valor cuando `status = REVOKED`.

---

## 5.4 Índices

- `PK(id)`
- `UNIQUE(token)`
- `INDEX(tenant_id)`
- `INDEX(recipient)`
- `INDEX(expires_at)`
- `INDEX(status)`
