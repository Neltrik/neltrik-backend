# File Entity

## 1. Entidad

La entidad `File` representa un recurso almacenado dentro de Neltrik, que pertenece a un único `Tenant` y posee metadata, binario y ciclo de vida.

Cada `File` constituye la unidad central del dominio `File Storage`, y es la única puerta a través de la cual los módulos de negocio pueden asociar archivos a sus recursos.

Un `File` no conoce el significado de negocio de su contenido: solo conoce su `purpose`, su metadata y su binario.

## File

| Campo          | Descripción                                                           |
| -------------- | --------------------------------------------------------------------- |
| `id`           | Identificador único del archivo.                                      |
| `tenantId`     | Identificador del `Tenant` al que pertenece el archivo.               |
| `ownerId`      | Identificador del `User` que subió o posee el archivo.                |
| `name`         | Nombre original del archivo.                                          |
| `extension`    | Extensión derivada del nombre del archivo.                            |
| `mimeType`     | Tipo MIME del archivo, validado contra una allowlist.                 |
| `size`         | Tamaño del archivo en bytes.                                          |
| `purpose`      | Propósito del archivo (`CV`, `AVATAR`, `DOCUMENT`, etc.).             |
| `status`       | Estado actual del archivo.                                            |
| `resourceType` | Tipo del recurso externo al que está asociado el archivo.             |
| `resourceId`   | Identificador del recurso externo al que está asociado el archivo.    |
| `versions`     | Historial de versiones del archivo.                                   |
| `createdAt`    | Fecha de creación del archivo.                                        |
| `updatedAt`    | Fecha de la última actualización del archivo.                         |
| `deletedAt`    | Fecha en la que el archivo fue eliminado lógicamente, cuando aplique. |

## Consideraciones

- El archivo pertenece obligatoriamente a un único `Tenant`.

- El archivo posee un `owner` que pertenece al mismo `Tenant`.

- El archivo se asocia a un recurso externo mediante una referencia polimórfica (`resourceType` + `resourceId`), sin FK.

- El archivo contiene una o más `FileVersion`, que representan su historial de versiones. Cada reemplazo agrega una nueva `FileVersion` al mismo `File`.

- Cada `FileVersion` contiene uno o más `AntivirusScan`, que representan su historial de escaneos.

- La eliminación de archivos es lógica por defecto. La eliminación física del binario puede ejecutarse posteriormente por políticas de costo o retención.

- El archivo no conoce el significado de negocio de su contenido.

- El archivo es la raíz del agregado principal del dominio.

## 2. Relaciones

La entidad **File** mantiene las siguientes relaciones:

```text
Tenant

1 ─────── N Files


User (owner)

1 ─────── N Files

Resource (polimórfico)

1 ─────── N Files

Tenant

1 ─────── 1 FileQuota
```

### Descripción

## Descripción

- Un `Tenant` puede tener múltiples `Files`.

- Todo `File` pertenece a un único `Tenant`.

- Un `User` puede ser `owner` de múltiples `Files`.

- Todo `File` posee un único `owner` (`ownerId`).

- Un `File` está asociado a un único `Resource` externo, mediante una referencia polimórfica.

- Un `Resource` puede tener múltiples `Files` asociados.

- El `Tenant` proporciona el contexto organizacional utilizado para garantizar el aislamiento de los archivos.

- Cada `Tenant` posee exactamente una `FileQuota`, que representa su límite y uso de almacenamiento.

> **Nota:** La relación con **Resource** es polimórfica. No existe una entidad **Resource** real ni una FK. **File** almacena `resourceType` (ej: `USER`, `CANDIDATE`, `TENANT`) y `resourceId` (el identificador del recurso), y la integridad se garantiza a nivel aplicación. Cada módulo de negocio es responsable de asociar sus propios recursos a los archivos que consume.

> **Nota:** La entidad **FileQuota** no se relaciona directamente con **File**. Ambas entidades dependen del **Tenant**, pero no se referencian entre sí. La relación entre un **File** y su **FileQuota** es indirecta, a través del **Tenant** al que ambos pertenecen. Cuando un **File** se crea o se elimina, el sistema consulta y actualiza la **FileQuota** del **Tenant** correspondiente.

