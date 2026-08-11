# Role-Tenant Association

## 1. Asociación

La asociación Role-Tenant representa la relación mediante la cual Neltrik habilita un Role oficial para que pueda ser utilizado dentro de un Tenant.

Esta asociación forma parte del modelo de autorización de Neltrik y determina qué Roles oficiales están disponibles para una organización.

La asociación no constituye una entidad independiente del dominio. Su propósito es establecer la relación entre las entidades Role y Tenant.

### Role-Tenant

| Campo      | Descripción                                                |
| ---------- | ---------------------------------------------------------- |
| `roleId`   | Identificador del Role oficial habilitado.                 |
| `tenantId` | Identificador del Tenant para el cual se habilita el Role. |

---

### Consideraciones

- La asociación Role-Tenant únicamente puede relacionar un Role oficial con un Tenant existente.
- Un Role puede estar habilitado para múltiples Tenants.
- Un Tenant puede tener múltiples Roles habilitados.
- La combinación roleId + tenantId identifica de forma única una asociación.
- Una misma asociación Role-Tenant no puede existir más de una vez.
- Los Tenants no pueden crear Roles; únicamente pueden utilizar los Roles habilitados para su organización.
- La administración de las asociaciones Role-Tenant corresponde a Neltrik, según las reglas de autorización definidas para la plataforma.
- La habilitación de un Role no modifica los atributos del Role.
- La habilitación de un Role no modifica los Permissions asociados al Role.
- La habilitación de un Role únicamente establece que dicho Role puede ser utilizado dentro del Tenant correspondiente.
- La configuración de displayName de un Role dentro de un Tenant es independiente de la habilitación del Role y corresponde a TenantRoleConfiguration.
- Un TenantRoleConfiguration únicamente puede existir cuando el Role correspondiente se encuentra habilitado para el Tenant.
- Las reglas de habilitación deben considerar el scope definido para el Role.
- Un Role cuyo scope sea exclusivo de Neltrik únicamente podrá habilitarse para el Tenant propietario de la plataforma.
- La cantidad máxima de Roles procesables por una solicitud será una restricción técnica de la API y no una regla del dominio.

## 2. Relaciones

```text
Role

N ─────── N Tenant
```

### Descripción

- Un Role puede estar habilitado para múltiples Tenants.
- Un Tenant puede tener múltiples Roles habilitados.
- La relación entre Role y Tenant determina qué Roles están disponibles para una organización dentro de la plataforma.
- La habilitación de un Role para un Tenant no modifica los atributos del Role.
- La habilitación de un Role para un Tenant no modifica los Permissions asociados al Role.
- Un mismo Role no puede estar habilitado más de una vez para el mismo Tenant.
- La combinación roleId + tenantId identifica de forma única una habilitación.
- La relación Role-Tenant es administrada por Neltrik.
- La existencia de una habilitación Role-Tenant permite que posteriormente Identity valide si un Role puede ser asignado a un User dentro de un determinado Tenant.

> **Nota:** La asociación **Role-Tenant** pertenece al modelo de autorización de Neltrik. El módulo Authorization administra la disponibilidad de los Roles para cada Tenant, pero no administra los Tenants ni la asignación de Roles a los Users.

> **Nota:** La relación **Role-Tenant** no modifica la identidad funcional ni las capacidades oficiales del Role. Estas permanecen determinadas por el catálogo de Roles y sus asociaciones con Permissions.

## 3. Enums

La asociación **Role-Tenant** no utiliza tipos enumerados (**Enums**) para el MVP.

La habilitación de un **Role** para un **Tenant** se determina exclusivamente mediante los identificadores `roleId` y `tenantId` de la asociación.

Las reglas relacionadas con los tipos de Roles, incluyendo su alcance (`scope`), pertenecen a la entidad **Role** y no a la asociación **Role-Tenant**.

# 4. Reglas de negocio

## 4.1 Habilitación de Roles

- Solo **Neltrik** puede crear asociaciones entre `Role` y `Tenant`.
- El `Role` debe existir dentro del catálogo oficial de Neltrik.
- El `Tenant` debe existir dentro de la plataforma.
- Un `Role` no puede habilitarse dos veces para el mismo `Tenant`.
- La habilitación únicamente crea la asociación entre el `Role` y el `Tenant`.
- La habilitación de un `Role` no modifica los atributos del `Role`.
- La habilitación de un `Role` no modifica los `Permissions` asociados al `Role`.
- Un `Tenant` únicamente puede utilizar los Roles que hayan sido habilitados para su organización.
- Un `Role` puede habilitarse para uno o múltiples `Tenants`.
- Un `Tenant` puede tener uno o múltiples `Roles` habilitados.

### Roles con alcance restringido

