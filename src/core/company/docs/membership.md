# Membership Entity

## 1. Entidad

La entidad `Membership` representa la relación entre un `User` y una `Company`, con un `Role` asignado dentro de Neltrik.

Cada `Membership` constituye una unidad independiente dentro del dominio `Company`, y es la unidad de autorización: el rol que el usuario tiene en esa empresa.

Un `Membership` no conoce el significado de negocio del `User` ni del `Role` que referencia: solo conoce su identidad, su estado, y la `company` a la que pertenece.

## Membership

| Campo       | Descripción                                                          |
| ----------- | -------------------------------------------------------------------- |
| `id`        | Identificador único del membership.                                  |
| `tenantId`  | Identificador del `Tenant` al que pertenece el membership.           |
| `userId`    | Identificador del `User` que pertenece a la company.                 |
| `companyId` | Identificador de la `Company` a la que pertenece el user.            |
| `roleId`    | Identificador del `Role` asignado al user en esa company.            |
| `status`    | Estado del membership (`PENDING`, `ACTIVE`, `SUSPENDED`, `REVOKED`). |
| `createdAt` | Fecha de creación del membership.                                    |
| `updatedAt` | Fecha de la última actualización del membership.                     |

## Consideraciones

- Todo `Membership` pertenece obligatoriamente a una única `Company`.
- Todo `Membership` referencia a un único `User`.
- Todo `Membership` referencia a un único `Role` (de scope `TENANT`).
- Todo `Membership` hereda el `tenantId` de su `Company` (no se ingresa manualmente).
- Todo `Membership` posee un `status` válido (`PENDING`, `ACTIVE`, `SUSPENDED`, `REVOKED`).
- Todo `Membership` recién creado (invitación) inicia con el estado `PENDING`.
- Un `Membership` en estado `PENDING` no otorga permisos.
- Un `Membership` en estado `ACTIVE` otorga los permisos del `Role` asignado.
- Un `Membership` en estado `SUSPENDED` o `REVOKED` no otorga permisos.
- Un `User` no puede tener dos `Memberships` activos en la misma `Company`.
- Los `Memberships` nunca se eliminan físicamente; únicamente cambian su estado.
- El `Membership` es la raíz de su propio agregado.
- El `Membership` no conoce el significado de negocio del `User` ni del `Role`.

## 2. Relaciones

La entidad **Membership** mantiene las siguientes relaciones:

```text
Company

1 ─────── N Memberships

Membership

1 ─────── N User

Membership

N ─────── 1 Role

Membership

N ─────── 1 Tenant
```

## Descripción

- Una `Company` tiene múltiples `Memberships`.
- Un `Membership` pertenece a una única `Company`.
- Un `Membership` referencia a un único `User`.
- Un `Membership` referencia a un único `Role`.
- Un `Membership` pertenece a un único `Tenant` (heredado de su `Company`).
- Un `User` puede tener múltiples `Memberships` en distintas `Companies` del mismo `Tenant`.
- Un `Role` puede estar asignado a múltiples `Memberships` en distintas `Companies` del mismo `Tenant`.
- El `Membership` hereda el `tenantId` de su `Company` (no se ingresa manualmente).

> **Nota:** El `Membership` es la unidad de autorización: el rol que el `User` tiene en la `Company`. Un `User` puede estar en varias Companies del mismo `Tenant`, con roles distintos en cada una. El `Membership` referencia a `User` y `Role`, pero no administra sus reglas de negocio (esas pertenecen a `Identity` y `Authorization`). El `Membership` hereda el tenantId de su `Company` (para el RLS).

## 3. Tipos

### 3.1 Enums

#### MembershipStatus

Representa el estado de un membership durante su ciclo de vida.

| Estado    | Descripción                                                       |
| --------- | ----------------------------------------------------------------- |
| PENDING   | El membership fue creado (invitación), pero el user no lo aceptó. |
| ACTIVE    | El membership está activo (el user aceptó la invitación).         |
| SUSPENDED | El membership está suspendido (no otorga permisos).               |
| REVOKED   | El membership fue revocado (el user salió de la company).         |

### 3.2 Value Objects

#### MembershipRole

Representa el Role asignado a un Membership (referencia a **Authorization**).

- **Tipo:** `RoleId` (`UUID`).
- **Validación:** debe ser un `Role` existente, de scope `TENANT`.
- **Restricción:** no puede ser `NULL` (todo `Membership` debe tener un `Role`).

> **Nota:** `MembershipRole` es una referencia al `Role` (de **Authorization**), no un value object con lógica propia. Se valida en el use case (que el roleId existe, y es de scope TENANT). No se define como VO con validaciones de formato (el roleId es un UUID, y su validez la determina **Authorization**).

## 4. Reglas de negocio

### 4.1 Creación

- El `Membership` debe poseer un `companyId` válido (pertenece a una `Company` existente).
- El `Membership` debe poseer un `userId` válido (referencia a un `User` existente).
- El `Membership` debe poseer un `roleId` válido (referencia a un `Role` existente, de scope `TENANT`).
- El `Membership` hereda el `tenantId` de su `Company` (no se ingresa manualmente).
- El `Membership` inicia con `status` en `PENDING`.
- No puede existir más de un `Membership` en estado `PENDING` o `ACTIVE` para la misma combinación `userId` + `companyId`.

