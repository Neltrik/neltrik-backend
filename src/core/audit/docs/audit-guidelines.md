# Audit Guidelines

## Objetivo

Definir las convenciones para crear y mantener el catálogo oficial de `AuditAction` y `AuditResource` de Neltrik.

Este documento complementa el DDD y SDD del dominio **Audit**.

---

# AuditResource

## Formato

Los recursos utilizan identificadores en **mayúsculas y singular**:

```text
<RESOURCE>
```

Ejemplos:

```text
USER
ROLE
PERMISSION
TENANT
SESSION
INVITATION
VACANCY
CANDIDATE
```

El nombre pertenece al vocabulario de **Audit** y no está obligado a coincidir con el nombre utilizado internamente por otro dominio.

---

# AuditAction

## Formato

Las acciones utilizan la siguiente estructura:

```text
<RESOURCE>_<EVENT>
```

Donde:

- `RESOURCE` debe existir en el catálogo oficial de `AuditResource`.
- `EVENT` representa el hecho específico que ocurrió.

Ejemplos:

```text
USER_CREATED
USER_UPDATED
USER_SUSPENDED
USER_REACTIVATED

ROLE_CREATED
ROLE_UPDATED
ROLE_DELETED

INVITATION_CREATED
INVITATION_REVOKED

VACANCY_PUBLISHED
```

### Importante

`<RESOURCE>_<EVENT>` es una **convención para definir nuevas acciones del catálogo**.

No es una validación de formato realizada por `AuditEvent`.

---

# Dónde agregar nuevos valores

Los catálogos oficiales pertenecen exclusivamente al módulo **Audit**.

```text
Audit
├── AuditAction
└── AuditResource
```

Los módulos del Core **no deben crear catálogos propios**.

Si un módulo necesita una nueva acción:

```text
1. Verificar si el AuditResource ya existe.
2. Si no existe, agregar primero el AuditResource.
3. Agregar la nueva AuditAction.
4. El módulo consumidor utiliza el valor oficial mediante AuditApi.
```

---

# Reglas rápidas

### AuditResource

- Mayúsculas.
- Singular.
- Identifica claramente el recurso dentro del contexto de Audit.
- No duplicar recursos existentes.

### AuditAction

- Formato `<RESOURCE>_<EVENT>`.
- `RESOURCE` debe existir en `AuditResource`.
- Debe representar un evento específico.
- No utilizar acciones genéricas.

Correcto:

```text
USER_SUSPENDED
ROLE_UPDATED
VACANCY_PUBLISHED
```

Incorrecto:

```text
SUSPEND_USER
CREATE
UPDATE
MANAGE
ADMIN_USER_SUSPENDED
```

La acción **no incluye el actor**, el caso de uso ni la ruta HTTP.

---

# Checklist

Antes de agregar una entrada al catálogo:

- [ ] ¿El recurso o evento realmente necesita ser auditado?
- [ ] ¿No existe ya un valor equivalente?
- [ ] ¿`AuditResource` está en mayúsculas y singular?
- [ ] ¿`AuditAction` cumple `<RESOURCE>_<EVENT>`?
- [ ] ¿El `RESOURCE` existe en `AuditResource`?
- [ ] ¿La acción representa un evento específico?
- [ ] ¿El valor se agregó al catálogo oficial de `Audit`?
- [ ] ¿El módulo consumidor utilizará el valor mediante `AuditApi`?

Los catálogos de `AuditAction` y `AuditResource` son la **fuente oficial de verdad** para el vocabulario de auditoría de Neltrik.
