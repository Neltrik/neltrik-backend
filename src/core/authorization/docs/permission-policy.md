# Permission Policy

## 1. Concepto

Una **Policy** representa una regla adicional de autorización que restringe la ejecución de un `Permission` cuando dicha capacidad depende de condiciones que no pueden expresarse únicamente mediante el `Permission` y su `scope`.

Una Policy no define una nueva capacidad. La capacidad continúa siendo definida por el `Permission`; la Policy determina **bajo qué condiciones dicha capacidad puede ser ejecutada**.

No todos los `Permissions` requieren una Policy.

```text
Role
  │
  ▼
Permission
  │
  └────── 0..N ──────► Policy
```

### Policy

| Concepto     | Descripción                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| `permission` | Permission al que aplica la Policy.                                          |
| `rule`       | Regla que determina las condiciones adicionales para ejecutar el Permission. |
| `context`    | Información necesaria para evaluar la regla de autorización.                 |

> **Nota:** Una Policy no reemplaza `scope`. El `scope` determina el ámbito general del Permission, mientras que una Policy puede imponer restricciones adicionales sobre su ejecución.

---

## 2. Relaciones

```text
Permission

1 ─────── 0..N Policy
```

### Descripción

- Un `Permission` puede no tener ninguna Policy.
- Un `Permission` puede estar sujeto a una o múltiples Policies.
- Una Policy únicamente puede aplicarse a un `Permission` existente.
- La existencia de una Policy no modifica el `scope` del Permission.
- Las Policies son definidas exclusivamente por Neltrik.
- Las Policies forman parte del modelo oficial de autorización.

---

## 3. Tipos de Policy

El modelo debe permitir incorporar diferentes tipos de Policy conforme aparezcan nuevas necesidades de autorización.

Inicialmente se define únicamente el concepto de Policy, sin introducir categorías artificiales que todavía no representen una necesidad real del dominio.

Los tipos concretos deberán incorporarse mediante SDD cuando aparezca una regla de autorización que los justifique.

### Policy actualmente identificada

**User Suspension Policy**

Regula sobre qué usuarios puede ejecutarse el Permission `USER_SUSPEND` según la jerarquía del Role que ejecuta la operación.

```text
PLATFORM_ADMIN
      ↓
TENANT_OWNER
      ↓
TENANT_ADMIN
```

---

# 4. Reglas de negocio

## 4.1 Aplicación

- Una Policy solo puede aplicarse a un `Permission` existente.
- Una Policy no es obligatoria para todos los Permissions.
- Un Permission sin Policy no está sujeto a restricciones adicionales mediante Policy.
- Las reglas generales de autorización (`scope`, Role, etc.) deben cumplirse antes de evaluar las restricciones específicas de una Policy.
- Una Policy no puede ampliar las capacidades definidas por un Permission.
- Una Policy únicamente puede restringir las condiciones bajo las cuales un Permission puede ejecutarse.
- Las Policies oficiales únicamente pueden ser definidas y administradas por Neltrik.

---

## 4.2 Evaluación

- Una Policy debe evaluarse en el contexto de la operación que intenta ejecutar el usuario.
- La evaluación debe considerar la información necesaria para determinar si la operación está permitido.
- Si una Policy determina que la operación no está permitida, la autorización debe ser rechazada.
- Una Policy no debe modificar el Permission ni el Role durante su evaluación.
- Las reglas de Policy deben ser deterministas para un mismo contexto de autorización.

---

## 4.3 User Suspension Policy

Aplica al Permission:

```text
USER_SUSPEND
```

### Regla de jerarquía

Un Role inferior no puede utilizar `USER_SUSPEND` sobre un usuario que tenga un Role superior.

La jerarquía definida actualmente es:

```text
PLATFORM_ADMIN > TENANT_OWNER > TENANT_ADMIN
```

Por tanto:

| Actor            | Puede suspender                                       |
| ---------------- | ----------------------------------------------------- |
| `PLATFORM_ADMIN` | `PLATFORM_ADMIN`, `TENANT_OWNER`, `TENANT_ADMIN`      |
| `TENANT_OWNER`   | `TENANT_ADMIN`                                        |
| `TENANT_ADMIN`   | No puede suspender `TENANT_OWNER` ni `PLATFORM_ADMIN` |

> Esta Policy únicamente restringe **sobre quién puede ejecutarse `USER_SUSPEND`**. No modifica el significado del Permission.

---

## 5. Extensibilidad

El modelo de Policy debe permitir incorporar nuevas reglas de autorización sin modificar el concepto base de `Permission`.

Cuando aparezca una nueva necesidad que requiera restricciones adicionales, deberá:

1. Identificarse el `Permission` afectado.
2. Determinarse si la restricción corresponde a una Policy.
3. Definirse el tipo de Policy requerido.
4. Documentarse la regla de negocio.
5. Incorporarse al modelo de autorización mediante su correspondiente SDD.

Las nuevas Policies no deben crearse únicamente para representar diferencias que ya puedan expresarse mediante `scope`, `Role` o las relaciones existentes.
