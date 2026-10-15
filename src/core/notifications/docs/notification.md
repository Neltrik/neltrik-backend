# Notification Entity

## 1. Entidad

La entidad `Notification` representa una comunicación saliente solicitada por un módulo del Core hacia un destinatario dentro de un `Tenant`.

Cada `Notification` constituye la unidad central del dominio `Notifications`, y es la única puerta a través de la cual los módulos de negocio pueden comunicarse con sus usuarios.

Una `Notification` no conoce el significado de negocio de su contenido: solo conoce su `code`, su `payload`, sus canales y su destinatario.

## Notification

| Campo            | Descripción                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `id`             | Identificador único de la notificación.                                    |
| `tenantId`       | Identificador del `Tenant` al que pertenece la notificación.               |
| `recipientId`    | Identificador del `User` destinatario.                                     |
| `recipientEmail` | Email del destinatario, obligatorio si la notificación incluye `EMAIL`.    |
| `code`           | Código del template que define el contenido.                               |
| `channels`       | Canales por los que se entrega la notificación.                            |
| `payload`        | Datos proporcionados por el módulo consumidor para renderizar el template. |
| `locale`         | Idioma y configuración regional para renderizar el template.               |
| `status`         | Estado actual de la notificación.                                          |
| `attempts`       | Cantidad de intentos de envío realizados.                                  |
| `lastError`      | Motivo del último fallo de envío, cuando aplique.                          |
| `sentAt`         | Fecha en la que la notificación fue enviada exitosamente.                  |
| `readAt`         | Fecha en la que el destinatario marcó la notificación como leída.          |
| `createdAt`      | Fecha de creación de la notificación.                                      |
| `updatedAt`      | Fecha de la última actualización de la notificación.                       |

## Consideraciones

- La notificación pertenece obligatoriamente a un único `Tenant`.

- La notificación posee un destinatario que pertenece al mismo `Tenant`.

- La notificación referencia un `NotificationTemplate` por su `code`, no por FK.

- La notificación debe tener al menos un canal.

- La notificación debe tener un `payload` con los datos necesarios para renderizar el template.

- La notificación inicia en estado `PENDING`.

- La notificación puede transicionar a `SENT` o `FAILED`.

- Una notificación `SENT` no puede reenviarse.

- Una notificación `FAILED` puede reintentarse según la política interna del dominio.

- La notificación no conoce el significado de negocio de su contenido.

- La notificación es la raíz del agregado principal del dominio.

## 2. Relaciones

La entidad **Notification** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N Notifications


User (recipient)

1 ─────── N Notifications


NotificationTemplate (por code)

