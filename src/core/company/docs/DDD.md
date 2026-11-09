# Company + Membership

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Company** es responsable de administrar las empresas que pertenecen a un **Tenant** dentro de **Neltrik**, gestionando su información básica, su ciclo de vida y la membresía de los usuarios a dichas empresas mediante la relación usuario ↔ empresa ↔ rol.

---

## Responsabilidades

El módulo **Company** es responsable de:

- Registrar empresas dentro de un **Tenant**.
- Administrar la información básica de cada empresa.
- Consultar la información de las empresas.
- Actualizar la información de las empresas.
- Mantener el estado de las empresas durante su ciclo de vida.
- Asociar cada empresa a un único **Tenant**.
- Registrar la membresía de un usuario a una empresa, asignándole un rol.
- Consultar la membresía de los usuarios en las empresas.
- Actualizar la membresía (cambio de rol, suspensión, remoción).
- Mantener el estado de las membresías durante su ciclo de vida.
- Invitar usuarios a una empresa, creando una membresía en estado **PENDING**.
- Aceptar invitaciones, cambiando el estado de la membresía de **PENDING** a **ACTIVE**.

---

## No es responsabilidad del módulo

El módulo **Company** **no** administra:

- Organizaciones (**Tenants**).
- Identidades de usuarios.
- Autenticación.
- Contraseñas.
- Tokens de acceso.
- Sesiones.
- Definición global de roles.
- Definición de permisos.
- Reglas de autorización.
- Configuraciones específicas de otros módulos.

Estas responsabilidades pertenecen a sus respectivos módulos del Core.

---

## ¿Qué representa un Company?

Una **Company** representa una **empresa** (la entidad legal/operativa) dentro de un **Tenant**.

Todo **Tenant** puede tener una o más **Companies**. Toda **Company** pertenece obligatoriamente a un único **Tenant**. La **Company** es la unidad operativa (donde se publican vacantes, se gestionan candidatos, se asignan recruiters, etc.).

El **.Tenant**. es la cuenta (el cliente que paga). La **.Company**. es la empresa (donde se opera).

## ¿Qué representa un Membership?

Un **Membership** representa la relación entre un **User** y una **Company**, con un rol asignado.

Un **User** puede pertenecer a varias **Companies** del mismo Tenant, con roles distintos en cada una. El **Membership** es la unidad de autorización (el rol que el usuario tiene en esa empresa).

El **User** (Identity) es la persona. El **Membership** es "qué puede hacer esa persona en esa empresa".

---

## Contexto dentro de la plataforma

```text
Tenant
│
├── Company A
│   ├── Membership (User 1, role: TenantAdmin)
│   ├── Membership (User 2, role: Recruiter)
│   └── Membership (User 3, role: Viewer)
│
├── Company B
│   ├── Membership (User 1, role: Viewer)
│   └── Membership (User 4, role: TenantAdmin)
│
└── Company C
    └── Membership (User 5, role: TenantAdmin)
```

---

## Dependencias

El módulo **Company** depende de los siguientes módulos:

- **Tenant**: toda empresa (**Company**) pertenece obligatoriamente a un único Tenant.
- **Identity**: el módulo **Membership** referencia a un **User** para establecer su pertenencia a una empresa.
- **Authorization**: el módulo **Membership** referencia a un **Role** para determinar el rol asignado al usuario dentro de una empresa.

Los demás módulos pueden utilizar **Company** para asociar sus recursos a una empresa:

- **File**: asociar archivos a una empresa.
- **Vacancy**: asociar vacantes a una empresa.
- **Notifications**: gestionar notificaciones relacionadas con una empresa.

---

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- **Platform Administrator**: Administrador de la plataforma.
- **Owner Tenant Administrator**: Propietario de la organización.
- **Tenant Administrator**: Administrador de la organización.
- **Company Administrator**: Administrador de la empresa.
- **Recruiter**: Reclutador.
- **Viewer**: Usuario con permisos de solo lectura.
- **User**: Usuario estándar.

> **Nota:** El **Platform Administrator** pertenece al Tenant propietario de la plataforma (**Neltrik**) y puede administrar cualquier **Company** y **Membership** del sistema. El **Owner Tenant Administrator** y el **Tenant Administrator** administran únicamente las **Companies** y **Memberships** pertenecientes a su propia organización. El **Company Administrator** administra únicamente los **Memberships** de su propia empresa. El **Recruiter** y el **Viewer** solo pueden acceder a los recursos de su propia empresa, sin administrar **Memberships**. El **User** puede administrar únicamente su propia identidad, sin administrar **Companies** ni **Memberships**.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- Company _(se valida en el Paso 3)_
- Membership _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- **Company Identity** (la identidad de la empresa: nombre, slug, estado).
- **Company Status** (el ciclo de vida de la empresa: ACTIVE, SUSPENDED).
- **Company Lifecycle**: (creación, actualización, suspensión).
- **Membership** (la relación User ↔ Company, con rol).
- **Membership Status** (el ciclo de vida de la membresía: PENDING, ACTIVE, SUSPENDED, REVOKED).
- **Membership Role** (el rol del User en la Company).
- **Membership Invitation** (la invitación a un User para unirse a una Company).
- **Membership Lifecycle** (invitación, aceptación, cambio de rol, suspensión, remoción).
- **Company Context** (la Company activa en la que el User está operando).

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto   | Estado        |
| ---------- | ------------- |
| Company    | ✅ Confirmada |
| Membership | ✅ Confirmada |

