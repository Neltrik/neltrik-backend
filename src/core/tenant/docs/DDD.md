# Tenant

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Tenant** es responsable de administrar las organizaciones que utilizan **Neltrik** como plataforma SaaS, proporcionando el contexto organizacional sobre el cual operan los distintos módulos del sistema y garantizando el aislamiento lógico de la información entre clientes.

---

## Responsabilidades

El módulo **Tenant** es responsable de:

- Registrar organizaciones clientes dentro de Neltrik.
- Administrar la información general de cada Tenant.
- Proporcionar el contexto organizacional utilizado por los demás módulos del sistema.
- Garantizar la identificación única de cada Tenant.
- Mantener el estado del Tenant durante su ciclo de vida.
- Gestionar las invitaciones para que nuevos usuarios puedan unirse a la organización.

---

## No es responsabilidad del módulo

El módulo **Tenant** **no** administra:

- Usuarios.
- Autenticación.
- Autorización (Roles y Permisos).
- Branding.
- Suscripciones.
- Facturación.
- Configuración SMTP.
- Feature Flags.
- Configuraciones específicas de otros módulos.

Estas responsabilidades pertenecen a sus respectivos módulos del Core.

---

## ¿Qué representa un Tenant?

Un **Tenant** representa una organización cliente que utiliza **Neltrik** como plataforma.

Cada Tenant posee un espacio lógico completamente aislado donde operan sus usuarios, módulos e información, garantizando que ninguna organización pueda acceder a los datos pertenecientes a otra.

---

## Contexto dentro de la plataforma

```text
Neltrik
├── Tenant A
│   ├── Usuarios
│   ├── Vacantes
│   ├── Candidatos
│   └── ...
│
├── Tenant B
│   ├── Usuarios
│   ├── Vacantes
│   ├── Candidatos
│   └── ...
│
└── Tenant C
    ├── Usuarios
    ├── Vacantes
    ├── Candidatos
    └── ...
```

---

## Dependencias

El módulo **Tenant** no depende de ningún otro módulo del Core.

Los demás módulos pueden utilizar **Tenant** como contexto organizacional para garantizar el aislamiento y la pertenencia de la información a cada organización.

Los demás módulos pueden consumir la interfaz pública de Tenant para validar invitaciones.

---

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- Platform Administrator (Administrador de la plataforma)
- Tenant Administrator (Administrador de la organización)

> **Nota:** El **Platform Administrator** pertenece al Tenant propietario de la plataforma (**Neltrik**) y es el único autorizado para administrar el ciclo de vida de los Tenants. El **Tenant Administrator** administra únicamente los recursos pertenecientes a su propia organización.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- Tenant _(se valida en el Paso 3)_
- Invitation _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- Organization
- Platform Tenant _(en análisis)_
- Tenant Status
- Tenant Lifecycle
- Workspace
- Tenant Isolation
- Tenant Ownership
- Organizational Context
- Invitation
- Invitation Mechanism
- Invitation Lifecycle

# Paso 3 — Identificar entidades

Después del análisis del dominio se definió la siguiente entidad para el MVP.

| Concepto   | Estado        |
| ---------- | ------------- |
| Tenant     | ✅ Confirmada |
| Invitation | ✅ Confirmada |

