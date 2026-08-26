# Authentication Session Entity

## 1. Entidad

La entidad **Authentication Session** representa una sesión autenticada de un usuario dentro de la plataforma.

Una Authentication Session se crea como resultado de una autenticación exitosa y permite mantener el acceso del usuario durante un período determinado sin requerir nuevamente sus credenciales principales.

Cada Authentication Session está asociada a una única **Authentication Account**.

La Authentication Session pertenece exclusivamente al contexto de **Authentication**.

### Authentication Session

| Campo                     | Descripción                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `id`                      | Identificador único de la Authentication Session.                         |
| `authenticationAccountId` | Identificador de la Authentication Account asociada a la sesión.          |
| `refreshTokenHash`        | Representación segura del Refresh Token utilizado para renovar la sesión. |
| `ipAddress`               | Dirección IP desde la que se creó la sesión (para auditoría y seguridad). |
| `userAgent`               | User-Agent del dispositivo desde el que se creó la sesión.                |
| `lastUsedAt`              | Fecha y hora del último uso de la sesión (para detectar inactividad).     |
| `expiresAt`               | Fecha y hora en la que la sesión deja de ser válida.                      |
| `refreshTokenExpiresAt`   | Fecha y hora en la que el Refresh Token deja de ser válido.               |
| `revokedAt`               | Fecha y hora en la que la sesión fue revocada, si corresponde.            |
| `createdAt`               | Fecha y hora de creación de la Authentication Session.                    |
| `updatedAt`               | Fecha y hora de la última actualización de la Authentication Session.     |

---

### Consideraciones

- Una Authentication Session pertenece a una única Authentication Account.
- Una Authentication Account puede tener múltiples Authentication Sessions.
- La Authentication Session representa el estado autenticado de la cuenta.
- La sesión posee un período de validez determinado mediante `expiresAt`.
- Una sesión puede ser revocada antes de su expiración mediante `revokedAt`.
- Una sesión expirada o revocada deja de ser válida para renovar el acceso.
- El Refresh Token se almacena únicamente mediante una representación segura (`refreshTokenHash`).
- El Refresh Token original nunca debe almacenarse en texto plano.
- El Access Token no forma parte de la persistencia de la Authentication Session.
- El Access Token representa una credencial temporal utilizada para acceder a la plataforma durante un período limitado.
- El Refresh Token representa la credencial utilizada para renovar la Authentication Session.
- Los tokens no constituyen entidades independientes del dominio.
- La Authentication Session no administra la entidad User de Identity.
- La Authentication Session se relaciona con el User de forma indirecta mediante la Authentication Account.

## 2. Relaciones

```text
Authentication Account
1 ─────── N Authentication Session
```

### Descripción

- Una **Authentication Account** puede tener múltiples Authentication Sessions.
- Una **Authentication Session** pertenece a una única Authentication Account.
- La relación se establece mediante `authenticationAccountId`.
- La Authentication Account pertenece al contexto de Authentication.
- El User relacionado con la sesión pertenece al dominio Identity y se obtiene mediante la Authentication Account.
- Authentication mantiene únicamente la referencia al User mediante `userId` dentro de Authentication Account.
- Una Authentication Session no administra directamente al User.
- Los Access Tokens y Refresh Tokens no constituyen relaciones con otras entidades del dominio.

> **Nota:** Una Authentication Session representa el estado autenticado de una Authentication Account. Los tokens son mecanismos técnicos utilizados para materializar y renovar dicha sesión.

## 3. Enums

La entidad Authentication Session no utiliza tipos enumerados (Enums) para el MVP.

El estado de una sesión se determina mediante su ciclo de vida:

- Una sesión activa es aquella que no ha expirado ni ha sido revocada.
- Una sesión expirada es aquella cuyo `expiresAt` ya fue alcanzado.
- Una sesión revocada es aquella que posee un `revokedAt`.

No se almacena un campo `status` como Enum.

# 4. Reglas de negocio

## 4.1 Creación

- Toda `Authentication Session` debe estar asociada a una única `Authentication Account`.
- Una `Authentication Session` únicamente puede crearse como resultado de una autenticación exitosa.
- Toda `Authentication Session` debe poseer un identificador único.
- Toda `Authentication Session` debe poseer una fecha de creación.
- Toda `Authentication Session` debe poseer una fecha de expiración.
- Una nueva sesión debe iniciar sin revocación.
- `revokedAt` debe permanecer vacío al momento de crear una sesión.
- Toda sesión debe poseer un Refresh Token asociado.
- El Refresh Token original nunca debe almacenarse.
- El Refresh Token debe almacenarse mediante un mecanismo seguro de hashing.
- Toda sesión debe poseer una fecha de expiración para el Refresh Token.
- El Access Token debe tener una duración limitada.
- El Refresh Token debe tener una duración mayor que el Access Token.
- La creación de una Authentication Session no modifica la Authentication Account.

---

## 4.2 Renovación

### Campos actualizables

