# Audit

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Audit** es responsable de registrar de forma inmutable todas las acciones relevantes que ocurren dentro de **Neltrik**, garantizando trazabilidad, cumplimiento normativo y visibilidad para los administradores de cada tenant.

Su responsabilidad principal es determinar qué acciones deben auditarse, cómo se registran de forma segura e inmutable, y cómo se consultan dichos registros. El módulo debe diseñarse para que cada tenant pueda ver únicamente los eventos de auditoría que le corresponden, mientras que `PLATFORM_ADMIN` puede consultar los eventos de todos los tenants.

El módulo debe diseñarse de forma extensible para permitir incorporar nuevos tipos de eventos sin modificar las reglas fundamentales del dominio.
---

## Responsabilidades

El módulo **Audit** es responsable de:

- Registrar eventos de auditoría de acciones relevantes del sistema.
- Definir y mantener el catálogo oficial de acciones auditables.
- Definir y mantener el catálogo oficial de recursos auditables.
- Almacenar el actor, la acción, el recurso afectado, el resultado y el contexto.
- Garantizar la inmutabilidad de los eventos (solo INSERT).
- Registrar eventos de autenticación (login, logout, refresh, register).
- Registrar eventos de autorización (cambios de rol, permisos).
- Registrar eventos de identidad (suspensión, reactivación de usuarios).
- Registrar eventos de tenant (creación, suspensión, reactivación).
- Registrar eventos de invitación (creación, revocación, uso).
- Permitir la consulta de eventos por tenant, usuario, acción y recurso.
- Garantizar que cada tenant solo vea sus propios eventos.
- Mantener la integridad y seguridad de los registros de auditoría.
- Permitir la incorporación futura de nuevos tipos de eventos.
- Permitir la incorporación futura de hash chain para compliance.
- Permitir la incorporación futura de cola de reintentos.
- Exponer `AuditRecorder` para que los guards registren eventos DENIED.
- Exponer `@Audit()` para que los controllers marquen endpoints auditables.
- Registrar eventos con 3 status: SUCCESS, FAILED, DENIED.
- Auditar los rechazos de los guards (401, 403) como DENIED.

---

## No es responsabilidad del módulo

El módulo **Audit** no administra:

- Usuarios como entidad de negocio.
- Roles.
- Permisos.
- Policies de autorización.
- Tenants.
- Sesiones.
- Información específica del perfil del usuario.
- Reglas de negocio de otros módulos.
- La lógica de las acciones auditadas.

Estas responsabilidades pertenecen a sus respectivos módulos del Core.

> **Nota:** **Audit** puede consultar información proporcionada por otros módulos mediante sus interfaces públicas (api/), pero no debe administrar sus entidades ni duplicar sus reglas de negocio.

---

## ¿Qué representa Audit?

El módulo **Audit** representa el registro histórico e inmutable de todas las acciones relevantes que ocurren en **Neltrik**.

El dominio debe separar la acción auditada del registro de auditoría. El evento de auditoría es un hecho ocurrido en el pasado, no una acción que se ejecuta.

Cada evento de auditoría representa un hecho ocurrido en un momento específico, con un actor, una acción, un recurso afectado y un resultado.

El conjunto de acciones auditables es abierto y extensible. Para el MVP, se auditarán las acciones críticas del Core, pero el dominio deberá permitir incorporar nuevas acciones sin modificar las reglas fundamentales de Audit.

Los eventos se capturan mediante:

- `AuditApi` (OHS): Para use cases que auditan SUCCESS/FAILED.
- `AuditRecorder` (shared): Para guards que auditan DENIED.
- `@Audit()` (shared): Para que los controllers marquen endpoints auditables.

El registro de auditoría es consultable por el tenant correspondiente. Cada tenant ve únicamente sus propios eventos. PLATFORM_ADMIN ve todos los eventos.

---

## Contexto dentro de la plataforma