N ─────── 1 NotificationTemplate
```

## Descripción

- Un `Tenant` puede tener múltiples `Notifications`.
- Toda `Notification` pertenece a un único `Tenant`.
- Un `User` puede ser recipient de múltiples `Notifications`.
- Toda `Notification` posee un único recipient, identificado mediante `recipientId`.
- Una `Notification` referencia un `NotificationTemplate` mediante su atributo `code`, sin establecer una relación mediante clave foránea (FK).
- La resolución del template se realiza dinámicamente en tiempo de ejecución, buscando un template activo que coincida con `code`, `channel`, `locale` y `tenantId`. Si no existe una coincidencia específica para el tenant, se utiliza como fallback el template global (`tenantId = null`).
- El `Tenant` proporciona el contexto organizacional necesario para garantizar el aislamiento de las notificaciones.

# 3. Tipos

## 3.1 Enums

### NotificationStatus

Representa el estado actual de una notificación.

| Estado    | Descripción                                                          |
| --------- | -------------------------------------------------------------------- |
| `PENDING` | La notificación fue creada y está esperando ser procesada.           |
| `SENT`    | La notificación fue entregada exitosamente por todos sus canales.    |
| `FAILED`  | La notificación falló al entregarse por al menos uno de sus canales. |

### NotificationChannel

Representa el canal por el cual se entrega una notificación.

| Canal    | Descripción                                         |
| -------- | --------------------------------------------------- |
| `EMAIL`  | La notificación se entrega por correo electrónico.  |
| `IN_APP` | La notificación se entrega dentro de la aplicación. |

> **Nota:** **NotificationChannel** se define como const object en **TypeScript**, no como enum en base de datos. En la base de datos se persiste como `VARCHAR[]`. Esto permite agregar nuevos canales sin requerir migraciones de esquema.

> **Nota:** **NotificationStatus** se define como const object en **TypeScript** y como enum en base de datos, ya que se utiliza para filtrar y consultar notificaciones por estado con frecuencia.

# 4. Reglas de negocio

## 4.1 Creación

- La notificación debe pertenecer obligatoriamente a un `Tenant`.
- La notificación debe tener un `recipientId` perteneciente al mismo `Tenant`.
- La notificación debe tener un `code` no vacío.
- La notificación debe tener al menos un canal válido.
- La notificación debe tener un `payload` válido (puede ser vacío).
- La notificación debe tener un `locale` válido.
- La notificación inicia con el estado `PENDING`.
- La notificación inicia con `attempts` en `0`.
- La notificación inicia con `lastError` en `null`.
- La notificación inicia con `sentAt` en `null`.
- La notificación inicia con `readAt` en `null`.
- Si la notificación incluye el canal `EMAIL`, debe tener un `recipientEmail` válido.
- Si la notificación no incluye el canal `EMAIL`, el `recipientEmail` puede ser `null`.
- La creación de una notificación solo puede ser realizada a través de `NotificationApi`, consumida por los módulos del Core.

## 4.2 Envío

- El envío se realiza por cada canal declarado en la notificación.
- El canal `EMAIL` requiere `recipientEmail`.
- El canal `IN_APP` no requiere `recipientEmail`.
- Si el renderizado del template falla, la notificación transiciona a `FAILED`.
- Si el envío por un canal falla, la notificación transiciona a `FAILED`.
- Si el envío por todos los canales es exitoso, la notificación transiciona a `SENT`.
- Al transicionar a `SENT`, se registra `sentAt` con la fecha actual.
- Al transicionar a `FAILED`, se registra `lastError` con el motivo del fallo.
- Cada intento de envío incrementa el campo `attempts`.
- La cantidad máxima de intentos es configurable a nivel de plataforma.
- Al agotarse la cantidad máxima de intentos, la notificación permanece en `FAILED`.
- El proveedor utilizado para cada canal es una decisión interna de Notifications.

## 4.3 Lectura

- Solo una notificación que incluye el canal `IN_APP` puede marcarse como leída.
- Una notificación que no incluye el canal `IN_APP` no puede marcarse como leída.
- Solo el destinatario de la notificación puede marcarla como leída.
- Al marcarse como leída, se registra `readAt` con la fecha actual.
- Marcar como leída una notificación ya leída es una operación idempotente.

## 4.4 Estados y transiciones

- `PENDING` → `SENT` (envío exitoso por todos los canales).
- `PENDING` → `FAILED` (fallo en el envío por al menos un canal).
- `SENT` → estado final, no transiciona.
- `FAILED` → estado final, no transiciona.

## 4.5 Campos actualizables

Los siguientes campos pueden modificarse mediante las transiciones del dominio:

- `status`
- `attempts`
- `lastError`
- `sentAt`
- `readAt`
- `updatedAt`

### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`
- `tenantId`
- `recipientId`
- `recipientEmail`
- `code`
- `channels`
- `payload`
- `locale`
- `createdAt`

## 4.6 Restricciones generales

