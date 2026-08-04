# Official Roles

## Objetivo

Este documento define el catálogo oficial de **Roles** disponibles dentro de **Neltrik** para el MVP.

Su propósito es establecer un lenguaje único sobre las responsabilidades de cada Rol, su alcance dentro de la plataforma y las reglas generales para su utilización, sirviendo como la fuente oficial para el dominio **Authorization**.

La definición de los permisos asociados a cada Rol se documentará de manera independiente.

## Clasificación de Roles

Los Roles de **Neltrik** se clasifican en dos grandes grupos según el contexto donde pueden existir.

### Platform Roles

Los **Platform Roles** son Roles exclusivos del **Tenant propietario de la plataforma (Neltrik)**.

Estos Roles representan responsabilidades relacionadas con la administración, operación y mantenimiento de la plataforma SaaS, por lo que nunca podrán asignarse a usuarios pertenecientes a otros Tenants.

Únicamente un **PlatformAdmin** puede administrar este tipo de Roles.

---

### Tenant Roles

Los **Tenant Roles** representan las responsabilidades operativas de los usuarios dentro de una organización cliente.

Estos Roles pueden ser utilizados tanto por el **Tenant propietario de la plataforma (Neltrik)** como por cualquier otro Tenant registrado en el sistema.

Neltrik define el catálogo oficial de Tenant Roles y determina cuáles estarán disponibles para cada organización.

Cada Tenant podrá asignar únicamente los Roles que tenga habilitados y personalizar su nombre visible (`displayName`) para adaptarlo a su estructura organizacional, sin modificar su comportamiento dentro del sistema.

---

## Catálogo Oficial de Roles

### PlatformAdmin

#### Code

PLATFORM_ADMIN

#### Descripción

Representa el rol con la máxima autoridad dentro de la plataforma **Neltrik**. Es el responsable de administrar y gobernar el producto, definiendo la configuración global de la plataforma y gestionando los recursos estratégicos que afectan a todos los Tenants.

#### Alcance

Posee autoridad sobre toda la plataforma y sobre todos los Tenants registrados en Neltrik.

#### Puede existir

Únicamente dentro del Tenant propietario de la plataforma (**Neltrik**).

#### Asignado por

Únicamente un `PLATFORM_ADMIN` puede asignar este Rol a otro usuario.

#### Observaciones

- El sistema debe garantizar la existencia de al menos dos usuarios activos con el Rol `PLATFORM_ADMIN`.
- No es posible eliminar, suspender o degradar un `PLATFORM_ADMIN` si esto provoca que existan menos de dos `PLATFORM_ADMIN` activos en la plataforma.
- PLATFORM_ADMIN no representa un cargo técnico.
- Representa la máxima autoridad administrativa dentro de Neltrik.

### Support

#### Code

SUPPORT

#### Descripción

Representa al personal encargado de brindar soporte operativo a los clientes de **Neltrik**, atendiendo incidentes, solicitudes y requerimientos relacionados con el uso de la plataforma, dentro de las capacidades autorizadas por el sistema.

#### Alcance

Puede brindar soporte operativo a cualquier Tenant registrado en **Neltrik**, accediendo únicamente a las funcionalidades autorizadas para la atención de clientes, sin capacidad para administrar la configuración global de la plataforma ni el catálogo oficial de Authorization.

#### Puede existir

Únicamente dentro del Tenant propietario de la plataforma (**Neltrik**).

#### Asignado por

Únicamente un `PLATFORM_ADMIN` puede asignar este Rol a otro usuario.

#### Observaciones

- Este Rol no puede administrar el catálogo oficial de Roles ni Permisos de la plataforma.
- Las capacidades operativas del Rol `SUPPORT` serán definidas mediante los Permisos asignados por el modelo de Authorization.

### Tenant Roles (Administrativos)

### TenantOwner

#### Code

TENANT_OWNER

#### Descripción

Representa la máxima autoridad administrativa de un Tenant y es el responsable de gobernar su organización dentro de Neltrik.

#### Alcance

Posee la máxima autoridad administrativa dentro de su Tenant, siendo responsable de administrar su organización y gestionar los recursos, usuarios y configuraciones que pertenecen exclusivamente a dicho Tenant.

### Puede existir

Puede existir en cualquier Tenant registrado dentro de **Neltrik**.

#### Asignado por

El primer `TENANT_OWNER` es creado automáticamente como parte del proceso de alta de un Tenant.
Posteriormente, únicamente un `PLATFORM_ADMIN` puede asignar este Rol a otro usuario.

#### Observaciones

- Todo Tenant debe tener exactamente un `TENANT_OWNER`.
- Un `TENANT_OWNER` no puede administrar otro Tenant.
- La transferencia del Rol `TENANT_OWNER` únicamente puede ser realizada por un `PLATFORM_ADMIN`.
- Un Tenant nunca puede quedar sin un `TENANT_OWNER` asignado.

### TenantAdmin

#### Code

TENANT_ADMIN

#### Descripción

Representa al administrador operativo de un Tenant. Es el responsable de gestionar la organización en las funciones administrativas que le hayan sido delegadas por el `TENANT_OWNER`, apoyando la operación diaria del Tenant dentro de Neltrik.

#### Alcance

Posee autoridad administrativa sobre un único Tenant, pudiendo gestionar los recursos, usuarios y configuraciones que le hayan sido delegados por el `TENANT_OWNER`, sin convertirse en la máxima autoridad de la organización.

### Puede existir

Puede existir en cualquier Tenant registrado dentro de **Neltrik**.

#### Asignado por

Únicamente un `TENANT_OWNER` puede asignar este Rol a otro usuario dentro de su organización.

#### Observaciones

- Un Tenant puede tener múltiples usuarios con el Rol `TENANT_ADMIN`.
- El Rol `TENANT_ADMIN` siempre depende de la autoridad del `TENANT_OWNER`.
- Un `TENANT_ADMIN` no puede asignar, transferir ni revocar el Rol `TENANT_OWNER`.

### Tenant Roles (ATS)

### Recruiter

#### Code

RECRUITER

#### Descripción

Representa al profesional responsable de gestionar los procesos de reclutamiento y selección de talento dentro de un Tenant, participando en la administración de vacantes y candidatos como parte de la operación del módulo ATS.

#### Alcance

Posee autoridad operativa dentro de un único Tenant para gestionar los procesos de reclutamiento y selección de talento que le hayan sido asignados, sin capacidad para administrar la organización ni el modelo de autorización.

### Puede existir

Puede existir en cualquier Tenant registrado dentro de **Neltrik**.

#### Asignado por

Puede ser asignado por un `TENANT_OWNER` o un `TENANT_ADMIN` dentro de su propia organización.

#### Observaciones

- Un Tenant puede tener múltiples usuarios con el Rol `RECRUITER`.
- Un usuario con el Rol `RECRUITER` únicamente puede operar dentro del Tenant al que pertenece.
- El Rol `RECRUITER` representa una función operativa del negocio y mantiene una identidad funcional definida por Neltrik.
