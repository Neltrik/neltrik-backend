# Authorization

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Authorization** es responsable de administrar el modelo de autorización de **Neltrik**, definiendo las reglas que determinan las acciones que los usuarios pueden realizar dentro de la plataforma.

Su responsabilidad principal es gestionar el modelo basado en **Roles** y **Permisos**, estableciendo las relaciones, reglas y configuraciones necesarias para controlar el acceso a las capacidades disponibles dentro del sistema.

---

## Responsabilidades

El módulo **Authorization** es responsable de:

- Administrar el catálogo oficial de Roles de Neltrik.
- Administrar el catálogo oficial de Permisos de Neltrik.
- Definir los Permisos asociados a cada Rol.
- Mantener las relaciones entre Roles y Permisos.
- Proporcionar el modelo de autorización utilizado por toda la plataforma.
- Determinar los Roles disponibles para cada Tenant.
- Permitir la personalización del nombre visible (`displayName`) de los Roles dentro de cada Tenant.
- Mantener la integridad y consistencia del modelo de autorización durante el ciclo de vida de la plataforma.

---

## No es responsabilidad del módulo

El módulo **Authorization** no administra:

- Usuarios.
- Organizaciones (Tenants).
- Autenticación.
- Contraseñas.
- Tokens de acceso.
- Sesiones.
- Información personal de los usuarios.
- Procesos de negocio específicos de otros módulos.

Estas responsabilidades pertenecen a sus respectivos módulos del Core.

---

## ¿Qué representa Authorization?

El módulo **Authorization** representa el sistema de autorización de **Neltrik**.

Su responsabilidad consiste en definir qué acciones puede realizar un usuario dentro de la plataforma mediante un modelo centralizado compuesto por:

- Roles.
- Permisos.
- Relaciones entre Roles y Permisos.
- Capacidades asociadas a cada Rol.

Los Roles y Permisos pertenecen al producto (**Neltrik**) y representan la forma oficial en que la plataforma modela las responsabilidades y capacidades disponibles dentro del sistema.

Los Tenants utilizan únicamente los Roles habilitados por Neltrik y pueden personalizar la representación visual de estos mediante un nombre visible (`displayName`) sin modificar su identidad funcional.

---

## Contexto dentro de la plataforma

Authorization

        ┌─────────────────────┐
        │        Role         │
        │    Permission       │
        │  Role Permissions   │
        └──────────┬──────────┘
                   │
                   ▼
              Identity (User)
                   │
                   ▼
        ATS / CRM / Inventory / ...

---

## Dependencias

El módulo **Authorization** no depende de ningún otro módulo del Core.

Los módulos funcionales utilizarán **Authorization** para determinar qué acciones puede ejecutar un usuario dentro de la plataforma.

El módulo **Identity** utilizará **Authorization** para asociar un Rol a cada usuario, sin administrar la lógica de autorización correspondiente.

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- PLATFORM_ADMIN
- TENANT_OWNER
- TENANT_ADMIN
- User

Nota:

El `PLATFORM_ADMIN` pertenece al Tenant propietario de la plataforma (**Neltrik**) y es responsable de administrar el catálogo oficial de Roles y Permisos.

El `TENANT_OWNER` y el `TENANT_ADMIN` administran únicamente la asignación de Roles dentro de su propia organización utilizando exclusivamente los Roles habilitados para su Tenant.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- Role _(se valida en el Paso 3)_
- Permission _(se valida en el Paso 3)_
- TenantRoleConfiguration _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- Authorization
- Role
- Permission
- Permission Scope
- Role Permission Association
- Tenant Role Availability
- Role Display Name
- Role Capabilities
- Authorization Rules

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto                | Estado        |
| ----------------------- | ------------- |
| Role                    | ✅ Confirmada |
| Permission              | ✅ Confirmada |
| TenantRoleConfiguration | ✅ Confirmada |

> **Nota:** La asignación de Roles a los usuarios no forma parte del dominio **Authorization**. Esta responsabilidad pertenece al dominio **Identity**, el cual utiliza el modelo de Roles definido por **Authorization**.

> **Nota:** Los Tenants no crean Roles ni Permisos. Únicamente utilizan el catálogo oficial definido por **Neltrik** y pueden personalizar el nombre visible (`displayName`) de los Roles habilitados mediante la entidad **TenantRoleConfiguration**.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
                Role
                  │
                  ├──────────────┐
                  │              │
                  ▼              ▼
            Permission   TenantRoleConfiguration
