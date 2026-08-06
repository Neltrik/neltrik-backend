# Permission Guidelines

## Objetivo

Este documento define las convenciones utilizadas para crear y mantener el catálogo oficial de **Permissions** de Neltrik.

Su propósito es garantizar que todos los Permissions de la plataforma mantengan una nomenclatura consistente, representen una única capacidad del sistema y puedan escalar de forma ordenada conforme evolucionen los módulos del producto.

Este documento complementa el DDD y el SDD del dominio Authorization.

---

## Alcance

Estas convenciones aplican a todos los Permissions oficiales definidos por Neltrik.

Los Tenants nunca crean ni modifican Permissions.

---

# Convención de nombres

Todos los Permissions deberán seguir la siguiente estructura:

```text
<RESOURCE>_<ACTION>
```

Donde:

- **RESOURCE** representa la entidad o recurso sobre el cual se ejecuta la acción.
- **ACTION** representa la capacidad específica autorizada.

---

## RESOURCE

El recurso debe corresponder al nombre oficial de la entidad definida dentro del dominio.

Ejemplos:

```text
ROLE
PERMISSION
USER
TENANT
VACANCY
CANDIDATE
PIPELINE
JOB
```

Siempre utilizar mayúsculas y nombres en singular.

---

## ACTION

Las acciones representan capacidades específicas del sistema.

Ejemplos comunes:

```text
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
```

No todas las entidades implementarán todas las acciones.

Cada dominio definirá únicamente las capacidades que realmente existan dentro del negocio.

---

# Descripciones

Las descripciones deben escribirse en español y explicar claramente la capacidad otorgada.

Ejemplos:

```text
ROLE_CREATE

Permite crear roles oficiales del catálogo de Neltrik.
```

```text
VACANCY_PUBLISH

Permite publicar vacantes.
```

Las descripciones deben orientarse al usuario administrador de la plataforma.

---

# Reglas

## Un Permission representa una única capacidad

Correcto

```text
USER_CREATE

USER_UPDATE
```

Incorrecto

```text
USER_CREATE_UPDATE
```

---

## El código es inmutable

Una vez creado un Permission, su código nunca debe modificarse.

Si cambia la capacidad del sistema, deberá crearse un nuevo Permission.

---

## No utilizar nombres ambiguos

Incorrecto

```text
ADMIN

ACCESS

MANAGE

GENERAL
```

Correcto

```text
USER_CREATE

USER_SUSPEND

ROLE_UPDATE
```

---

## Utilizar únicamente nombres oficiales

Siempre utilizar el nombre oficial definido por el dominio.

Incorrecto

```text
PROFILE_CREATE
```

Correcto

```text
ROLE_CREATE
```

---

## No incluir información del Rol

Los Permissions representan capacidades, no responsabilidades.

Incorrecto

```text
ADMIN_CREATE_USER

OWNER_DELETE_ROLE
```

Correcto

```text
USER_CREATE

ROLE_DELETE
```

La responsabilidad pertenece al Role, no al Permission.

---

# Ejemplos

Correctos

```text
ROLE_CREATE
ROLE_UPDATE
ROLE_LIST

PERMISSION_CREATE
PERMISSION_UPDATE
PERMISSION_LIST

USER_CREATE
USER_UPDATE
USER_LIST

VACANCY_CREATE
VACANCY_PUBLISH
VACANCY_ARCHIVE
```

Incorrectos

```text
CREATE_ROLE

ROLE_CAN_CREATE

ROLE_CREATE_UPDATE

ADMIN_ROLE

GENERAL_PERMISSION
```

---

# Consideraciones

El catálogo de Permissions crecerá conforme evolucionen los módulos de Neltrik.

Este documento busca garantizar que dicho crecimiento mantenga una estructura consistente, predecible y fácil de mantener.

Ante cualquier nuevo Permission, primero deberá verificarse que cumple estas convenciones antes de incorporarse al catálogo oficial.