> **Nota:** Durante el proceso de modelado no se identificaron otras entidades pertenecientes al dominio Tenant. Conceptos como `User`, `Role`, `Permission`, `Subscription`, `Branding` o `Company` pertenecen a otros dominios del Core y serán modelados en sus respectivos módulos.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
Tenant (1) ──── (N) Invitation
Tenant (1) ──── (N) ATS (MVP)
```

- Un **Tenant** puede generar múltiples Invitaciones.
- Toda Invitación pertenece a un único **Tenant**.
- En el MVP, el módulo **Tenant** se relaciona con el dominio ATS como contexto organizacional.

La incorporación de nuevos módulos (Identity, Authorization, CRM, Inventory, etc.) se realizará conforme evolucione la plataforma.

> **Nota:** En el MVP, el módulo **Tenant** únicamente se relaciona con el dominio **ATS** como contexto organizacional. La incorporación de nuevos módulos (Identity, Authorization, CRM, Inventory, etc.) se realizará conforme evolucione la plataforma.

---

## Parte B — Reglas de negocio

### Tenant

- Todo **Tenant** posee un identificador único.
- Todo **Tenant** representa una única organización.
- Todo **Tenant** debe tener un estado válido.
- Todo **Tenant** recién creado inicia con un estado por defecto.
- Un **Tenant** puede cambiar su nombre.
- Un **Tenant** puede suspenderse.
- Los **Tenant** nunca se eliminan físicamente; únicamente pueden cambiar su estado.

---

### Creación del Tenant

- Un **Tenant** nunca puede finalizar su proceso de creación sin un **OwnerTenantAdmin** asignado.
- La creación del **OwnerTenantAdmin** forma parte del proceso de alta del Tenant.
- El proceso de creación del Tenant solo se considera completado cuando existe un **OwnerTenantAdmin** asociado a la organización.

---

### Tenant Propietario de la Plataforma

- Solo existe un **Tenant** propietario de la plataforma.
- Únicamente usuarios con el rol **PlatformAdmin** pueden administrar el ciclo de vida de los **Tenant**.
- La propiedad de un **Tenant** únicamente puede ser asignada, transferida o revocada por un **PlatformAdmin**.
- El **Tenant** propietario únicamente puede ser administrado por usuarios con el rol **PlatformAdmin**.

---

### Administración del Tenant

- Cada **Tenant** posee exactamente un **OwnerTenantAdmin**.
- Un **TenantAdmin** no puede modificar, revocar ni administrar al **OwnerTenantAdmin**.
- El **OwnerTenantAdmin** puede administrar los **TenantAdmin** pertenecientes a su organización.

---

### Aislamiento

- Todo recurso del sistema pertenece exactamente a un **Tenant**.
- Un **Tenant** nunca puede acceder a recursos pertenecientes a otro **Tenant**.
- El **Tenant** proporciona el contexto organizacional utilizado por los demás módulos de la plataforma para garantizar el aislamiento de la información.

### Invitation

- Toda Invitación pertenece a un único **Tenant**.

- Toda Invitación está dirigida a un único destinatario.

- Toda Invitación está asociada a un rol dentro del **Tenant**.

- Toda Invitación posee un token único.

- Toda Invitación tiene una fecha de expiración.

- Toda Invitación tiene un mecanismo de entrega.

- Una Invitación solo puede utilizarse una vez.

- Una Invitación expirada no puede utilizarse.

- Una Invitación utilizada no puede reutilizarse.

- Una Invitación puede ser revocada antes de ser utilizada.

- Una Invitación revocada no puede utilizarse.

- Solo un usuario con rol `TenantAdmin` o superior puede crear invitaciones.

- Solo un usuario con rol `TenantAdmin` o superior puede revocar invitaciones.

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                     | Inglés (Código)     | Tipo     | Descripción                                                                     |
| --------------------------- | ------------------- | -------- | ------------------------------------------------------------------------------- |
| Tenant                      | Tenant              | Entidad  | Organización cliente que utiliza Neltrik como plataforma SaaS.                  |
| Invitación                  | Invitation          | Entidad  | Mecanismo mediante el cual un Tenant invita a un usuario a unirse.              |
| Administrador de Plataforma | PlatformAdmin       | Actor    | Responsable de administrar la plataforma y el ciclo de vida de los Tenants.     |
| Propietario del Tenant      | OwnerTenantAdmin    | Actor    | Responsable principal de administrar una organización dentro de Neltrik.        |
| Administrador del Tenant    | TenantAdmin         | Actor    | Usuario con privilegios administrativos dentro de un Tenant.                    |
| Organización                | Organization        | Concepto | Empresa o institución representada por un Tenant.                               |
| Espacio de Trabajo          | Workspace           | Concepto | Contexto lógico donde opera un Tenant dentro de la plataforma.                  |
| Contexto Organizacional     | TenantContext       | Concepto | Contexto utilizado por los módulos para aislar la información de un Tenant.     |
| Aislamiento de Tenant       | TenantIsolation     | Concepto | Garantiza que la información de un Tenant nunca sea accesible por otro.         |
| Estado del Tenant           | TenantStatus        | Enum     | Estados posibles durante el ciclo de vida de un Tenant.                         |
| Destinatario                | Recipient           | Atributo | Identificador del contacto al que se envía la invitación.                       |
| Mecanismo de Entrega        | Mechanism           | Atributo | Medio utilizado para entregar la invitación (email, código, mensaje, etc.).     |
| Token                       | Token               | Atributo | Identificador único de la invitación.                                           |
| Ciclo de Vida de Invitación | InvitationLifecycle | Concepto | Etapas por las que pasa una invitación (creación, expiración, uso, revocación). |

---

## Términos prohibidos

| ❌ No usar     | ✅ Usar  |
| -------------- | -------- |
| Company        | Tenant   |
| Customer       | Tenant   |
| Client         | Tenant   |
| WorkspaceId    | TenantId |
| OrganizationId | TenantId |

> **Nota:** El concepto **Company** pertenece a un dominio diferente y no debe utilizarse como sinónimo de **Tenant**.

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en **inglés**.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Conceptos como `User`, `Role`, `Permission`, `Session`, `AccessToken`, `Subscription` o `Branding` pertenecen a otros dominios del Core y no forman parte del lenguaje del dominio Tenant.
- El destinatario de una invitación se denomina recipient en el código y su tipo puede variar según el mecanismo de entrega.
- El mecanismo de entrega se denomina mechanism en el código y es extensible.
- El token de invitación se denomina token en el código y debe ser único.

# Resultado

Con este documento se da por finalizado el modelado inicial del dominio **Tenant** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

## Ubicación dentro del repositorio

```text
core/
└── tenant/
    └── docs/
        └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo ATS.

## Dependencias del dominio

El dominio **Tenant** no depende de ningún otro dominio del Core.

Los demás dominios podrán utilizar **Tenant** como contexto organizacional para garantizar el aislamiento de la información.

El dominio **Tenant** únicamente puede depender de componentes ubicados en `shared`.
