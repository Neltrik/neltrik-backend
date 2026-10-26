# NotificationPreference Entity

## 1. Entidad

La entidad `NotificationPreference` representa la configuración de un `User` sobre qué notificaciones desea recibir y por qué canales.

Cada `NotificationPreference` constituye una unidad independiente dentro del dominio `Notifications`, y es consultada antes de enviar una notificación para determinar si el destinatario acepta recibirla por un canal y categoría específicos.

Una `NotificationPreference` no conoce el significado de negocio del contenido que filtra: solo conoce el canal, la categoría y si está habilitada o deshabilitada.

## NotificationPreference

| Campo       | Descripción                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `id`        | Identificador único de la preferencia.                                                    |
| `tenantId`  | Identificador del `Tenant` al que pertenece la preferencia.                               |
| `ownerId`   | Identificador del `User` al que pertenece la preferencia.                                 |
| `channel`   | Canal al que aplica la preferencia.                                                       |
| `category`  | Categoría de notificación a la que aplica la preferencia.                                 |
| `enabled`   | Indicador de si el usuario acepta recibir notificaciones del canal y categoría indicados. |
| `createdAt` | Fecha de creación de la preferencia.                                                      |
| `updatedAt` | Fecha de la última actualización de la preferencia.                                       |

## Consideraciones

- La preferencia pertenece obligatoriamente a un único `Tenant`.

- La preferencia pertenece obligatoriamente a un único `User` del mismo `Tenant`.

- La preferencia posee un `channel` válido.

- La preferencia posee una `category` válida.

- La preferencia puede estar habilitada o deshabilitada.

- Las notificaciones transaccionales no pueden deshabilitarse por preferencia.

- Las notificaciones no transaccionales pueden deshabilitarse por canal.

- Si un `User` no posee una preferencia explícita para una combinación `channel + category`, se aplica el comportamiento por defecto del dominio.

- La preferencia no conoce el significado de negocio del contenido que filtra.

- La preferencia es la raíz de su propio agregado.

## 2. Relaciones

La entidad **NotificationPreference** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N NotificationPreferences


User

1 ─────── N NotificationPreferences
```

## Descripción

- Un Tenant puede tener múltiples NotificationPreferences.
- Toda NotificationPreference pertenece a un único Tenant.
- Un User puede tener múltiples NotificationPreferences.
- Toda NotificationPreference pertenece a un único User.
- El Tenant proporciona el contexto organizacional necesario para garantizar el aislamiento de las preferencias.
- La NotificationPreference se consulta antes de enviar una notificación para determinar si el destinatario acepta recibirla por el canal y la categoría indicados.

## 3. Tipos

### 3.1 Enums

#### NotificationChannel

Representa el canal al que aplica la preferencia.

| Canal    | Descripción                                                     |
| -------- | --------------------------------------------------------------- |
| `EMAIL`  | La preferencia aplica a notificaciones por correo electrónico.  |
| `IN_APP` | La preferencia aplica a notificaciones dentro de la aplicación. |

#### NotificationCategory

Representa la categoría de la notificación a la que aplica la preferencia.

| Categoría       | Descripción                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `TRANSACTIONAL` | Notificación transaccional, generada como resultado de una acción del usuario o del sistema. No puede deshabilitarse. |
| `MARKETING`     | Notificación no transaccional, con fines informativos o promocionales. Puede deshabilitarse.                          |

> **Nota:** `NotificationChannel` y `NotificationCategory` se definen como `const objects` en TypeScript, no como enums en base de datos. En la base de datos se persisten como `VARCHAR`. Esto permite agregar nuevos canales y categorías sin requerir migraciones de esquema.

> **Nota:** `NotificationCategory` vive en `core/notifications/domain/types/`, junto con `NOTIFICATION_CHANNEL`.

#### NotificationCodeCategory

Mapea cada `code` de notificación a su categoría.

```ts
export const NOTIFICATION_CODE_CATEGORIES = {
    RESET_PASSWORD: "TRANSACTIONAL",
    EMAIL_VERIFICATION: "TRANSACTIONAL",
    INVITATION: "TRANSACTIONAL",
    WELCOME: "MARKETING", // ejemplo cuando exista
} as const;
```

> **Nota:** Vive en `core/notifications/domain/catalog/`. La categoría se determina por el `code`, no por el template ni por el consumidor.

## 4. Reglas de negocio

### 4.1 Creación

- La preferencia debe pertenecer obligatoriamente a un Tenant.
- La preferencia debe pertenecer obligatoriamente a un User del mismo Tenant.
- La preferencia debe tener un `channel` válido.
- La preferencia debe tener una `category` válida.
- La preferencia inicia con `enabled` en `true` por defecto.
- No puede existir más de una preferencia por combinación `ownerId` + `channel` + `category`.

### 4.2 Gestión

- Solo el propio User puede gestionar sus preferencias.
- Un PlatformAdmin puede consultar las preferencias de cualquier usuario.
- La preferencia puede habilitarse o deshabilitarse.
- La preferencia puede eliminarse, en cuyo caso se aplica el comportamiento por defecto.
- `GET /notifications/preferences` — Lista las preferencias del usuario.
- `POST /notifications/preferences` — Crea una preferencia.
- `PATCH /notifications/preferences/:id` — Actualiza `enabled`.
- `DELETE /notifications/preferences/:id` — Elimina (se aplica el default).
- El usuario puede crear, actualizar y eliminar sus propias preferencias.
- El admin del tenant puede consultar las preferencias de los usuarios de su tenant.
- El `PlatformAdmin` puede consultar las preferencias de cualquier usuario.

### 4.3 Aplicación

- Antes de enviar una notificación, se consultan las preferencias del destinatario.
- Si el destinatario tiene una preferencia explícita que deshabilita la combinación `channel` + `category`, la notificación no se envía por ese canal.
- Si el destinatario no tiene una preferencia explícita, se aplica el comportamiento por defecto del dominio.
- El comportamiento por defecto es enabled = true. El usuario acepta la notificación. El usuario debe hacer opt-out explícito para deshabilitar una notificación de marketing.
- Las notificaciones transaccionales no se filtran por preferencias.
- Solo las notificaciones no transaccionales se filtran por preferencias.
- Las preferencias se consultan en `SendNotificationOhsUseCase` antes de crear la notificación.
- Se consulta la categoría del `code` vía `NOTIFICATION_CODE_CATEGORIES`.
- Si es `TRANSACTIONAL`, no se consultan preferencias.
- Si es `MARKETING`, se consultan las preferencias por canal.
- Si todos los canales se omiten, la notificación no se crea.
- Si algunos canales quedan, la notificación se crea solo con los restantes.

### 4.4 Campos actualizables

Los siguientes campos pueden modificarse mediante casos de uso del dominio:

- `enabled`
- `updatedAt`

#### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`
- `tenantId`
- `ownerId`
- `channel`
- `category`
- `createdAt`

