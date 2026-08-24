# Authentication Account Entity

## 1. Entidad

La entidad **Authentication Account** representa la cuenta mediante la cual un **User** puede demostrar su identidad ante **Authentication**.

Cada Authentication Account está asociada a un único **User** administrado por **Identity** y utiliza un único **Authentication Provider**.

El Provider representa el mecanismo mediante el cual la cuenta puede autenticarse.

Para el MVP, el único Provider soportado será:

**Email + Password**

La Authentication Account pertenece exclusivamente al contexto de **Authentication**. Authentication mantiene una referencia al User mediante su identificador, pero no administra la entidad User.

### Authentication Account

| Campo           | Descripción                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| `id`            | Identificador único de la Authentication Account.                           |
| `userId`        | Identificador del User perteneciente al dominio Identity.                   |
| `provider`      | Provider mediante el cual la Authentication Account puede autenticarse.     |
| `emailVerified` | Indica si el email asociado a la Authentication Account ha sido verificado. |
| `email`         | Dirección de email utilizada por la Authentication Account.                 |
| `passwordHash`  | Representación segura de la contraseña utilizada por el Provider.           |
| `createdAt`     | Fecha de creación de la Authentication Account.                             |
| `updatedAt`     | Fecha de la última actualización de la Authentication Account.              |

---

### Consideraciones

- El atributo `userId` referencia exclusivamente a un User administrado por **Identity**.
- Authentication no crea, modifica ni administra directamente la entidad User.
- Una Authentication Account utiliza un único Provider.
- El Provider identifica el mecanismo mediante el cual la Authentication Account puede autenticarse.
- El conjunto de Providers es abierto y puede ampliarse posteriormente.
- Para el MVP, el único Provider soportado será `Email + Password`.
- El Provider de una Authentication Account es inmutable durante su ciclo de vida en el MVP.
- Para el Provider `Email + Password`, Authentication almacena únicamente el `passwordHash`.
- La contraseña original nunca debe almacenarse en texto plano.
- El `passwordHash` no debe permitir recuperar la contraseña original.

## 2. Relaciones

```text
Authentication Account
N ─────── 1 User
```

### Descripción

- Una **Authentication Account** está asociada a un único User.
- Un **User** puede existir sin una `Authentication Account`.
- Un **User** puede estar asociado como máximo a una `Authentication Account`.
- La relación se establece mediante `userId`.
- El **User** pertenece al dominio **Identity**.
- **Authentication** mantiene únicamente la referencia al User y no administra su entidad.
- El `provider` forma parte de la propia `Authentication Account` y determina el mecanismo mediante el cual puede autenticarse.
- `Provider` no constituye una entidad ni una relación independiente dentro del dominio.

> **Nota:** La asignación de un **Role** a un **User** no forma parte de esta entidad. Esa responsabilidad pertenece al dominio **Identity**, el cual utiliza el modelo de Roles definido por **Authorization**.

## 3. Enums

La entidad Authentication Account no utiliza tipos enumerados (Enums) para el MVP.

# 4. Reglas de negocio

## 4.1 Creación

- Toda `Authentication Account` debe estar asociada a un único `User`.
- Una `Authentication Account` solo puede crearse para un `User` existente o creado previamente mediante el contrato público de `Identity`.
- Un `User` solo puede estar asociado a una única `Authentication Account`.
- Toda `Authentication Account` debe poseer un `provider`.
- Para el Provider `email-password`, la `Authentication Account` debe crearse con `emailVerified = false`.
- `emailVerified` únicamente puede cambiar a `true` como resultado de un proceso exitoso de `EmailVerification`.
- El conjunto de `Providers` es abierto y extensible.
- Para el MVP, el único `Provider` soportado será `email-password`.
- Toda `Authentication Account` debe poseer un email cuando el `Provider` utilizado requiera una dirección de email.
- Para el Provider `email-password`, toda `Authentication Account` debe poseer un `passwordHash`.
- La contraseña original nunca puede almacenarse.
- El `passwordHash` debe generarse mediante un mecanismo seguro de hashing.
- El `userId` debe corresponder a un `User` válido administrado por `Identity`.
- El `provider` utilizado durante la creación de la `Authentication Account` determina el mecanismo mediante el cual podrá autenticarse.

### Password

Password representa la contraseña original proporcionada durante los procesos
de creación o modificación de credenciales.