- Los Roles cuyo `scope` sea `NELTRIK` únicamente pueden habilitarse para el Tenant propietario de la plataforma (**Neltrik**).
- Los Roles cuyo `scope` sea `TENANT` pueden habilitarse para los Tenants permitidos por las reglas de la plataforma.
- La validación del `scope` del Role debe realizarse antes de crear la asociación.
- Una asociación que viole el `scope` del Role debe ser rechazada.

### Idempotencia

- Si un `Role` ya está habilitado para el `Tenant`, solicitar nuevamente su habilitación no debe crear una asociación duplicada.
- Una operación de habilitación debe producir el mismo estado final aunque contenga Roles que ya estén habilitados para el Tenant.

## 4.2 Eliminación de Roles

- Solo **Neltrik** puede eliminar asociaciones entre `Role` y `Tenant`.
- El `Role` debe existir dentro del catálogo oficial de Neltrik.
- El `Tenant` debe existir dentro de la plataforma.
- La eliminación únicamente elimina la asociación entre el `Role` y el `Tenant`.
- Eliminar una asociación no elimina el `Role`.
- Eliminar una asociación no elimina el `Tenant`.
- La eliminación de una asociación no modifica los `Permissions` asociados al `Role`.

### Idempotencia

- Si un `Role` no se encuentra actualmente habilitado para el `Tenant`, solicitar nuevamente su eliminación no debe generar una asociación ni producir un estado inconsistente.
- La operación debe finalizar dejando el `Tenant` sin las habilitaciones solicitadas.

## 4.3 Integridad de las asociaciones

- La combinación `roleId` + `tenantId` debe ser única.
- No pueden existir habilitaciones duplicadas entre un `Role` y un `Tenant`.
- Una asociación solo puede existir mientras existan el `Role` y el `Tenant` correspondientes.
- La asociación no modifica la identidad funcional del `Role`.
- La asociación no modifica los `Permissions` asociados al `Role`.
- Los Roles habilitados para un Tenant constituyen el conjunto de Roles que posteriormente puede utilizar Identity para asignar Roles a los Users de dicho Tenant.

## 4.4 Procesamiento masivo

- La habilitación y eliminación de Roles debe permitir procesar múltiples `Roles` en una misma solicitud.
- El sistema no debe requerir una petición independiente por cada `Role`.
- La cantidad de `Roles` procesables por solicitud podrá estar limitada por razones técnicas de rendimiento, seguridad o protección de recursos.
- Este límite técnico no modifica las reglas del dominio ni limita conceptualmente la cantidad de `Roles` que puede tener habilitados un `Tenant`.
- La implementación debe evitar operaciones innecesarias que puedan provocar degradación del rendimiento cuando se procesen múltiples asociaciones.

## 4.5 Atomicidad

- Una operación masiva de habilitación debe ser atómica.
- Una operación masiva de eliminación debe ser atómica.
- Si una operación no puede completarse correctamente, no deben quedar asociaciones parcialmente modificadas.
- Las modificaciones de las asociaciones deben ejecutarse dentro de una transacción de persistencia.

> **Nota:** La validación de existencia del `Role` corresponde al caso de uso mediante `RoleRepository`. La validación de existencia del `Tenant` corresponde al caso de uso mediante el mecanismo definido por el módulo correspondiente del Core. La persistencia de la asociación corresponde al repositorio responsable de la relación `Role-Tenant`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
role_tenants
```

---

## 5.2 Columnas

| Columna      | Tipo      | Null | Default             | Observación |
| ------------ | --------- | ---- | ------------------- | ----------- |
| `id`         | UUID      | ❌   | `gen_random_uuid()` | PK          |
| `role_id`    | UUID      | ❌   | —                   | FK          |
| `tenant_id`  | UUID      | ❌   | —                   | FK          |
| `created_at` | TIMESTAMP | ❌   | `NOW()`             |             |
| `updated_at` | TIMESTAMP | ❌   | `NOW()`             |             |

---

## 5.3 Restricciones

- id es la clave primaria.
- role_id referencia el Role al que pertenece la asociación.
- tenant_id referencia el Tenant al que se habilita el Role.
- La combinación role_id + tenant_id debe ser única.
- No pueden existir asociaciones duplicadas entre un Role y un Tenant.
- created_at registra el momento en que se creó la asociación.
- updated_at registra la última modificación de la asociación.
- Las asociaciones no pueden existir si el Role o el Tenant correspondiente no existe.

---

## 5.4 Integridad referencial

- La eliminación de un Role no debe permitir dejar asociaciones huérfanas.
- La eliminación de un Tenant no debe permitir dejar asociaciones huérfanas.
- La asociación no modifica ni elimina los atributos del Role o del Tenant.

---

## 5.5 Índices

- PK(id)
- UNIQUE(role_id, tenant_id)
- INDEX(role_id)
- INDEX(tenant_id)
