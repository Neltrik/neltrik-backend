# User Entity

## 1. Entidad

La entidad **User** representa una persona que utiliza **Neltrik** y pertenece a una única organización (**Tenant**).

Cada User constituye la identidad digital de un usuario dentro de la plataforma, permitiéndole interactuar con los diferentes módulos según el rol que tenga asignado.

### User

| Campo         | Descripción                                                           |
| ------------- | --------------------------------------------------------------------- |
| `id`          | Identificador único del usuario.                                      |
| `firstName`   | Nombre del usuario.                                                   |
| `lastName`    | Apellido del usuario.                                                 |
| `email`       | Correo electrónico único que identifica al usuario dentro de Neltrik. |
| `tenantId`    | Identificador del Tenant al que pertenece el usuario.                 |
| `roleId`      | Identificador del rol asignado al usuario.                            |
| `status`      | Estado actual del usuario.                                            |
| `createdAt`   | Fecha de creación del usuario.                                        |
| `updatedAt`   | Fecha de la última actualización del usuario.                         |
| `suspendedAt` | Fecha en la que el usuario fue suspendido, cuando aplique.            |

---

### Consideraciones

- El correo electrónico constituye el identificador público del usuario dentro de la plataforma.
- El atributo `email` será modelado como un **Value Object** durante la implementación del dominio.
- Todo usuario pertenece obligatoriamente a un único **Tenant**.
- Todo usuario debe tener un único rol asignado.

## 2. Relaciones

La entidad **User** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N Users


Role

1 ─────── N Users
```

### Descripción

- Un **Tenant** puede tener múltiples **Users**.
- Todo **User** pertenece a un único **Tenant**.
- Un **Role** puede estar asignado a múltiples **Users**.
- Todo **User** posee un único **Role**.
- El **Tenant** proporciona el contexto organizacional utilizado para garantizar el aislamiento de los usuarios.
- El **Role** determina los permisos que el usuario tendrá dentro de la plataforma.

> **Nota:** La administración de los **Roles** pertenece al dominio **Authorization**. La entidad **User** únicamente mantiene una referencia (`roleId`) al rol asignado.

## 3. Enums

La entidad **User** utiliza los siguientes tipos enumerados para garantizar la integridad de los datos.

### 3.1 UserStatus

Representa el estado actual del usuario.

| Estado      | Descripción                                                    |
| ----------- | -------------------------------------------------------------- |
| `ACTIVE`    | El usuario se encuentra activo y puede utilizar la plataforma. |
| `SUSPENDED` | El usuario fue suspendido y no puede acceder a la plataforma.  |

# 4. Reglas de negocio

## 4.1 Creación

- El nombre del usuario es obligatorio.
- El apellido del usuario es obligatorio.
- El correo electrónico es obligatorio.
- Todo correo electrónico debe ser válido.
- El correo electrónico debe ser único dentro de la plataforma.
- Todo usuario debe pertenecer obligatoriamente a un `Tenant`.
- Todo usuario debe tener un `Role` asignado.
- Todo usuario inicia con el estado `ACTIVE`.
- La creación de un usuario solo puede ser realizada por un usuario autorizado.

---

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden modificarse según el caso de uso y el nivel de autorización correspondiente:

- `firstName`
- `lastName`
- `roleId`
- `status`

> **Nota:** La actualización del correo electrónico no forma parte del MVP.

### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`
- `email`
- `tenantId`
- `createdAt`

### Restricciones

- Solo usuarios autorizados pueden actualizar otros usuarios.
- Todo usuario puede actualizar únicamente la información permitida de su propia identidad.
- Un usuario suspendido puede actualizarse únicamente por un usuario autorizado.

---

## 4.3 Suspensión

- Solo usuarios autorizados pueden suspender un usuario.
- Solo un usuario con estado `ACTIVE` puede suspenderse.
- Al suspender un usuario, su estado cambia a `SUSPENDED`.
- Al suspender un usuario, el sistema registra la fecha en `suspendedAt`.
- Un usuario suspendido no puede acceder a la plataforma.

---

## 4.4 Reactivación

- Solo usuarios autorizados pueden reactivar un usuario.
- Solo un usuario con estado `SUSPENDED` puede reactivarse.
- Al reactivar un usuario, su estado cambia a `ACTIVE`.
- Al reactivar un usuario, el campo `suspendedAt` se establece en `NULL`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
users
```

---

## 5.2 Columnas

| Columna        | Tipo         | Null | Default             | Observación |
| -------------- | ------------ | ---- | ------------------- | ----------- |
| `id`           | UUID         | ❌   | `gen_random_uuid()` | PK          |
| `first_name`   | VARCHAR(100) | ❌   | —                   |             |
| `last_name`    | VARCHAR(100) | ❌   | —                   |             |
| `email`        | VARCHAR(255) | ❌   | —                   | UNIQUE      |
| `tenant_id`    | UUID         | ❌   | —                   | FK          |
| `role_id`      | UUID         | ❌   | —                   | FK          |
| `status`       | ENUM         | ❌   | `ACTIVE`            |             |
| `created_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `updated_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `suspended_at` | TIMESTAMP    | ✅   | `NULL`              |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `email` debe ser único dentro de la plataforma.
- `tenant_id` referencia el Tenant al que pertenece el usuario.
- `role_id` referencia el rol asignado al usuario.
- `status` inicia con el valor `ACTIVE`.
- `suspended_at` solo debe contener un valor cuando el usuario se encuentre suspendido.

---

## 5.4 Índices

- PK(id)
- UNIQUE(email)
- INDEX(tenant_id)
- INDEX(role_id)
- INDEX(status)
