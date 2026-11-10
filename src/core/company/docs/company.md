# Company Entity

## 1. Entidad

La entidad `Company` representa una empresa (la entidad legal/operativa) que pertenece a un Tenant y agrupa recursos y miembros dentro de Neltrik.

Cada `Company` constituye una unidad independiente dentro del dominio `Company`, y es la unidad operativa donde se publican vacantes, se gestionan candidatos, se asignan recruiters, etc.

Una `Company` no conoce el significado de negocio de los recursos que agrupa (vacantes, archivos, notificaciones): solo conoce su identidad, su estado, y los miembros que la componen.

## Company

| Campo       | Descripción                                             |
| ----------- | ------------------------------------------------------- |
| `id`        | Identificador único de la company.                      |
| `tenantId`  | Identificador del `Tenant` al que pertenece la company. |
| `name`      | Nombre de la empresa.                                   |
| `slug`      | Identificador legible y único dentro del tenant.        |
| `status`    | Estado de la company (`ACTIVE`, `SUSPENDED`).           |
| `createdAt` | Fecha de creación de la company.                        |
| `updatedAt` | Fecha de la última actualización de la company.         |

## Consideraciones

- Toda `Company` pertenece obligatoriamente a un único `Tenant`.
- Toda `Company` posee un `slug` único dentro del `Tenant`.
- Toda `Company` posee un `name` válido (no vacío y con longitud definida).
- Toda `Company` posee un `status` válido (`ACTIVE`, `SUSPENDED`).
- Toda `Company` recién creada inicia con el estado `ACTIVE`.
- Una `Company` puede suspenderse.
- Las `Companies` nunca se eliminan físicamente; únicamente pueden cambiar su estado.
- La `Company` no conoce el significado de negocio de los recursos que agrupa.
- La `Company` es la raíz de su propio agregado.
- El `slug` de la `Company` es un Value Object (`CompanySlug`) único dentro del `Tenant`.
- El `name` es un Value Object (`CompanyName`) con validaciones de longitud y no vacío.

## 2. Relaciones

La entidad **Company** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N Companies

Company

1 ─────── N Memberships

Membership

N ─────── 1 User

Membership

N ─────── 1 Role
```

## Descripción

- Un `Tenant` puede tener múltiples `Companies`.
- Una `Company` pertenece a un único `Tenant`.
- Una `Company` tiene múltiples `Memberships`.
- Un `Membership` pertenece a una única `Company`.
- Un `Membership` referencia a un único `User`.
- Un `Membership` referencia a un único `Role`.
- Un `User` puede tener múltiples `Memberships` en distintas `Companies` del mismo `Tenant`.
- El `Tenant` proporciona el contexto organizacional necesario para el aislamiento de las `Companies` y sus `Memberships`.

> **Nota:** El `Tenant` es la organización (el cliente que paga). La `Company` es la empresa (la unidad operativa). Un `Tenant` puede tener una o más `Companies` (ej. un grupo empresarial con varias empresas). Toda `Company` pertenece a un único `Tenant`. El `Membership` es la relación entre un `User` y una `Company`, con un `Role` asignado. Un `User` puede estar en varias `Companies` del mismo `Tenant`, con roles distintos en cada una. El `Membership` hereda el tenantId de su `Company` (no se ingresa manualmente).

## 3. Tipos

### 3.1 Enums

#### CompanyStatus

Representa el estado de una company durante su ciclo de vida.

| Estado    | Descripción                                                   |
| --------- | ------------------------------------------------------------- |
| ACTIVE    | La company está activa y operativa.                           |
| SUSPENDED | La company está suspendida (no operativa, pero no eliminada). |

#### MembershipStatus

Representa el estado de un membership durante su ciclo de vida.

| Estado    | Descripción                                                       |
| --------- | ----------------------------------------------------------------- |
| PENDING   | El membership fue creado (invitación), pero el user no lo aceptó. |
| ACTIVE    | El membership está activo (el user aceptó la invitación).         |
| SUSPENDED | El membership está suspendido (no otorga permisos).               |

### 3.2 Value Objects

#### CompanySlug

Representa el slug de la company (identificador legible, único dentro del tenant).

- **Formato:** minúsculas, números y guiones (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
- **Longitud:** entre 3 y 50 caracteres.
- **Unicidad:** único dentro del `Tenant`.
- **Restricciones:** no puede estar vacío, contener únicamente guiones ni empezar o terminar con un guión.

#### CompanyName

Representa el nombre de la company.

- **Longitud:** entre 1 y 255 caracteres.
- **Restricciones:** no puede estar vacío ni contener únicamente espacios.

## 4. Reglas de negocio

### 4.1 Creación

- La `Company` debe poseer un `tenantId` válido (pertenece a un `Tenant` existente).
- La `Company` debe poseer un `name` no vacío (entre 1 y 255 caracteres).
- La `Company` debe poseer un `slug` válido (formato y longitud entre 3 y 50 caracteres).
- La `Company` debe poseer un `slug` único dentro del `Tenant`.
- La `Company` inicia con `status` en `ACTIVE`.
- No puede existir más de una `Company` con el mismo `slug` dentro del mismo `Tenant`.

### 4.2 Gestión

- Solo un `PlatformAdmin` puede gestionar `Companies` de cualquier `Tenant`.
- Solo un `OwnerTenantAdmin` o `TenantAdmin` puede gestionar `Companies` de su `Tenant`.
- Solo un `CompanyAdmin` puede gestionar su propia `Company`.
- Una `Company` inactiva (`SUSPENDED`) no puede utilizarse para operar (no se publican vacantes, no se invitan `Members`, etc.).
- Una `Company` puede suspenderse o reactivarse.
- Una `Company` puede modificarse en cualquier momento; los cambios aplican a las operaciones posteriores.
- Las `Companies` nunca se eliminan físicamente; únicamente cambian su estado.

### 4.3 Aislamiento

- Una `Company` pertenece exactamente a un único `Tenant`.
- Una `Company` nunca puede pertenecer simultáneamente a múltiples `Tenants`.
- Una `Company` de un `Tenant` nunca es accesible desde otro `Tenant`, excepto para `PlatformAdmin`.
- Toda operación sobre una `Company` debe respetar el aislamiento multi-tenant.

### 4.4 Campos actualizables

Los siguientes campos pueden modificarse mediante casos de uso del dominio:

- `name`
- `slug`
- `status`
- `updatedAt`

#### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`
- `tenantId`
- `createdAt`

