# Deuda Técnica — File Storage

---

## DT-001: Transactional Outbox para el encolado de jobs

**Qué falta**: persistir el encolado de jobs en una tabla `outbox` dentro de
la transacción de Postgres, y que un worker la lea y encole en BullMQ.
Hoy se encola directo en Redis dentro de la transacción, en modo best-effort.

**Por qué no se hizo**: agrega tabla, repositorio, processor y job recurrente.
El riesgo es bajo (Redis siempre arriba; si falla, el job falla ruidoso).

**Cuándo implementarlo**: cuando el patrón se repita en 2-3 jobs, o cuando un
job huérfano cause un incidente en producción.

**Referencia**: https://microservices.io/patterns/data/transactional-outbox.html
