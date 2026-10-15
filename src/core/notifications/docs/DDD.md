# Notifications

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Notifications** es responsable de administrar todo lo relacionado con la comunicación saliente de **Neltrik** hacia sus usuarios: la recepción de solicitudes de notificación desde otros módulos, la definición y gestión de canales, la definición y renderizado de templates, la selección y gestión de los proveedores de envío subyacentes, el envío efectivo, el registro del estado de cada notificación y su ciclo de vida.

Su responsabilidad principal es ser el único dueño del dominio de notificaciones en la plataforma, y la fuente de verdad sobre cómo se envía cada notificación. Ningún otro módulo debe conocer detalles sobre canales, templates, proveedores de envío (SMTP, SendGrid, SES, Twilio, FCM, APNs), reintentos ni tracking. Cualquier módulo que necesite notificar a un usuario debe hacerlo exclusivamente a través de las interfaces públicas de Notifications, declarando qué quiere notificar y a quién, sin conocer cómo se envía.

El proveedor de envío es una decisión interna de Notifications. Cambiar de Nodemailer a SendGrid, o agregar Twilio para SMS, o FCM para push, no impacta a los módulos consumidores. El consumidor solicita "enviar email de reset password a este usuario", y Notifications decide el proveedor, el formato, los reintentos y el canal.

El módulo debe diseñarse de forma extensible para permitir incorporar nuevos canales, nuevos templates, nuevos proveedores de envío y nuevas capacidades (preferencias, tracking, agrupación) sin modificar las reglas fundamentales del dominio.

El módulo es **multi-tenant**: cada notificación pertenece a un tenant y a un destinatario, y las 8 capas de autorización del sistema aplican sobre ella igual que sobre cualquier otro recurso.

---

## Responsabilidades

El módulo **Notifications** es responsable de:

- Recibir solicitudes de notificación provenientes de cualquier módulo de negocio.
- Definir y mantener el catálogo oficial de canales de notificación (EMAIL, IN_APP, y futuros).
- Definir y mantener el catálogo oficial de templates de notificación.
- Renderizar templates con los datos provistos por el módulo consumidor.
- Definir y gestionar los proveedores de envío subyacentes (Nodemailer, SendGrid, SES, Twilio, FCM, APNs, y futuros).
- Abstraer cada proveedor detrás de un contrato (port), para que cambiar de proveedor sea una decisión interna.
- Seleccionar el proveedor adecuado según el canal, la configuración del tenant y las políticas internas.
- Enviar notificaciones a través de los proveedores configurados.
- Registrar el estado y el historial de intentos de cada notificación (pendiente, enviada, fallida, readAt, sentAt, attempts, lastError) en su propia tabla.
- Gestionar reintentos y manejo de errores de envío.
- Gestionar el ciclo de vida de cada notificación (pendiente, enviada, fallida).
- Servir las notificaciones in-app a los usuarios a través de endpoints HTTP.
- Permitir marcar notificaciones in-app como leídas.
- Garantizar que cada tenant solo acceda a sus propias notificaciones.
- Garantizar que cada usuario solo acceda a sus propias notificaciones in-app.
- Exponer NotificationApi (OHS) para que otros módulos del Core soliciten notificaciones.
- Exponer endpoints HTTP para que el front y consumidores externos operen sobre notificaciones in-app.
- Permitir la incorporación futura de nuevos canales sin modificar el dominio.
- Permitir la incorporación futura de nuevos templates sin modificar el dominio.
- Permitir la incorporación futura de nuevos proveedores de envío sin modificar el dominio ni los módulos consumidores.
- Permitir la incorporación futura de preferencias de usuario.
- Permitir la incorporación futura de tracking de apertura y clicks.
- Permitir la incorporación futura de agrupación y digest de notificaciones.

---

## No es responsabilidad del módulo

El módulo **Notifications** no administra:

- Las reglas de negocio que originan una notificación (ej: cuándo enviar un reset password).
- La decisión de a quién notificar.
- El contenido específico de cada notificación (el template define la forma; el módulo consumidor provee los datos).
- La elección del proveedor de envío por parte del módulo consumidor (el consumidor no elige el proveedor; lo hace Notifications).
- La auditoría de las acciones que originan notificaciones (eso lo hace el módulo consumidor vía Audit).
- Usuarios, roles, permisos ni policies de autorización.
- La autenticación de usuarios.
- La gestión de tenants.
- El envío de notificaciones internas entre módulos (eso no es del dominio de Notifications; es comunicación inter-módulos).
- La definición de las preferencias de notificación del usuario (futuro, pero cuando existan, el módulo administra el almacenamiento y la aplicación, no la política de qué es opt-out y qué no).

