# Tenant Entity

## 1. Entidad

La entidad **Tenant** representa la cuenta, el cliente o el namespace de aislamiento global dentro de Neltrik.

Cada **Tenant** constituye un espacio aislado donde operan sus Companies, usuarios, módulos e información, garantizando que ninguna organización pueda acceder a los datos perteneciente a otra.

Dentro de la plataforma existen diferentes tipos de **Tenant**, definidos mediante `TenantType`.

### Tenant

| Campo         | Descripción                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `id`          | Identificador único del Tenant.                                               |
| `name`        | Nombre de la organización.                                                    |
| `slug`        | Identificador legible utilizado por la plataforma para identificar al Tenant. |
| `type`        | Tipo de Tenant dentro de la plataforma.                                       |
| `status`      | Estado actual del Tenant.                                                     |
| `createdAt`   | Fecha de creación del Tenant.                                                 |
| `updatedAt`   | Fecha de la última actualización del Tenant.                                  |
| `suspendedAt` | Fecha en la que el Tenant fue suspendido, cuando aplique.                     |

---

### Consideraciones

- El `slug` constituye el identificador público del **Tenant** y actúa como namespace global de la plataforma, permitiendo que Companies en Tenants distintos puedan tener el mismo `slug`.
- El type determina la naturaleza del **Tenant** dentro de la plataforma.
- Debe existir un único **Tenant** con type = PLATFORM dentro de Neltrik.
- Los Tenants con type = CUSTOMER representan organizaciones cliente de la plataforma.
- El **Tenant** con type = PLATFORM representa el **Tenant** propietario de la plataforma Neltrik.
- El type de un **Tenant** no puede modificarse una vez creado.
- El **Tenant** opera en conjunto con Company, que representa la unidad operativa interior (donde se trabaja). Juntos conforman los dos niveles de aislamiento de la plataforma.

## 2. Relaciones

La entidad **Tenant** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N Companies
```

### Descripción

- Un **Tenant** puede poseer múltiples **Companies**.
- Toda **Company** pertenece a un único **Tenant**.
- El **Tenant** actúa como el namespace de aislamiento global; la Company actúa como la unidad operativa.

> **Nota:** El dominio **Tenant** se relaciona con **Company** (orquestación de la **Company** por defecto durante el alta del **Tenant**). Conforme evolucione la plataforma, nuevas entidades pertenecientes a otros dominios (**Identity**, **Authorization**, **CRM**, etc.) establecerán relaciones con **Tenant**, manteniendo a este como el namespace de aislamiento global.

## 3. Enums

La entidad **Tenant** utiliza los siguientes tipos enumerados para garantizar la integridad de los datos.

### 3.1 TenantType

Representa la naturaleza del Tenant dentro de la plataforma.

| Tipo       | Descripción                                                   |
| ---------- | ------------------------------------------------------------- |
| `PLATFORM` | Tenant propietario de la plataforma Neltrik.                  |
| `CUSTOMER` | Tenant correspondiente a una organización cliente de Neltrik. |

#### Reglas

- Solo puede existir un Tenant con `type = PLATFORM`.
- Pueden existir múltiples Tenants con `type = CUSTOMER`.
- El `type` de un Tenant es inmutable.
- La existencia del Tenant `PLATFORM` es un requisito estructural de la plataforma.

### 3.2 TenantStatus

Representa el estado actual del Tenant.

| Estado      | Descripción                                                 |
| ----------- | ----------------------------------------------------------- |
| `ACTIVE`    | El Tenant se encuentra activo y puede operar normalmente.   |
| `SUSPENDED` | El Tenant fue suspendido y no puede utilizar la plataforma. |

# 4. Reglas de negocio

## 4.1 Creación

- El nombre del Tenant es obligatorio.
- El slug es generado automáticamente por la plataforma utilizando el nombre del Tenant y su identificador único.
- El nombre utilizado para generar el slug es normalizado automáticamente a minúsculas antes de persistirse.
- La plataforma garantiza la unicidad del slug mediante esta estrategia y la restricción UNIQUE de la base de datos.
- El `slug` debe ser único a nivel global de la plataforma.
- Una vez generado, el slug no puede modificarse.
- El `type` debe estar definido durante la creación del Tenant.
- El `type` no puede modificarse posteriormente.
- Solo puede existir un Tenant con `type = PLATFORM`.
- Si ya existe un Tenant con `type = PLATFORM`, la creación de otro Tenant con `type = PLATFORM` debe ser rechazada.
- Pueden existir múltiples Tenants con `type = CUSTOMER`.
- Todo Tenant inicia con el estado `ACTIVE`.
- Todo Tenant debe finalizar su proceso de creación con una `Company` por defecto y un `OwnerTenantAdmin` asociados.
- La creación de la `Company` por defecto y el OwnerTenantAdmin se delega al dominio `Company` durante el proceso de alta del `Tenant`.
- El proceso de creación del `Tenant` solo se considera completado cuando existen la `Company` por defecto y el `OwnerTenantAdmin` asociados.
- Solo usuarios con los permisos adecuados pueden crear un `Tenant`.

### Creación del Tenant PLATFORM

- El Tenant propietario de Neltrik debe crearse con `type = PLATFORM`.
- La plataforma debe garantizar que no exista previamente otro Tenant con `type = PLATFORM`.
- La creación de un segundo Tenant con `type = PLATFORM` debe ser rechazada tanto por las reglas de negocio como por la restricción de persistencia correspondiente.

### Creación de Tenants CUSTOMER

- Los Tenants correspondientes a organizaciones cliente deben crearse con `type = CUSTOMER`.
- La plataforma puede crear múltiples Tenants con `type = CUSTOMER`.
- La creación de un Tenant `CUSTOMER` no está limitada por la existencia de otros Tenants `CUSTOMER`.

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden ser modificados:

- `name`

### Campos no actualizables

Los siguientes campos no pueden modificarse mediante el caso de uso de actualización:

- `id`
- `slug`
- `type`
- `status`
- `createdAt`

### Restricciones

- Solo usuarios con los permisos adecuados pueden actualizar un Tenant.
- Un Tenant suspendido puede actualizarse únicamente por usuarios con los permisos adecuados.

## 4.3 Suspensión

- Solo usuarios con los permisos adecuados pueden suspender un Tenant.
- Solo un Tenant con estado `ACTIVE` puede suspenderse.
- Al suspender un Tenant, su estado cambia a `SUSPENDED`.
- Al suspender un Tenant, el sistema registra la fecha en `suspendedAt`.
- Un Tenant suspendido no puede operar dentro de la plataforma.
- La suspensión no modifica el `type` del Tenant.
- El Tenant `PLATFORM` no puede cambiar su `type` como consecuencia de una suspensión.

## 4.4 Reactivación

- Solo usuarios con los permisos adecuados pueden reactivar un Tenant.
- Solo un Tenant con estado `SUSPENDED` puede reactivarse.
- Al reactivar un Tenant, su estado cambia a `ACTIVE`.
- Al reactivar un Tenant, el campo `suspendedAt` se establece en `NULL`.
- La reactivación no modifica el `type` del Tenant.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
tenants
```

