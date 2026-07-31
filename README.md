# Neltrik Backend

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

Backend del sistema **Neltrik**, desarrollado con **NestJS**, **TypeScript** y **Prisma ORM**, siguiendo una arquitectura modular basada en **DDD (Domain-Driven Design)** y **Clean Architecture**.

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
│   ├── prisma/
│   ├── modules/
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

# Convenciones de arquitectura

Las siguientes convenciones forman parte de la arquitectura de Neltrik y deben respetarse durante el desarrollo de cualquier módulo.

## Convenciones generales

Las siguientes convenciones forman parte de la arquitectura de Neltrik y deben respetarse durante el desarrollo de cualquier módulo.

## Aislamiento por Tenant

Neltrik implementa una arquitectura Multi-Tenant basada en aislamiento lógico.

Para garantizar la seguridad, la escalabilidad y la consistencia de la plataforma, se establecen las siguientes reglas:

- Toda entidad perteneciente a una organización debe almacenar explícitamente el campo tenantId.
- El tenantId representa el propietario de la información y constituye el límite de aislamiento entre organizaciones.
- Todas las consultas, actualizaciones y eliminaciones de datos deben realizarse dentro del contexto de un tenantId.
- Ningún Tenant puede acceder, modificar o consultar información perteneciente a otro Tenant.
- Las entidades globales de la plataforma (por ejemplo, Tenant) no almacenan tenantId, ya que no pertenecen a ninguna organización.

Estas reglas aplican a todos los módulos funcionales de la plataforma (ATS, CRM, Inventory, etc.) y forman parte de la arquitectura base de Neltrik.

# Arquitectura por capas

Todos los módulos del sistema, tanto los ubicados en `core` como en `modules`, siguen exactamente la misma estructura arquitectónica.

## Diagrama de capas

```text
Presentation
      │
      ▼
Application
      │
      ▼
Domain
      ▲
      │
Infrastructure
```

## Responsabilidad de cada capa

| Capa               | Responsabilidad                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Presentation**   | Expone la funcionalidad mediante interfaces de entrada (HTTP, Controllers, DTO, Swagger, etc.).                                                             |
| **Application**    | Contiene los casos de uso del módulo y los Application Services encargados de orquestar procesos que involucren múltiples casos de uso o múltiples módulos. |
| **Domain**         | Contiene el modelo de negocio, entidades, value objects, interfaces, eventos, errores y reglas del dominio.                                                 |
| **Infrastructure** | Implementa los contratos definidos por el dominio utilizando tecnologías concretas como Prisma, almacenamiento o servicios externos.                        |

## Reglas de dependencia

Las dependencias entre capas deben respetar las siguientes reglas:

- Presentation únicamente puede depender de Application.
- Application puede depender únicamente de Domain y de las interfaces públicas de otros módulos.
- Domain únicamente puede depender de componentes ubicados en Shared.
- Infrastructure implementa las interfaces definidas por Domain.
- Ninguna capa puede depender de una capa superior.

## Comunicación entre módulos

Los módulos del sistema permanecen desacoplados entre sí.

Por esta razón:

- Ningún módulo puede importar implementaciones internas pertenecientes a otro módulo.
- La comunicación entre módulos debe realizarse mediante la API pública expuesta por la capa Application.
- Las reglas de negocio permanecen encapsuladas dentro del dominio propietario.

# Herramientas de desarrollo

## Crear un módulo

Genera automáticamente un módulo siguiendo la arquitectura modular basada en DDD (Domain-Driven Design) y Clean Architecture definida para Neltrik.

```bash
pnpm module:create <module-name> --target=<core|modules>
```

Ejemplos:

```bash
pnpm module:create ats --target=modules
pnpm module:create tenant --target=core
```

Estructura generada:

```text
src/
└── modules/
    └── auth/
        ├── application/
        │   ├── application-services/
        │   ├── use-cases/
        │   └── index.ts
        ├── domain/
        │   ├── entities/
        │   ├── errors/
        │   ├── interfaces/
        │   ├── types/
        │   └── value-objects/
        ├── infrastructure/
        │   ├── mappers/
        │   ├── providers/
        │   └── repositories/
        ├── presentation/
        │   ├── controllers/
        │   └── dto/
        ├── test-doubles/
        ├── tests/
        └── auth.module.ts
```

La carpeta `application-services` se utiliza únicamente cuando un proceso del negocio requiere coordinar múltiples casos de uso o interactuar con otros módulos. En módulos simples puede permanecer vacía o no existir.

### Parámetro `--target`

El parámetro `--target` indica el destino donde será creado el módulo.

| Valor     | Destino                                                   |
| --------- | --------------------------------------------------------- |
| `modules` | Módulos funcionales de la aplicación.                     |
| `core`    | Módulos transversales compartidos por toda la aplicación. |

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

Validar el esquema:

```bash
pnpm prisma:validate
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

# Calidad de código

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

Correr test:

```bash
pnpm test
```

Correr coverage test:

```bash
pnpm test:coverage
```

---

# 🤝 Contribución

Todo cambio realizado sobre Neltrik debe respetar las convenciones definidas por la arquitectura del proyecto.

Antes de abrir un Pull Request verifica que:

- El proyecto compile correctamente.
- Todas las pruebas pasen.
- ESLint no reporte errores.
- La cobertura mínima requerida se mantenga.
- Las dependencias entre capas y entre módulos respeten la arquitectura definida en este documento.

---

# 📄 Licencia

Este proyecto es de uso privado y no está autorizado para distribución o uso externo sin autorización expresa del propietario.