```

> **Nota:** Un **Role** puede agrupar múltiples **Permissions** y una **Permission** puede pertenecer a múltiples **Roles**, conformando el modelo oficial de autorización definido por Neltrik.

> **Nota:** La entidad **TenantRoleConfiguration** permite personalizar la representación de un **Role** dentro de un Tenant sin modificar su identidad funcional ni las reglas oficiales definidas por la plataforma.

## Parte B — Reglas de negocio

### Authorization

- Los Tenants no pueden crear, modificar ni eliminar Roles o Permisos oficiales.
- Un usuario únicamente puede tener un Rol asignado dentro de un mismo Tenant.
- El conjunto de Permissions asociado a cada Role es definido exclusivamente por Neltrik.

### Role

- Todo **Role** posee un identificador único.
- Todo **Role** posee un código (`code`) único dentro de la plataforma.
- Todo **Role** pertenece al catálogo oficial definido por **Neltrik**.
- Todo **Role** debe tener un nombre visible por defecto.
- Todo **Role** define un conjunto de capacidades mediante los **Permissions** que tiene asociados.
- Un **Role** puede asociarse a múltiples **Permissions**.
- Un **Role** puede estar habilitado para uno o múltiples **Tenants**.
- Un **Role** nunca puede ser creado por un Tenant.
- Un **Role** nunca puede ser eliminado por un Tenant.
- El código (`code`) de un Role es inmutable una vez creado.

### Permission

- Todo **Permission** posee un identificador único.
- Todo **Permission** posee un código (`code`) único dentro de la plataforma.
- Todo **Permission** pertenece al catálogo oficial definido por **Neltrik**.
- Todo **Permission** representa una única capacidad dentro de la plataforma.
- Todo **Permission** posee un alcance (`scope`) que determina el contexto al que pertenece dentro del modelo de autorización.
- Un **Permission** puede asociarse a múltiples **Roles**.
- Un **Permission** nunca puede ser creado por un Tenant.
- Un **Permission** nunca puede ser eliminado por un Tenant.

### TenantRoleConfiguration

- Todo **TenantRoleConfiguration** pertenece obligatoriamente a un único **Tenant**.
- Todo **TenantRoleConfiguration** referencia obligatoriamente un único **Role** del catálogo oficial de **Neltrik**.
- Un **Tenant** puede personalizar el nombre visible (`displayName`) de un **Role** habilitado para su organización.
- La personalización del `displayName` nunca modifica el código (`code`), la identidad ni el comportamiento del **Role** oficial.
- Solo puede existir una configuración por cada combinación **Tenant–Role**.
- Un **TenantRoleConfiguration** únicamente puede existir para Roles habilitados para ese **Tenant**.

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                         | Inglés (Código)         | Tipo         | Descripción                                                                                                                                          |
| ------------------------------- | ----------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rol                             | Role                    | Entidad      | Representa una responsabilidad dentro de la plataforma y determina las capacidades que puede ejecutar un usuario mediante los Permissions asociados. |
| Permiso                         | Permission              | Entidad      | Representa una capacidad específica que puede ejecutarse dentro de la plataforma.                                                                    |
| Alcance del Permiso             | PermissionScope         | Value Object | Determina el contexto de autorización al que pertenece un Permission.                                                                                |
| Configuración de Rol del Tenant | TenantRoleConfiguration | Entidad      | Permite personalizar el nombre visible (`displayName`) de un Rol dentro de un Tenant.                                                                |
| Nombre Visible                  | DisplayName             | Value Object | Nombre utilizado por un Tenant para representar visualmente un Rol.                                                                                  |

---

## Términos prohibidos

| ❌ No usar  | ✅ Usar     |
| ----------- | ----------- |
| Profile     | Role        |
| UserRole    | Role        |
| AccessLevel | Role        |
| Privilege   | Permission  |
| Right       | Permission  |
| Capability  | Permission  |
| Alias       | DisplayName |

> **Nota:** El dominio **Authorization** administra el modelo oficial de autorización de Neltrik. Conceptos como **Profile**, **Privilege** o **AccessLevel** no deben utilizarse como sinónimos de **Role** o **Permission** dentro de este dominio.

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en **inglés**.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Los Roles oficiales únicamente pueden ser administrados por **Neltrik**.
- Los Permisos oficiales únicamente pueden ser administrados por **Neltrik**.
- Los Tenants únicamente pueden personalizar el `displayName` de los Roles habilitados para su organización.
- Cada Role posee un conjunto de Permissions definido exclusivamente por Neltrik.

# Resultado

Con este documento se da por finalizado el modelado inicial del dominio **Authorization** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

## Ubicación dentro del repositorio

```text
core/
└── authorization/
    └── docs/
        └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo **Authorization**.

## Dependencias del dominio

El dominio **Authorization** no depende de otros dominios del Core.

Los demás dominios podrán utilizar **Authorization** para determinar las capacidades asociadas a los Roles definidos por la plataforma.

El dominio **Authorization** únicamente puede depender de componentes ubicados en `shared`.