> **Nota:** Notifications puede consultar información proporcionada por otros módulos mediante sus interfaces públicas (api/), pero no debe administrar sus entidades ni duplicar sus reglas de negocio. En particular, no sabe por qué se envía una notificación: solo sabe que debe enviarla, con qué template, a quién, por qué canales, y decide cómo enviarla.

---

## ¿Qué representa Notifications?

El módulo **Notifications** representa el dominio único y centralizado de comunicación saliente de **Neltrik**.

El dominio debe separar la notificación (el evento en sí, con su destinatario, template y canales) de las reglas de negocio que la originan. Una notificación existe en Notifications independientemente de qué módulo la haya solicitado o por qué.

El dominio también debe separar la notificación del proveedor de envío. La notificación se define por su destinatario, template, canales y estado. El proveedor es un detalle de implementación que puede cambiar sin afectar el dominio ni los consumidores.

Cada notificación representa un envío con un tenant, un destinatario, un template, un payload, uno o más canales, un estado, un proveedor usado y un historial de intentos.

El conjunto de templates es abierto y extensible. Para el MVP se cubrirán los templates críticos de los módulos de negocio, pero el dominio deberá permitir incorporar nuevos templates sin modificar las reglas fundamentales de Notifications.

El conjunto de proveedores es abierto y extensible. Agregar un nuevo proveedor (SendGrid, SES, Twilio, FCM) es agregar un adapter. No modifica el dominio ni los consumidores.

El ciclo de vida de una notificación es gestionado internamente por Notifications, y los módulos consumidores solo observan el estado resultante a través de las interfaces públicas.

Las notificaciones se consumen mediante:

- `NotificationApi` (OHS): para que otros módulos del Core soliciten notificaciones.
- Endpoints HTTP (controllers): para que el front consulte y gestione las notificaciones in-app.

---

## Contexto dentro de la plataforma

```text
                       Notifications
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    Ingestion            Delivery            Tracking
        │                    │                    │
        ▼                    ▼                    ▼
   Solicitudes         Canales            Apertura (futuro)
   Templates           Proveedores        Clicks (futuro)
   Validación          Reintentos         Preferencias (futuro)
                       Estado
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                       Channel Ports
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
            Email         In-App         (futuro)
                             │              Push
                             │              SMS
                             ▼              WhatsApp
                    Providers (internos)
                    ┌──────┼──────┐
                    ▼      ▼      ▼
                  SMTP   SendGrid  SES
                  (MVP)  (futuro) (futuro)
```

## Dependencias

El módulo **Notifications** podrá depender de otros módulos del Core exclusivamente a través de sus interfaces públicas (`api/`), respetando la arquitectura modular definida por Neltrik. Queda prohibida la importación directa de entidades, servicios, repositorios o cualquier otro elemento interno de módulos externos.

### Interfaces expuestas

Notifications expone dos mecanismos de consumo:

- **`NotificationApi` (OHS):** interfaz pública para que otros módulos del Core soliciten notificaciones sin conocer los detalles de implementación del dominio.
- **Endpoints HTTP (`controllers`):** interfaz externa para que el front y otros consumidores autorizados consulten y gestionen las notificaciones in-app.

### Reglas de dependencia y consumo

- Los módulos del Core que necesiten solicitar notificaciones deberán consumir exclusivamente `NotificationApi`, a través de la interfaz pública de Notifications.
- El front y los consumidores externos interactuarán con las notificaciones in-app exclusivamente mediante los endpoints HTTP expuestos por Notifications.
- Los módulos consumidores no podrán importar ni utilizar directamente los servicios internos, repositorios, entidades, templates, canales, adapters o proveedores de envío de Notifications.
- Los módulos consumidores no conocerán ni seleccionarán los proveedores de envío. La selección del proveedor, la gestión de canales, los reintentos y los detalles de entrega son responsabilidad exclusiva de Notifications.
- Las dependencias entre módulos deberán ser explícitas y unidireccionales, evitando acoplamientos con detalles de implementación y preservando la autonomía de cada dominio.
- Cualquier cambio en los proveedores de envío o en la implementación interna de Notifications deberá realizarse sin exigir modificaciones en los módulos consumidores, siempre que se mantenga el contrato público de `NotificationApi`.

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- **User (destinatario)**
- **Sistema / Cliente**
- **Módulos del Core**
- **Platform Admin**