- Solo actores autorizados pueden consultar notificaciones.
- Ninguna notificación puede ser accedida por un `User` de otro `Tenant`, excepto `PlatformAdmin`.
- Ninguna notificación puede ser accedida por un `User` que no sea su destinatario, excepto `PlatformAdmin`.
- Toda operación sobre una notificación debe respetar las 8 capas de autorización del sistema.
- Toda operación sobre una notificación debe respetar el aislamiento multi-tenant.
- Ningún `User` puede solicitar el envío de una notificación directamente.
- El envío de notificaciones solo puede solicitarse a través de `NotificationApi`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
notifications
```

---

## 5.2 Columnas

| Columna        | Tipo           | Null | Default             | Observación                                      |
| -------------- | -------------- | ---- | ------------------- | ------------------------------------------------ |
| `id`           | `UUID`         | ❌   | `gen_random_uuid()` | PK                                               |
| `tenant_id`    | `UUID`         | ❌   | —                   | Referencia a `Tenant`                            |
| `recipient_id` | `UUID`         | ❌   | —                   | Referencia a `User`                              |
| `code`         | `VARCHAR(100)` | ❌   | —                   | Código del template                              |
| `status`       | `ENUM`         | ❌   | `PENDING`           | Enum en DB                                       |
| `channels`     | `VARCHAR[]`    | ❌   | —                   | Canales de entrega                               |
| `payload`      | `JSONB`        | ❌   | —                   | Datos necesarios para renderizar la notificación |
| `locale`       | `VARCHAR(10)`  | ❌   | —                   | Idioma y región de la notificación               |
| `created_at`   | `TIMESTAMP`    | ❌   | `NOW()`             | Fecha de creación                                |
| `updated_at`   | `TIMESTAMP`    | ❌   | `NOW()`             | Fecha de última actualización                    |

> **Nota:** El valor `PENDING` se define en la entidad **Notification** al momento de su creación. El `default` en la base de datos actúa únicamente como red de seguridad.

> **Nota:** El atributo **channels** almacena los canales de entrega como `VARCHAR[]`. El tipo **NotificationChannel** se define como un `const object` en TypeScript y se valida a nivel de aplicación, lo que permite agregar nuevos canales sin requerir migraciones de esquema.

> **Nota:** El atributo **code** identifica el template mediante un código lógico, no mediante una clave foránea. La resolución del template se realiza en runtime utilizando los criterios **code**, **channel**, **locale** y **tenantId**, con fallback al template global (`tenantId = null`).

---

## 5.3 Restricciones

- `id` es la clave primaria.
- `tenant_id` identifica el `Tenant` al que pertenece la notificación y permite garantizar el aislamiento organizacional.
- `recipient_id` identifica al `User` destinatario de la notificación.
- `code` identifica el template lógico que se utilizará para renderizar la notificación.
- `status` inicia con el valor `PENDING`.
- `channels` debe contener al menos un canal de entrega válido.
- `payload` contiene los datos necesarios para renderizar la notificación mediante el template correspondiente.
- `locale` identifica el idioma y la región utilizados para resolver el template.
- `tenant_id` y `recipient_id` son referencias a los dominios **Tenant** e **Identity**, respectivamente, sin implicar acoplamiento estructural entre dominios.
- `code` no establece una FK hacia `NotificationTemplate`; la asociación se resuelve dinámicamente en tiempo de ejecución.
- `status` se persiste como enum en la base de datos y se define como enum en TypeScript.

> **Nota:** Los conceptos **NotificationStatus**, **NotificationChannel**, **NotificationPayload**, **NotificationRecipient**, **NotificationLocale** y **NotificationCode** no se modelan como entidades ni como Value Objects. Se representan mediante atributos de la entidad **Notification**, según corresponda, ya que no poseen identidad propia ni ciclo de vida independiente.

---

## 5.4 Índices

- `PK(id)`
- `INDEX(tenant_id)`
- `INDEX(recipient_id)`
- `INDEX(tenant_id, status)`
- `INDEX(tenant_id, recipient_id, created_at)` — facilita la consulta del historial de notificaciones de un destinatario dentro de un tenant.
- `INDEX(tenant_id, code)` — facilita la consulta de notificaciones por código de template.
- `INDEX(tenant_id, created_at)` — facilita la consulta de notificaciones por tenant y fecha de creación.

> **Nota:** No se define una restricción de unicidad entre **Notification** y **NotificationTemplate**, ya que la resolución del template depende de `code`, `channel`, `locale` y `tenantId`, y se realiza dinámicamente en runtime.
