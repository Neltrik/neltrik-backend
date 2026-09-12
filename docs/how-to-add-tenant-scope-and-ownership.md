# Cómo agregar Tenant Scope y Ownership

## Tenant Scope (tenantId)

### 1. Agregar tenantId al modelo

```prisma
model MiModelo {
    id       String @id @default(uuid()) @db.Uuid
    tenantId String @map("tenant_id") @db.Uuid
    tenant   Tenant @relation(fields: [tenantId], references: [id])
}
```

### 2. Migrar

```bash
pnpm prisma migrate dev --name add_tenant_id_to_mi_modelo
```

### 3. Agregar a TENANT_MODELS

En `src/prisma/prisma.service.ts`:

```typescript
const TENANT_MODELS = ["User", "Role", "Permission", "TenantRoleConfiguration", "Invitation", "MiModelo"] as const;
```

Listo. El middleware filtra por `tenantId` automáticamente.

---

## Ownership (ownerId)

### 1. Agregar ownerId al modelo

```prisma
model MiModelo {
    id      String  @id @default(uuid()) @db.Uuid
    ownerId String? @map("owner_id") @db.Uuid
    owner   User?   @relation(fields: [ownerId], references: [id])
}
```

### 2. Migrar

```bash
pnpm prisma migrate dev --name add_owner_id_to_mi_modelo
```

### 3. Agregar a OWNERSHIP_MODELS

En `src/prisma/prisma.service.ts`:

```typescript
const OWNERSHIP_MODELS = ["AuthenticationSession", "MiModelo"] as const;
```

### 4. Asignar ownerId al crear

```typescript
const recurso = MiModelo.create({
    id: this.idGenerator.generate(),
    ownerId: userId,
});
```

Listo. El middleware filtra por `ownerId` automáticamente.

---

## Reglas

- `tenantId`: si el recurso pertenece a un tenant
- `ownerId`: si el usuario solo debe ver SUS recursos
- `create`/`upsert`: el middleware NO filtra (se asigna manualmente)
- `PLATFORM_ADMIN`: bypass automático (ve todo)
- Si tiene ambos: agregar a las dos listas

---

## Referencia

| Modelo                | tenantId | ownerId |
| --------------------- | -------- | ------- |
| User                  | Sí       | No      |
| Role                  | Sí       | No      |
| Permission            | Sí       | No      |
| Invitation            | Sí       | No      |
| AuthenticationSession | No       | Sí      |
| RolePermission        | No       | No      |
| Tenant                | No       | No      |
| AuthenticationAccount | No       | No      |