> **Nota:** La administración del **Tenant** pertenece al dominio **Tenant**. La administración del **User** pertenece al dominio **Identity**. La entidad **File** únicamente mantiene referencias (`tenantId`, `ownerId`) a dichos dominios, sin acoplamiento estructural.

> **Nota:** Las entidades **FileVersion** y **AntivirusScan** son value objects dentro del agregado **File**. No se representan en este diagrama porque no son relaciones hacia afuera del agregado. Su modelado se detalla en la sección **3. Tipos**.

# 3. Tipos

## 3.1 Value Objects

### FileVersion

Representa una versión concreta del binario de un `File`. Cada reemplazo genera una nueva `FileVersion`.

| Campo        | Descripción                                          |
| ------------ | ---------------------------------------------------- |
| `version`    | Número de versión incremental.                       |
| `name`       | Nombre original del archivo en esta versión.         |
| `extension`  | Extensión derivada del nombre.                       |
| `mimeType`   | Tipo MIME del archivo en esta versión.               |
| `storageKey` | Clave única del binario en el proveedor de storage.  |
| `size`       | Tamaño del binario en bytes.                         |
| `checksum`   | Hash SHA-256 del binario, para verificar integridad. |
| `scans`      | Historial de escaneos de antivirus.                  |
| `createdAt`  | Fecha de creación de la versión.                     |

#### Consideraciones

- La versión inicial de un `File` es la número `1`.

- Toda `FileVersion` posee su propio `name`, `extension` y `mimeType`.

- Toda `FileVersion` posee una `storageKey` única en el proveedor de storage.

- Toda `FileVersion` posee un `checksum` que permite verificar integridad y detectar duplicados.

- Toda `FileVersion` posee un tamaño mayor a cero.

- Las `FileVersion` no se eliminan mientras el `File` exista.

- Las `FileVersion` son inmutables una vez creadas.

- El `File` actualiza sus campos `name`, `extension` y `mimeType` al de la versión actual.

### AntivirusScan

Representa el resultado del análisis de seguridad de una `FileVersion`.

| Campo       | Descripción                            |
| ----------- | -------------------------------------- |
| `status`    | Estado del escaneo.                    |
| `engine`    | Motor de escaneo utilizado.            |
| `result`    | Detalle del resultado, cuando aplique. |
| `scannedAt` | Fecha en la que se realizó el escaneo. |

#### Consideraciones

- Todo `AntivirusScan` posee un estado válido.

- Todo `AntivirusScan` registra el motor de escaneo utilizado.

- Un `AntivirusScan` puede resultar `CLEAN`, `INFECTED` o `ERROR`.

- Los `AntivirusScan` no se modifican una vez finalizados.

- Un `File` cuya `FileVersion` actual no esté `CLEAN` no puede servirse.

## 3.2 Enums

### FileStatus

Representa el estado actual del archivo.

| Estado     | Descripción                                                    |
| ---------- | -------------------------------------------------------------- |
| `PENDING`  | El archivo fue creado y está esperando confirmación o escaneo. |
| `READY`    | El archivo está disponible para ser servido.                   |
| `INFECTED` | El archivo fue marcado como malicioso y no puede servirse.     |
| `DELETED`  | El archivo fue eliminado lógicamente.                          |

### AntivirusScanStatus

Representa el estado de un escaneo de antivirus.

| Estado     | Descripción                      |
| ---------- | -------------------------------- |
| `CLEAN`    | El archivo no presenta amenazas. |
| `INFECTED` | El archivo presenta amenazas.    |
| `ERROR`    | El escaneo no pudo completarse.  |

### FilePurpose

Representa el propósito del archivo.

| Propósito  | Descripción                  |
| ---------- | ---------------------------- |
| `CV`       | Currículum vitae.            |
| `AVATAR`   | Imagen de perfil de usuario. |
| `DOCUMENT` | Documento genérico.          |

