# Audit Event Entity

## 1. Entidad

La entidad **Audit Event** representa un hecho histórico ocurrido en **Neltrik** que debe ser registrado para garantizar trazabilidad, seguridad y visibilidad sobre las acciones relevantes realizadas en la plataforma.

Cada Audit Event representa una acción específica originada por un **User** o por el **Sistema**, sobre un recurso determinado y en un momento concreto.

La entidad **Audit Event** pertenece exclusivamente al contexto de **Audit**. Audit mantiene referencias mediante identificadores hacia las entidades administradas por otros módulos, pero no administra dichas entidades.

Un Audit Event es **inmutable** después de su creación y únicamente puede ser registrado mediante una operación de creación.

## Audit Event

| Campo        | Descripción                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | Identificador único del Audit Event.                                                                                                                             |
| `userId`     | Identificador del User que originó la acción. Puede ser `null` cuando la acción es originada por el sistema.                                                     |
| `userEmail`  | Dirección de email del User en el momento en que ocurrió la acción. Puede ser `null` cuando la acción es originada por el sistema o el email no está disponible. |
| `tenantId`   | Identificador del Tenant al que pertenece el evento. Puede ser `null` cuando el evento no está asociado a un Tenant específico.                                  |
| `action`     | Acción específica que ocurrió y que está registrada en el catálogo oficial de `AuditAction`.                                                                     |
| `resource`   | Tipo de recurso de negocio afectado por la acción y registrado en el catálogo oficial de `AuditResource`.                                                        |
| `resourceId` | Identificador de la instancia concreta del recurso afectado. Puede ser `null` cuando la acción no afecta a una instancia específica.                             |
| `status`     | Resultado de la acción auditada.                                                                                                                                 |
| `metadata`   | Información adicional específica del evento.                                                                                                                     |
| `ipAddress`  | Dirección IP desde la cual se originó la acción, cuando esté disponible.                                                                                         |
| `userAgent`  | User Agent asociado al contexto desde el cual se originó la acción, cuando esté disponible.                                                                      |
| `createdAt`  | Fecha y hora en la que ocurrió la acción auditada.                                                                                                               |

## Consideraciones

- El atributo `userId` referencia exclusivamente a un User administrado por **Identity**.
- Audit no crea, modifica ni administra directamente la entidad User.
- El atributo `tenantId` referencia exclusivamente a un Tenant administrado por el contexto correspondiente.
- Audit no crea, modifica ni administra directamente la entidad Tenant.
- `userId` puede ser `null` cuando la acción sea originada directamente por el sistema.
- `userEmail` representa el email del User en el momento en que ocurrió la acción.
- `userEmail` constituye una captura histórica del contexto del actor y no una referencia viva al email actual del User.
- Los cambios posteriores realizados sobre el email del User no deben modificar el `userEmail` almacenado en un Audit Event.
- Audit no utiliza `userEmail` para administrar o identificar la entidad User; `userId` continúa siendo la referencia al User.
- `action` debe corresponder a una acción definida en el catálogo oficial de `AuditAction`.
- `resource` debe corresponder a un recurso definido en el catálogo oficial de `AuditResource`.
- `resourceId` identifica la instancia concreta del recurso afectado cuando corresponda.
- `resourceId` puede ser `null` cuando la acción no afecte a una instancia específica.
- `action` representa un evento específico y no una operación HTTP ni una capacidad genérica como `CREATE`, `UPDATE` o `DELETE`.
- Las nuevas entradas del catálogo oficial de `AuditAction` siguen la convención `<RESOURCE>_<EVENT>`.
- Esta convención corresponde a una regla de definición y nomenclatura del catálogo y no constituye una validación adicional realizada por `AuditEvent`.
- `status` únicamente puede utilizar valores definidos por el dominio `AuditStatus`.
- `metadata` permite almacenar información adicional relacionada con el evento sin modificar la estructura fundamental de `AuditEvent`.
- `metadata` no debe utilizarse para duplicar información que ya pertenece a los campos principales de `AuditEvent`.
- `ipAddress` puede ser `null` cuando la dirección IP no esté disponible.
- `userAgent` puede ser `null` cuando el contexto de origen no proporcione dicha información.
- `createdAt` representa el momento en el que ocurrió la acción y no el momento en el que posteriormente pudiera procesarse o persistirse de forma asíncrona.
- Un Audit Event es inmutable después de su creación.
- Un Audit Event no puede ser actualizado.
- Un Audit Event no puede ser eliminado.
- El registro de un Audit Event debe realizarse de forma independiente de la transacción principal que originó la acción.
- Un fallo en el registro del Audit Event no debe revertir la operación principal que originó el evento.
- La entidad no contiene información específica de infraestructura relacionada con el mecanismo utilizado para persistir o procesar el evento.
- El modelo queda preparado para futuras extensiones como procesamiento asíncrono, reintentos o hash chain sin modificar el significado fundamental del Audit Event.