- `refreshTokenHash` puede actualizarse durante la renovación de la sesión.
- `refreshTokenExpiresAt` puede actualizarse durante la renovación cuando corresponda.
- `updatedAt` debe actualizarse cuando se modifique la Authentication Session.
- Cuando se aplique Token Rotation, el Refresh Token utilizado debe quedar invalidado y debe generarse un nuevo Refresh Token.
- El nuevo Refresh Token debe almacenarse mediante su correspondiente `refreshTokenHash`.
- El Refresh Token original nunca debe quedar almacenado en texto plano.
- Al renovar la sesión, debe actualizarse lastUsedAt con la fecha y hora actual.

> **Nota:** La renovación debe realizarse mediante el proceso correspondiente de Authentication y nunca mediante una modificación directa de la entidad.

### Campos no actualizables

Los siguientes campos no pueden modificarse durante el ciclo de vida de la Authentication Session:

- `id`
- `authenticationAccountId`
- `createdAt`

### Restricciones

- Una sesión expirada no puede utilizarse para renovar el acceso.
- Una sesión revocada no puede utilizarse para renovar el acceso.
- Un Refresh Token expirado no puede utilizarse para renovar la sesión.
- Un Refresh Token inválido no puede utilizarse para renovar la sesión.
- La renovación debe validar que el Refresh Token corresponda a la sesión.
- La renovación debe respetar las políticas de seguridad definidas por Authentication.
- Cuando se aplique Token Rotation, el Refresh Token utilizado debe quedar invalidado y debe generarse un nuevo Refresh Token.
- El nuevo Refresh Token debe almacenarse mediante su correspondiente `refreshTokenHash`.
- El Refresh Token original nunca debe quedar almacenado en texto plano.

---

## 4.3 Revocación

- Una Authentication Session puede ser revocada antes de su expiración.
- La revocación debe registrarse mediante `revokedAt`.
- Una sesión revocada no puede utilizarse para renovar el acceso.
- La revocación de una sesión no elimina la Authentication Account.
- La revocación de una sesión no elimina el User perteneciente a Identity.
- Una sesión revocada permanece registrada para mantener el historial de su ciclo de vida.

---

## 4.4 Expiración

- Una Authentication Session deja de ser válida cuando alcanza `expiresAt`.
- Una sesión expirada no puede utilizarse para renovar el acceso.
- Un Refresh Token deja de ser válido cuando alcanza `refreshTokenExpiresAt`.
- La expiración de una sesión no implica la eliminación física de la Authentication Session.
- Una sesión expirada permanece registrada para mantener el historial de su ciclo de vida.

---

## 4.5 Eliminación

- Una Authentication Session no debe eliminarse físicamente como mecanismo de logout o revocación.
- El cierre de sesión debe realizarse mediante la revocación de la Authentication Session.
- La expiración de una sesión no requiere su eliminación física.
- La eliminación física de sesiones, si fuera necesaria por políticas de mantenimiento o retención, no forma parte del ciclo de vida de la entidad en el MVP.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

```text
authentication_sessions
```

## 5.2 Columnas

| Columna                     | Tipo      | Null | Default             | Observación                             |
| --------------------------- | --------- | ---- | ------------------- | --------------------------------------- |
| `id`                        | UUID      | ❌   | `gen_random_uuid()` | PK                                      |
| `authentication_account_id` | UUID      | ❌   | —                   | Referencia a Authentication Account     |
| `refresh_token_hash`        | TEXT      | ❌   | —                   | Hash del Refresh Token                  |
| `expires_at`                | TIMESTAMP | ❌   | —                   | Expiración de la Authentication Session |
| `refresh_token_expires_at`  | TIMESTAMP | ❌   | —                   | Expiración del Refresh Token            |
| `revoked_at`                | TIMESTAMP | ✅   | `NULL`              | Momento de revocación                   |
| `last_used_at`              | TIMESTAMP | ✅   | `NULL`              | Último uso de la sesión                 |
| `ip_address`                | VARCHAR   | ✅   | `NULL`              | Dirección IP desde la que se conectó    |
| `user_agent`                | TEXT      | ✅   | `NULL`              | User-Agent del dispositivo              |
| `created_at`                | TIMESTAMP | ❌   | `NOW()`             |                                         |
| `updated_at`                | TIMESTAMP | ❌   | `NOW()`             |                                         |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `authentication_account_id` es obligatorio.
- `authentication_account_id` debe corresponder a una Authentication Account válida.
- `refresh_token_hash` es obligatorio.
- El Refresh Token original nunca debe almacenarse.
- `expires_at` es obligatorio.
- `refresh_token_expires_at` es obligatorio.
- `revoked_at` puede ser `NULL` mientras la sesión no haya sido revocada.
- Una sesión sin `revoked_at` puede estar activa o expirada dependiendo de `expires_at`.
- Una sesión con `revoked_at` no puede utilizarse para renovar el acceso.
- Un Refresh Token cuya fecha `refresh_token_expires_at` haya sido alcanzada no puede utilizarse para renovar la sesión.
- `created_at` no puede modificarse después de la creación.
- `updated_at` debe actualizarse cuando se modifique la Authentication Session.
- No se almacena un campo `status`.
- No se almacena el Access Token.
- No se almacena el Refresh Token original.

---

## 5.4 Índices

- PK(`id`)
- INDEX(`authentication_account_id`)
- INDEX(`expires_at`)
- INDEX(`refresh_token_hash`)
