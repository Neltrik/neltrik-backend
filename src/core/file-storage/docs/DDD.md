# File Storage

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **File Storage** es responsable de administrar todo lo relacionado con archivos dentro de **Neltrik:** su recepción, validación, almacenamiento, versionado, procesamiento, servicio y ciclo de vida, así como la definición de los contratos y la elección del proveedor de almacenamiento subyacente.

Su responsabilidad principal es ser el único dueño del dominio de archivos en la plataforma. Ningún otro módulo debe conocer detalles sobre tipos de archivo, validaciones, proveedores de storage, URLs, versionado ni procesamiento. Cualquier módulo que necesite trabajar con archivos debe hacerlo exclusivamente a través de las interfaces públicas de File Storage.

El módulo debe diseñarse de forma extensible para permitir incorporar nuevos tipos de archivo, nuevos propósitos, nuevos proveedores de storage y nuevas capacidades de procesamiento sin modificar las reglas fundamentales del dominio.

El módulo es **multi-tenant:** cada archivo pertenece a un tenant y a un owner, y las 8 capas de autorización del sistema aplican sobre él igual que sobre cualquier otro recurso.
---

## Responsabilidades

El módulo **File Storage** es responsable de:

- Recibir archivos provenientes de cualquier módulo de negocio.
- Validar archivos en múltiples niveles (extensión, MIME declarado, magic bytes).
- Validar el tamaño de los archivos contra los límites definidos.
- Definir y mantener el catálogo oficial de propósitos de archivo (purpose).
- Definir y mantener el catálogo oficial de tipos MIME permitidos.
- Almacenar los binarios en el proveedor de storage configurado.
- Abstraer el proveedor de storage detrás de un contrato (port).
- Registrar la metadata de cada archivo (nombre, tamaño, MIME, owner, tenant, timestamps).
- Gestionar el versionado de archivos (reemplazo, historial).
- Servir los archivos a los módulos consumidores (descarga, preview).
- Generar URLs de acceso a los archivos cuando corresponda.
- Procesar archivos según su propósito (extracción de texto, thumbnails, OCR).
- Gestionar el ciclo de vida de los archivos (activo, archivado, eliminado).
- Gestionar las cuotas de almacenamiento por tenant.
- Detectar y gestionar contenido malicioso (antivirus).
- Mantener la consistencia entre la base de datos y el proveedor de storage.
- Garantizar que cada tenant solo acceda a sus propios archivos.
- Exponer FileStorageApi (OHS) para que otros módulos del Core consuman el dominio.
- Exponer endpoints HTTP para que el front y consumidores externos operen sobre archivos.
- Permitir la incorporación futura de nuevos proveedores de storage sin modificar el dominio.
- Permitir la incorporación futura de nuevas capacidades de procesamiento sin modificar el dominio.
- Permitir la incorporación futura de políticas de retención y compliance.

---

## No es responsabilidad del módulo

El módulo **File Storage** no administra:

- Reglas de negocio de otros módulos.
- El significado de un archivo dentro de un módulo de negocio (ej: qué es un CV para el ATS).
- Usuarios, roles, permisos ni policies de autorización.
- La lógica de las acciones que originan la subida de un archivo.
- La decisión de qué archivos debe tener un módulo de negocio.
- La auditoría de las acciones sobre archivos.
- La notificación a usuarios sobre eventos de archivos.
- Estas responsabilidades pertenecen a sus respectivos módulos del Core.

> **Nota:** **File Storage** puede consultar información proporcionada por otros módulos mediante sus interfaces públicas (api/), pero no debe administrar sus entidades ni duplicar sus reglas de negocio. En particular, no sabe qué es un CV, una nómina o un contrato: solo sabe que son archivos con un purpose determinado.

---

## ¿Qué representa File Storage?

El módulo **File Storage** representa el dominio único y centralizado de archivos de **Neltrik**.

El dominio debe separar el archivo (el recurso en sí, con su metadata y su binario) de las reglas de negocio que cada módulo aplica sobre él. Un archivo existe en File Storage independientemente de qué módulo lo haya subido o para qué se use.

Cada archivo representa un recurso almacenado, con un tenant, un owner, un propósito, un tipo MIME, un tamaño, un estado y un historial de versiones.

El conjunto de propósitos de archivo es abierto y extensible. Para el MVP se cubrirán los propósitos críticos de los módulos de negocio, pero el dominio deberá permitir incorporar nuevos propósitos sin modificar las reglas fundamentales de File Storage.

El ciclo de vida de un archivo es gestionado internamente por File Storage, y los módulos consumidores solo observan el estado resultante a través de las interfaces públicas.

