# Rate Limiting

## ¿Cómo funciona?

Sliding Window con Redis. Cada request se cuenta en una ventana de tiempo. Al exceder el límite, retorna `429 Too Many Requests`.

## Criterios de decisión

### 1. Tipo de operación

| Operación                       | Límite              |
| ------------------------------- | ------------------- |
| Lectura (GET, list)             | Global (100/15min)  |
| Escritura (POST, PATCH, DELETE) | Moderado (20/15min) |
| Crítica (login, forgot)         | Estricto (5/15min)  |

### 2. Destructividad

| ¿Destructivo? | Límite   |
| ------------- | -------- |
| No            | Global   |
| Reversible    | Moderado |
| Irreversible  | Estricto |

### 3. Envío de emails

| ¿Envía email? | Límite             |
| ------------- | ------------------ |
| No            | Global             |
| Sí            | Estricto (3/60min) |

### 4. Sensibilidad de seguridad

| ¿Sensible? | Límite             |
| ---------- | ------------------ |
| No         | Global             |
| Sí         | Estricto (5/15min) |

### 5. Frecuencia esperada

| ¿Frecuencia? | Límite   |
| ------------ | -------- |
| Alta         | Global   |
| Media        | Moderado |
| Baja         | Estricto |

### 6. Actor

| Actor                    | Límite   |
| ------------------------ | -------- |
| Anónimo (IP)             | Estricto |
| Autenticado (User)       | Moderado |
| Sistema (PLATFORM_ADMIN) | Global   |

## Tabla de límites

| Límite   | TTL       | Uso              |
| -------- | --------- | ---------------- |
| Global   | 100/15min | Lectura, sistema |
| Moderado | 20/15min  | Escritura, admin |
| Estricto | 5/15min   | Seguridad, login |
| Email    | 3/60min   | Envío de emails  |

## Cómo agregar un nuevo endpoint

### 1. Si usa el límite global

**No hagas nada.** El `ThrottlerGuard` ya lo aplica.

### 2. Si necesita un límite específico

```typescript
import { Throttle } from "@nestjs/throttler";

@Throttle({ default: { limit: 5, ttl: 900000 } })
@Post("login")
public async login(...) { ... }
```
