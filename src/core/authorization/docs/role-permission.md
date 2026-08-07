# Role-Permission Association

## 1. Asociación

La asociación **Role-Permission** representa la relación oficial mediante la cual **Neltrik** determina qué **Permissions** están disponibles para un **Role**.

Esta asociación forma parte del modelo de autorización de **Neltrik** y permite construir el conjunto de capacidades que puede ejecutar un usuario cuando tiene asignado un determinado Role.

La asociación no constituye una entidad independiente del dominio. Su propósito es establecer la relación entre las entidades **Role** y **Permission**.

### Role-Permission

| Campo          | Descripción                                            |
| -------------- | ------------------------------------------------------ |
| `roleId`       | Identificador del Role al que se asocia el Permission. |
| `permissionId` | Identificador del Permission asociado al Role.         |

---

### Consideraciones

- La asociación **Role-Permission** únicamente puede relacionar un `Role` oficial con un `Permission` oficial.
- Un `Role` puede estar asociado a múltiples `Permissions`.
- Un `Permission` puede estar asociado a múltiples `Roles`.
- La combinación `roleId` + `permissionId` identifica de forma única una asociación.
- Una misma asociación **Role-Permission** no puede existir más de una vez.
- Los Tenants no pueden crear, modificar ni eliminar asociaciones entre Roles y Permissions.
- Las asociaciones entre Roles y Permissions forman parte del modelo oficial de autorización definido por **Neltrik**.
- La administración de estas asociaciones corresponde exclusivamente a **Neltrik**.
- La asociación puede ser creada o eliminada de forma masiva mediante una única operación.
- La cantidad máxima de asociaciones procesables por una solicitud será una restricción técnica de la API y no una regla del dominio.
- La existencia de un `Permission` debe validarse antes de crear su asociación con un `Role`.
- La existencia del `Role` debe validarse antes de crear o eliminar sus asociaciones.

## 2. Relaciones

```text
Role

N ─────── N Permission
```

### Descripción

- Un **Role** puede estar asociado a múltiples **Permissions**.
- Un **Permission** puede estar asociado a múltiples **Roles**.
- Cada asociación representa una capacidad oficial disponible para un Role.
- Un **Role** puede agregar o remover múltiples **Permissions** mediante una única operación.
- Un **Permission** puede ser asociado a múltiples Roles sin modificar su propia identidad ni información.
- La eliminación de una asociación únicamente elimina la relación entre el `Role` y el `Permission`; no elimina ninguna de las entidades involucradas.

> **Nota:** La asociación **Role-Permission** pertenece al modelo oficial de autorización de **Neltrik**. Los Tenants no pueden modificar las asociaciones entre Roles y Permissions.

> **Nota:** La asociación no constituye una entidad independiente del dominio. Su persistencia se materializa mediante la tabla `role_permissions`.

## 3. Enums

La asociación **Role-Permission** no utiliza tipos enumerados (**Enums**) para el MVP.

La relación se encuentra determinada exclusivamente por los identificadores `roleId` y `permissionId`.

# 4. Reglas de negocio

## 4.1 Asignación de Permissions

- Solo **Neltrik** puede crear asociaciones entre `Role` y `Permission`.
- El `Role` debe existir dentro del catálogo oficial de Neltrik.
- Cada `Permission` debe existir dentro del catálogo oficial de Neltrik.
- Un `Permission` no puede asociarse dos veces al mismo `Role`.
- La asignación puede incluir uno o múltiples `Permissions` en una misma operación.
- Cuando se asignen múltiples `Permissions`, todas las asociaciones deben procesarse como una única operación.
- Si una operación contiene un `Permission` inexistente, la operación completa debe rechazarse.
- La asignación de Permissions no modifica los atributos del `Role`.
- La asignación de Permissions no modifica los atributos de los `Permissions`.
- La asignación únicamente crea las asociaciones correspondientes entre el `Role` y los `Permissions`.

### Idempotencia

