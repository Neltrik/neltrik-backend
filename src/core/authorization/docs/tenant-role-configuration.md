# TenantRoleConfiguration Entity

## 1. Entidad

La entidad **TenantRoleConfiguration** representa la configuración que un **Tenant** realiza sobre un **Role** oficial definido por **Neltrik**.

Su propósito es permitir que cada organización personalice la representación visual de los Roles habilitados para su Tenant sin modificar su identidad funcional, comportamiento o capacidades dentro de la plataforma.

### TenantRoleConfiguration

| Campo         | Descripción                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| `id`          | Identificador único de la configuración.                                                   |
| `tenantId`    | Identificador del Tenant propietario de la configuración.                                  |
| `roleId`      | Identificador del Role oficial al que pertenece la configuración.                          |
| `displayName` | Nombre visible utilizado por el Tenant para representar el Role dentro de su organización. |
| `createdAt`   | Fecha de creación de la configuración.                                                     |
| `updatedAt`   | Fecha de la última actualización de la configuración.                                      |

---

### Consideraciones

- Todo **TenantRoleConfiguration** pertenece obligatoriamente a un único **Tenant**.
- Todo **TenantRoleConfiguration** referencia obligatoriamente un único **Role** oficial.
- La personalización del `displayName` nunca modifica la identidad funcional (`code`) del **Role**.
- Un **TenantRoleConfiguration** únicamente puede existir para Roles habilitados para el **Tenant** correspondiente.

## 2. Relaciones

```text
Tenant

1 ─────── N TenantRoleConfiguration


Role

1 ─────── N TenantRoleConfiguration
```

### Descripción

- Un **Tenant** puede tener múltiples configuraciones de Roles (`TenantRoleConfiguration`).
- Todo **TenantRoleConfiguration** pertenece a un único **Tenant**.
- Un **Role** puede tener múltiples configuraciones realizadas por distintos **Tenants**.
- Todo **TenantRoleConfiguration** referencia un único **Role** oficial definido por **Neltrik**.
- La relación entre **Tenant** y **TenantRoleConfiguration** permite personalizar la representación visual de los Roles disponibles dentro de una organización.
- La relación entre **Role** y **TenantRoleConfiguration** garantiza que la personalización nunca altere la identidad funcional ni las capacidades oficiales del Role.

> **Nota:** La habilitación de un **Role** para un **Tenant** forma parte del modelo oficial de autorización definido por **Neltrik**. `TenantRoleConfiguration` únicamente almacena la personalización visual del Role dentro del Tenant.

## 3. Enums

La entidad **TenantRoleConfiguration** no utiliza tipos enumerados (**Enums**) para el MVP.

Todas las reglas de negocio relacionadas con la configuración de Roles se encuentran definidas mediante sus atributos y sus relaciones con las entidades **Tenant** y **Role**.

# 4. Reglas de negocio

## 4.1 Creación

- Todo `TenantRoleConfiguration` debe pertenecer obligatoriamente a un `Tenant`.
- Todo `TenantRoleConfiguration` debe referenciar un `Role` oficial definido por **Neltrik**.
- Todo `TenantRoleConfiguration` debe tener un `displayName`.
- Solo puede existir una configuración por cada combinación (`tenantId`, `roleId`).
- Un `TenantRoleConfiguration` únicamente puede crearse para un `Role` habilitado para el `Tenant`.

---

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden modificarse por un usuario autorizado del `Tenant`:

- `displayName`

### Campos no actualizables

Los siguientes campos nunca pueden modificarse:

- `id`
- `tenantId`
- `roleId`
- `createdAt`

### Restricciones

- La actualización del `displayName` nunca modifica el `code` ni la identidad funcional del `Role`.
- La actualización del `displayName` nunca modifica las `Permissions` asociadas al `Role`.
- La actualización del `displayName` nunca modifica el comportamiento del `Role` dentro de la plataforma.

---

## 4.3 Eliminación

- Un `TenantRoleConfiguration` puede eliminarse cuando el `Tenant` desee restablecer la configuración por defecto del `Role`.
- Al eliminar un `TenantRoleConfiguration`, el sistema utilizará nuevamente el `defaultDisplayName` definido por **Neltrik** para el `Role`.
- La eliminación de un `TenantRoleConfiguration` nunca elimina el `Role` oficial ni afecta a otros `Tenants`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
tenant_role_configurations
```

---

## 5.2 Columnas

| Columna        | Tipo         | Null | Default             | Observación |
| -------------- | ------------ | ---- | ------------------- | ----------- |
| `id`           | UUID         | ❌   | `gen_random_uuid()` | PK          |
| `tenant_id`    | UUID         | ❌   | —                   | FK          |
| `role_id`      | UUID         | ❌   | —                   | FK          |
| `display_name` | VARCHAR(100) | ❌   | —                   |             |
| `created_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `updated_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` referencia el Tenant propietario de la configuración.
- `role_id` referencia un Role oficial definido por **Neltrik**.
- Solo puede existir un registro por cada combinación (`tenant_id`, `role_id`).
- `display_name` es obligatorio.

---

## 5.4 Índices

- PK(id)
- UNIQUE(tenant_id, role_id)
- INDEX(tenant_id)
- INDEX(role_id)
