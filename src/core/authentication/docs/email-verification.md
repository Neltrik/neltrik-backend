# Email Verification Entity

## 1. Entidad

La entidad **Email Verification** representa una solicitud temporal mediante la cual **Authentication** verifica que un usuario tiene acceso a la dirección de email asociada a su **Authentication Account**.

Cada Email Verification está asociada a una única **Authentication Account**.

La Email Verification pertenece exclusivamente al contexto de **Authentication** y no administra directamente la entidad `User` de **Identity**.

Una Email Verification tiene un período de validez limitado y solo puede completarse una vez.

### Email Verification

| Campo                     | Descripción                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `id`                      | Identificador único de la Email Verification.                           |
| `authenticationAccountId` | Identificador de la Authentication Account asociada.                    |
| `email`                   | Dirección de email para la cual se solicita la verificación.            |
| `tokenHash`               | Representación segura del token utilizado para validar la verificación. |
| `expiresAt`               | Fecha y hora a partir de la cual la solicitud deja de ser válida.       |
| `verifiedAt`              | Fecha y hora en la que la verificación fue completada. Nullable.        |
| `createdAt`               | Fecha de creación de la Email Verification.                             |

---

### Consideraciones

- Una Email Verification pertenece a una única `Authentication Account`.
- `authenticationAccountId` referencia una entidad administrada por `Authentication`.
- Authentication Verification no administra directamente la entidad `User`.
- El campo `email` representa la dirección de email que se pretende verificar.
- El `tokenHash` representa de forma segura el token utilizado para completar la verificación.
- El token original nunca debe almacenarse en texto plano.
- Una Email Verification debe poseer una fecha de expiración.
- Una Email Verification completada se identifica mediante `verifiedAt`.
- Una Email Verification expirada no puede completarse.
- Una Email Verification completada no puede reutilizarse.
- La verificación exitosa debe provocar la actualización de `emailVerified` en la `Authentication Account`.

## 2. Relaciones

```text
Authentication Account
1 ─────── N Email Verification
```

### Descripción

- Una **Authentication Account** puede tener múltiples solicitudes de `Email Verification` durante su ciclo de vida.
- Al generar una nueva solicitud de verificación, las solicitudes pendientes anteriores
  correspondientes a la misma Authentication Account deben quedar invalidadas.
- Cada **Email Verification** pertenece a una única `Authentication Account`.
- La relación se establece mediante `authenticationAccountId`.
- Una Authentication Account puede tener múltiples solicitudes históricas de verificación.
- Solo las solicitudes que permanezcan válidas pueden utilizarse para completar una verificación.
- La Email Verification no mantiene una relación directa con `User`.

> **Nota:** `User` pertenece al dominio `Identity`. La Email Verification se relaciona con el usuario indirectamente mediante `Authentication Account`.

## 3. Enums

La entidad **Email Verification** no utiliza tipos enumerados (`Enums`) para el MVP.

El estado de la solicitud se determina mediante sus atributos:

```text
verifiedAt = null
        │
        ├── expiresAt > now
        │       └── Solicitud pendiente y válida
        │
        └── expiresAt <= now
                └── Solicitud expirada

verifiedAt != null
        └── Solicitud completada
```

# 4. Reglas de negocio

### 4.1 Creación

- Toda `Email Verification` debe estar asociada a una única `Authentication Account`.
- La `Authentication Account` debe existir antes de crear una `Email Verification`.
- Toda `Email Verification` debe poseer una dirección de email.
- Toda `Email Verification` debe poseer un `tokenHash`.
- El token original nunca puede almacenarse.
- El `tokenHash` debe generarse mediante un mecanismo seguro.
- Toda `Email Verification` debe poseer una fecha de expiración.
- Una nueva solicitud de verificación puede generarse para una `Authentication Account` que aún no tenga su email verificado.
- La creación de una nueva solicitud no debe marcar el email como verificado.
- Una nueva solicitud de verificación debe comenzar con `verifiedAt = null`.

---

## 4.2 Validación y completación

- Una `Email Verification` solo puede utilizarse si no está expirada.
- Una `Email Verification` solo puede utilizarse si `verifiedAt` es `null`.
- El token proporcionado debe corresponder al `tokenHash` almacenado.
- La comparación debe realizarse contra el `tokenHash`, nunca contra el token original.
- Una verificación válida debe establecer `verifiedAt`.
- Una verificación completada no puede utilizarse nuevamente.
- Una verificación expirada no puede completarse.
- Una verificación completada debe actualizar `emailVerified` de la `Authentication Account` asociada a `true`.
- La actualización de `emailVerified` debe realizarse como resultado del proceso de verificación y no mediante una modificación directa de la `Authentication Account`.
- Al completar correctamente una verificación, las solicitudes de verificación pendientes correspondientes a la misma `Authentication Account` deben quedar invalidadas.

---

## 4.3 Expiración e invalidación

- Una `Email Verification` deja de ser válida cuando `expiresAt` es anterior o igual al momento actual.
- Una `Email Verification` completada no puede volver a utilizarse.
- Una `Email Verification` expirada no puede volver a utilizarse.
- La expiración no requiere necesariamente una operación de eliminación física.
- Las solicitudes históricas pueden conservarse de acuerdo con las políticas de persistencia de `Authentication`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

```text
email_verifications
```

### 5.2 Columnas

| Columna                     | Tipo         | Null | Default             | Observación                     |
| --------------------------- | ------------ | ---- | ------------------- | ------------------------------- |
| `id`                        | UUID         | ❌   | `gen_random_uuid()` | PK                              |
| `authentication_account_id` | UUID         | ❌   | —                   | FK                              |
| `email`                     | VARCHAR(320) | ❌   | —                   | Email a verificar               |
| `token_hash`                | VARCHAR(255) | ❌   | —                   | Representación segura del token |
| `expires_at`                | TIMESTAMP    | ❌   | —                   | Fecha de expiración             |
| `verified_at`               | TIMESTAMP    | ✅   | `NULL`              | Fecha de completación           |
| `created_at`                | TIMESTAMP    | ❌   | `NOW()`             | Fecha de creación               |

---

### 5.3 Restricciones

- `id` es la clave primaria.
- `authentication_account_id` es obligatorio.
- `authentication_account_id` debe referenciar una `Authentication Account` existente.
- `email` es obligatorio.
- `token_hash` es obligatorio.
- `token_hash` debe almacenar únicamente una representación segura del token.
- El token original nunca debe almacenarse.
- `expires_at` es obligatorio.
- `verified_at` puede ser `NULL`.
- Una Email Verification con `verified_at != NULL` se considera completada.
- Una Email Verification con `expires_at <= NOW()` se considera expirada.
- Una Email Verification completada no puede volver a utilizarse.

---

## 5.4 Índices

- PK(`id`)
- INDEX(`token_hash`)
- INDEX(`authentication_account_id`)
- INDEX(`expires_at`)
