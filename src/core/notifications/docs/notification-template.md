# NotificationTemplate Entity

## 1. Entidad

La entidad `NotificationTemplate` representa una plantilla reutilizable que define la estructura y el contenido de una notificación para un canal y un idioma específicos.

Cada `NotificationTemplate` constituye una unidad independiente dentro del dominio `Notifications`, y es resuelto dinámicamente en runtime según el `code`, `channel`, `locale` y `tenantId` de la notificación.

Un `NotificationTemplate` no conoce el significado de negocio del contenido que renderiza: solo conoce su estructura, sus variables y el canal al que aplica.

## NotificationTemplate

| Campo       | Descripción                                                         |
| ----------- | ------------------------------------------------------------------- |
| `id`        | Identificador único del template.                                   |
| `tenantId`  | Identificador del `Tenant` al que pertenece el template, si aplica. |
| `code`      | Código lógico del template (`RESET_PASSWORD`, `INVITATION`, etc.).  |
| `channel`   | Canal al que aplica el template.                                    |
| `locale`    | Idioma y configuración regional del template.                       |
| `subject`   | Asunto del template, obligatorio para el canal `EMAIL`.             |
| `body`      | Contenido del template.                                             |
| `isActive`  | Indicador de si el template está activo.                            |
| `createdAt` | Fecha de creación del template.                                     |
| `updatedAt` | Fecha de la última actualización del template.                      |

## Consideraciones

- El template puede ser global (`tenantId = null`) o específico de un `Tenant`.

- Un template global aplica a todos los tenants.

- Un template específico de un tenant sobrescribe al template global para ese tenant.

- El template posee un `code` que lo identifica lógicamente.

- El template posee un `channel` válido.

- El template posee un `locale` válido.

- El template debe poseer un `subject` cuando su canal es `EMAIL`.

- El template debe poseer un `body`.

- El template posee un indicador `isActive`.

- Un template inactivo no se utiliza para renderizar notificaciones.

- El template no conoce el significado de negocio del contenido que renderiza.

- El template es la raíz de su propio agregado.

## 2. Relaciones

La entidad **NotificationTemplate** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N NotificationTemplates
```

## Descripción

- Un Tenant puede tener múltiples NotificationTemplates específicos.
- Un NotificationTemplate específico pertenece a un único Tenant.
- Un NotificationTemplate global no pertenece a ningún Tenant.
- Un NotificationTemplate es resuelto dinámicamente por las Notification mediante su `code`, `channel`, `locale` y `tenantId`.
- El Tenant proporciona el contexto organizacional necesario para el aislamiento de los templates específicos.

> **Nota:** Los templates globales (`tenantId = null`) son definidos por Neltrik y
> constituyen el comportamiento por defecto para todos los tenants. Un tenant
> puede crear un template específico (`tenantId` no nulo) para sobrescribir el
> global con su propia personalización (branding, idioma, texto legal, links
> propios, etc.). La resolución del template respeta esta jerarquía: primero se
> busca el template del tenant, y si no existe, se utiliza el global.

## 3. Tipos

### 3.1 Enums

#### NotificationChannel

Representa el canal al que aplica un template.

| Canal  | Descripción                                                         |
| ------ | ------------------------------------------------------------------- |
| EMAIL  | El template se utiliza para notificaciones por correo electrónico.  |
| IN_APP | El template se utiliza para notificaciones dentro de la aplicación. |

> **Nota:** **NotificationChannel** se define como const object en **TypeScript**, no como enum en base de datos. En la base de datos se persiste como **VARCHAR**. Esto permite agregar nuevos canales sin requerir migraciones de esquema.

## 4. Reglas de negocio

### 4.1 Creación

- El template debe poseer un `code` no vacío.
- El template debe poseer un `channel` válido.
- El template debe poseer un `locale` válido.
- El template puede pertenecer opcionalmente a un Tenant.
- El template debe poseer un `subject` cuando su canal es `EMAIL`.
- El template debe poseer un `body` no vacío.
- El template inicia con `isActive` en `true`.
- No puede existir más de un template activo con la misma combinación `code` + `channel` + `locale` + `tenantId`.

### 4.2 Gestión

- Solo un `PlatformAdmin` puede gestionar templates globales.
- Solo un administrador de tenant puede gestionar templates específicos de su tenant.
- Un template inactivo no se utiliza para renderizar notificaciones.
- Un template puede activarse o desactivarse.
- Un template puede modificarse en cualquier momento; los cambios aplican a las notificaciones que se rendericen después del cambio.

### 4.3 Resolución

- La resolución del template se realiza en runtime, utilizando `code`, `channel`, `locale` y `tenantId`.
- Si existe un template específico del tenant para esa combinación, se utiliza ese.
- Si no existe un template específico del tenant, se utiliza el template global para esa combinación.
- Si no existe ni template del tenant ni global, la notificación falla con el error `TEMPLATE_NOT_FOUND`.
- Solo se consideran templates activos para la resolución.

### 4.4 Campos actualizables

Los siguientes campos pueden modificarse mediante casos de uso del dominio:

- `subject`
- `body`
- `isActive`
- `updatedAt`

#### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`
- `tenantId`
- `code`
- `channel`
- `locale`
- `createdAt`