- Si un `Permission` ya está asociado al `Role`, solicitar nuevamente su asignación no debe crear una asociación duplicada.
- Una operación de asignación debe producir el mismo estado final aunque contenga Permissions que ya estén asociados al Role.

---

## 4.2 Eliminación de Permissions

- Solo **Neltrik** puede eliminar asociaciones entre `Role` y `Permission`.
- El `Role` debe existir dentro del catálogo oficial de Neltrik.
- Los `Permissions` indicados deben existir dentro del catálogo oficial de Neltrik.
- La operación puede remover uno o múltiples `Permissions` en una misma solicitud.
- Eliminar una asociación no elimina el `Role`.
- Eliminar una asociación no elimina el `Permission`.
- La eliminación únicamente elimina la relación existente entre el `Role` y los `Permissions`.

### Idempotencia

- Si un `Permission` no se encuentra actualmente asociado al `Role`, solicitar nuevamente su eliminación no debe generar una asociación ni producir un estado inconsistente.
- La operación debe finalizar dejando el `Role` sin las asociaciones solicitadas.

---

## 4.3 Integridad de las asociaciones

- La combinación `roleId` + `permissionId` debe ser única.
- No pueden existir asociaciones duplicadas entre un `Role` y un `Permission`.
- Una asociación solo puede existir mientras existan el `Role` y el `Permission` correspondientes.
- Las asociaciones pertenecen exclusivamente al modelo oficial de autorización administrado por Neltrik.
- Los Tenants no pueden modificar las asociaciones entre Roles y Permissions.

---

## 4.4 Procesamiento masivo

- Las operaciones de asignación y eliminación deben permitir procesar múltiples `Permissions` en una misma solicitud.
- El sistema no debe requerir una petición independiente por cada `Permission`.
- La cantidad de `Permissions` procesados por solicitud podrá estar limitada por razones técnicas de rendimiento, seguridad o protección de recursos.
- Este límite técnico no modifica las reglas del dominio ni limita conceptualmente la cantidad de `Permissions` que puede tener un `Role`.
- La implementación debe evitar operaciones innecesarias que puedan provocar degradación del rendimiento cuando se procesen grandes cantidades de asociaciones.

---

## 4.5 Atomicidad

- Una operación masiva de asignación debe ser atómica.
- Una operación masiva de eliminación debe ser atómica.
- Si una operación no puede completarse correctamente, no deben quedar asociaciones parcialmente modificadas.
- Las modificaciones de las asociaciones deben ejecutarse dentro de una transacción de persistencia.

> **Nota:** La validación de existencia de los `Permissions` corresponde al caso de uso mediante `PermissionRepository`. La persistencia de las asociaciones corresponde a `RoleRepository`, ya que la operación modifica la composición de un `Role`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
role_permissions
```

---

## 5.2 Columnas

| Columna         | Tipo      | Null | Default             | Observación |
| --------------- | --------- | ---- | ------------------- | ----------- |
| `id`            | UUID      | ❌   | `gen_random_uuid()` | PK          |
| `role_id`       | UUID      | ❌   | —                   | FK          |
| `permission_id` | UUID      | ❌   | —                   | FK          |
| `created_at`    | TIMESTAMP | ❌   | `NOW()`             |             |
| `updated_at`    | TIMESTAMP | ❌   | `NOW()`             |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `role_id` referencia el `Role` al que pertenece la asociación.
- `permission_id` referencia el `Permission` asociado al `Role`.
- La combinación `role_id` + `permission_id` debe ser única.
- No pueden existir asociaciones duplicadas entre un `Role` y un `Permission`.
- `created_at` registra el momento en que se creó la asociación.
- `updated_at` registra la última modificación de la asociación.
- Las asociaciones no pueden existir si el `Role` o el `Permission` correspondiente no existe.

### Clave primaria

La combinación de ambas columnas constituye la clave primaria:

```text
PRIMARY KEY (role_id, permission_id)
```

---

## 5.4 Índices

- PK(id)
- UNIQUE(role_id, permission_id)
- INDEX(role_id)
- INDEX(permission_id)