> **Nota:** **FilePurpose** se define como enum en **TypeScript**, no como enum en base de datos. Esto permite agregar, quitar o modificar propósitos sin requerir migraciones de esquema. El campo `purpose` se persiste como `VARCHAR` en la base de datos. La gestión del catálogo de propósitos es responsabilidad exclusiva de **File Storage**.

> **Nota:** **FilePurpose** no debe confundirse con `resourceType`. **FilePurpose** define qué tipo de archivo es (`CV`, `AVATAR`, `DOCUMENT`) y es gestionado exclusivamente por **File Storage**. `resourceType` define a qué recurso externo está asociado el archivo (`USER`, `CANDIDATE`, `TENANT`) y es definido por cada módulo de negocio.

# 4. Reglas de negocio

## 4.1 Creación

- El archivo debe pertenecer obligatoriamente a un `Tenant`.

- El archivo debe tener un `owner` perteneciente al mismo `Tenant`.

- El archivo debe tener un `name` no vacío.

- El archivo debe tener una `extension` válida.

- El archivo debe tener un `mimeType` válido, dentro de la allowlist permitida.

- El archivo debe tener un `size` mayor a cero y dentro del límite permitido para su `purpose`.

- El archivo debe tener un `purpose` válido, dentro del catálogo de **File Storage**.

- El archivo debe estar asociado a un recurso externo (`resourceType` + `resourceId`).

- Todo archivo inicia con el estado `PENDING`.

- Todo archivo debe tener al menos una `FileVersion` almacenada.

- La creación de un archivo solo se considera completada cuando su `FileVersion` inicial existe y su `AntivirusScan` asociado es `CLEAN`.

- La creación de un archivo consume de la `FileQuota` del `Tenant`.

- La creación de un archivo solo puede ser realizada por un actor autorizado.

## 4.2 Reemplazo

- Solo un archivo con estado `READY` o `INFECTED` puede reemplazarse.
- El reemplazo agrega una nueva `FileVersion` al mismo `File`.
- La nueva `FileVersion` incrementa el número de versión respecto a la anterior.
- El `File` vuelve a `PENDING` hasta que la nueva FileVersion sea escaneada. Una vez escaneada, transiciona a `READY` o `INFECTED` según el resultado del escaneo.
- El `File` mantiene su `tenantId`, `ownerId`, `purpose`, `resourceType` y `resourceId`.
- El `File` actualiza su `name`, `extension` y `mimeType` al de la nueva versión.
- El `File` actualiza su `size` al tamaño de la nueva versión.
- El `File` actualiza su `checksum` al de la nueva versión.
- La nueva `FileVersion` pasa por el mismo flujo de validación y escaneo que una versión inicial.
- El reemplazo consume de la `FileQuota` del `Tenant` por el `size` de la nueva versión.
- El reemplazo solo puede ser realizado por un actor autorizado.

## 4.3 Eliminación

- Solo un archivo con estado `READY` o `INFECTED` puede eliminarse.

- Al eliminar un archivo, su estado cambia a `DELETED`.

- Al eliminar un archivo, el sistema registra la fecha en `deletedAt`.

- Un archivo eliminado no puede servirse.

- Un archivo eliminado conserva sus `FileVersion` y sus `AntivirusScan` (eliminación lógica).

- Un archivo eliminado libera su consumo de la `FileQuota` del `Tenant`.

- La eliminación física del binario puede ejecutarse posteriormente por políticas de costo o retención.

- La eliminación solo puede ser realizada por un actor autorizado.

## 4.4 Descarga

- Solo un archivo con estado `READY` puede descargarse.

- El archivo debe pertenecer al `Tenant` del actor que solicita la descarga.

- El actor debe tener autorización sobre el recurso asociado al archivo.

- La descarga genera una URL de acceso con tiempo de expiración corto.

- La descarga no modifica el estado del archivo.

- La descarga no modifica la `FileQuota` del `Tenant`.

## 4.5 Campos actualizables

Los siguientes campos pueden modificarse según el caso de uso y el nivel de autorización correspondiente:

- `name`
- `resourceType`
- `resourceId`

