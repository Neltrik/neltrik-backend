# Tenant Entity

## 1. Entidad

La entidad **Tenant** representa una organización cliente que utiliza **Neltrik** como plataforma SaaS.

Cada Tenant constituye un espacio organizacional aislado donde operan los diferentes módulos de la plataforma, garantizando que la información perteneciente a una organización nunca pueda ser accedida por otra.

### Tenant

| Campo         | Descripción                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `id`          | Identificador único del Tenant.                                               |
| `name`        | Nombre de la organización.                                                    |
| `slug`        | Identificador legible utilizado por la plataforma para identificar al Tenant. |
| `status`      | Estado actual del Tenant.                                                     |
| `createdAt`   | Fecha de creación del Tenant.                                                 |
| `updatedAt`   | Fecha de la última actualización del Tenant.                                  |
| `suspendedAt` | Fecha en la que el Tenant fue suspendido, cuando aplique.                     |

---

### Consideraciones

- El slug constituye el identificador público del Tenant y podrá utilizarse en URLs, subdominios u otros mecanismos de identificación.

## 2. Relaciones

La entidad **Tenant** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N Vacancies
```

### Descripción

- Un **Tenant** puede poseer múltiples **Vacancies**.
- Toda **Vacancy** pertenece a un único **Tenant**.
- El **Tenant** actúa como el contexto organizacional utilizado para garantizar el aislamiento de la información.

> **Nota:** Conforme evolucione la plataforma, nuevas entidades pertenecientes a otros dominios (Identity, Authorization, CRM, etc.) establecerán relaciones con **Tenant**, manteniendo a este como el contexto organizacional principal del sistema.

## 3. Enums

La entidad **Tenant** utiliza los siguientes tipos enumerados para garantizar la integridad de los datos.

### 3.1 TenantStatus

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
- Una vez generado, el slug no puede modificarse.
- Todo Tenant inicia con el estado ACTIVE.
- Todo Tenant debe finalizar su proceso de creación con un OwnerTenantAdmin asociado.
- La creación de un Tenant solo puede ser realizada por un usuario con el rol PlatformAdmin.

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden ser modificados:

- `name`

### Campos no actualizables

Los siguientes campos no pueden modificarse mediante el caso de uso de actualización:

- `id`
- `slug`
- `status`
- `createdAt`

### Restricciones

- Solo un `PlatformAdmin` puede actualizar un Tenant.
- Un Tenant suspendido puede actualizarse únicamente por un `PlatformAdmin`.

## 4.3 Suspensión

- Solo un `PlatformAdmin` puede suspender un Tenant.
- Solo un Tenant con estado `ACTIVE` puede suspenderse.
- Al suspender un Tenant, su estado cambia a `SUSPENDED`.
- Al suspender un Tenant, el sistema registra la fecha en `suspendedAt`.
- Un Tenant suspendido no puede operar dentro de la plataforma.

## 4.4 Reactivación

- Solo un `PlatformAdmin` puede reactivar un Tenant.
- Solo un Tenant con estado `SUSPENDED` puede reactivarse.
- Al reactivar un Tenant, su estado cambia a `ACTIVE`.
- Al reactivar un Tenant, el campo `suspendedAt` se establece en `NULL`.

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
| `status`       | ENUM         | ❌   | `ACTIVE`            |             |
| `created_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `updated_at`   | TIMESTAMP    | ❌   | `NOW()`             |             |
| `suspended_at` | TIMESTAMP    | ✅   | `NULL`              |             |

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `slug` debe ser único dentro de la plataforma.
- `status` inicia con el valor `ACTIVE`.
- `suspended_at` solo debe contener un valor cuando el Tenant se encuentre suspendido.

---

## 5.4 Índices

- PK(id)
- UNIQUE(slug)
- INDEX(status)
