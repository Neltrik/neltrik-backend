# Vacancy Entity - README

## 1. Entidad

La entidad **Vacancy** representa una oferta laboral publicada dentro del sistema.

### Vacancy

| Campo            | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `id`             | Identificador único de la vacante                                  |
| `title`          | Título de la oferta laboral                                        |
| `description`    | Descripción detallada de la vacante                                |
| `tenantId`       | Identificador de la empresa asociada                               |
| `recruiterId`    | Identificador del reclutador responsable                           |
| `employmentType` | Tipo de contrato o modalidad laboral                               |
| `workMode`       | Modalidad de trabajo (presencial, remoto, híbrido)                 |
| `closingDate`    | Fecha límite para aplicar a la vacante                             |
| `status`         | Estado actual de la vacante                                        |
| `salary`         | Rango o valor salarial ofrecido                                    |
| `location`       | Ubicación de la vacante                                            |
| `createdAt`      | Fecha de creación del registro                                     |
| `updatedAt`      | Fecha de última actualización del registro                         |
| `deletedAt`      | Fecha en la que la vacante fue eliminada lógicamente (Soft Delete) |

---

## 2. Relaciones

La entidad **Vacancy** mantiene las siguientes relaciones:

```
Vacancy

1 ─────── N Applications

N ─────── 1 Tenant

N ─────── 1 Recruiter
```

### Descripción

- Una **Vacancy** puede tener múltiples **Applications**.
- Una **Vacancy** pertenece a una única **Tenant**.
- Una **Vacancy** pertenece a un único **Recruiter**.

---

## 3. Enums

La entidad **Vacancy** utiliza los siguientes tipos enumerados para garantizar la integridad de los datos.

### 3.1 VacancyStatus

Representa el estado actual de la vacante.

| Estado      | Descripción                                       |
| ----------- | ------------------------------------------------- |
| `DRAFT`     | La vacante fue creada pero aún no está publicada. |
| `PUBLISHED` | La vacante está visible y acepta postulaciones.   |
| `CLOSED`    | La vacante dejó de aceptar nuevas postulaciones.  |
| `ARCHIVED`  | La vacante fue archivada y no está activa.        |

---

### 3.2 EmploymentType

Representa el tipo de contratación de la vacante.

| Tipo         | Descripción                                                |
| ------------ | ---------------------------------------------------------- |
| `FULL_TIME`  | Empleo de tiempo completo.                                 |
| `PART_TIME`  | Empleo de medio tiempo.                                    |
| `CONTRACT`   | Contrato por tiempo determinado o prestación de servicios. |
| `INTERNSHIP` | Prácticas o pasantías.                                     |

---

### 3.3 WorkMode

Representa la modalidad en la que se desarrollará el trabajo.

| Modalidad | Descripción                            |
| --------- | -------------------------------------- |
| `ONSITE`  | Trabajo presencial.                    |
| `REMOTE`  | Trabajo remoto.                        |
| `HYBRID`  | Trabajo híbrido (presencial y remoto). |

---

# 4. Reglas de negocio

## 4.1 Creación

- El título de la vacante es obligatorio.
- El salario no puede ser negativo.
- La fecha de cierre debe ser posterior a la fecha de creación.
- Toda vacante inicia con el estado `DRAFT`.

---

## 4.2 Actualización

### Campos actualizables

Los siguientes campos pueden ser modificados:

- `title`
- `description`
- `employmentType`
- `workMode`
- `closingDate`
- `salary`
- `location`

### Campos no actualizables

Los siguientes campos no pueden ser modificados mediante el caso de uso de actualización:

- `id`
- `tenantId`
- `recruiterId`
- `status`
- `createdAt`

### Restricciones

- Una vacante con estado `CLOSED` no puede actualizarse.
- Una vacante con estado `ARCHIVED` no puede actualizarse.
- La nueva fecha de cierre debe continuar siendo válida.
- El salario no puede ser negativo.

---

## 4.3 Eliminación

- La eliminación de una vacante es lógica (Soft Delete).
- Al eliminar una vacante, el sistema registra la fecha en `deletedAt`.
- Las vacantes eliminadas no deben ser retornadas por las consultas del sistema.

---

## 4.4 Publicación

- Solo una vacante en estado `DRAFT` puede publicarse.
- Una vacante publicada pasa al estado `PUBLISHED`.

---

## 4.5 Cierre

- Una vacante en estado `PUBLISHED` puede cerrarse.
- Una vacante cerrada pasa al estado `CLOSED`.
- Una vacante en estado `CLOSED` deja de aceptar nuevas postulaciones.

---

## 4.6 Archivado

- Una vacante en estado `CLOSED` puede archivarse.
- Una vacante archivada pasa al estado `ARCHIVED`.
- Una vacante archivada no puede modificarse ni volver a publicarse.

---

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```
vacancies
```

---

## 5.2 Columnas

| Columna           | Tipo          | Null | Default             | Observación |
| ----------------- | ------------- | ---- | ------------------- | ----------- |
| `id`              | UUID          | ❌   | `gen_random_uuid()` | PK          |
| `title`           | VARCHAR(255)  | ❌   | —                   |             |
| `description`     | TEXT          | ❌   | —                   |             |
| `tenant_id`       | UUID          | ❌   | —                   | FK          |
| `recruiter_id`    | UUID          | ❌   | —                   | FK          |
| `employment_type` | ENUM          | ❌   | —                   |             |
| `work_mode`       | ENUM          | ❌   | —                   |             |
| `closing_date`    | TIMESTAMP     | ❌   | —                   |             |
| `status`          | ENUM          | ❌   | `DRAFT`             |             |
| `salary`          | DECIMAL(12,2) | ✅   | `NULL`              |             |
| `location`        | VARCHAR(255)  | ✅   | `NULL`              |             |
| `created_at`      | TIMESTAMP     | ❌   | `NOW()`             |             |
| `updated_at`      | TIMESTAMP     | ❌   | `NOW()`             |             |
| `deleted_at`      | TIMESTAMP     | ✅   | `NULL`              | Soft delete |

---

## 5.3 Restricciones

- id es la clave primaria.
- tenant_id referencia el Tenant propietario de la vacante.
- recruiter_id referencia la entidad Recruiter.
- status inicia con el valor DRAFT.
- closing_date debe ser posterior a created_at.
- deleted_at se utilizará para implementar Soft Delete.

---

## 5.4 Índices

- PK(id)
- INDEX(tenant_id)
- INDEX(recruiter_id)
- INDEX(status)
