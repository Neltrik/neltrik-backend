# Permission Entity

## 1. Entidad

La entidad **Permission** representa una capacidad específica que puede ejecutarse dentro de **Neltrik**.

Cada **Permission** constituye la unidad mínima de autorización utilizada por la plataforma para controlar las acciones disponibles para los usuarios.

Los **Permissions** pertenecen exclusivamente al catálogo oficial definido por **Neltrik** y son asociados a los **Roles** para construir el modelo de autorización utilizado por toda la plataforma.

### Permission

| Campo         | Descripción                                                                          |
| ------------- | ------------------------------------------------------------------------------------ |
| `id`          | Identificador único del Permiso.                                                     |
| `code`        | Código único e inmutable que identifica funcionalmente al Permiso dentro de Neltrik. |
| `description` | Descripción oficial del propósito del Permiso dentro de la plataforma.               |
| `createdAt`   | Fecha de creación del Permiso.                                                       |
| `updatedAt`   | Fecha de la última actualización del Permiso.                                        |

---

### Consideraciones

- El atributo `code` constituye la identidad funcional del **Permission** y nunca puede modificarse una vez creado.
- Todo **Permission** pertenece exclusivamente al catálogo oficial definido por **Neltrik**.
- Un **Permission** representa una única capacidad dentro de la plataforma.
- Los **Permissions** únicamente pueden ser administrados por **Neltrik**.

## 2. Relaciones

```text
Permission

N ─────── N Role
```

### Descripción

- Un **Permission** puede estar asociado a múltiples **Roles**.
- Un **Role** puede estar asociado a múltiples **Permissions**.
- Las relaciones entre **Permission** y **Role** determinan las capacidades oficiales disponibles para cada Rol dentro de la plataforma.

> **Nota:** La asociación entre **Role** y **Permission** forma parte del modelo oficial de autorización definido por **Neltrik**. Los Tenants no pueden modificar estas asociaciones.

## 3. Enums

La entidad **Permission** no utiliza tipos enumerados (**Enums**) para el MVP.

Todas las reglas de negocio relacionadas con los Permisos se encuentran definidas mediante sus atributos y relaciones con los Roles oficiales administrados por **Neltrik**.

# 4. Reglas de negocio

## 4.1 Creación

- Todo `Permission` debe poseer un `code` único dentro de la plataforma.
- Todo `Permission` debe tener una `description`.
- El `code` de un `Permission` únicamente puede ser definido por **Neltrik**.
- Los Tenants no pueden crear Permissions.

---

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden modificarse únicamente por **Neltrik**:

- `description`

> **Nota:** La asociación de un `Permission` con uno o múltiples `Roles` forma parte de la administración del modelo de autorización y no de la actualización de la entidad.

### Campos no actualizables

Los siguientes campos nunca pueden modificarse:

- `id`
- `code`
- `createdAt`

### Restricciones

- Solo **Neltrik** puede actualizar un `Permission`.
- El `code` constituye la identidad funcional del `Permission` y es inmutable.

---

## 4.3 Eliminación

- Los Permissions oficiales no pueden eliminarse físicamente.
- Un `Permission` únicamente puede dejar de utilizarse mediante las reglas definidas por **Neltrik**.
- Los Tenants no pueden eliminar Permissions del catálogo oficial.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
permissions
```

---

## 5.2 Columnas

| Columna       | Tipo         | Null | Default             | Observación |
| ------------- | ------------ | ---- | ------------------- | ----------- |
| `id`          | UUID         | ❌   | `gen_random_uuid()` | PK          |
| `code`        | VARCHAR(150) | ❌   | —                   | UNIQUE      |
| `description` | TEXT         | ❌   | —                   |             |
| `created_at`  | TIMESTAMP    | ❌   | `NOW()`             |             |
| `updated_at`  | TIMESTAMP    | ❌   | `NOW()`             |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `code` debe ser único dentro de la plataforma.
- `code` es inmutable una vez creado.
- Todo `Permission` debe tener una `description`.

---

## 5.4 Índices

- PK(id)
- UNIQUE(code)
