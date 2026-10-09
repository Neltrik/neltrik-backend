# Deuda Técnica — File Storage

## DT-001: Dual-write entre Postgres y Redis al encolar jobs

### Contexto

`UploadFileUseCase` y `ReplaceFileUseCase` persisten el `File` en Postgres
y encolan un job en Redis (BullMQ) en la misma operación lógica. Postgres
y Redis son dos sistemas distintos: no existe una transacción que abarque
ambos.

### Decisión actual

Se encola el job **dentro de la transacción de Prisma**, en modo
best-effort. Si el commit falla, el job ya está encolado y va a fallar
ruidosamente (`FileNotFoundError`). Si el enqueue falla, la transacción
hace rollback y el `File` no se persiste.

### Riesgos

- **Job huérfano**: el job corre sobre un `File` que no existe. Mitigado:
  el job falla ruidoso, BullMQ lo marca `failed`, y es visible.
- **File PENDING sin job**: si el enqueue falla pero el commit commitea
  (no puede pasar con la Opción A, porque el enqueue va dentro de la
  transacción, pero conviene documentarlo).

### Solución correcta: Transactional Outbox

El encolado se persiste en una tabla `outbox` **dentro de la misma
transacción** que el `File`. Un worker separado lee la `outbox` y encola
en BullMQ. Consistencia eventual.

**Ventajas**:

- Cero dual-write.
- Reintentos automáticos del encolado.
- Es el patrón que usan Stripe, Shopify, etc.

**Desventajas**:

- Tabla nueva.
- Worker de outbox.
- Latencia de segundos entre el commit y el encolado.

**Componentes necesarios**:

- Modelo Prisma `Outbox`.
- `OutboxRepository` (contrato + implementación Prisma).
- `OutboxProcessor` (job recurrente que lee y encola).
- Modificar `UploadFileUseCase` y `ReplaceFileUseCase` para usar
  `OutboxRepository` en vez de `JobScheduler`.

### Cuándo implementarlo

Cuando el patrón se repita en 2-3 jobs y el riesgo de dual-write duela.
No en el MVP.

### Referencias

- https://microservices.io/patterns/data/transactional-outbox.html
- https://www.stripe.com/blog/...
