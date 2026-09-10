# Permission Guidelines

## Objetivo

Este documento define las convenciones utilizadas para crear y mantener el catálogo oficial de Permissions de Neltrik.

Su propósito es garantizar que todos los Permissions mantengan una nomenclatura consistente, representen una única capacidad del sistema y permitan identificar de forma explícita su categoría de acceso.

Este documento complementa el DDD y el SDD del dominio Authorization.

---

## Alcance

Estas convenciones aplican a todos los Permissions oficiales definidos por Neltrik.

Los Tenants nunca crean ni modifican Permissions.

---

# Convención de nombres

Todos los Permissions deberán seguir la siguiente estructura:

<CATEGORY>_<RESOURCE>_<ACTION>

Donde:

- CATEGORY representa la categoría de acceso del permiso.
- RESOURCE representa la entidad o recurso sobre el cual se ejecuta la acción.
- ACTION representa la capacidad específica autorizada.

---

## CATEGORY

Existen tres categorías oficiales:

PLATFORM_ Permisos de sistema (solo PLATFORM_ADMIN)
ADMIN_ Permisos administrativos del tenant
(sin prefijo) Permisos de ownership (el propio usuario)

### PLATFORM_

Permisos exclusivos de PLATFORM_ADMIN.

Ejemplos:

PLATFORM_TENANT_CREATE
PLATFORM_TENANT_UPDATE
PLATFORM_ROLE_CREATE
PLATFORM_PERMISSION_CREATE

### ADMIN_

Permisos de administradores del tenant.

Ejemplos:

ADMIN_USER_UPDATE
ADMIN_USER_SUSPEND
ADMIN_INVITATION_CREATE

### Sin prefijo

Permisos del propio usuario sobre sus propios recursos.

Ejemplos:

SESSION_LIST
SESSION_VIEW
SESSION_REVOKE

---

## RESOURCE

El recurso debe corresponder al nombre oficial de la entidad definida dentro del dominio.

Ejemplos:

ROLE
PERMISSION
USER
TENANT
SESSION
INVITATION
VACANCY
CANDIDATE
PIPELINE
JOB

Siempre utilizar mayúsculas y nombres en singular.

---

## ACTION

Las acciones representan capacidades específicas del sistema.

Ejemplos comunes:

CREATE
LIST
UPDATE
DELETE

SUSPEND
RESTORE

PUBLISH
ARCHIVE

IMPORT
EXPORT

APPROVE
REJECT

No todas las entidades implementarán todas las acciones.

Cada dominio definirá únicamente las capacidades que realmente existan dentro del negocio.

---

# Descripciones

Las descripciones deben escribirse en español y explicar claramente la capacidad otorgada.

Ejemplos:

PLATFORM_ROLE_CREATE

Permite crear roles oficiales del catálogo de Neltrik.

ADMIN_USER_SUSPEND

Permite suspender usuarios del tenant.

Las descripciones deben orientarse al usuario administrador de la plataforma.

---

# Reglas

## Un Permission representa una única capacidad

Correcto

ADMIN_USER_CREATE

ADMIN_USER_UPDATE

Incorrecto

ADMIN_USER_CREATE_UPDATE

---

## El código es inmutable

Una vez creado un Permission, su código nunca debe modificarse.

Si cambia la capacidad del sistema, deberá crearse un nuevo Permission.

---

## La categoría siempre es explícita

Correcto

PLATFORM_TENANT_CREATE

ADMIN_USER_UPDATE

SESSION_LIST

Incorrecto

TENANT_CREATE (¿es sistema o administrativo?)

USER_UPDATE (¿es administrativo u ownership?)

---

## No utilizar nombres ambiguos

Incorrecto

ADMIN

ACCESS

MANAGE

GENERAL

Correcto

ADMIN_USER_CREATE

ADMIN_USER_SUSPEND

SESSION_REVOKE

---

## Utilizar únicamente nombres oficiales

Siempre utilizar el nombre oficial definido por el dominio.

Incorrecto

PROFILE_CREATE

Correcto

ADMIN_USER_CREATE

---

## No incluir información del Rol

Los Permissions representan capacidades, no responsabilidades.

Incorrecto

ADMIN_CREATE_USER

OWNER_DELETE_ROLE

Correcto

ADMIN_USER_CREATE

ADMIN_ROLE_DELETE

La responsabilidad pertenece al Role, no al Permission.

---

## El prefijo determina la categoría

Correcto

PLATFORM_TENANT_CREATE
ADMIN_USER_UPDATE
SESSION_LIST

Incorrecto

TENANT_CREATE
USER_UPDATE
SESSION_LIST_SELF

---

# Ejemplos

## Sistema (PLATFORM_)

PLATFORM_TENANT_CREATE
PLATFORM_TENANT_UPDATE
PLATFORM_TENANT_LIST

PLATFORM_ROLE_CREATE
PLATFORM_ROLE_UPDATE
PLATFORM_ROLE_LIST

PLATFORM_PERMISSION_CREATE
PLATFORM_PERMISSION_LIST

## Administrativos (ADMIN_)

ADMIN_USER_CREATE
ADMIN_USER_UPDATE
ADMIN_USER_SUSPEND
ADMIN_USER_REACTIVATE
ADMIN_USER_LIST

ADMIN_INVITATION_CREATE
ADMIN_INVITATION_LIST
ADMIN_INVITATION_REVOKE

## Ownership (sin prefijo)

SESSION_LIST
SESSION_VIEW
SESSION_REVOKE
SESSION_REVOKE_ALL

## Incorrectos

TENANT_CREATE (falta prefijo PLATFORM_)

USER_UPDATE (falta prefijo ADMIN_)

CREATE_ROLE (orden incorrecto)

ROLE_CAN_CREATE (formato incorrecto)

ADMIN_ROLE (ambiguo)

GENERAL_PERMISSION (ambiguo)

---

# Consideraciones

El catálogo de Permissions crecerá conforme evolucionen los módulos de Neltrik.

Este documento busca garantizar que dicho crecimiento mantenga una estructura consistente, predecible y fácil de mantener.

Ante cualquier nuevo Permission, primero deberá verificarse que cumple estas convenciones antes de incorporarse al catálogo oficial.