### 4.2 Gestión

- Solo un `PlatformAdmin` puede gestionar `Memberships` de cualquier `Tenant`.
- Solo un `OwnerTenantAdmin` o `TenantAdmin` puede gestionar `Memberships` de su `Tenant`.
- Solo un `CompanyAdmin` puede gestionar los `Memberships` de su propia `Company`.
- Un `Membership` en estado `PENDING` no otorga permisos.
- Un `Membership` en estado `ACTIVE` otorga los permisos del `Role` asignado.
- Un `Membership` en estado `SUSPENDED` o `REVOKED` no otorga permisos.
- Un `Membership` puede aceptarse (`PENDING` → `ACTIVE`).
- Un `Membership` puede suspenderse (`ACTIVE` → `SUSPENDED`).
- Un `Membership` puede revocarse (`ACTIVE` → `REVOKED`).
- Un `Membership` puede cambiar de `Role` mientras esté en estado `ACTIVE`.
- Los `Memberships` nunca se eliminan físicamente; únicamente cambian su estado.

### 4.3 Aislamiento

- Un `Membership` pertenece exactamente a una única `Company`.
- Un `Membership` nunca puede pertenecer simultáneamente a múltiples `Companies`.
- Un `Membership` de una `Company` nunca es accesible desde otra `Company`, excepto para `PlatformAdmin` o administradores del `Tenant` que tengan los permisos correspondientes.
- Toda operación sobre un `Membership` debe respetar el aislamiento multi-tenant y multi-company.

### 4.4 Campos actualizables

Los siguientes campos pueden modificarse mediante casos de uso del dominio:

- `roleId`
- `status`
- `updatedAt`

#### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`
- `tenantId`
- `userId`
- `companyId`
- `createdAt`

### 4.5 Restricciones generales

- Solo los actores autorizados pueden gestionar `Memberships`.
- Los `Memberships` de una `Company` solo pueden ser gestionados por administradores de esa `Company` o por un `PlatformAdmin`.
- Los `Memberships` de una `Company` nunca son accesibles desde otra `Company`, excepto para `PlatformAdmin`.
- Toda operación sobre un `Membership` debe respetar las 8 capas de autorización del sistema.
- Toda operación sobre un `Membership` debe respetar el aislamiento multi-tenant y multi-company.

## 5. Modelo físico (Base de datos)

### 5.1 Tabla

Nombre sugerido:

`memberships`

### 5.2 Columnas

| Columna      | Tipo      | Null | Default             | Observación                      |
| ------------ | --------- | ---- | ------------------- | -------------------------------- |
| `id`         | UUID      | ❌   | `gen_random_uuid()` | PK                               |
| `tenant_id`  | UUID      | ❌   | —                   | Referencia a Tenant (heredado)   |
| `user_id`    | UUID      | ❌   | —                   | Referencia a User                |
| `company_id` | UUID      | ❌   | —                   | Referencia a Company             |
| `role_id`    | UUID      | ❌   | —                   | Referencia a Role (scope TENANT) |
| `status`     | ENUM      | ❌   | `'PENDING'`         | Estado del membership            |
| `created_at` | TIMESTAMP | ❌   | `NOW()`             | Fecha de creación                |
| `updated_at` | TIMESTAMP | ❌   | `NOW()`             | Fecha de última actualización    |

> **Nota:** El atributo `tenant_id` se hereda de la **Company** (no se ingresa manualmente). Garantiza el aislamiento multi-tenant y permite el RLS por tenant.

### 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` referencia al `Tenant` (heredado de la `Company`).
- `user_id` referencia al `User` (de `Identity`).
- `company_id` referencia a la `Company` (de `Company`).
- `role_id` referencia al `Role` (de `Authorization`, scope `TENANT`).
- `status` inicia con el valor `PENDING`.
- No puede existir más de un `Membership` en estado `PENDING` o `ACTIVE` para la misma combinación `user_id` + `company_id`.
- Los `Memberships` nunca se eliminan físicamente; únicamente cambian de estado.
- `tenant_id`, `user_id`, `company_id` y `role_id` son referencias a otros dominios, sin implicar acoplamiento estructural entre dominios.

### 5.4 Índices

- `PK (id)`
- `UNIQUE (user_id, company_id) WHERE status IN ('PENDING', 'ACTIVE')`
- `INDEX (tenant_id)`
- `INDEX (company_id)`
- `INDEX (user_id)`
- `INDEX (role_id)`
- `INDEX (status)`
- `INDEX (company_id, status)`

> **Nota:** La restricción de unicidad (user_id, company_id) se aplica solo sobre memberships `PENDING` o `ACTIVE`. Esto permite que un user que fue `REVOKED` (o `SUSPENDED`) pueda ser re-invitado a la misma company (creando un nuevo membership `PENDING`), sin romper la unicidad.
