# Role Entity

## 1. Entidad

La entidad **Role** representa una responsabilidad oficial definida por **Neltrik** dentro del modelo de autorización.

Cada Role determina las capacidades que puede ejecutar un usuario mediante el conjunto de **Permissions** que tiene asociados.

Los Roles pertenecen exclusivamente al catálogo oficial de **Neltrik** y constituyen la base sobre la cual se construye el modelo de autorización utilizado por toda la plataforma.

### Role

| Campo         | Descripción                                          |
| ------------- | ---------------------------------------------------- |
| `id`          | Identificador único del Rol.                         |
| `code`        | Código único e inmutable del Rol dentro de Neltrik.  |
| `displayName` | Nombre visible oficial del Rol definido por Neltrik. |
| `description` | Descripción funcional del Rol.                       |
| `createdAt`   | Fecha de creación del Rol.                           |
| `updatedAt`   | Fecha de la última actualización del Rol.            |

---

### Consideraciones

- El atributo `code` constituye la identidad funcional del Role y nunca puede modificarse una vez creado.
- El atributo `defaultDisplayName` representa el nombre visible definido oficialmente por Neltrik.
- Los Tenants nunca modifican el `defaultDisplayName`; cualquier personalización se realiza mediante la entidad `TenantRoleConfiguration`.
- Un Role pertenece exclusivamente al catálogo oficial de Roles de Neltrik.

## 2. Relaciones

```text
Role

N ─────── N Permission


Role

1 ─────── N TenantRoleConfiguration
```

### Descripción

- Un **Role** puede estar asociado a múltiples **Permissions**.
- Un **Permission** puede estar asociado a múltiples **Roles**.
- Un **Role** puede tener múltiples configuraciones de personalización (`TenantRoleConfiguration`).
- Cada **TenantRoleConfiguration** pertenece a un único **Role**.
- Las relaciones entre **Role** y **Permission** determinan las capacidades oficiales de cada Rol dentro de la plataforma.
- Las relaciones entre **Role** y **TenantRoleConfiguration** permiten personalizar únicamente la representación visual del Rol para cada Tenant, sin modificar su identidad funcional ni su comportamiento.

> **Nota:** La asignación de un **Role** a un **User** no forma parte de esta entidad. Esa responsabilidad pertenece al dominio **Identity**, el cual únicamente mantiene una referencia (`roleId`) al Rol asignado.

## 3. Enums

La entidad **Role** no utiliza tipos enumerados (**Enums**) para el MVP.

# 4. Reglas de negocio

## 4.1 Creación

- Todo `Role` debe poseer un `code` único dentro de la plataforma.
- Todo `Role` debe tener un `defaultDisplayName`.
- Todo `Role` debe tener una `description`.
- El `code` de un `Role` únicamente puede ser definido por **Neltrik**.
- Los Tenants no pueden crear Roles.

---

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden modificarse únicamente por **Neltrik**:

- `defaultDisplayName`
- `description`

> **Nota:** La actualización del conjunto de `Permissions` asociados al `Role` forma parte de la administración del modelo de autorización y no de la actualización de la entidad.

### Campos no actualizables

Los siguientes campos nunca pueden modificarse:

- `id`
- `code`
- `createdAt`

### Restricciones

- Solo **Neltrik** puede actualizar un `Role`.
- El `code` constituye la identidad funcional del `Role` y es inmutable.

---

## 4.3 Eliminación

- Los Roles oficiales no pueden eliminarse físicamente.
- Un `Role` únicamente puede dejar de utilizarse mediante las reglas definidas por **Neltrik**.
- Los Tenants no pueden eliminar Roles del catálogo oficial.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
roles
```

---

## 5.2 Columnas

| Columna                | Tipo         | Null | Default             | Observación |
| ---------------------- | ------------ | ---- | ------------------- | ----------- |
| `id`                   | UUID         | ❌   | `gen_random_uuid()` | PK          |
| `code`                 | VARCHAR(100) | ❌   | —                   | UNIQUE      |
| `default_display_name` | VARCHAR(100) | ❌   | —                   |             |
| `description`          | TEXT         | ❌   | —                   |             |
| `created_at`           | TIMESTAMP    | ❌   | `NOW()`             |             |
| `updated_at`           | TIMESTAMP    | ❌   | `NOW()`             |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `code` debe ser único dentro de la plataforma.
- `code` es inmutable una vez creado.
- Todo `Role` debe tener un `default_display_name`.
- Todo `Role` debe tener una `description`.

---

## 5.4 Índices

- PK(id)
- UNIQUE(code)
