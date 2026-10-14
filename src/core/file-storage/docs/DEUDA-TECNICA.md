# Deuda Técnica — File Storage

Registro de deudas técnicas del módulo File Storage. Cada entrada describe
algo que decidimos **no implementar ahora** por simplicidad, y el costo
futuro de no hacerlo.

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

---

## DT-002: Paginación en `FileStoragePort.list(prefix)`

**Qué falta**: paginar el listado de binarios en el storage. Hoy `list()`
devuelve **todos** los binarios de un tenant en memoria, en una sola llamada.

En `B2FileStorageAdapter`, la paginación de `ListObjectsV2` ya está implementada
internamente (itera hasta agotar `IsTruncated`). Pero **el resultado completo se
acumula en un array en memoria**. Si un tenant tiene millones de archivos, el
array puede consumir GB de RAM.

**Por qué no se hizo**: en la práctica, un tenant de RR.HH. no tiene millones
de archivos. Los jobs de reconciliación y purga corren de noche, y el uso de
memoria es aceptable con decenas de miles de archivos.

**Cuándo implementarlo**: cuando un tenant supere los ~100.000 binarios, o
cuando el worker empiece a consumir demasiada memoria. La solución es
`AsyncIterable<string>` en lugar de `Promise<string[]>`, y que los jobs
procesen en streaming.

---

## DT-003: Paralelización de jobs por tenant

**Qué falta**: procesar los tenants en paralelo en los jobs que iteran por
tenant (`ReconcileStorageHandler`, `PurgeDeletedFilesHandler`,
`RescanFilesHandler`). Hoy se procesan secuencialmente: un tenant a la vez.

**Por qué no se hizo**: con pocos tenants (decenas), el tiempo secuencial es
aceptable. Los jobs corren de noche. La paralelización agrega complejidad
(control de concurrencia, manejo de errores parciales, límites de tasa en B2).

**Cuándo implementarlo**: cuando la cantidad de tenants crezca a cientos, o
cuando un tenant con muchos archivos haga que el job tarde más de lo aceptable.
La solución es procesar N tenants en paralelo con un límite (`Promise.all` con
chunks, o `p-limit`).
