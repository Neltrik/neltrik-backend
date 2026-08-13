# Neltrik Backend

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

Backend del sistema **Neltrik**, desarrollado con **NestJS**, **TypeScript** y **Prisma ORM**, siguiendo una arquitectura de **Monolito Modular** basada en **Domain-Driven Design (DDD)** y **Clean Architecture.**.

---

# Tecnologías

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Docker
- Zod
- ESLint
- Prettier
- Husky
- Commitlint
- pnpm

---

# Estructura del proyecto

```text
.
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── core/
│   ├── modules/
│   ├── prisma/
│   ├── shared/
│   ├── app.module.ts
│   └── main.ts
│
├── docker-compose.yml
├── prisma.config.ts
└── README.md
```

---

# Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 20 o superior
- pnpm
- Docker Desktop (Windows/macOS) o Docker Engine (Linux)

---

# Instalación

Instalar las dependencias del proyecto:

```bash
pnpm install
```

---

# Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

---

# Herramientas de desarrollo

## Crear un módulo

Genera automáticamente un módulo siguiendo la estructura de Clean Architecture definida para Neltrik.

```bash
pnpm module:create <module-name>
```

Ejemplo:

```bash
pnpm module:create auth
```

## Actualizar un módulo

Sincroniza la estructura de un módulo existente con la plantilla oficial del proyecto, agregando nuevos archivos o carpetas incorporados por la arquitectura sin sobrescribir la implementación existente.

```bash
pnpm module:update
```

Ejemplo:

```bash
pnpm module:update
```

Estructura generada:

```text
src/
└── modules/
    └── auth/
        ├── api/
        ├── application/
        │   ├── use-cases/
        │   └── use-cases-ohs/
        ├── docs/
        |
        ├── domain/
        │   ├── entities/
        │   ├── errors/
        │   ├── interfaces/
        │   ├── types/
        │   └── value-objects/
        ├── infrastructure/
        │   ├── mappers/
        │   └── repositories/
        ├── presentation/
        │   ├── controllers/
        │   ├── dto/
        │   ├── messages/
        │   └── schemas/
        ├── test-doubles/
        ├── tests/
        └── auth.module.ts
```

### Convención para nombres de módulos

Los módulos deben nombrarse utilizando **kebab-case**.

Reglas:

- Solo letras minúsculas.
- Las palabras se separan mediante guiones (`-`).
- No se permiten espacios.
- No se permiten guiones bajos (`_`).
- No se permiten caracteres especiales.
- El nombre debe comenzar con una letra.
- No puede iniciar ni terminar con un guion.
- No puede contener guiones consecutivos.

Ejemplos válidos:

```text
auth
ats
candidate
candidate-profile
candidate-profile-v2
```

Ejemplos inválidos:

```text
Auth
AUTH
candidate_profile
candidate profile
candidate-
-candidate
candidate--profile
candidate.profile
```

---

# Comunicación entre módulos

Cada módulo expone una interfaz pública mediante la carpeta `api/`.

Esta representa el único punto de entrada permitido para que otros módulos interactúen con sus capacidades.

```text
HTTP
   │
   ▼
presentation
   │
   ▼
application
   │
   ▼
domain


Otro módulo
     │
     ▼
    api
     │
     ▼
application
     │
     ▼
domain
```

Los módulos nunca deben importar directamente elementos internos (`application`, `domain`, `infrastructure` o `presentation`) de otro módulo.

Toda comunicación entre módulos debe realizarse exclusivamente mediante `api/`.

## Casos de uso para comunicación intermodular

Los casos de uso destinados a Presentation y los casos de uso destinados al consumo mediante `api/` (OHS) tienen responsabilidades diferenciadas.

La carpeta `application/use-cases/` contiene los casos de uso utilizados por la capa de Presentation.

La carpeta `application/use-cases-ohs/` contiene exclusivamente los casos de uso utilizados por la capa `api/` para exponer capacidades del módulo a otros módulos.

Un `UseCaseOhs` no debe depender de otro `OhsApi`. La comunicación intermodular debe realizarse a través del `api/` correspondiente, evitando cadenas de dependencias entre casos de uso OHS.

### Reutilización de casos de uso

Un `api/` debe utilizar preferentemente un caso de uso existente de `application/use-cases/`.

No debe crearse un `UseCaseOhs` cuando el caso de uso de Presentation pueda reutilizarse directamente.

Debe crearse un `UseCaseOhs` únicamente cuando el caso de uso de Presentation que se pretende reutilizar tenga una dependencia hacia otro `OhsApi`.

En ese caso, el `UseCaseOhs` debe implementar únicamente el flujo necesario para satisfacer el contrato expuesto por `api/`, sin depender del caso de uso de Presentation que genera la recursividad.

## Dependencias circulares

Las dependencias circulares entre módulos mediante OHS son válidas cuando corresponden a una necesidad real del dominio.

Cuando una dependencia circular entre módulos sea requerida por NestJS, debe utilizarse `forwardRef` para resolver la referencia durante la inicialización del contenedor de dependencias.

Por ejemplo:

```text
TenantApi
    ↕
AuthorizationApi
```

---

# Responsabilidad de `api`

La carpeta `api/` representa la interfaz pública del módulo.

Su responsabilidad es equivalente a la de `presentation`, pero destinada al consumo por otros módulos en lugar de clientes HTTP.

Por definición arquitectónica:

- no contiene lógica de negocio;
- únicamente delega a los casos de uso correspondientes;
- constituye el **Open Host Service (OHS)** del módulo, permitiendo la comunicación con otros Bounded Contexts sin exponer su implementación interna..

---

# Base de datos

> **Importante**
>
> Antes de levantar la base de datos, asegúrate de que **Docker Desktop** esté abierto y en ejecución.

Levantar PostgreSQL:

```bash
docker compose up -d
```

Detener PostgreSQL:

```bash
docker compose down
```

---

# Prisma

Generar el cliente:

```bash
pnpm prisma:generate
```

Crear una migración:

```bash
pnpm prisma:migrate --name <migration-name>
```

Aplicar migraciones en producción:

```bash
pnpm prisma:deploy
```

Reiniciar la base de datos:

```bash
pnpm prisma:reset
```

Abrir Prisma Studio:

```bash
pnpm prisma:studio
```

Formatear el esquema:

```bash
pnpm prisma:format
```

---

# Ejecutar el proyecto

Modo desarrollo:

```bash
pnpm start:dev
```

Compilar:

```bash
pnpm build
```

Modo producción:

```bash
pnpm start:prod
```

---

# 🧪 Calidad de código

Formatear el proyecto:

```bash
pnpm format
```

Ejecutar ESLint:

```bash
pnpm lint
```

Corregir automáticamente los problemas encontrados:

```bash
pnpm lint:fix
```

Ejecutar las pruebas unitarias:

```bash
pnpm test
```

Generar el reporte de cobertura:

```bash
pnpm test:coverage
```

---

# 📄 Licencia

Este proyecto es de uso privado y no está autorizado para distribución o uso externo sin autorización expresa del propietario.