> **Nota:** Conceptos como Role, Permission, User o Tenant no forman parte del dominio Company dentro del MVP. Estos serán administrados por sus respectivos dominios (Authorization, Identity y Tenant). El dominio Company solo los referencia (por id) desde el Membership..

> **Nota:** Durante la implementación del dominio, el atributo slug de la entidad Company será modelado como un Value Object para encapsular sus reglas de negocio y validaciones (formato, unicidad dentro del tenant).

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
Tenant
    │
    ├── Company
    │       │
    │       └── Membership
    │               │
    │               └── User
    │
    └── User
```

> **Nota:** Toda Company pertenece obligatoriamente a un único Tenant. Todo Membership pertenece a una Company y referencia a un User. Un User puede tener múltiples Memberships (en distintas Companies del mismo Tenant). El Tenant proporciona el contexto organizacional utilizado para garantizar el aislamiento de la información entre organizaciones.

---

## Parte B — Reglas de negocio

### Company

- Toda **Company** posee un identificador único.
- Toda **Company** pertenece obligatoriamente a un único Tenant.
- Toda **Company** posee un slug único dentro del Tenant.
- Toda **Company** debe tener un nombre.
- Toda **Company** debe tener un estado válido.
- Toda **Company** recién creada inicia con el estado `ACTIVE`.
- Una **Company** puede suspenderse.
- Las **Companies** nunca se eliminan físicamente; únicamente pueden cambiar su estado.

---

### Creación de la Company

- Toda **Company** debe pertenecer obligatoriamente a un **Tenant**.
- Toda **Company** debe tener un `slug` válido (formato y unicidad dentro del **Tenant**).
- Toda **Company** debe tener un nombre válido.
- Toda **Company** se crea con estado `ACTIVE`.
- El proceso de creación de una Company solo se considera completado cuando la Company pertenece a un Tenant y tiene un `slug` válido.
- Al crear un Tenant, se crea una Company por defecto (name = nombre del tenant, slug = slug del tenant, status = ACTIVE).

---

### Membership

- Todo **Membership** posee un identificador único.
- Todo **Membership** pertenece obligatoriamente a una única **Company**.
- Todo **Membership** referencia a un único **User**.
- Todo **Membership** referencia a un único **Role** (de scope `TENANT`).
- Todo **Membership** debe tener un estado válido.
- Todo **Membership** recién creado (invitación) inicia con el estado `PENDING`.
- Un **Membership** `PENDING` no otorga permisos.
- Un **Membership** `ACTIVE` otorga los permisos del Role asignado.
- Un **Membership** `SUSPENDED` o `REVOKED` no otorga permisos.
- Un User no puede tener dos Memberships activos en la misma **Company**.
- Un **Membership** puede cambiar de Role (mientras esté `ACTIVE`).
- Un **Membership** puede suspenderse o revocarse.
- Los Memberships nunca se eliminan físicamente; únicamente pueden cambiar su estado.
- Todo Membership hereda el tenantId de su Company (no se ingresa manualmente; se deriva de la company).

---

### Creación del Membership (invitación)

- Todo **Membership** debe pertenecer obligatoriamente a una **Company**.
- Todo **Membership** debe referenciar a un **User** existente.
- Todo **Membership** debe tener un **Role** válido (de scope `TENANT`).
- El proceso de creación de un **Membership** solo se considera completado cuando el User acepta la invitación (`PENDING` → `ACTIVE`).
- Un **User** no puede tener un **Membership** `PENDING` o `ACTIVE` en la misma **Company** (no se puede invitar dos veces).

---

### Administración de la Company

- Un `PlatformAdmin` puede administrar cualquier Company de la plataforma.
- Un `OwnerTenantAdmin` puede administrar únicamente las Companies de su organización.
- Un `TenantAdmin` puede administrar únicamente las Companies de su organización según las reglas definidas por el dominio **Authorization**.
- Un `CompanyAdmin` puede administrar únicamente su propia Company (y sus Memberships).
- Un `User` no puede administrar Companies (solo puede ver las Companies a las que pertenece, vía Membership).

---

### Administración del Membership

- Un `PlatformAdmin` puede administrar cualquier **Membership** de la plataforma.
- Un `OwnerTenantAdmin` puede administrar los **Memberships** de su organización.
- Un `TenantAdmin` puede administrar los **Memberships** de su organización según las reglas definidas por el dominio **Authorization**.
- Un `CompanyAdmin` puede administrar los **Memberships** de su propia **Company**.
- Un `User` puede aceptar su propia invitación (`PENDING` → `ACTIVE`), y revocar su propio **Membership** (salir de la **Company**).

---

### Aislamiento

- Toda **Company** pertenece exactamente a un único **Tenant**.
- Toda **Company** nunca puede pertenecer simultáneamente a múltiples Tenants.
- Todo Membership pertenece exactamente a una única **Company** (y hereda su tenantId).
- Un User puede pertenecer a múltiples Companies del mismo **Tenant**, pero nunca a Companies de distintos Tenants.
- El **Tenant** proporciona el contexto organizacional utilizado por **Company** para garantizar el aislamiento de las companies y memberships entre organizaciones.

### Company Context

- El CompanyContext (la Company activa) se selecciona al iniciar sesión (o al cambiar de company).
- El User solo puede seleccionar una Company en la que tenga un Membership `ACTIVE`.
- El CompanyContext se incluye en el contexto del request (header, JWT, o path) para que los demás módulos sepan en qué Company se está operando.

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                  | Inglés (Código)  | Tipo         | Descripción                                                                    |
| ------------------------ | ---------------- | ------------ | ------------------------------------------------------------------------------ |
| Empresa                  | Company          | Entidad      | Organización operativa que pertenece a un Tenant y agrupa recursos y miembros. |
| Membresía                | Membership       | Entidad      | Relación que vincula un User con una Company, con un Role asignado.            |
| Identificador de Empresa | CompanyId        | Value Object | Identificador único de una Company.                                            |
| Nombre de Empresa        | CompanyName      | Value Object | Nombre de la empresa (validado: no vacío, longitud).                           |
| Slug de Empresa          | CompanySlug      | Value Object | Identificador legible y único dentro del Tenant (validado: formato, unicidad). |
| Estado de Empresa        | CompanyStatus    | Enum         | Estados posibles durante el ciclo de vida de una Company.                      |
| Estado de Membresía      | MembershipStatus | Enum         | Estados posibles durante el ciclo de vida de un Membership.                    |
| Invitación               | Invitation       | Concepto     | Acción de invitar a un User a unirse a una Company (Membership PENDING).       |
| Rol de Membresía         | MembershipRole   | Concepto     | Role asignado a un Membership (referencia a Authorization).                    |
| Contexto de Empresa      | CompanyContext   | Concepto     | Company activa en la que el User está operando en un momento dado.             |
| Administrador de Empresa | CompanyAdmin     | Actor        | Responsable de administrar una Company y sus Memberships.                      |

---

## Términos prohibidos

| ❌ No usar     | ✅ Usar    |
| -------------- | ---------- |
| Organization   | Company    |
| Workspace      | Company    |
| Team           | Company    |
| Member         | Membership |
| Account        | Company    |
| CompanyID      | CompanyId  |
| OrganizationId | CompanyId  |
| WorkspaceId    | CompanyId  |

> **Nota:** El dominio Company administra empresas y membresías. Conceptos como Organization, Workspace, Team o Member no deben utilizarse como sinónimos de Company o Membership dentro de este dominio. El Tenant es la organización (el cliente); la Company es la empresa (la unidad operativa).

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en inglés.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Conceptos como `User`, `UserStatus`, `Email` pertenecen al dominio Identity.
- Conceptos como `Role`, `Permission`, `Policy` o `Authorization` pertenecen al dominio Authorization.
- Conceptos como `Tenant`, `TenantStatus` o `TenantSlug` pertenecen al dominio Tenant.
- Conceptos como `Company`, `Membership`, `CompanyStatus`, `MembershipStatus`, `CompanySlug` pertenecen al dominio **Company**.
- El **Membership** referencia a User (por `userId`) y a Role (por `roleId`), pero no administra sus reglas de negocio (esas pertenecen a **Identity** y **Authorization**).

# Resultado

Con este documento se da por finalizado el modelado inicial del dominio **Company** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

## Ubicación dentro del repositorio

```text
core/
└── company/
    └── docs/
        └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo **Company**.

## Dependencias del dominio

- **Tenant**, ya que toda **Company** pertenece obligatoriamente a una organización.
- **Identity**, ya que el **Membership** referencia a un User.
- **Authorization**, ya que el **Membership** referencia a un **Role**.

Los demás dominios podrán utilizar **Company** para asociar recursos (Files, Vacancies, Notifications) a una empresa.

El dominio **Company** únicamente puede depender de componentes ubicados en shared.
