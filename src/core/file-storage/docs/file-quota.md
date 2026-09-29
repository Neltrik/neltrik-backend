# FileQuota Entity

## 1. Entidad

La entidad `FileQuota` representa el límite y uso de almacenamiento asociado a un único `Tenant`.

Cada `FileQuota` constituye el mecanismo de control de almacenamiento del dominio **File Storage**, y es la única fuente de verdad sobre cuánto espacio puede consumir un `Tenant`.

Una `FileQuota` no conoce los archivos individuales del `Tenant`: solo conoce el total consumido y el límite disponible.

## FileQuota

| Campo        | Descripción                                           |
| ------------ | ----------------------------------------------------- |
| `id`         | Identificador único de la cuota.                      |
| `tenantId`   | Identificador del `Tenant` al que pertenece la cuota. |
| `limitBytes` | Límite total de almacenamiento permitido, en bytes.   |
| `usedBytes`  | Almacenamiento actualmente consumido, en bytes.       |
| `createdAt`  | Fecha de creación de la cuota.                        |
| `updatedAt`  | Fecha de la última actualización de la cuota.         |

## Consideraciones

- La cuota pertenece obligatoriamente a un único `Tenant`.

- La cuota se crea al primer upload de un archivo del `Tenant`.

- La cuota se crea con un `limitBytes` configurable por defecto. En el MVP, el valor por defecto es `1 GB`.

- La cuota mantiene un contador de uso que se incrementa y decrementa según las operaciones sobre archivos.

- La cuota no conoce los archivos individuales: solo conoce el total.

- La cuota no se elimina mientras el `Tenant` exista.

- La cuota es la única fuente de verdad sobre el almacenamiento consumido por un `Tenant`.

- La cuota es raíz de su propio agregado.

- El bloqueo por límite se evalúa en cada operación de upload: si `usedBytes + newFileSize > limitBytes`, la operación se rechaza.

- El aviso por proximidad al límite se calcula on-the-fly (ej: `80%` del límite) y no se persiste.

> **Nota:** El valor por defecto de `limitBytes` es una decisión de configuración, no una regla de dominio. En el MVP se establece en `1 GB` por razones de costo del proveedor de storage (**Backblaze B2 free tier**).

## 2. Relaciones