### Nota sobre el comportamiento del dominio

Notifications no inicia acciones de negocio por sí mismo. Recibe solicitudes de los módulos del Core, las procesa según las reglas del dominio y entrega las notificaciones a sus destinatarios.

Las acciones que Notifications ejecuta de forma autónoma, como el envío y los reintentos, son reacciones a solicitudes previas, no acciones de negocio originadas por el propio módulo.

---

## 📦 Entidades (¿Qué información administra el dominio?)

Las siguientes entidades candidatas se validarán en el Paso 3:

- Notification _(se valida en el Paso 3)_
- Notification Template _(se valida en el Paso 3)_
- Notification Preference _(se valida en el Paso 3)_

---

## 💡Conceptos del negocio

### Conceptos principales

- **Notification:** representa una notificación solicitada para un destinatario dentro de un tenant.
- **Notification Status:** representa el estado actual de una notificación durante su ciclo de vida.
- **Notification Channel:** representa el canal mediante el cual se entrega una notificación.
- **Notification Template:** define la estructura y el formato del contenido de una notificación.
- **Notification Code:** identifica el tipo de notificación solicitado por un módulo consumidor.
- **Notification Locale:** representa el idioma y la configuración regional utilizados para renderizar una notificación.
- **Notification Payload:** contiene los datos proporcionados por el módulo consumidor para renderizar el contenido de la notificación.
- **Notification Recipient:** representa al destinatario de la notificación.
- **Notification Sender:** representa el componente responsable de coordinar la entrega de una notificación.
- **Notification Attempt:** representa un intento individual de envío de una notificación.
- **Notification Retry:** representa la repetición de un intento de envío fallido según las políticas internas del dominio.
- **Notification Provider:** representa el proveedor técnico utilizado para realizar la entrega de una notificación.

---

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto                | Estado        |
| ----------------------- | ------------- |
| Notification            | ✅ Confirmada |
| Notification Template   | ✅ Confirmada |
| Notification Preference | ✅ Confirmada |

> **Nota:** **Notification** es raíz de su propio agregado porque: tiene identidad propia, tiene su propio ciclo de vida, no depende de `NotificationTemplate` ni de `NotificationPreference`, y tiene su propio repositorio.

> **Nota:** **NotificationTemplate** es raíz de su propio agregado porque: tiene identidad propia, tiene su propio ciclo de vida (`isActive`, versiones), no depende de `Notification` ni de `NotificationPreference`, y tiene su propio repositorio.

> **Nota:** **Notification Status**, **Notification Channel**, **Notification Locale**, **Notification Payload** y **Notification Recipient** no se modelan como entidades. Se modelan como value objects dentro del agregado `Notification`, ya que no poseen identidad propia ni ciclo de vida independiente.

> **Nota:** **Notification Attempt**, **Notification Retry** y **Notification Provider** no se modelan como entidades. Son atributos de `Notification` o conceptos técnicos de infraestructura.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
        Tenant
            │
            ├── Notification
            │       │
            │       └── NotificationAttempt
            │
            ├── NotificationTemplate
            │
            └── NotificationPreference
