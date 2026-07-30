# Identity

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Identity** es responsable de administrar la identidad de los usuarios que pertenecen a un **Tenant** dentro de **Neltrik**, gestionando su información básica y su ciclo de vida dentro de la plataforma.

---

## Responsabilidades

El módulo **Identity** es responsable de:

- Registrar usuarios dentro de un Tenant.
- Administrar la información básica de cada usuario.
- Consultar la información de los usuarios.
- Actualizar la información de los usuarios.
- Mantener el estado de los usuarios durante su ciclo de vida.
- Asociar cada usuario a un único Tenant.
- Conocer el rol asignado a cada usuario como parte de su identidad.

---

## No es responsabilidad del módulo

El módulo **Identity** **no** administra:

- Organizaciones (Tenants).
- Autenticación.
- Contraseñas.
- Tokens de acceso.
- Sesiones.
- Roles.
- Permisos.
- Configuraciones específicas de otros módulos.

Estas responsabilidades pertenecen a sus respectivos módulos del Core.

---

## ¿Qué representa un User?

Un **User** representa la identidad digital de una persona dentro de **Neltrik**.

Todo usuario pertenece obligatoriamente a un único **Tenant**, independientemente del rol que desempeñe dentro de la plataforma. El módulo **Identity** administra la información básica del usuario y conoce el rol que tiene asignado, pero no administra las reglas de autorización asociadas a dicho rol.

---

## Contexto dentro de la plataforma

```text
Tenant
│
├── User (PlatformAdmin)
├── User (Operations)
├── User (Sales)
├── User (OwnerTenantAdmin)
├── User (TenantAdmin)
└── User (...)
```

---

## Dependencias

El módulo **Identity** depende del módulo **Tenant**, ya que todo usuario debe pertenecer obligatoriamente a una organización.

Los demás módulos pueden utilizar **Identity** para identificar a los usuarios que realizan acciones dentro del sistema.

---

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- Platform Administrator (Administrador de la plataforma)
- Owner Tenant Administrator (Propietario de la organización)
- Tenant Administrator (Administrador de la organización)
- User (Usuario)

> **Nota:** El **Platform Administrator** pertenece al Tenant propietario de la plataforma (**Neltrik**) y puede administrar cualquier usuario del sistema. El **Owner Tenant Administrator** y el **Tenant Administrator** administran únicamente los usuarios pertenecientes a su propia organización. El **User** puede administrar únicamente la información permitida de su propia identidad.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- User _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- User Identity
- User Status
- User Lifecycle
- Organization Membership

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto | Estado        |
| -------- | ------------- |
| User     | ✅ Confirmada |

> **Nota:** Conceptos como **Role**, **Permission**, **Password**, **Session** o **Invitation** no forman parte del dominio **Identity** dentro del MVP. Estos serán administrados por sus respectivos dominios (**Authorization** y **Authentication**).

> **Nota:** Durante la implementación del dominio, el atributo email de la entidad User será modelado como un Value Object para encapsular sus reglas de negocio y validaciones.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
Tenant
    │
    └── User
```

> **Nota:** Todo **User** pertenece obligatoriamente a un único **Tenant**, el cual proporciona el contexto organizacional utilizado para garantizar el aislamiento de la información entre organizaciones.

---

## Parte B — Reglas de negocio

### User

- Todo **User** posee un identificador único.
- Todo **User** pertenece obligatoriamente a un único **Tenant**.
- Todo **User** posee un correo electrónico único dentro de la plataforma.
- Todo **User** debe tener un nombre.
- Todo **User** debe tener un apellido.
- Todo **User** debe tener un rol asignado.
- Todo **User** debe tener un estado válido.
- Todo **User** recién creado inicia con el estado `ACTIVE`.
- Un **User** puede actualizar la información permitida de su propia identidad.
- Un **User** puede suspenderse.
- Los **Users** nunca se eliminan físicamente; únicamente pueden cambiar su estado.

---

### Creación del User

- Todo **User** debe pertenecer obligatoriamente a un **Tenant**.
- Todo **User** debe tener un correo electrónico válido.
- Todo **User** debe tener un rol asignado antes de finalizar su proceso de creación.
- El proceso de creación de un **User** solo se considera completado cuando el usuario pertenece a un **Tenant** y posee un rol asignado.

---

### Administración del User

- Un **PlatformAdmin** puede administrar cualquier **User** de la plataforma.
- Un **OwnerTenantAdmin** puede administrar únicamente los usuarios pertenecientes a su organización.
- Un **TenantAdmin** puede administrar únicamente los usuarios pertenecientes a su organización según las reglas definidas por el dominio **Authorization**.
- Un **User** únicamente puede modificar la información permitida de su propia identidad.

---

### Aislamiento

- Todo **User** pertenece exactamente a un único **Tenant**.
- Un **User** nunca puede pertenecer simultáneamente a múltiples **Tenant**.
- El **Tenant** proporciona el contexto organizacional utilizado por **Identity** para garantizar el aislamiento de los usuarios entre organizaciones.

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                     | Inglés (Código)        | Tipo         | Descripción                                                                 |
| --------------------------- | ---------------------- | ------------ | --------------------------------------------------------------------------- |
| Usuario                     | User                   | Entidad      | Persona que utiliza la plataforma Neltrik y pertenece a un Tenant.          |
| Administrador de Plataforma | PlatformAdmin          | Actor        | Responsable de administrar todos los usuarios de la plataforma.             |
| Propietario del Tenant      | OwnerTenantAdmin       | Actor        | Responsable principal de administrar los usuarios de su organización.       |
| Administrador del Tenant    | TenantAdmin            | Actor        | Usuario con privilegios administrativos dentro de su organización.          |
| Identidad del Usuario       | UserIdentity           | Concepto     | Representa la identidad digital de un usuario dentro de Neltrik.            |
| Membresía Organizacional    | OrganizationMembership | Concepto     | Relación que vincula un usuario con un único Tenant.                        |
| Estado del Usuario          | UserStatus             | Enum         | Estados posibles durante el ciclo de vida de un usuario.                    |
| Correo Electrónico          | Email                  | Value Object | Correo electrónico único que identifica al usuario dentro de la plataforma. |

---

## Términos prohibidos

| ❌ No usar | ✅ Usar |
| ---------- | ------- |
| Account    | User    |
| Person     | User    |
| Member     | User    |
| Employee   | User    |
| AccountId  | UserId  |
| PersonId   | UserId  |

> **Nota:** El dominio **Identity** administra usuarios de la plataforma. Conceptos como **Account**, **Member** o **Employee** no deben utilizarse como sinónimos de **User** dentro de este dominio.

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en **inglés**.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Conceptos como `Password`, `Session`, `AccessToken`, `RefreshToken` o `Authentication` pertenecen al dominio **Authentication**.
- Conceptos como `Role`, `Permission`, `Policy` o `Authorization` pertenecen al dominio **Authorization**.
- Conceptos como `Tenant` o `TenantStatus` pertenecen al dominio **Tenant**.

# Resultado

Con este documento se da por finalizado el modelado inicial del dominio **Identity** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

## Ubicación dentro del repositorio

```text
core/
└── identity/
    └── docs/
        └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo **Identity**.

## Dependencias del dominio

El dominio **Identity** depende del dominio **Tenant**, ya que todo usuario pertenece obligatoriamente a una organización.

Los demás dominios podrán utilizar **Identity** para identificar a los usuarios que realizan acciones dentro de la plataforma.

El dominio **Identity** únicamente puede depender de componentes ubicados en `shared`.