## 2. Relaciones

### Audit Event → User

**Cardinalidad:** `N ─────── 1`

Un **Audit Event** puede estar asociado a un único **User** mediante `userId`.

- Un **User** puede originar múltiples **Audit Events** a lo largo del tiempo.
- Un **Audit Event** puede existir sin un **User** cuando la acción es originada directamente por el sistema.
- La relación con **User** se establece mediante `userId`.
- **User** pertenece al dominio **Identity**.
- **Audit** mantiene únicamente la referencia al **User** y no administra su entidad.
- `userEmail` no constituye una relación adicional con **User**.
- `userEmail` representa una captura histórica del email del **User** en el momento en que ocurrió el evento.
- `userEmail` no reemplaza a `userId` ni se utiliza para identificar o administrar al **User**.

> **Nota:** `userEmail` tiene como finalidad conservar el contexto histórico del actor en el momento en que ocurrió el evento.

### Audit Event → Tenant

**Cardinalidad:** `N ─────── 1`

Un **Audit Event** puede estar asociado a un único **Tenant** mediante `tenantId`.

- Un **Tenant** puede estar asociado a múltiples **Audit Events**.
- Un **Audit Event** puede existir sin un **Tenant** cuando el evento no está asociado a un **Tenant** específico.
- La relación con **Tenant** se establece mediante `tenantId`.
- **Audit** mantiene únicamente la referencia al **Tenant** y no administra su entidad.

### Audit Event → Resource

`resource` y `resourceId` **no constituyen relaciones** con entidades administradas por **Audit**.

- `resource` identifica el tipo de recurso de negocio afectado.
- `resourceId` identifica la instancia del recurso cuando corresponda.
- La entidad responsable del recurso mantiene la administración de dicho recurso y sus reglas de negocio.

### AuditAction y AuditResource

**AuditAction** y **AuditResource** forman parte del vocabulario oficial administrado por **Audit**.

No representan entidades relacionadas mediante identificadores.

---

## 3. Enums

La entidad **Audit Event** utiliza el siguiente tipo enumerado para el MVP.

### AuditStatus

Representa el resultado de la acción auditada.

| Valor     | Descripción                                                   |
| --------- | ------------------------------------------------------------- |
| `SUCCESS` | La acción se ejecutó correctamente.                           |
| `FAILED`  | La acción fue ejecutada pero produjo un fallo.                |
| `DENIED`  | La acción fue rechazada por falta de autorización o permisos. |

`AuditStatus` pertenece al dominio **Audit** y únicamente puede utilizar los valores definidos oficialmente por el contexto.

## 4. Reglas de negocio

### 4.1 Creación