### 4.5 Restricciones generales

- Solo actores autorizados pueden gestionar templates.
- Los templates globales solo pueden ser gestionados por un `PlatformAdmin`.
- Los templates específicos de un tenant solo pueden ser gestionados por un administrador de ese tenant.
- Los templates específicos de un tenant nunca son accesibles desde otro tenant, excepto `PlatformAdmin`.
- Toda operación sobre un template debe respetar las 8 capas de autorización del sistema.
- Toda operación sobre un template debe respetar el aislamiento multi-tenant.

## 5. Modelo físico (Base de datos)

### 5.1 Tabla

Nombre sugerido:

`notification_templates`

### 5.2 Columnas

| Columna      | Tipo         | Null | Default             | Observación                          |
| ------------ | ------------ | ---- | ------------------- | ------------------------------------ |
| `id`         | UUID         | ❌   | `gen_random_uuid()` | PK                                   |
| `tenant_id`  | UUID         | ✅   | `NULL`              | Referencia a Tenant. `NULL` = global |
| `code`       | VARCHAR(100) | ❌   | —                   | Código lógico del template           |
| `channel`    | VARCHAR(50)  | ❌   | —                   | Canal al que aplica                  |
| `locale`     | VARCHAR(10)  | ❌   | —                   | Idioma del template                  |
| `subject`    | VARCHAR(255) | ✅   | `NULL`              | Requerido si `channel = EMAIL`       |
| `body`       | TEXT         | ❌   | —                   | Contenido del template               |
| `is_active`  | BOOLEAN      | ❌   | `TRUE`              | Indicador de activo                  |
| `created_at` | TIMESTAMP    | ❌   | `NOW()`             | Fecha de creación                    |
| `updated_at` | TIMESTAMP    | ❌   | `NOW()`             | Fecha de última actualización        |

> **Nota:** El atributo **channel** se persiste como **VARCHAR**. El tipo **NotificationChannel** se define como un const object en **TypeScript** y se valida a nivel de aplicación, lo que permite agregar nuevos canales sin requerir migraciones de esquema.

> **Nota:** El atributo **tenant_id** es nullable. Un valor **NULL** indica que el template es global y aplica a todos los tenants. Un valor no nulo indica que el template es específico de ese tenant y sobrescribe al template global para la misma combinación de `code` + `channel` + `locale`.

### 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` referencia al Tenant al que pertenece el template, si aplica.
- `code` identifica lógicamente el tipo de template.
- `channel` identifica el canal al que aplica el template.
- `locale` identifica el idioma y la región del template.
- `subject` es obligatorio cuando `channel = EMAIL`.
- `body` es obligatorio.
- `is_active` inicia con el valor `TRUE`.
- No puede existir más de un template activo con la misma combinación `code` + `channel` + `locale` + `tenant_id`.
- `tenant_id` es una referencia al dominio Tenant, sin implicar acoplamiento estructural entre dominios.

### 5.4 Índices

- `PK(id)`
- `UNIQUE(code, channel, locale, tenant_id) WHERE is_active = TRUE`
- `INDEX(tenant_id)`
- `INDEX(code)`
- `INDEX(code, channel, locale)`
- `INDEX(tenant_id, code, channel, locale)`

> **Nota:** La restricción de unicidad se aplica solo sobre templates activos. Esto permite conservar templates inactivos como histórico sin romper la unicidad.