Los archivos se consumen mediante:

- `FileStorageApi` (OHS): Para que otros módulos del Core operen sobre archivos.
- Endpoints HTTP (controllers): Para que el front y consumidores externos operen sobre archivos

---

## Contexto dentro de la plataforma

```text
                       File Storage
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    Ingestion            Management          Delivery
        │                    │                    │
        ▼                    ▼                    ▼
   Validación          Versionado          Descarga
   Almacenamiento      Cuotas              Preview
   Antivirus           Ciclo de vida       URLs
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                       Storage Port
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
            B2            Local          (futuro)
          (prod)         (dev/test)      S3, R2, GCS
```

---

## Dependencias

El módulo **File Storage** podrá depender de otros módulos del Core exclusivamente mediante sus interfaces públicas (api/).

La comunicación deberá respetar la arquitectura modular definida por **Neltrik** y no deberá importar directamente elementos internos de otros módulos.

El módulo **File Storage** expone:

- FileStorageApi (OHS): Para que otros módulos del Core consuman el dominio.
- Endpoints HTTP (controllers): Para que el front y consumidores externos operen sobre archivos.

Los módulos consumidores solo conocen:

- FileStorageApi (para consumo interno entre módulos del Core).
- Endpoints HTTP (para consumo externo).

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- User
- Sistema / Cliente
- Módulos del Core
- Platform Admin

Nota:

El **User** es el actor cuyas acciones sobre archivos quedan registradas en el sistema. Puede subir, consultar, reemplazar o solicitar la eliminación de archivos a través de las interfaces públicas de **File Storage**.

El Sistema / Cliente inicia operaciones sobre archivos a través de los endpoints HTTP expuestos por File Storage (front, consumidores externos).

Los Módulos del Core inician operaciones sobre archivos a través de FileStorageApi (OHS), sin conocer los detalles de almacenamiento, validación ni proveedor.

**File Storage** no inicia acciones por sí mismo. Recibe solicitudes de los actores, las procesa según las reglas del dominio, y devuelve el resultado. Las acciones que File Storage ejecuta de forma autónoma (escaneo, procesamiento, reconciliación) son reacciones a solicitudes previas, no acciones originadas por el módulo.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- File _(se valida en el Paso 3)_
- File Version _(se valida en el Paso 3)_
- File Quota _(se valida en el Paso 3)_
- Storage Provider _(se valida en el Paso 3)_
- Antivirus Scan _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- File
- File Version
- File Metadata
- File Purpose
- File Status
- File MIME Type
- File Size
- File Name
- File Extension
- Storage Provider
- Storage Key
- Storage Location
- Upload
- Download
- Replace
- Archive
- Delete
- Quota
- Antivirus Scan
- Processing (extracción de texto, thumbnails, OCR)
- Retention _(futuro)_
- Compliance _(futuro)_
- Reconciliación DB ↔ Storage _(futuro)_
- Derivados / Thumbnails _(futuro)_
- Preview _(futuro)_
- Firma de URLs _(futuro)_
- Cifrado en reposo _(futuro)_
- Ciclo de vida avanzado _(futuro)_

---

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto   | Estado        |
| ---------- | ------------- |
| File       | ✅ Confirmada |
| File Quota | ✅ Confirmada |

> **Nota:** **FileQuota** es raíz de su propio agregado porque: Tiene identidad propia, Tiene su propio ciclo de vida, no depende de File (depende de Tenant), tiene su propio repositorio.

> **Nota:** **File Version** y **Antivirus Scan** no se modelan como entidades. Se modelan como value objects dentro del agregado File, ya que no poseen identidad propia ni ciclo de vida independiente.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
        Tenant
            │
            ├── File
            │       │
            │       └── FileVersion
            │               │
            │               └── AntivirusScan
            │
            └── FileQuota