- Todo **Audit Event** debe representar un hecho ocurrido dentro de Neltrik que deba ser registrado para garantizar trazabilidad, seguridad o visibilidad.
- Todo **Audit Event** debe poseer un `id` único.
- Todo **Audit Event** debe poseer una `action` definida en el catálogo oficial de **AuditAction**.
- Toda `action` debe representar un evento específico y no una operación HTTP ni una operación genérica como `CREATE`, `UPDATE` o `DELETE`.
- Toda `action` debe pertenecer al catálogo oficial de `AuditAction`.
- Las nuevas entradas del catálogo oficial de `AuditAction` deben definirse siguiendo la convención `<RESOURCE>_<EVENT>`.
- Todo **Audit Event** debe poseer un `resource` definido en el catálogo oficial de **AuditResource**.
- `resourceId` debe identificar la instancia concreta del recurso afectado cuando corresponda.
- `resourceId` puede ser `null` cuando la acción no afecte a una instancia específica.
- `userId` debe corresponder a un **User** válido administrado por **Identity** cuando el evento sea originado por un usuario.
- `userId` puede ser `null` cuando la acción sea originada directamente por el sistema.
- `userEmail` debe corresponder al email del **User** en el momento en que ocurrió la acción cuando dicho email esté disponible.
- `userEmail` puede ser `null` cuando la acción sea originada por el sistema o cuando el email del actor no esté disponible.
- `userEmail` debe almacenarse como una captura histórica y no como una referencia al email actual del **User**.
- Los cambios posteriores realizados sobre el email del **User** no deben modificar el `userEmail` almacenado en un **Audit Event**.
- `tenantId` debe corresponder al **Tenant** asociado al evento cuando exista un **Tenant** específico.
- `tenantId` puede ser `null` cuando el evento no esté asociado a un **Tenant** específico.
- `status` únicamente puede utilizar valores definidos por **AuditStatus**.
- `metadata` puede contener información adicional relacionada con el evento sin modificar la estructura fundamental de **AuditEvent**.
- `metadata` no debe utilizarse para duplicar información que ya pertenece a los campos principales de **AuditEvent**.
- `ipAddress` puede ser `null` cuando la dirección IP no esté disponible.
- `userAgent` puede ser `null` cuando el contexto de origen no proporcione dicha información.
- `createdAt` debe representar el momento en que ocurrió la acción auditada.
- La creación de un **Audit Event** debe realizarse mediante el contrato público **AuditApi**.
- El registro del evento debe ser independiente de la transacción principal que originó la acción.
- Un fallo durante el registro del **Audit Event** no debe revertir la operación principal que originó el evento.

### 4.2 Actualización

#### Campos actualizables

Un **Audit Event** no posee campos actualizables después de su creación.

#### Campos no actualizables

Todos los campos de **AuditEvent** son inmutables después de su creación.

#### Restricciones

- Un **Audit Event** no puede ser actualizado.
- Un **Audit Event** no puede ser eliminado.
- No se permite modificar un **Audit Event** para corregir, complementar o reemplazar información después de su creación.
- Los cambios posteriores realizados sobre las entidades o recursos relacionados no deben modificar la información histórica almacenada en el **Audit Event**.
- Si ocurre un nuevo hecho relevante sobre un recurso, debe registrarse un nuevo **Audit Event** en lugar de modificar uno existente.
- La consulta de **Audit Events** nunca debe modificar su estado.
- Las futuras capacidades de procesamiento asíncrono, reintentos o hash chain no deben modificar la regla fundamental de inmutabilidad del **Audit Event**.

---

## 5. Modelo físico (Base de datos)

### 5.1 Tabla

**Nombre sugerido:**

`audit_events`

### 5.2 Columnas

