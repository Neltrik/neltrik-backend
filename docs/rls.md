## RLS: Pendiente para futuro

### Contexto

Se intentó implementar RLS para agregar una capa adicional
de seguridad al tenant scope.

### Lo que se intentó

1. Políticas RLS manuales con set_config
   → Falló por el pool de conexiones
2. @nestarc/tenancy
   → Falló por incompatibilidad con cookies httpOnly

### Decisión

RLS queda pendiente. El middleware de Prisma YA filtra por
tenantId y ownerId, y es suficiente para el MVP.

### Cuándo reconsiderar

- Si hay requisitos de compliance (SOC2, HIPAA, GDPR)
- Si el equipo crece y hay riesgo de olvidos
- Si se contrata un experto en RLS con Prisma

### Alternativas para futuro

- Rol dedicado de PostgreSQL con NOBYPASSRLS
- Motor de autorización externo (OpenFGA, OPA, Casbin)
- tenancyTransaction() de @nestarc/tenancy