```text
                       Audit
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    Recording        Querying         (futuro)
        │                │                │
        │                │                │
        ▼                ▼                ▼
   Authentication   Authorization    Exporting
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                     Identity
                         │
                         ▼
                      Tenant
```

El flujo conceptual será:

```text
Recording

Acción en el Core
  │
  ├── Authentication (login, logout, register)
  ├── Authorization (role change, permission assign)
  ├── Identity (user suspend, reactivate)
  ├── Tenant (create, suspend, reactivate)
  └── Invitation (create, revoke, use)
          │
          ▼
    AuditApi.record()
          │
          ├── captura: userId, userEmail, tenantId, action, resource
          ├── captura: resourceId, metadata, status
          └── captura: ipAddress, userAgent (desde contexto)
          │
          ▼
    CreateAuditEventUseCase
          │
          └── registra: AuditEvent
```

```text
Querying

AuditEventController
    │
    ├── GET /audit-events
    ├── GET /audit-events/:id
    └── filtra por tenantId (Tenant Scope)
            │
            ▼
    ListAuditEventsUseCase
            │
            └── retorna eventos del tenant
```

> **Nota:** Los eventos de auditoría son inmutables. No se pueden modificar ni eliminar. El repositorio solo tiene create y find.

---

## Dependencias

El módulo **Audit** podrá depender de otros módulos del Core exclusivamente mediante sus interfaces públicas (api/).

La comunicación deberá respetar la arquitectura modular definida por **Neltrik** y no deberá importar directamente elementos internos de otros módulos.

El módulo **Audit** expone:

- `AuditApi` (OHS): Para use cases.
- `AuditRecorder` (shared): Para guards.
- `@Audit()` (shared): Para controllers.

Los módulos consumidores solo conocen:

- `AuditApi` (para use cases).
- `AuditRecorder` (para guards).
- `@Audit()` (para controllers).

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- User
- Sistema / Cliente
- Módulos del Core

Nota:

El User es el actor cuyas acciones son auditadas. No inicia directamente
la auditoría, pero es el sujeto de los eventos registrados.

El Sistema / Cliente inicia operaciones que generan eventos de auditoría
a través de los módulos del Core.

Audit no inicia acciones. Audit registra acciones iniciadas por otros.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- Audit Event _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- Audit
- Audit Event
- Audit Action
- Audit Status
- Audit Resource
- Audit Metadata
- IP Address
- Audit Retention _(futuro)_
- Audit Export _(futuro)_
- Audit Compliance _(futuro)_
- Audit Hash Chain _(futuro)_
- Audit Streaming _(futuro)_
- Audit SIEM Integration _(futuro)_
- Audit Data Subject Access Request _(futuro)_

---

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades
para el MVP.

| Concepto    | Estado        |
| ----------- | ------------- |
| Audit Event | ✅ Confirmada |

## Conceptos del dominio

| Concepto          | Tipo                   |
| ----------------- | ---------------------- |
| Audit Event       | Entidad                |
| Audit Action      | Catálogo del dominio   |
| Audit Resource    | Catálogo del dominio   |
| Audit Status      | Enum                   |
| Audit Metadata    | Value Object           |
| Ip Address        | Value Object           |
| **AuditRecorder** | **Contrato (shared)**  |
| **@Audit()**      | **Decorador (shared)** |

## Audit Event

Representa un hecho ocurrido en el pasado dentro de la plataforma que debe
ser registrado de forma inmutable para garantizar trazabilidad y
cumplimiento normativo.

Cada Audit Event está asociado a:

- Un actor identificado mediante `userId` y, cuando corresponda, `userEmail`, que originó la acción. `userId` y `userEmail` pueden ser nulos para eventos generados por el sistema.
- Un tenant (`tenantId`) al que pertenece el evento. Puede ser nulo cuando
  el evento corresponde a una operación de `PLATFORM_ADMIN` sin tenant específico.