| Columna       | Tipo           | Null | Default             | Observación                             |
| ------------- | -------------- | ---- | ------------------- | --------------------------------------- |
| `id`          | `UUID`         | ❌   | `gen_random_uuid()` | PK                                      |
| `user_id`     | `UUID`         | ✅   | `NULL`              | Referencia al User de Identity          |
| `user_email`  | `VARCHAR(255)` | ✅   | `NULL`              | Email del User en el momento del evento |
| `tenant_id`   | `UUID`         | ✅   | `NULL`              | Referencia al Tenant asociado al evento |
| `action`      | `VARCHAR(100)` | ❌   | —                   | Acción oficial de AuditAction           |
| `resource`    | `VARCHAR(100)` | ❌   | —                   | Recurso oficial de AuditResource        |
| `resource_id` | `UUID`         | ✅   | `NULL`              | Identificador de la instancia afectada  |
| `status`      | `VARCHAR(20)`  | ❌   | —                   | Resultado del evento                    |
| `metadata`    | `JSONB`        | ❌   | `'{}'`              | Información adicional del evento        |
| `ip_address`  | `VARCHAR(45)`  | ✅   | `NULL`              | Dirección IPv4 o IPv6                   |
| `user_agent`  | `TEXT`         | ✅   | `NULL`              | User Agent del contexto de origen       |
| `created_at`  | `TIMESTAMP`    | ❌   | `NOW()`             | Momento en que ocurrió la acción        |

### 5.3 Restricciones

- `id` es la clave primaria.
- `user_id` puede ser `NULL` cuando el evento sea originado directamente por el sistema.
- Cuando `user_id` no sea `NULL`, debe corresponder a un **User** válido de **Identity**.
- `user_email` puede ser `NULL` cuando el evento sea originado por el sistema o cuando el email del actor no esté disponible.
- `user_email` representa una captura histórica del email del **User** en el momento en que ocurrió el evento.
- Los cambios posteriores realizados sobre el email del **User** no deben modificar `user_email`.
- `tenant_id` puede ser `NULL` cuando el evento no esté asociado a un **Tenant** específico.
- Cuando `tenant_id` no sea `NULL`, debe corresponder al **Tenant** asociado al evento.
- `action` es obligatorio.
- `action` debe corresponder a una acción definida en el catálogo oficial de **AuditAction**.
- `action` se almacena como texto y no utiliza un tipo `ENUM` de PostgreSQL.
- `resource` es obligatorio.
- `resource` debe corresponder a un recurso definido en el catálogo oficial de **AuditResource**.
- `resource` se almacena como texto y no utiliza un tipo `ENUM` de PostgreSQL.
- `resource_id` puede ser `NULL` cuando la acción no afecte a una instancia específica.
- `status` es obligatorio.
- `status` debe corresponder a un valor válido de **AuditStatus**.
- `status` se almacena como texto y no utiliza un tipo `ENUM` de PostgreSQL.
- `metadata` es obligatorio y debe almacenar un objeto JSON válido.
- `ip_address` puede ser `NULL` cuando la dirección IP no esté disponible.
- `user_agent` puede ser `NULL` cuando el contexto de origen no proporcione dicha información.
- `created_at` es obligatorio.
- `created_at` representa el momento en que ocurrió la acción y no el momento posterior de persistencia o procesamiento.
- `created_at` no puede modificarse después de la creación.
- Los registros de `audit_events` son **append-only**.
- Un registro de `audit_events` no puede actualizarse.
- Un registro de `audit_events` no puede eliminarse.

> **Nota:** No se establece una FK física hacia `users` ni `tenants` en esta primera versión, ya que **Audit** mantiene referencias mediante identificadores hacia entidades administradas por otros contextos. La integridad de dichas referencias pertenece a los contratos y límites entre contextos.

### 5.4 Índices

De acuerdo con lo definido en el DDD, tendremos los siguientes 6 índices:

- `PK(id)`
- `INDEX(tenant_id)`
- `INDEX(user_id)`
- `INDEX(action)`
- `INDEX(resource)`
- `INDEX(created_at)`

### 5.5 Restricciones de unicidad

No se debe establecer `UNIQUE` sobre ninguna columna aparte de `id`.

Dos eventos pueden perfectamente tener el mismo:

- `user_id`
- `action`
- `resource`
- `resource_id`
- `status`

La combinación de estos campos no representa una clave única de negocio, ya que pueden existir múltiples eventos idénticos como hechos auditables independientes.