```

> **Nota:** Toda **Notification** pertenece obligatoriamente a un único **Tenant**, el cual proporciona el contexto organizacional utilizado para garantizar el aislamiento de la información entre organizaciones.

> **Nota:** Toda **Notification** posee un destinatario (`recipientId`), que es un **User** del mismo **Tenant**. El `recipientEmail` es obligatorio únicamente cuando la notificación incluye el canal `EMAIL`.

> **Nota:** Toda **Notification** referencia un **NotificationTemplate** mediante su `code`, no mediante una clave foránea (FK). La resolución del template es dinámica: se busca el template activo que coincida con `code + channel + locale + tenantId`, con fallback al template global (`tenantId = null`).

> **Nota:** Todo **NotificationTemplate** pertenece opcionalmente a un único **Tenant**. Un template con `tenantId = null` es global. Un template con un `tenantId` específico sobrescribe al template global para ese tenant.

> **Nota:** Toda **NotificationPreference** pertenece obligatoriamente a un único **Tenant** y a un único **User** del mismo **Tenant**.

---

## Parte B — Reglas de negocio

### Notification

- Toda Notification posee un identificador único.
- Toda Notification pertenece obligatoriamente a un único Tenant.
- Toda Notification posee un destinatario perteneciente al mismo Tenant.
- Toda Notification debe tener un `code` de template válido.
- Toda Notification debe tener al menos un canal.
- Toda Notification debe tener un payload con los datos necesarios para renderizar el template.
- Toda Notification debe tener un estado válido.
- Toda Notification recién creada inicia con el estado `PENDING`.
- Una Notification puede transicionar a `SENT` o `FAILED`.
- Una Notification en estado `SENT` no puede reenviarse.
- Una Notification en estado `FAILED` puede reintentarse según la política interna del dominio.
- Una Notification en estado `SENT` registra `sentAt`.
- Una Notification en estado `FAILED` registra `lastError`.
- Una Notification acumula la cantidad de intentos en `attempts`.
- Una Notification que incluye el canal `IN_APP` puede marcarse como leída mediante el registro de `readAt`.
- Una Notification que no incluye el canal `IN_APP` no puede marcarse como leída.
- Una Notification solo puede marcarse como leída por su destinatario.
- Las Notification de un Tenant nunca son accesibles desde otro Tenant.

---

### NotificationTemplate

- Todo NotificationTemplate posee un identificador único.
- Todo NotificationTemplate posee un `code`.
- Todo NotificationTemplate posee un `channel` válido.
- Todo NotificationTemplate posee un `locale` válido.
- Todo NotificationTemplate pertenece opcionalmente a un único Tenant (`tenantId` nullable).
- Todo NotificationTemplate debe poseer un `subject` cuando su canal es `EMAIL`.
- Todo NotificationTemplate debe poseer un `body`.
- Todo NotificationTemplate posee un indicador `isActive`.
- No puede existir más de un NotificationTemplate activo con la misma combinación `code + channel + locale + tenantId`.
- Un NotificationTemplate inactivo no se utiliza para renderizar notificaciones.
- Si existe un NotificationTemplate específico del tenant para una combinación `code + channel + locale`, se utiliza ese template.
- Si no existe un NotificationTemplate específico del tenant, se utiliza el NotificationTemplate global correspondiente a `code + channel + locale`.
- Si no existe ni un template específico del tenant ni uno global, la Notification falla con el error `TEMPLATE_NOT_FOUND`.
- Los NotificationTemplate globales solo pueden ser gestionados por un `PlatformAdmin`.
- Los NotificationTemplate específicos de un tenant solo pueden ser gestionados por un administrador de ese tenant.

---

### NotificationPreference

- Toda NotificationPreference pertenece obligatoriamente a un único Tenant.
- Toda NotificationPreference pertenece obligatoriamente a un único User del mismo Tenant.
- Toda NotificationPreference posee un `channel` válido.
- Toda NotificationPreference posee una `category` válida.
- Toda NotificationPreference puede estar habilitada o deshabilitada.
- Las notificaciones transaccionales no pueden deshabilitarse mediante preferencias.
- Las notificaciones no transaccionales pueden deshabilitarse por canal.
- Si un User no posee una NotificationPreference explícita para una combinación `channel + category`, se aplica el comportamiento por defecto del dominio.
- Las NotificationPreference de un User nunca son accesibles desde otro User, excepto por un `PlatformAdmin`.

---

### NotificationAttempt

- Cada intento de envío incrementa el campo `attempts` de la Notification.
- Cada fallo actualiza el campo `lastError` de la Notification.
- La cantidad máxima de intentos es configurable a nivel de plataforma.
- Al agotarse la cantidad máxima de intentos, la Notification transiciona a `FAILED`.
- Los intentos no se modelan como una entidad independiente; se representan mediante atributos de la Notification.

---

### Envío de la Notification

- Toda Notification debe tener un `code` de template válido y al menos un canal.
- Toda Notification debe tener los datos necesarios en su payload para renderizar el template.
- El envío se realiza por cada canal declarado en la Notification.
- El canal `EMAIL` requiere `recipientEmail`.
- El canal `IN_APP` no requiere `recipientEmail`.
- Si el renderizado del template falla, la Notification transiciona a `FAILED`.
- Si el envío por un canal falla, la Notification transiciona a `FAILED`.
- Si el envío por todos los canales es exitoso, la Notification transiciona a `SENT`.
- El proveedor utilizado para cada canal es una decisión interna de Notifications.
- Los módulos consumidores no pueden seleccionar ni gestionar directamente los proveedores de envío.

---

### Administración de Notifications

- Un `PlatformAdmin` puede consultar cualquier Notification de la plataforma.
- Un administrador de tenant puede consultar las Notification de su tenant según las reglas definidas por el dominio Authorization.
- Un User puede consultar las Notification cuyo destinatario sea él mismo.
- Un User puede marcar como leídas las Notification que incluyan el canal `IN_APP` y cuyo destinatario sea él mismo.
- Ningún User puede solicitar el envío de Notification directamente.
- El envío de notificaciones solo puede solicitarse a través de `NotificationApi`, consumida por los módulos del Core.
- Los módulos consumidores no conocen los detalles internos del procesamiento, los canales concretos ni los proveedores de envío.

---

### Aislamiento

- Toda Notification pertenece exactamente a un único Tenant.
- Una Notification nunca puede pertenecer simultáneamente a múltiples Tenant.
- El Tenant proporciona el contexto organizacional utilizado por Notifications para garantizar el aislamiento de las notificaciones entre organizaciones.
- Todo destinatario de una Notification pertenece al mismo Tenant que la notificación.
- Ninguna Notification puede ser accedida por un User de otro Tenant, excepto por un `PlatformAdmin`.
- Ninguna Notification puede ser accedida por un User que no sea su destinatario, excepto por un `PlatformAdmin`.
- El aislamiento entre tenants debe aplicarse en todas las operaciones de consulta y gestión de notificaciones.
- Las validaciones de acceso deben respetar las reglas definidas por el dominio Authorization.

---

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                     | Inglés (Código)          | Tipo         | Descripción                                                                                            |
| --------------------------- | ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| Notificación                | `Notification`           | Entidad      | Comunicación saliente solicitada para un destinatario dentro de un Tenant.                             |
| Plantilla de Notificación   | `NotificationTemplate`   | Entidad      | Plantilla reutilizable que define la estructura y el contenido de una notificación por canal y locale. |
| Preferencia de Notificación | `NotificationPreference` | Entidad      | Configuración de un User sobre qué notificaciones desea recibir y por qué canales.                     |
| Estado de la Notificación   | `NotificationStatus`     | Enum         | Estados posibles durante el ciclo de vida de una Notification.                                         |
| Canal de Notificación       | `NotificationChannel`    | Enum         | Medio por el cual se entrega una Notification (`EMAIL`, `IN_APP`, etc.).                               |
| Código de Plantilla         | `NotificationCode`       | Value Object | Identificador lógico del tipo de notificación (`RESET_PASSWORD`, `INVITATION`, etc.).                  |
| Idioma de Notificación      | `NotificationLocale`     | Value Object | Idioma y configuración regional para renderizar una Notification.                                      |
| Carga Útil                  | `NotificationPayload`    | Value Object | Datos proporcionados por el módulo consumidor para renderizar el template.                             |
| Destinatario                | `NotificationRecipient`  | Value Object | User al que se dirige una Notification.                                                                |
| Remitente                   | `NotificationSender`     | Concepto     | Módulo del Core que solicita una Notification.                                                         |
| Intento de Envío            | `NotificationAttempt`    | Value Object | Registro de un intento individual de envío de una Notification.                                        |
| Reintento                   | `NotificationRetry`      | Acción       | Repetición de un intento de envío fallido según la política interna del dominio.                       |
| Proveedor de Notificaciones | `NotificationProvider`   | Concepto     | Servicio técnico utilizado para entregar una Notification (SMTP, SendGrid, FCM, etc.).                 |
| Envío                       | `Send`                   | Acción       | Operación mediante la cual un módulo del Core solicita una Notification.                               |
| Entrega                     | `Deliver`                | Acción       | Operación mediante la cual Notifications entrega una Notification a su destinatario.                   |
| Lectura                     | `Read`                   | Acción       | Operación mediante la cual un User marca como leída una Notification `IN_APP`.                         |
| Fallo                       | `Fail`                   | Acción       | Resultado de un intento de envío que no se completó correctamente.                                     |
| Reintentar                  | `Retry`                  | Acción       | Repetición de un envío fallido.                                                                        |
| Renderizado de Plantilla    | `TemplateRendering`      | Concepto     | Proceso de transformar un template y un payload en el contenido final de una Notification.             |
| Entrega Multicanal          | `MultiChannelDelivery`   | Concepto     | Propiedad por la cual una Notification puede entregarse por más de un canal.                           |
| Bandeja In-App              | `InAppInbox`             | Concepto     | Vista del front donde un User consulta sus Notification `IN_APP`.                                      |
| Preferencia de Exclusión    | `OptOut`                 | Concepto     | Configuración de un User para no recibir ciertas notificaciones no transaccionales (futuro).           |
| Resumen Periódico           | `Digest`                 | Concepto     | Agrupación de notificaciones en un solo envío (futuro).                                                |
| Seguimiento                 | `Tracking`               | Concepto     | Registro de aperturas y clicks de notificaciones (futuro).                                             |
| Prioridad                   | `Priority`               | Concepto     | Nivel de urgencia de una Notification (futuro).                                                        |
| Agrupación                  | `Group`                  | Concepto     | Agrupación lógica de notificaciones relacionadas (futuro).                                             |

---

## Términos prohibidos

| No usar                                        | Usar                     |
| ---------------------------------------------- | ------------------------ |
| `Message`                                      | `Notification`           |
| `Alert`                                        | `Notification`           |
| `Notice`                                       | `Notification`           |
| `Mail`                                         | `Notification`           |
| `Email` (como sinónimo de Notification)        | `Notification`           |
| `Template` (sin prefijo)                       | `NotificationTemplate`   |
| `Channel` (sin prefijo)                        | `NotificationChannel`    |
| `Preference` (sin prefijo)                     | `NotificationPreference` |
| `NotificationId` (como referencia al template) | `NotificationCode`       |

> **Nota:** El dominio Notifications administra comunicaciones salientes de cualquier tipo. Conceptos como `Message`, `Alert`, `Notice`, `Mail` o `Email` no deben utilizarse como sinónimos de `Notification` dentro de este dominio. Cada comunicación, independientemente de su canal, es una Notification.

> **Nota:** El término `Email` solo se utiliza para referirse al canal `EMAIL`, no como sinónimo de Notification. Una Notification puede entregarse por Email, In-App o cualquier otro canal.

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en inglés.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Conceptos como `Tenant` o `TenantStatus` pertenecen al dominio Tenant.
- Conceptos como `User`, `UserStatus` o `UserIdentity` pertenecen al dominio Identity.
- Conceptos como `Role`, `Permission`, `Policy` o `Authorization` pertenecen al dominio Authorization.
- Conceptos como `Session`, `Password`, `AccessToken` o `Authentication` pertenecen al dominio Authentication.
- El dominio Notifications no conoce el significado de negocio de una notificación: solo conoce su template, su payload, sus canales y su destinatario.

## Resultado

Con este documento se da por finalizado el modelado inicial del dominio **Notifications** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

### Ubicación dentro del repositorio

```text
core/
└── notifications/
    └── docs/
        └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo Notifications.

## Dependencias del dominio

- El dominio Notifications depende de otros dominios del Core exclusivamente mediante sus interfaces públicas (`api/`).
- El dominio Notifications depende de `TenantApi` para validar la existencia y validez del tenant asociado a una solicitud de notificación.
- El dominio Notifications no depende de `IdentityApi`. Los módulos consumidores proveen `recipientId` y `recipientEmail`, y son responsables de su validez.
- El dominio Notifications no depende de `AuditApi`. El estado y el ciclo de vida de cada notificación pertenecen al dominio Notifications. La auditoría de la acción de negocio que origina una notificación es responsabilidad del módulo consumidor.
- El dominio Notifications únicamente puede depender de componentes ubicados en `shared`.