- Una acción (`action`) que identifica el evento específico que ocurrió.
- Un recurso (`resource`) que identifica el tipo de recurso de negocio afectado.
- Un recurso específico (`resourceId`) cuando aplica.
- Un resultado (`status`) que indica si fue éxito, fallo o denegado.
- Un contexto (`metadata`) con información adicional.
- Contexto forense (`ipAddress`, `userAgent`).
- Un timestamp (`createdAt`) que indica cuándo ocurrió.

El Audit Event es inmutable. Una vez creado, no puede modificarse ni
eliminarse.

El Audit Event es consultable por el tenant correspondiente. Cada tenant
ve únicamente sus propios eventos. PLATFORM_ADMIN ve todos los eventos.

> **Nota:** Para el MVP, el Audit Event no incluye hash chain. El diseño
> permite incorporarlo posteriormente sin modificar las reglas
> fundamentales del dominio.

## Audit Action

Representa el evento específico que ocurrió dentro de la plataforma y que debe ser registrado por Audit.

Las acciones son definidas y mantenidas exclusivamente por el módulo Audit.

Las acciones siguen la convención:

<RESOURCE>_<EVENT>

Esta convención se utiliza como guía para definir y mantener nuevas
entradas en el catálogo de `AuditAction`.

La pertenencia de una acción al catálogo oficial de `AuditAction` es la
que determina si dicha acción es reconocida por Audit.

Ejemplos:

- USER_CREATED
- USER_UPDATED
- USER_SUSPENDED
- USER_REACTIVATED
- ROLE_CREATED
- ROLE_UPDATED
- ROLE_DELETED
- INVITATION_CREATED
- INVITATION_REVOKED
- VACANCY_PUBLISHED

Los módulos del Core no definen sus propios catálogos de acciones de auditoría. Utilizan las acciones oficiales expuestas por Audit mediante su API pública.

La acción no representa el caso de uso ni la ruta HTTP que originó el evento. Representa el hecho de negocio que ocurrió.

## Audit Resource

Representa el tipo de recurso de negocio afectado por una acción auditada.

Los recursos son definidos y mantenidos exclusivamente por el módulo Audit.

Los recursos son identificadores pertenecientes al vocabulario oficial de
Audit.

El nombre utilizado para cada recurso es definido por Audit y no constituye
una relación, dependencia ni regla de negocio sobre la entidad o recurso
administrado por otro dominio.

Los nombres del catálogo deben seleccionarse de forma que permitan
identificar claramente el recurso al que hacen referencia dentro del
contexto de auditoría.

Ejemplos:

- USER
- ROLE
- PERMISSION
- TENANT
- SESSION
- INVITATION
- VACANCY
- CANDIDATE
- PIPELINE
- JOB

`AuditResource` no representa una entidad administrada por Audit.

Audit registra el identificador del tipo de recurso mediante `resource` y,
cuando corresponde, el identificador de la instancia afectada mediante
`resourceId`.

Los módulos del Core no definen sus propios catálogos de recursos de auditoría. Utilizan los recursos oficiales expuestos por Audit mediante su API pública.

## Value Objects

### Audit Metadata

Representa información adicional y específica del evento que complementa
los datos estructurados de `AuditEvent`.

`AuditMetadata` utiliza una estructura JSON flexible cuya forma puede variar
según el evento y el módulo del Core que lo origine.

Audit no define ni valida el significado ni el esquema interno de las
propiedades contenidas en la metadata. Su responsabilidad se limita a
garantizar que la metadata corresponda a una estructura JSON válida.

Es un Value Object porque:

- Es inmutable.
- Encapsula la validación de su propia estructura.
- Encapsula el acceso a sus propiedades mediante `get` y `has`.
- Encapsula su serialización mediante `toJSON`.

### Ip Address

Representa la dirección IP desde la cual se ejecutó la acción.

`IpAddress` soporta direcciones IPv4 e IPv6 y garantiza que el valor
corresponda a una dirección IP válida.

El Value Object encapsula las reglas propias de validación y normalización
de una dirección IP, independientemente de `AuditEvent`.