### 4.5 Restricciones generales

- Solo el propio User puede gestionar sus preferencias.
- Las preferencias de un User nunca son accesibles desde otro User, excepto PlatformAdmin.
- Las preferencias de un Tenant nunca son accesibles desde otro Tenant, excepto PlatformAdmin.
- Toda operación sobre una preferencia debe respetar las 8 capas de autorización del sistema.
- Toda operación sobre una preferencia debe respetar el aislamiento multi-tenant.

## 5. Modelo físico (Base de datos)

### 5.1 Tabla

Nombre sugerido:

```text
notification_preferences
```

### 5.2 Columnas

| Columna      | Tipo        | Null | Default             | Observación                   |
| ------------ | ----------- | ---- | ------------------- | ----------------------------- |
| `id`         | UUID        | ❌   | `gen_random_uuid()` | PK                            |
| `tenant_id`  | UUID        | ❌   | —                   | Referencia a Tenant           |
| `owner_id`   | UUID        | ❌   | —                   | Referencia a User             |
| `channel`    | VARCHAR(50) | ❌   | —                   | Canal al que aplica           |
| `category`   | VARCHAR(50) | ❌   | —                   | Categoría a la que aplica     |
| `enabled`    | BOOLEAN     | ❌   | `TRUE`              | Indicador de habilitado       |
| `created_at` | TIMESTAMP   | ❌   | `NOW()`             | Fecha de creación             |
| `updated_at` | TIMESTAMP   | ❌   | `NOW()`             | Fecha de última actualización |

> **Nota:** Los atributos `channel` y `category` se persisten como `VARCHAR`. Los tipos `NotificationChannel` y `NotificationCategory` se definen como `const objects` en TypeScript y se validan a nivel de aplicación, lo que permite agregar nuevos canales y categorías sin requerir migraciones de esquema.

### 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` referencia al Tenant al que pertenece la preferencia.
- `owner_id` referencia al User al que pertenece la preferencia.
- `channel` identifica el canal al que aplica la preferencia.
- `category` identifica la categoría a la que aplica la preferencia.
- `enabled` inicia con el valor `TRUE`.
- No puede existir más de una preferencia por combinación `owner_id` + `channel` + `category`.
- `tenant_id` y `owner_id` son referencias a los dominios Tenant e Identity, respectivamente, sin implicar acoplamiento estructural entre dominios.

### 5.4 Índices

- `PK(id)`
- `UNIQUE(owner_id, channel, category)`
- `INDEX(tenant_id)`
- `INDEX(owner_id)`
- `INDEX(tenant_id, owner_id)`