> **Nota:** La actualización de metadata no forma parte del MVP. Se documenta para dejar constancia de qué campos serían modificables en el futuro.

### Campos no actualizables

Los siguientes campos no pueden modificarse mediante ningún caso de uso del dominio:

- `id`

- `tenantId`

- `ownerId`

- `extension`

- `mimeType`

- `versions`

- `createdAt`

## 4.6 Restricciones generales

- Solo actores autorizados pueden ejecutar operaciones sobre archivos.

- Todo archivo debe estar asociado a un recurso externo (`resourceType` + `resourceId`).

- Ningún archivo puede ser accedido por un actor de otro `Tenant`, excepto `PlatformAdmin`.

- La eliminación de archivos es lógica por defecto. La eliminación física del binario puede ejecutarse posteriormente por políticas de costo o retención, usando `deletedAt` como referencia.

- Toda operación sobre un archivo debe respetar las 8 capas de autorización del sistema.

- Toda operación sobre un archivo debe respetar el aislamiento multi-tenant.

- Toda operación sobre un archivo que consuma o libere almacenamiento debe actualizar la `FileQuota` del `Tenant`.

# 5. Modelo físico (Base de datos)

## 5.1 Tabla

Nombre sugerido:

```text
files
```

---

## 5.2 Columnas

| Columna         | Tipo           | Null | Default             | Observación                |
| --------------- | -------------- | ---- | ------------------- | -------------------------- |
| `id`            | `UUID`         | ❌   | `gen_random_uuid()` | PK                         |
| `tenant_id`     | `UUID`         | ❌   | —                   | Referencia a `Tenant`      |
| `owner_id`      | `UUID`         | ❌   | —                   | Referencia a `User`        |
| `name`          | `VARCHAR(255)` | ❌   | —                   |                            |
| `extension`     | `VARCHAR(20)`  | ❌   | —                   |                            |
| `mime_type`     | `VARCHAR(100)` | ❌   | —                   |                            |
| `size`          | `BIGINT`       | ❌   | —                   |                            |
| `purpose`       | `VARCHAR(50)`  | ❌   | —                   | Enum en TS                 |
| `status`        | `ENUM`         | ❌   | `PENDING`           | Enum en DB                 |
| `resource_type` | `VARCHAR(50)`  | ❌   | —                   | Referencia polimórfica     |
| `resource_id`   | `UUID`         | ❌   | —                   | Referencia polimórfica     |
| `versions`      | `JSONB`        | ❌   | `NOT NULL`          | Historial de `FileVersion` |
| `created_at`    | `TIMESTAMP`    | ❌   | `NOW()`             |                            |
| `updated_at`    | `TIMESTAMP`    | ❌   | `NOW()`             |                            |
| `deleted_at`    | `TIMESTAMP`    | ✅   | `NULL`              |

> **Nota:** El valor `PENDING` se define en la entidad **File** al momento de su creación. El `default` en la base de datos actúa únicamente como red de seguridad.

### 5.3 Restricciones

- `id` es la clave primaria.

- `tenant_id` referencia el `Tenant` al que pertenece el archivo.

- `owner_id` referencia el `User` que subió o posee el archivo.

- `status` inicia con el valor `PENDING`.

- `versions` debe contener al menos una `FileVersion`.

- `deleted_at` solo debe contener un valor cuando el archivo se encuentre en estado `DELETED`.

- `resource_type` + `resource_id` forman una referencia polimórfica sin FK.

- `purpose` se persiste como `VARCHAR`, validado a nivel aplicación contra el catálogo de **File Storage**.

### 5.4 Índices

- `PK(id)`

- `INDEX(tenant_id)`

- `INDEX(owner_id)`

- `INDEX(resource_type, resource_id)`

- `INDEX(tenant_id, status)`

- `INDEX(tenant_id, purpose)`

- `UNIQUE(tenant_id, resource_type, resource_id, purpose) WHERE status IN ('PENDING', 'READY', 'INFECTED')` — evita múltiples archivos activos del mismo propósito para el mismo recurso.