### 4.5 Restricciones generales

- Solo los actores autorizados pueden gestionar `Companies`.
- Las `Companies` de un `Tenant` solo pueden ser gestionadas por administradores de ese `Tenant` o por un `PlatformAdmin`.
- Las `Companies` de un `Tenant` nunca son accesibles desde otro `Tenant`, excepto para `PlatformAdmin`.
- Toda operación sobre una `Company` debe respetar las 8 capas de autorización del sistema.
- Toda operación sobre una `Company` debe respetar el aislamiento multi-tenant.

## 5. Modelo físico (Base de datos)

### 5.1 Tabla

Nombre sugerido:

`companies`

### 5.2 Columnas

| Columna      | Tipo         | Null | Default             | Observación                       |
| ------------ | ------------ | ---- | ------------------- | --------------------------------- |
| `id`         | UUID         | ❌   | `gen_random_uuid()` | PK                                |
| `tenant_id`  | UUID         | ❌   | —                   | Referencia a Tenant (obligatorio) |
| `name`       | VARCHAR(255) | ❌   | —                   | Nombre de la empresa              |
| `slug`       | VARCHAR(50)  | ❌   | —                   | Slug único dentro del tenant      |
| `status`     | ENUM         | ❌   | `'ACTIVE'`          | Estado de la company              |
| `created_at` | TIMESTAMP    | ❌   | `NOW()`             | Fecha de creación                 |
| `updated_at` | TIMESTAMP    | ❌   | `NOW()`             | Fecha de última actualización     |

### 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` referencia al `Tenant` al que pertenece la `Company` (obligatorio).
- `tenant_id` es una referencia al dominio `Tenant`, sin implicar acoplamiento estructural entre dominios.
- `name` es obligatorio (no puede estar vacío).
- `slug` es obligatorio (no puede estar vacío y debe cumplir con el formato válido).
- `slug` es único dentro del `Tenant`.
- `status` inicia con el valor `ACTIVE`.
- Las `Companies` nunca se eliminan físicamente; únicamente cambian de estado.

### 5.4 Índices

- `PK (id)`
- `UNIQUE (tenant_id, slug)`
- `INDEX (tenant_id)`
- `INDEX (status)`

> **Nota:** La restricción de unicidad (tenant_id, slug) garantiza que no existan dos companies con el mismo slug dentro del mismo tenant. El slug es único por tenant, no global.
