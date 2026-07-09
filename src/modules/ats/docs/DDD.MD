# Flujo de Desarrollo del Dominio ATS (MVP)

> **Proyecto:** Neltrik
> **Dominio:** ATS (Applicant Tracking System)
> **Estado:** MVP v1

---

# Objetivo

Este documento describe el proceso utilizado para modelar el dominio **ATS** siguiendo principios de **Domain-Driven Design (DDD)**.

El objetivo no es modelar absolutamente todo el negocio, sino descubrir únicamente el conocimiento necesario para construir el **primer MVP** de forma sólida y escalable.

---

# Paso 1 — Definir el propósito del dominio

El **ATS (Applicant Tracking System)** es el módulo encargado de gestionar el ciclo completo de un proceso de selección de personal.

Permite administrar desde la creación de una vacante hasta la contratación o descarte de un candidato, coordinando a todos los actores involucrados y registrando cada etapa del proceso.

Dentro del proceso participan diferentes actores como el reclutador, el candidato, el entrevistador y la empresa contratante, además de elementos como entrevistas, evaluaciones técnicas, estados del proceso, comentarios, documentos y decisiones de contratación.

---

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- Recruiter (Reclutador)
- Candidate (Candidato)
- Hiring Company (Empresa contratante)
- Interviewer (Entrevistador)
- Administrator (Administrador del sistema)

---

## 📦 Entidades (¿Qué información administra el dominio?)

- Vacancy
- Candidate
- Application _(se valida en el Paso 3)_
- Interview
- Technical Assessment _(en análisis)_
- Offer _(descartada para el MVP)_
- Attachment _(CV, certificados, portafolio, etc.)_

---

## 💡 Conceptos del negocio

- Recruitment Process
- Stage
- Vacancy Status
- Application Status
- Interview Result
- Hiring Decision

---

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto             | Estado         |
| -------------------- | -------------- |
| Vacancy              | ✅ Confirmada  |
| Candidate            | ✅ Confirmada  |
| Interview            | ✅ Confirmada  |
| Application          | ✅ Confirmada  |
| Attachment           | ✅ Confirmada  |
| Technical Assessment | 🟡 En análisis |

> **Nota:** La entidad **Offer** fue descartada para el MVP. Se evaluará en futuras versiones del sistema.

---

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
Vacancy
    │
    └── Application

Candidate
    │
    ├── Application
    └── Attachment

Application
    │
    └── Interview

Interview
    └── (Sin relaciones hijas por ahora)

Attachment
    └── (Sin relaciones hijas por ahora)
```

---

## Parte B — Reglas de negocio

### Vacancy → Application

- Una **Application** debe pertenecer siempre a una **Vacancy**.
- Una **Vacancy** no puede permanecer abierta indefinidamente. El sistema podrá cerrarla automáticamente cuando supere el tiempo máximo configurado sin ser cerrada manualmente.

---

### Candidate → Application

- Un candidato no puede tener más de una **Application** para la misma **Vacancy**.
- Toda **Application** debe crearse con un estado inicial.
- Un **Recruiter** no puede crear **Applications** manualmente.
- La política de reaplicación será configurable en futuras versiones del sistema.

---

### Candidate → Attachment

- El candidato no puede superar el número máximo de archivos permitido por el sistema.
- Solo se permiten archivos con las extensiones definidas por el sistema.
- Cada archivo debe respetar el tamaño máximo permitido.
- Cada archivo conserva su identidad.
- Los archivos utilizados en una **Application** no pueden eliminarse.
- Los archivos utilizados en una **Application** pueden actualizarse.

---

### Application → Interview

- Toda **Interview** debe pertenecer a una **Application**.

---

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español               | Inglés (Código)    | Tipo     | Descripción                                     |
| --------------------- | ------------------ | -------- | ----------------------------------------------- |
| Vacante               | Vacancy            | Entidad  | Oferta de empleo publicada por una empresa.     |
| Candidato             | Candidate          | Entidad  | Persona que participa en procesos de selección. |
| Postulación           | Application        | Entidad  | Participación de un candidato en una vacante.   |
| Entrevista            | Interview          | Entidad  | Entrevista realizada dentro de una postulación. |
| Archivo               | Attachment         | Entidad  | Documento asociado al candidato.                |
| Reclutador            | Recruiter          | Actor    | Responsable del proceso de selección.           |
| Empresa               | Company            | Actor    | Organización que publica vacantes.              |
| Proceso de Selección  | RecruitmentProcess | Concepto | Flujo completo del proceso de contratación.     |
| Etapa                 | Stage              | Concepto | Paso específico del proceso de selección.       |
| Estado de Vacante     | VacancyStatus      | Enum     | Estados posibles de una vacante.                |
| Estado de Postulación | ApplicationStatus  | Enum     | Estados posibles de una postulación.            |
| Estado de Entrevista  | InterviewStatus    | Enum     | Estados posibles de una entrevista.             |
| Tipo de Archivo       | AttachmentType     | Enum     | Clasificación lógica de un archivo.             |

---

## Términos prohibidos

| ❌ No usar           | ✅ Usar            |
| -------------------- | ------------------ |
| Job                  | Vacancy            |
| JobOffer             | Vacancy            |
| Applicant            | Candidate          |
| CandidateApplication | Application        |
| Resume               | Attachment         |
| File                 | Attachment         |
| Hiring Process       | RecruitmentProcess |

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en **inglés**.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Conceptos como `User`, `Role`, `Permission`, `Session` o `AccessToken` pertenecen a otros dominios (Users/Auth) y no forman parte del lenguaje del dominio ATS.

---

# Resultado

Con este documento se da por finalizado el modelado inicial del dominio **ATS** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

---

## Ubicación dentro del repositorio

```text
modules/
└── ats/
    └── docs/
        └── README.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo ATS.