Es un Value Object porque:

- Es inmutable.
- Valida que el valor corresponda a una dirección IPv4 o IPv6 válida.
- Normaliza la representación de la dirección cuando corresponda.
- Encapsula las reglas propias del concepto de dirección IP.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
                    Core
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
Authentication  Authorization   Identity
        │            │            │
        └────────────┼────────────┘
                     │
                     │ AuditApi
                     ▼
              ┌───────────────┐
              │     Audit     │
              │               │
              │   AuditEvent  │
              └───────────────┘
```

```text
Guards (shared)
    │
    ├── AuthenticationGuard
    ├── EmailVerifiedGuard
    └── PermissionsGuard
            │
            ▼
    AuditRecorder (shared)
            │
            ▼
    AuditRecorderProvider (core/audit)
            │
            ▼
    CreateAuditEventOhsUseCase
            │
            ▼
    AuditEvent (DENIED)
```

Relación conceptual:

```text
Core Module
     │
     └──────────────► AuditApi
                          │
                          ▼
                     AuditEvent
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
       userId         tenantId        resourceId
          │
          ▼
      userEmail
```

> **Nota:** **Audit** registra acciones originadas en otros módulos del Core o por el sistema. Los módulos consumidores utilizan `AuditApi` para registrar eventos y no dependen de la implementación interna de Audit.

> **Nota:** `userId` mantiene una referencia hacia el usuario que originó la acción. User pertenece a **Identity** y **Audit** no administra la entidad **User**. `userEmail` almacena una captura histórica del email del usuario en el momento en que ocurrió la acción.

> **Nota:** `tenantId` mantiene una referencia hacia el tenant al que pertenece el evento. **Tenant** pertenece a su respectivo módulo y **Audit** no administra la entidad **Tenant**.

> **Nota:** `resource` y `resourceId` no representan una relación de entidad administrada por Audit. `resource` identifica el tipo de recurso de negocio afectado y `resourceId` identifica la instancia concreta cuando aplica.

> **Nota:** Un `AuditEvent` no mantiene relaciones con otros `AuditEvent`. Cada evento representa un hecho histórico independiente.

> **Nota:** `userId` puede ser nulo cuando el evento es generado por el sistema.

> **Nota:** `tenantId` puede ser nulo cuando el evento corresponde a una operación de `PLATFORM_ADMIN` que no pertenece a un tenant específico.

# Parte B — Reglas de negocio

## Audit

- Audit únicamente registra acciones ocurridas dentro de la plataforma.
- Audit no ejecuta las acciones que registra.
- Audit no determina si una acción está autorizada.
- Audit no administra usuarios, roles, permisos, tenants ni recursos de otros módulos.
- Los módulos del Core deben utilizar `AuditApi` para registrar eventos sin depender de la implementación interna de Audit.
- Audit debe permitir registrar eventos generados por usuarios.
- Audit debe permitir registrar eventos generados por el sistema.
- Una falla durante el registro de auditoría no debe revertir la operación principal que originó el evento.
- El registro de auditoría debe ejecutarse de forma independiente de la transacción principal.
- El mecanismo de registro debe permitir evolucionar posteriormente hacia procesamiento asíncrono, reintentos y hash chain sin modificar las reglas fundamentales del dominio.

## Audit Event

- Todo `AuditEvent` representa un hecho ocurrido en un momento determinado.
- Todo `AuditEvent` debe registrar una acción.
- Todo `AuditEvent` debe identificar el recurso sobre el cual ocurrió la acción.
- `resourceId` puede ser nulo cuando la acción no afecta a un recurso específico.
- Todo `AuditEvent` debe registrar el resultado de la acción mediante `status`.
- `status` únicamente puede utilizar los valores definidos por el dominio.
- `userId` puede ser nulo cuando el evento es generado por el sistema.
- `userEmail` puede ser nulo cuando el evento es generado por el sistema o cuando el email del actor no está disponible.
- `userEmail` representa el email del User en el momento en que ocurrió el evento.
- `userEmail` constituye una captura histórica del contexto del actor y no una referencia al email actual del User.
- Los cambios posteriores realizados sobre el email del User no deben modificar el `userEmail` almacenado en un `AuditEvent`.
- `tenantId` puede ser nulo cuando el evento corresponde a una operación de `PLATFORM_ADMIN` sin tenant específico.
- `metadata` puede contener información adicional relacionada con el contexto del evento.
- `ipAddress` puede ser nulo cuando la dirección IP no está disponible.
- `userAgent` puede ser nulo cuando la información no está disponible.
- `createdAt` debe representar el momento en que ocurrió el evento.
- Un `AuditEvent` es inmutable después de su creación.
- Un `AuditEvent` no puede modificarse después de ser registrado.
- Un `AuditEvent` no puede eliminarse.
- La consulta de un `AuditEvent` no puede modificar su contenido.
- Cada `AuditEvent` debe poseer un identificador único.
- `action` debe pertenecer al catálogo oficial de `AuditAction`.
- `resource` debe pertenecer al catálogo oficial de `AuditResource`.
- `action` debe representar un evento específico y no una capacidad genérica como `CREATE`, `UPDATE` o `DELETE`.
- La convención `<RESOURCE>_<EVENT>` aplica a la definición de nuevas entradas del catálogo oficial de `AuditAction`.
- La incorporación de una nueva acción al catálogo requiere que su definición haya sido previamente analizada y aprobada dentro del contexto de Audit.

## Audit Metadata

- `AuditMetadata` debe representar información adicional y específica del evento.
- La metadata debe corresponder a una estructura JSON válida.
- La estructura de la metadata puede variar según el evento y el módulo del Core que lo origine.
- Audit no debe definir ni validar el significado ni el esquema interno de las propiedades contenidas en la metadata.
- La metadata debe complementar los datos estructurados de `AuditEvent` y no sustituirlos.
- `AuditMetadata` es inmutable después de su creación.
- El acceso a las propiedades de la metadata no puede modificar su contenido.

## IP Address

- `IpAddress` debe representar una dirección IP válida.
- `IpAddress` debe soportar direcciones IPv4.
- `IpAddress` debe soportar direcciones IPv6.
- Una dirección IP inválida no puede formar parte de `AuditEvent`.
- La representación de la dirección IP debe mantenerse en una forma normalizada.
- `IpAddress` es inmutable después de su creación.

## Consulta de Audit Events

- Los eventos de auditoría deben poder consultarse mediante los casos de uso definidos por Audit.
- Un tenant únicamente puede consultar los eventos correspondientes a su propio `tenantId`.
- `PLATFORM_ADMIN` puede consultar eventos correspondientes a todos los tenants.
- La consulta debe permitir filtrar eventos por tenant, usuario, acción y recurso.
- La consulta debe soportar paginación.
- La consulta debe respetar las reglas de autorización definidas para `AUDIT_LIST`.
- La consulta no puede modificar los eventos.
- La consulta no puede eliminar los eventos.

## Guards (AuditRecorder)

- Los guards deben auditar `DENIED` cuando rechazan una request.
- Los guards deben leer `@Audit()` del handler para saber qué auditar.
- Si el handler no tiene `@Audit()`, el guard NO audita.
- Los guards NO auditan si el error no es de autorización.
- Los guards auditan: `AuthenticationGuard`, `EmailVerifiedGuard`, `PermissionsGuard`.
- `ThrottlerGuard` NO audita (es técnico).
- El registro de auditoría es fire-and-forget.
- Si el registro falla, no revierte la operación del guard.
- Los guards auditan solo si el handler tiene `@Audit()`.
- Los guards NO auditan si el handler no tiene `@Audit()`.

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                | Inglés (Código) | Tipo           | Descripción                                                                                                         |
| ---------------------- | --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Evento de Auditoría    | `AuditEvent`    | Entidad        | Representa un hecho histórico e inmutable ocurrido en Neltrik que debe ser registrado para garantizar trazabilidad. |
| Acción de Auditoría    | `AuditAction`   | Domain Concept | Representa el evento específico que ocurrió y que debe ser registrado por el sistema de auditoría.                  |
| Recurso de Auditoría   | `AuditResource` | Domain Concept | Representa el tipo de recurso de negocio afectado por una acción auditada.                                          |
| Estado de Auditoría    | `AuditStatus`   | Enum           | Representa el resultado de la acción auditada.                                                                      |
| Metadatos de Auditoría | `AuditMetadata` | Value Object   | Representa información adicional y específica del evento que complementa el registro de auditoría.                  |
| Dirección IP           | `IpAddress`     | Value Object   | Representa la dirección IP desde la cual se originó la acción auditada.                                             |
| Grabador de Auditoría  | `AuditRecorder` | Contrato       | Contrato que los guards usan para registrar eventos de auditoría.                                                   |
| Decorador de Auditoría | `@Audit()`      | Decorador      | Decorador que marca un endpoint como auditable.                                                                     |

---

## Términos prohibidos

| ❌ No usar                                        | ✅ Usar                                       |
| ------------------------------------------------- | --------------------------------------------- |
| Audit Log                                         | `AuditEvent`                                  |
| Audit Entry                                       | `AuditEvent`                                  |
| Log Entry                                         | `AuditEvent`                                  |
| Event Log                                         | `AuditEvent`                                  |
| Audit Action Type                                 | `AuditAction`                                 |
| Action Type                                       | `AuditAction`                                 |
| Resource Type                                     | `AuditResource`                               |
| Entity Type                                       | `AuditResource`                               |
| User Action                                       | `AuditAction`                                 |
| HTTP Action                                       | `AuditAction`                                 |
| Endpoint Action                                   | `AuditAction`                                 |
| CREATE / UPDATE / DELETE como acción de auditoría | Acción específica, por ejemplo `USER_CREATED` |
| User Actor                                        | `User` según el contexto                      |
| Audit Data                                        | `AuditMetadata`                               |
| Audit IP                                          | `IpAddress`                                   |
| Audit ID                                          | `AuditEvent` / `id` según el contexto         |
| Audit Record como entidad principal               | `AuditEvent`                                  |

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en **inglés**.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- `Audit` representa el contexto responsable de registrar y consultar hechos históricos relevantes ocurridos en Neltrik.
- `AuditEvent` representa un hecho ocurrido en el pasado y no una acción que Audit ejecute.
- `Audit` registra acciones originadas por otros módulos del Core o por el sistema.
- `Audit` no ejecuta las acciones que registra.
- `Audit` es responsable de definir y mantener el vocabulario oficial de auditoría.
- `AuditAction` representa una acción específica que ocurrió en el sistema.
- Las nuevas entradas del catálogo de `AuditAction` seguirán la convención `<RESOURCE>_<EVENT>`.
- La convención `<RESOURCE>_<EVENT>` constituye una regla de definición y nomenclatura del catálogo, no una validación adicional realizada por `AuditEvent`.
- Las acciones de auditoría deben representar eventos específicos y no operaciones genéricas como `CREATE`, `UPDATE` o `DELETE`.
- Una acción únicamente puede utilizarse como `AuditAction` si forma parte del catálogo oficial mantenido por Audit.
- `AuditResource` representa el identificador del tipo de recurso al que hace referencia una acción auditada.
- `AuditResource` no representa una entidad administrada por Audit.
- Los valores de `AuditResource` son definidos y mantenidos exclusivamente por Audit.
- El nombre de un `AuditResource` pertenece al vocabulario de Audit y no impone reglas de nomenclatura sobre el dominio que administra el recurso representado.
- `resourceId` identifica la instancia concreta del recurso afectado cuando corresponda.
- Un `resourceId` no implica que Audit administre o mantenga la entidad correspondiente al identificador.
- `userId` identifica al usuario que originó la acción cuando exista un usuario como actor.
- `userEmail` representa el email del usuario en el momento en que ocurrió la acción.
- `userEmail` constituye una captura histórica del contexto del actor y no una referencia al email actual del User.
- Las acciones originadas directamente por el sistema pueden no tener `userId` ni `userEmail`.
- `tenantId` identifica el tenant al que pertenece el evento cuando corresponda.
- Los eventos de plataforma que no estén asociados a un tenant específico pueden no tener `tenantId`.
- `AuditStatus` representa únicamente estados definidos por el dominio.
- `AuditMetadata` permite almacenar información adicional específica del evento sin modificar las reglas fundamentales de `AuditEvent`.
- `AuditEvent` es inmutable después de su creación.
- Los eventos de auditoría no pueden actualizarse ni eliminarse.
- La consulta de eventos de auditoría nunca puede modificar sus registros.
- Los eventos deben conservar el momento en que ocurrió la acción mediante `createdAt`.
- La información de contexto, como `IpAddress` y `userAgent`, puede no estar disponible en determinados escenarios.
- La comunicación de los módulos consumidores con Audit debe realizarse mediante `AuditApi`.
- Los módulos del Core no deben definir sus propios catálogos de `AuditAction` o `AuditResource`.
- Las nuevas acciones auditables deben incorporarse al vocabulario oficial de Audit antes de implementarse.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- El mecanismo de persistencia, procesamiento asíncrono, reintentos o futuras cadenas de hash no forma parte del lenguaje principal del dominio y podrá evolucionar sin modificar el significado fundamental de `AuditEvent`.

# Resultado

Con este documento se establece el **Lenguaje Ubicuo inicial del dominio Audit** para el MVP.

El dominio queda preparado para representar eventos históricos mediante la siguiente estructura conceptual:

```text
AuditEvent
    │
    ├── userId
    ├── userEmail
    ├── tenantId
    ├── AuditAction
    ├── AuditResource
    ├── resourceId
    ├── AuditStatus
    ├── AuditMetadata
    ├── IpAddress
    ├── userAgent
    └── createdAt