```

> **Nota:** Todo **File** pertenece obligatoriamente a un único **Tenant**, el cual proporciona el contexto organizacional utilizado para garantizar el aislamiento de la información entre organizaciones.

> **Nota:** Todo **File** posee un owner (el actor que lo subió o al que pertenece), que es un **User** del mismo **Tenant**.

> **Nota:** Todo **File** contiene una o más `FileVersion`, que representan el historial de reemplazos del archivo. Las versiones no existen de forma independiente.

> **Nota:** Cada **Tenant** posee exactamente una **FileQuota**, que representa su límite y uso de almacenamiento.

---

## Parte B — Reglas de negocio

### File

- Todo File posee un identificador único.
- Todo File pertenece obligatoriamente a un único Tenant.
- Todo File posee un owner perteneciente al mismo Tenant.
- Todo File debe tener un nombre.
- Todo File debe tener una extensión.
- Todo File debe tener un tipo MIME válido.
- Todo File debe tener un tamaño mayor a cero.
- Todo File debe tener un purpose válido.
- Todo File debe tener un estado válido.
- Todo File debe tener al menos una FileVersion.
- Todo File recién creado inicia con el estado PENDING.
- Un File puede reemplazarse, lo que genera una nueva FileVersion y archiva la anterior.
- Un File puede archivarse sin ser eliminado.
- Un File puede solicitarse su eliminación, pero no se elimina físicamente mientras existan versiones asociadas.
- Los File de un Tenant nunca son accesibles desde otro Tenant.

---

### FileVersion

- Toda FileVersion pertenece obligatoriamente a un único File.
- Toda FileVersion posee un número de versión incremental.
- Toda FileVersion posee una storageKey única en el proveedor de storage.
- Toda FileVersion posee un tamaño mayor a cero.
- Toda FileVersion conserva la información de la versión anterior.
- Las FileVersion no se eliminan mientras el File exista.
- La versión inicial de un File es la número 1.

---

### AntivirusScan

- Todo AntivirusScan posee un estado válido.
- Todo AntivirusScan posee una fecha de escaneo.
- Todo AntivirusScan registra el motor de escaneo utilizado.
- Un AntivirusScan puede resultar CLEAN, INFECTED o ERROR.
- Un File cuya FileVersion actual no esté CLEAN no puede servirse.
- Los AntivirusScan no se modifican una vez finalizados.
- Todo AntivirusScan pertenece obligatoriamente a una FileVersion.

---

### FileQuota

- Toda FileQuota pertenece obligatoriamente a un único Tenant.
- Toda FileQuota posee un límite de almacenamiento definido.
- Toda FileQuota posee un uso de almacenamiento actual.
- Toda FileQuota puede generar advertencias al acercarse a su límite.
- Toda FileQuota puede bloquear nuevas subidas al alcanzar su límite.
- El uso de una FileQuota se incrementa al confirmar una subida.
- El uso de una FileQuota se decrementa al eliminar definitivamente un archivo.
- Los Tenant no comparten cuotas entre sí.

### Creación del File

- Todo File debe pertenecer obligatoriamente a un Tenant.
- Todo File debe tener un purpose válido.
- Todo File debe tener un tamaño dentro del límite permitido para su purpose.
- Todo File debe pasar las validaciones de tipo (extensión, MIME declarado, magic bytes) antes de ser almacenado.
- Todo File debe ser escaneado por antivirus antes de estar disponible.
- La creación de un File solo se considera completada cuando existe al menos una FileVersion almacenada y su AntivirusScan asociado es CLEAN.

---

### Administración del File

- Un PlatformAdmin puede administrar cualquier File de la plataforma.
- Un OwnerTenantAdmin puede administrar los archivos pertenecientes a su organización.
- Un TenantAdmin puede administrar los archivos pertenecientes a su organización según las reglas definidas por el dominio Authorization.
- Un User puede administrar los archivos de los que es owner.
- Un User puede consultar los archivos permitidos según las reglas de su rol.

---

### Aislamiento

- Todo File pertenece exactamente a un único Tenant.
- Un File nunca puede pertenecer simultáneamente a múltiples Tenant.
- El Tenant proporciona el contexto organizacional utilizado por File Storage para garantizar el aislamiento de los archivos entre organizaciones.
- Todo File posee un owner perteneciente al mismo Tenant.
- Ningún File puede ser accedido por un User de otro Tenant, excepto PlatformAdmin.

---

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                 | Inglés (Código)       | Tipo         | Descripción                                                                                   |
| ----------------------- | --------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| Archivo                 | `File`                | Entidad      | Recurso almacenado que pertenece a un Tenant y posee metadata, binario y ciclo de vida.       |
| Versión de Archivo      | `FileVersion`         | Value Object | Representa una versión concreta del binario de un File.                                       |
| Cuota de Archivos       | `FileQuota`           | Entidad      | Límite y uso de almacenamiento asociado a un Tenant.                                          |
| Escaneo de Antivirus    | `AntivirusScan`       | Value Object | Resultado del análisis de seguridad de una FileVersion.                                       |
| Propósito del Archivo   | `FilePurpose`         | Value Object | Define el uso previsto de un File (CV, AVATAR, DOCUMENT, etc.).                               |
| Estado del Archivo      | `FileStatus`          | Enum         | Estados posibles durante el ciclo de vida de un File.                                         |
| Estado del Escaneo      | `AntivirusScanStatus` | Enum         | Estados posibles de un AntivirusScan.                                                         |
| Nombre del Archivo      | `FileName`            | Value Object | Nombre original del archivo subido.                                                           |
| Extensión del Archivo   | `FileExtension`       | Value Object | Extensión derivada del nombre del archivo.                                                    |
| Tipo MIME               | `MimeType`            | Value Object | Tipo de contenido del archivo, validado contra una allowlist.                                 |
| Tamaño del Archivo      | `FileSize`            | Value Object | Tamaño del archivo en bytes, mayor a cero.                                                    |
| Clave de Almacenamiento | `StorageKey`          | Value Object | Identificador único del binario dentro del proveedor de storage.                              |
| Proveedor de Storage    | `StorageProvider`     | Concepto     | Servicio subyacente donde se almacenan los binarios (B2, local, etc.).                        |
| Recurso Vinculado       | `LinkedResource`      | Concepto     | Referencia polimórfica (`resourceType + resourceId`) que asocia un File a un recurso externo. |
| Propietario del Archivo | `FileOwner`           | Concepto     | User que subió o posee el File.                                                               |
| Subida                  | `Upload`              | Acción       | Operación mediante la cual un actor incorpora un File al sistema.                             |
| Descarga                | `Download`            | Acción       | Operación mediante la cual un actor obtiene el binario de un File.                            |
| Reemplazo               | `Replace`             | Acción       | Operación que genera una nueva FileVersion y archiva la anterior.                             |
| Archivado               | `Archive`             | Acción       | Operación que marca un File como inactivo sin eliminarlo.                                     |
| Eliminación             | `Delete`              | Acción       | Operación que marca un File como eliminado lógicamente.                                       |
| Procesamiento           | `Processing`          | Concepto     | Extracción de información derivada de un File (texto, thumbnails, OCR).                       |
| Retención               | `Retention`           | Concepto     | Reglas de conservación y eliminación definitiva de archivos (futuro).                         |
| Cumplimiento            | `Compliance`          | Concepto     | Reglas regulatorias aplicadas a archivos (futuro).                                            |
| Reconciliación          | `Reconciliation`      | Concepto     | Proceso de sincronización entre la base de datos y el proveedor de storage (futuro).          |

---

## Términos prohibidos

| ❌ No usar                 | ✅ Usar |
| -------------------------- | ------- |
| Attachment                 | File    |
| Document                   | File    |
| Asset                      | File    |
| Media                      | File    |
| Blob                       | File    |
| Object                     | File    |
| Upload _(como sustantivo)_ | File    |
| AttachmentId               | FileId  |
| DocumentId                 | FileId  |
| AssetId                    | FileId  |

> **Nota:** El dominio **File Storage** administra archivos de cualquier tipo. Conceptos como Attachment, Document, Asset, Media u Object no deben utilizarse como sinónimos de File dentro de este dominio. Cada archivo, independientemente de su propósito, es un File.

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en inglés.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.
- Conceptos como Tenant o TenantStatus pertenecen al dominio Tenant.
- Conceptos como User, UserStatus o UserIdentity pertenecen al dominio Identity.
- Conceptos como Role, Permission, Policy o Authorization pertenecen al dominio Authorization.
- Conceptos como Session, Password, AccessToken o Authentication pertenecen al dominio Authentication.
- El dominio File Storage no conoce el significado de negocio de un archivo: solo conoce su FilePurpose, su metadata y su binario.

# Resultado

Con este documento se da por finalizado el modelado inicial del dominio **File Storage** para el MVP de Neltrik.

A partir de este punto, el desarrollo continuará utilizando **Spec-Driven Development (SDD)**, tomando este documento como la fuente de verdad del dominio.

## Ubicación dentro del repositorio

```text
        core/
        └── file-storage/
            └── docs/
                └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo **File Storage**.

## Dependencias del dominio

El dominio **File Storage** no depende de ningún otro dominio del Core para operar. Es un dominio transversal que administra archivos de forma autónoma.

Los demás dominios pueden utilizar **File Storage** para asociar archivos a sus recursos mediante referencias polimórficas (resourceType + resourceId), sin que **File Storage** conozca sus entidades.

El dominio **File Storage** referencia externamente a Tenant y Identity únicamente mediante identificadores (tenantId, ownerId), sin acoplamiento estructural.

El dominio **File Storage** únicamente puede depender de componentes ubicados en shared.
