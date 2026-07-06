# Neltrik Backend

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

Backend del sistema **Neltrik**, desarrollado con **NestJS**, **TypeScript** y **Prisma ORM**, siguiendo una arquitectura modular basada en principios de **Clean Architecture**.

---

# 🚀 Tecnologías

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

# 📂 Estructura del proyecto

```text
.
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
│
├── docker-compose.yml
├── prisma.config.ts
└── README.md
```

---

# ⚙️ Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 20 o superior
- pnpm
- Docker Desktop (Windows/macOS) o Docker Engine (Linux)

---

# 📦 Instalación

Instalar las dependencias del proyecto:

```bash
pnpm install
```

---

# 🔧 Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

---

# 🐳 Base de datos

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

# 🗄️ Prisma

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

# ▶️ Ejecutar el proyecto

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

---

# 📄 Licencia

Este proyecto es de uso privado y no está autorizado para distribución o uso externo sin autorización expresa del propietario.