```

El vocabulario oficial de auditoría será mantenido exclusivamente por el módulo **Audit**:

```text
Audit
 │
 ├── AuditAction
 │      ├── USER_CREATED
 │      ├── USER_SUSPENDED
 │      ├── ROLE_UPDATED
 │      └── VACANCY_PUBLISHED
 │
 └── AuditResource
        ├── USER
        ├── ROLE
        ├── TENANT
        ├── INVITATION
        └── VACANCY
```

Los módulos no definirán catálogos propios de acciones o recursos de auditoría. Cuando necesiten registrar un evento, utilizarán el contrato público `AuditApi`.

Ejemplo conceptual:

```text
Identity
   │
   │ acción: USER_SUSPENDED
   ▼
AuditApi
   │
   ▼
AuditEvent
   ├── userId: userId
   ├── userEmail: user@email.com
   ├── action: USER_SUSPENDED
   ├── resource: USER
   └── resourceId: userId
```

El MVP implementará únicamente las acciones definidas en el catálogo inicial de Audit. El catálogo podrá extenderse posteriormente con nuevas acciones y recursos sin modificar las reglas fundamentales de `AuditEvent`.

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo **Audit**.

## Dependencias del dominio

El dominio **Audit** no depende directamente de las implementaciones internas de otros dominios del Core.

Cuando **Audit** necesite interactuar con otro Bounded Context, dicha comunicación deberá realizarse mediante las interfaces públicas (`api/`) definidas por el módulo correspondiente.

Los módulos que necesiten registrar eventos de auditoría utilizarán `AuditApi` sin depender de la implementación interna de Audit.

El dominio **Audit** únicamente puede depender de componentes ubicados en `shared` y de contratos públicos (`api/`) de otros módulos cuando el dominio requiera dicha interacción.