- La contraseña no forma parte del estado persistido de AuthenticationAccount.
- La contraseña debe tener una longitud entre 15 y 64 caracteres.
- No se requieren combinaciones obligatorias de mayúsculas, minúsculas, números
  ni caracteres especiales.
- Los espacios pueden formar parte de la contraseña.
- No debe aplicarse trim ni transformación de mayúsculas/minúsculas.
- La contraseña no debe ser almacenada directamente.
- La contraseña debe ser transformada mediante el mecanismo de hashing definido
  por Authentication antes de ser persistida.
- Las contraseñas comprometidas o incluidas en listas de contraseñas prohibidas
  no deben aceptarse cuando el mecanismo correspondiente forme parte del flujo.

---

## 4.2 Actualización

### Campos actualizables

- El `passwordHash` puede actualizarse mediante los procesos de cambio o recuperación de contraseña definidos por `Authentication`.
- `emailVerified` no se actualiza directamente mediante la modificación de la `Authentication Account`.
- `emailVerified` únicamente puede modificarse como resultado del proceso de `EmailVerification`.

> **Nota:** La actualización de credenciales debe realizarse mediante los casos de uso correspondientes y nunca mediante una modificación directa de la entidad.

### Campos no actualizables

Los siguientes campos no pueden modificarse durante el ciclo de vida de la `Authentication Account` en el MVP:

- `id`
- `userId`
- `provider`
- `createdAt`

### Restricciones

- El `provider` de una `Authentication Account` es inmutable durante su ciclo de vida en el MVP.
- Una `Authentication Account` no puede cambiar de `provider` mediante una actualización.
- El `userId` no puede reasignarse a otro `User`.
- Una cuenta creada con `email-password` no puede autenticarse posteriormente mediante otro `Provider`.
- Una cuenta creada con otro `Provider` no puede cambiar posteriormente a `email-password` ni a otro Provider.
- La incorporación de nuevos Providers no modifica las reglas de las cuentas existentes.

---

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
authentication_accounts
```

---

## 5.2 Columnas

| Columna          | Tipo         | Null | Default             | Observación                                   |
| ---------------- | ------------ | ---- | ------------------- | --------------------------------------------- |
| `id`             | UUID         | ❌   | `gen_random_uuid()` | PK                                            |
| `user_id`        | UUID         | ❌   | —                   | Referencia al User de Identity                |
| `provider`       | VARCHAR(100) | ❌   | —                   | Provider de autenticación                     |
| `email`          | VARCHAR(255) | ❌   | —                   | Email utilizado por la Authentication Account |
| `email_verified` | BOOLEAN      | ❌   | `FALSE`             | Indica si el email ha sido verificado         |
| `password_hash`  | TEXT         | ✅   | `NULL`              | Hash de contraseña para `email-password`      |
| `created_at`     | TIMESTAMP    | ❌   | `NOW()`             |                                               |
| `updated_at`     | TIMESTAMP    | ❌   | `NOW()`             |                                               |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `user_id` es obligatorio.
- `user_id` debe referenciar un User válido de Identity.
- Un User puede estar asociado como máximo a una Authentication Account.
- `provider` es obligatorio.
- `provider` se almacena como texto y no utiliza un tipo ENUM.
- El conjunto de Providers es abierto y extensible.
- Para el MVP, el único Provider soportado será `email-password`.
- `provider` es inmutable durante el ciclo de vida de la Authentication Account.
- `email` es obligatorio para el Provider `email-password`.
- `email_verified` es obligatorio y su valor inicial debe ser `FALSE` para el Provider `email-password`.
- `email_verified` no debe modificarse mediante una actualización directa de la Authentication Account.
- `email_verified` únicamente puede pasar a `TRUE` como resultado de un proceso exitoso de Email Verification.
- `password_hash` es obligatorio para el Provider `email-password`.
- La contraseña original nunca debe almacenarse.
- `password_hash` debe contener únicamente una representación segura de la contraseña.
- `user_id` es único dentro de `authentication_accounts`.
- `created_at` no puede modificarse después de la creación.
- `updated_at` debe actualizarse cuando se modifique la Authentication Account.

---

## 5.4 Índices

- PK(`id`)
- UNIQUE(`user_id`)
- INDEX(`email`)
- INDEX(`provider`)