---

## 5.2 Columnas

| Columna        | Tipo         | Null | Default             | Observación |
| -------------- | ------------ | ---- | ------------------- | ----------- |
| `id`           | UUID         | ❌   | `gen_random_uuid()` | PK          |
| `name`         | VARCHAR(255) | ❌   | —                   |             |
| `slug`         | VARCHAR(100) | ❌   | —                   | UNIQUE      |
| `type`         | ENUM         | ❌   | `CUSTOMER`          |             |
| `status`       | ENUM         | ❌   | `ACTIVE`            |             |
| `created_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `updated_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `suspended_at` | TIMESTAMP    | ✅   | `NULL`              |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `slug` debe ser único a nivel global de la plataforma (namespace).
- `type` debe contener un valor válido del enum `TenantType`.
- Solo puede existir un Tenant con `type = PLATFORM`.
- Pueden existir múltiples Tenants con `type = CUSTOMER`.
- `type` no puede modificarse después de la creación.
- `status` inicia con el valor `ACTIVE`.
- `suspended_at` solo debe contener un valor cuando el Tenant se encuentre suspendido.
- Las restricciones de persistencia deben impedir la existencia de más de un Tenant `PLATFORM`.

## 5.4 Unicidad del Tenant PLATFORM

La base de datos debe garantizar que no puedan existir múltiples registros con:

```text
type = PLATFORM
```

Esta restricción debe implementarse mediante un **índice único parcial**, de forma que:

- `PLATFORM` pueda existir como máximo una vez.
- `CUSTOMER` pueda existir múltiples veces.

Conceptualmente, la restricción corresponde a:

```sql
CREATE UNIQUE INDEX ...
ON tenants(type)
WHERE type = 'PLATFORM';
```

La validación de negocio y la restricción de base de datos deben complementarse para garantizar la unicidad incluso ante operaciones concurrentes.

## 5.5 Índices

- `PK(id)`
- `UNIQUE(slug)`
- `UNIQUE(type)` parcial para `type = PLATFORM`
- `INDEX(status)`
