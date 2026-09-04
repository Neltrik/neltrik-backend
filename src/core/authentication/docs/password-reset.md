# Password Reset Entity

## 1. Entidad

La entidad **Password Reset** representa una solicitud temporal mediante la cual un usuario puede recuperar el acceso a su cuenta de autenticación estableciendo una nueva contraseña.

Cada Password Reset está asociada a una única **Authentication Account**.

La Password Reset pertenece exclusivamente al contexto de **Authentication** y no administra directamente la entidad `User` de **Identity**.

Una Password Reset tiene un período de validez limitado y solo puede utilizarse una vez.

### Password Reset

| Campo                     | Descripción                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `id`                      | Identificador único del Password Reset.                                   |
| `authenticationAccountId` | Identificador de la Authentication Account asociada.                      |
| `tokenHash`               | Representación segura del token utilizado para validar el Password Reset. |
| `expiresAt`               | Fecha y hora a partir de la cual la solicitud deja de ser válida.         |
| `usedAt`                  | Fecha y hora en la que la solicitud fue utilizada. Nullable.              |
| `createdAt`               | Fecha de creación del Password Reset.                                     |
| `updatedAt`               | Fecha y hora de la última actualización del Password Reset.               |

---

### Consideraciones

- Un Password Reset pertenece a una única `Authentication Account`.
- `authenticationAccountId` referencia una entidad administrada por `Authentication`.
- Password Reset no administra directamente la entidad `User`.
- El `tokenHash` representa de forma segura el token utilizado para completar la recuperación.
- El token original nunca debe almacenarse en texto plano.
- Un Password Reset debe poseer una fecha de expiración.
- Un Password Reset utilizado se identifica mediante `usedAt`.
- Un Password Reset expirado no puede utilizarse.
- Un Password Reset utilizado no puede reutilizarse.
- El Password Reset no almacena la nueva contraseña.
- La nueva contraseña debe actualizarse en la `Authentication Account` mediante su `passwordHash`.
- `updatedAt` se actualiza automáticamente cuando el Password Reset es utilizado.

## 2. Relaciones

```text
Authentication Account
1 ─────── N Password Reset
```

# Descripción

- Una **Authentication Account** puede tener múltiples solicitudes de `Password Reset` durante su ciclo de vida.
- Cada **Password Reset** pertenece a una única `Authentication Account`.
- La relación se establece mediante `authenticationAccountId`.
- Una Authentication Account puede conservar múltiples solicitudes históricas de recuperación.
- Solo las solicitudes que permanezcan válidas pueden utilizarse para establecer una nueva contraseña.
- Password Reset no mantiene una relación directa con `User`.

> **Nota:** `User` pertenece al dominio `Identity`. Password Reset se relaciona con el usuario indirectamente mediante `Authentication Account`.

## 3. Enums

La entidad **Password Reset** no utiliza tipos enumerados (`Enums`) para el MVP.

El estado de la solicitud se determina mediante sus atributos:

```text
usedAt = null
        │
        ├── expiresAt > now
        │       └── Solicitud pendiente y válida
        │
        └── expiresAt <= now
                └── Solicitud expirada

usedAt != null
        └── Solicitud utilizada
```

# 4. Reglas de negocio

## 4.1 Creación

- Todo `Password Reset` debe estar asociado a una única `Authentication Account`.
- La `Authentication Account` debe existir antes de crear un `Password Reset`.
- Todo `Password Reset` debe poseer un `tokenHash`.
- El token original nunca puede almacenarse.
- El `tokenHash` debe generarse mediante un mecanismo seguro.
- Todo `Password Reset` debe poseer una fecha de expiración.
- Un nuevo `Password Reset` puede generarse para una `Authentication Account`.
- Una nueva solicitud debe comenzar con `usedAt = null`.
- La creación de un `Password Reset` no modifica la contraseña de la `Authentication Account`.
- La solicitud de recuperación no debe revelar si un email pertenece o no a un usuario cuando esto permita enumerar cuentas.

---

## 4.2 Validación y completación

- Un `Password Reset` solo puede utilizarse si no está expirado.
- Un `Password Reset` solo puede utilizarse si `usedAt` es `null`.
- El token proporcionado debe corresponder al `tokenHash` almacenado.
- Un Password Reset válido permite establecer una nueva contraseña para la `Authentication Account` asociada.
- La nueva contraseña debe almacenarse mediante un mecanismo seguro de hashing.
- La contraseña original nunca puede almacenarse.
- Una operación de recuperación completada debe establecer `usedAt`.
- Un Password Reset utilizado no puede utilizarse nuevamente.
- Un Password Reset expirado no puede utilizarse.
- El cambio de contraseña debe respetar las reglas de seguridad definidas por `Authentication`.
- El cambio de contraseña debe invalidar las sesiones que deban considerarse comprometidas según las políticas de seguridad definidas por `Authentication`.

---

## 4.3 Expiración e invalidación

- Un `Password Reset` deja de ser válido cuando `expiresAt` es anterior o igual al momento actual.
- Un `Password Reset` utilizado no puede volver a utilizarse.
- Un `Password Reset` expirado no puede volver a utilizarse.
- La expiración no requiere necesariamente una operación de eliminación física.
- Las solicitudes históricas pueden conservarse de acuerdo con las políticas de persistencia de `Authentication`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

```text
password_resets
```

### 5.2 Columnas

| Columna                     | Tipo         | Null | Default             | Observación                     |
| --------------------------- | ------------ | ---- | ------------------- | ------------------------------- |
| `id`                        | UUID         | ❌   | `gen_random_uuid()` | PK                              |
| `authentication_account_id` | UUID         | ❌   | —                   | FK                              |
| `token_hash`                | VARCHAR(255) | ❌   | —                   | Representación segura del token |
| `expires_at`                | TIMESTAMP    | ❌   | —                   | Fecha de expiración             |
| `used_at`                   | TIMESTAMP    | ✅   | `NULL`              | Fecha de utilización            |
| `created_at`                | TIMESTAMP    | ❌   | `NOW()`             | Fecha de creación               |
| `updated_at`                | TIMESTAMP    | ❌   | `NOW()`             | Fecha de actualización          |

---

### 5.3 Restricciones

- `id` es la clave primaria.
- `authentication_account_id` es obligatorio.
- `authentication_account_id` debe referenciar una `Authentication Account` existente.
- `token_hash` es obligatorio.
- `token_hash` debe almacenar únicamente una representación segura del token.
- El token original nunca debe almacenarse.
- `expires_at` es obligatorio.
- `used_at` puede ser `NULL`.
- Un Password Reset con `used_at != NULL` se considera utilizado.
- Un Password Reset con `expires_at <= NOW()` se considera expirado.
- Un Password Reset utilizado no puede volver a utilizarse.

---

### 5.4 Índices

- `PK(id)`
- `INDEX(authentication_account_id)`
- `INDEX(expires_at)`
- `INDEX(token_hash)`