La entidad **File** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── 1 FileQuota
```

## Descripción

Un `Tenant` posee exactamente una `FileQuota`.

Toda `FileQuota` pertenece a un único `Tenant`.

El `Tenant` proporciona el contexto organizacional utilizado para garantizar el aislamiento de las cuotas.

La `FileQuota` no se relaciona directamente con `File`. Ambas entidades dependen del `Tenant`, pero no se referencian entre sí.

La relación entre un `File` y su `FileQuota` es indirecta, a través del `Tenant` al que ambos pertenecen.

> **Nota:** La administración del **Tenant** pertenece al dominio **Tenant**. La entidad **FileQuota** únicamente mantiene una referencia (`tenantId`) a dicho dominio, sin acoplamiento estructural.

> **Nota:** La **FileQuota** es raíz de su propio agregado. No contiene value objects ni entidades internas.

> **Nota:** La **FileQuota** es creada on-demand: se crea la primera vez que un **File** del **Tenant** se sube. No se crea al crear el **Tenant**.

> **Nota:** El campo `usedBytes` se actualiza de la siguiente manera:
>
> - Incrementa cuando un **File** del **Tenant** se crea (upload) o se reemplaza.
>
> - Decrementa cuando un **File** del **Tenant** se elimina lógicamente (`status = DELETED`) o físicamente (borrado del binario).
>
> - No se modifica en operaciones de descarga, archivado ni consulta.
>
> - El incremento y decremento se ejecutan en la misma transacción que la operación sobre el **File**, para garantizar consistencia.

## 3. Enums

La entidad **FileQuota** no utiliza tipos enumerados (Enums) para el MVP.

# 4. Reglas de negocio

## 4.1 Creación

- La cuota se crea on-demand, la primera vez que un `File` del `Tenant` se sube.

- La cuota se crea con un `limitBytes` configurable por defecto. En el MVP, el valor por defecto es `1 GB`.

- La cuota se crea con `usedBytes = 0`.

- La cuota solo puede ser creada por el sistema, no por un actor.

## 4.2 Incremento de uso

- El uso (`usedBytes`) se incrementa cuando un `File` del `Tenant` se crea (upload) o se reemplaza.

- El incremento corresponde al `size` de la `FileVersion` que se está subiendo.

- El incremento se ejecuta en la misma transacción que la creación del `File`.

- El incremento solo puede ser ejecutado por el sistema, no por un actor.

## 4.3 Decremento de uso

- El uso (`usedBytes`) se decrementa cuando un `File` del `Tenant` pasa a estado `DELETED` (eliminación lógica).

- El decremento corresponde al `size` de la `FileVersion` que estaba activa.

- El decremento se ejecuta en la misma transacción que la eliminación del `File`.

- El decremento no se ejecuta cuando un `File` pasa a `ARCHIVED`, porque el binario sigue almacenado.

- El decremento no se ejecuta cuando se realiza la eliminación física del binario, porque la cuota ya fue liberada en la eliminación lógica.

- El decremento solo puede ser ejecutado por el sistema, no por un actor.

## 4.4 Verificación de límite

- Antes de aceptar un nuevo `File`, el sistema verifica que `usedBytes + newFileSize <= limitBytes`.

- Si la verificación falla, la operación de upload se rechaza con el error `FILE_QUOTA_EXCEEDED`.

- La verificación se ejecuta antes de almacenar el binario, para evitar consumir recursos innecesarios.

- La verificación solo puede ser ejecutada por el sistema, no por un actor.

## 4.5 Aviso por proximidad al límite

- El aviso por proximidad al límite se calcula on-the-fly, sin persistirse.

- El umbral sugerido para el aviso es `80%` del `limitBytes`.

- El aviso puede exponerse a través de la API para que el front lo muestre al usuario.

- El aviso no bloquea ninguna operación.

## 4.6 Ajuste de límite

- El `limitBytes` puede ajustarse por un actor autorizado (`PlatformAdmin`).

- El ajuste puede reducir el `limitBytes` por debajo del `usedBytes` actual. En ese caso, el `Tenant` no puede subir nuevos archivos, porque la verificación usedBytes + newFileSize <= limitBytes falla para cualquier tamaño.

- El ajuste no puede reducir el `limitBytes` por debajo del mínimo configurado (1 GB en el MVP).

- El ajuste se registra en la auditoría.

- El ajuste solo puede ser realizado por un actor autorizado.

## 4.7 Restricciones generales

- Una `FileQuota` no se elimina mientras el `Tenant` exista.

- Una `FileQuota` no puede tener `usedBytes` negativo.

- `usedBytes` puede superar temporalmente a `limitBytes` cuando un ajuste administrativo reduce el límite por debajo del uso actual. En ese caso, las nuevas subidas serán rechazadas hasta que el `Tenant` libere espacio.

- El `usedBytes` solo puede ser modificado por el sistema, nunca directamente por un actor.

- Toda operación sobre la cuota debe respetar el aislamiento multi-tenant.

- Toda operación sobre la cuota debe respetar las 8 capas de autorización del sistema.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
file_quotas
```

---

## 5.2 Columnas

| Columna       | Tipo        | Null | Default             | Observación                   |
| ------------- | ----------- | ---- | ------------------- | ----------------------------- |
| `id`          | `UUID`      | ❌   | `gen_random_uuid()` | PK                            |
| `tenant_id`   | `UUID`      | ❌   | —                   | Referencia a `Tenant`, UNIQUE |
| `limit_bytes` | `BIGINT`    | ❌   | —                   |                               |
| `used_bytes`  | `BIGINT`    | ❌   | `0`                 |                               |
| `created_at`  | `TIMESTAMP` | ❌   | `NOW()`             |                               |
| `updated_at`  | `TIMESTAMP` | ❌   | `NOW()`             |                               |

> **Nota:** El valor `used_bytes` se define en la entidad **FileQuota** al momento de su creación (`0`). El `default` en la base de datos actúa únicamente como red de seguridad.

## 5.3 Restricciones

- `id` es la clave primaria.

- `tenant_id` referencia el `Tenant` al que pertenece la cuota.

- `tenant_id` es único: un `Tenant` posee exactamente una `FileQuota`.

- `limit_bytes` debe ser mayor a cero (`CHECK (limit_bytes > 0)`).

- `used_bytes` no puede ser negativo (`CHECK (used_bytes >= 0)`).

- `used_bytes` puede superar temporalmente a `limit_bytes` por ajuste administrativo.

- `limit_bytes` no puede ser menor al mínimo configurado (validado en aplicación).

## 5.4 Índices

- `PK(id)`

- `UNIQUE(tenant_id)`

> **Nota:** El índice `UNIQUE(tenant_id)` es creado automáticamente por la restricción `UNIQUE`. No se requiere un índice adicional para `tenant_id`.
