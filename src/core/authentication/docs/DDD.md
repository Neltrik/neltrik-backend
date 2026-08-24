# Authentication

# Paso 1 — Definir el propósito del dominio

## Objetivo

El módulo **Authentication** es responsable de gestionar la autenticación de los usuarios de **Neltrik**, verificando sus credenciales y administrando el ciclo de vida de sus sesiones autenticadas.

Su responsabilidad principal es determinar cómo un usuario demuestra su identidad ante la plataforma, establecer una sesión autenticada y gestionar de forma segura las credenciales y mecanismos necesarios para mantener dicha sesión.

El módulo debe diseñarse de forma extensible para permitir incorporar diferentes Providers de autenticación sin modificar las reglas fundamentales del dominio.
---

## Responsabilidades

El módulo **Authentication** es responsable de:

- Autenticar usuarios mediante email y contraseña.
- Gestionar el ciclo de vida de las sesiones autenticadas.
- Emitir Access Tokens.
- Emitir y gestionar Refresh Tokens.
- Renovar sesiones autenticadas mediante Refresh Tokens.
- Invalidar sesiones mediante logout.
- Gestionar la verificación del email del usuario.
- Gestionar la recuperación de acceso mediante restablecimiento de contraseña.
- Validar y gestionar las credenciales de autenticación.
- Aplicar políticas de seguridad relacionadas con la autenticación.
- Permitir la incorporación futura de diferentes estrategias de autenticación.
- Gestionar el registro de cuentas de autenticación.
- Asociar una cuenta de autenticación con la identidad creada por Identity.
- Gestionar el Provider utilizado por cada cuenta de autenticación.
- Garantizar que el Provider de una cuenta no pueda modificarse durante su ciclo de vida en el MVP.
- Gestionar los procesos de verificación requeridos por cada Provider.
- Mantener la integridad y seguridad del proceso de autenticación.

---

## No es responsabilidad del módulo

El módulo **Authentication** no administra:

- Usuarios como entidad de negocio.
- Roles.
- Permisos.
- Policies de autorización.
- Tenants.
- Información específica del perfil del usuario.
- Reglas de negocio de otros módulos.
- Autorización de acciones dentro de la plataforma.
- Procesos funcionales de otros módulos.

Estas responsabilidades pertenecen a sus respectivos módulos del Core.

> **Nota:** **Authentication** puede consultar información proporcionada por otros módulos mediante sus interfaces públicas (api/), pero no debe administrar sus entidades ni duplicar sus reglas de negocio.

---

## ¿Qué representa Authentication?

El módulo **Authentication** representa el mecanismo mediante el cual **Neltrik** verifica que una persona puede autenticarse como un usuario existente y mantiene su sesión autenticada.

El dominio debe separar la identidad del usuario del mecanismo utilizado para demostrar dicha identidad.

Cada cuenta de autenticación utiliza un único **Provider**, determinado durante su registro. El Provider representa el mecanismo mediante el cual la cuenta puede autenticarse.

El conjunto de Providers es abierto y extensible. Para el MVP, el único Provider soportado será **Email/Password**, pero el dominio deberá permitir incorporar posteriormente otros Providers sin modificar las reglas fundamentales de Authentication.

Por ejemplo:

- Google.
- GitHub.
- Facebook.
- Otros proveedores externos.

El Provider asociado a una cuenta es inmutable durante su ciclo de vida en el MVP.

JWT representa un mecanismo de emisión y validación de tokens y no constituye la definición del dominio de autenticación.

La sesión autenticada representa el estado mediante el cual un usuario puede continuar realizando solicitudes autenticadas sin proporcionar nuevamente sus credenciales.

El proceso de registro pertenece a Authentication como punto de entrada para la creación de una cuenta de autenticación. Cuando el registro requiere la creación de un User, Authentication utilizará la interfaz pública (`api/`) de **Identity**, delegando en dicho módulo la creación y administración de la identidad.

El contexto de incorporación utilizado durante el registro puede proporcionar información como `tenantId` y `roleId`, pero Authentication no administra el mecanismo mediante el cual dicho contexto fue generado.

Authentication únicamente utiliza estos datos como contexto de registro y los proporciona a IdentityApi durante la creación del User cuando corresponda.

La verificación del email forma parte del proceso de autenticación cuando el Provider utilizado requiere demostrar el control sobre una dirección de correo electrónico.

---

## Contexto dentro de la plataforma

```text
                    Authentication
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Registration      Credentials         Session
        │             │                 Lifecycle
        │             │                     │
        │             ▼                     │
        │          Provider                 │
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
                       Identity
                          │
                          ▼
                    Authorization
```

El flujo conceptual será:

```text
Registration

Registration Context
  │
  ├── invitationToken
  ├── provider
  └── ... (datos del usuario)
          │
          ▼
    Authentication
          │
          ├── valida invitación con Tenant (OHS)
          │   └── obtiene: tenantId, roleId, email
          │
          ├── solicita creación de User
          │        │
          │        ▼
          │    IdentityApi
          │
          ├── crea cuenta de autenticación
          │
          ├── consume invitación (marca USED en Tenant)
          │
          └── ejecuta verificación requerida (si aplica)
```

```text
Login

Credentials
    │
    ▼
Authentication
    │
    ├── identificar Account
    ├── verificar Provider
    ├── validar credenciales
    ├── validar estado de la cuenta
    └── crear Session
            │
            ├── Access Token
            └── Refresh Token
```

> **Nota:** Los tokens serán transportados mediante mecanismos seguros del navegador, utilizando cookies HttpOnly para evitar que el código JavaScript del frontend pueda acceder directamente a ellos.

---

## Dependencias

El módulo **Authentication** podrá depender de otros módulos del Core exclusivamente mediante sus interfaces públicas (api/).

En particular:

Identity será responsable de la identidad del usuario.
**Authentication** será responsable de demostrar que una persona puede autenticarse como ese usuario.
Authorization será responsable de determinar qué puede hacer ese usuario después de autenticarse.

La comunicación deberá respetar la arquitectura modular definida por **Neltrik** y no deberá importar directamente elementos internos de otros módulos.

# Paso 2 — Descubrir los conceptos del negocio

## 👤 Actores (¿Quién realiza acciones?)

- User
- Authentication Provider
- Sistema / Cliente

Nota:

El User inicia los procesos de autenticación, verificación de email,
recuperación de acceso y cierre de sesión.

Los Authentication Providers representan mecanismos internos o externos
mediante los cuales puede verificarse la identidad del usuario.

Email + Password será el primer Provider soportado, pero el modelo deberá
permitir incorporar Providers adicionales posteriormente.

El Sistema / Cliente inicia las operaciones de Authentication mediante las
interfaces públicas del módulo.

---

## 📦 Entidades (¿Qué información administra el dominio?)

- Authentication Account _(se valida en el Paso 3)_
- Session _(se valida en el Paso 3)_
- Email Verification _(se valida en el Paso 3)_
- Password Reset _(se valida en el Paso 3)_

---

## 💡 Conceptos del negocio

- Authentication
- Registration
- Registration Context
- Authentication Provider
- Authentication Strategy
- Authentication Account
- Credential
- Password
- Session
- Access Token
- Refresh Token
- Token Rotation
- Token Expiration
- Email Verification
- Password Reset
- Authentication Attempt
- Logout
- Session Revocation
- Credential Recovery
- Identity Verification
- Authentication Policy
- Authentication Security Rules

---

# Paso 3 — Identificar entidades

Después del análisis del dominio se definieron las siguientes entidades para el MVP.

| Concepto               | Estado        |
| ---------------------- | ------------- |
| Authentication Account | ✅ Confirmada |
| Authentication Session | ✅ Confirmada |
| Email Verification     | ✅ Confirmada |
| Password Reset         | ✅ Confirmada |

## Authentication Account

Representa la cuenta mediante la cual un usuario puede demostrar su identidad ante Authentication.

Cada Authentication Account está asociada a un único User de Identity y utiliza un único Provider.

El Provider representa el mecanismo mediante el cual la cuenta puede autenticarse.

Para el MVP, el único Provider soportado será:

Email + Password

El conjunto de Providers es abierto y podrá ampliarse posteriormente.

> **Nota:** Para el Provider Email + Password, Authentication almacena únicamente una representación segura de la contraseña, como un password hash. La contraseña nunca debe almacenarse en texto plano.

## Authentication Session

Representa una sesión autenticada de un usuario dentro de la plataforma.

Una sesión permite mantener el acceso del usuario durante un período determinado sin requerir nuevamente sus credenciales.

La sesión está asociada a una Authentication Account y, mediante ella, a un User administrado por Identity.

> **Nota:** Access Token y Refresh Token no se consideran entidades independientes en el dominio del MVP. Representan credenciales técnicas utilizadas para implementar una sesión autenticada.

## Email Verification

Representa el proceso temporal mediante el cual Authentication permite demostrar que el usuario tiene acceso a la dirección de email asociada a su cuenta de autenticación.

El proceso contempla conceptualmente:

- Solicitud de verificación.
- Expiración de la solicitud.
- Validación de la solicitud.
- Completar la verificación.

> **Nota:** La necesidad y las reglas específicas de verificación dependen del Provider utilizado por la Authentication Account.

## Password Reset

Representa una solicitud temporal mediante la cual un usuario puede recuperar el acceso a su cuenta cuando no conoce su contraseña actual.

El proceso contempla conceptualmente:

- Solicitud de recuperación.
- Expiración de la solicitud.
- Validación de la solicitud.
- Establecimiento de una nueva contraseña.
- Finalización de la solicitud.

> **Nota:** El proceso debe evitar revelar si una Authentication Account existe para un identificador determinado.

# Paso 4 — Definir relaciones y reglas de negocio

## Parte A — Relaciones

```text
                Identity
                │
                │ userId
                ▼
        ┌─────────────────────┐
        │   Authentication    │
        │                     │
        │ Authentication      │
        │ Account             │
        │ Session             │
        │ Email Verification  │
        │ Password Reset      │
        └─────────────────────┘
```

Relación conceptual:

```text
User
 │
 └──────────────► AuthenticationAccount
                       │
                       ├──────────────► AuthenticationSession
                       │
                       ├──────────────► EmailVerification
                       │
                       └──────────────► PasswordReset
```

> **Nota:** User pertenece a Identity. Authentication únicamente mantiene referencias hacia el usuario mediante su identificador y no administra la entidad User.

> **Nota:** Una `AuthenticationAccount` utiliza un único Provider. El conjunto de Providers es abierto y podrá ampliarse posteriormente.

> **Nota:** Una `AuthenticationSession` representa el estado autenticado del usuario. Los Access Tokens y Refresh Tokens son mecanismos utilizados para materializar dicha sesión y no constituyen entidades independientes del dominio.

## Parte B — Reglas de negocio

### Authentication

- Authentication únicamente puede autenticar usuarios existentes en Identity.
- Authentication no crea ni modifica usuarios.
- Authentication no administra Roles ni Permissions.
- Una autenticación exitosa debe establecer una sesión autenticada.
- Una sesión debe tener un período de validez definido.
- Una sesión puede ser revocada.
- Una sesión revocada no puede utilizarse para renovar el acceso.
- Las credenciales de autenticación nunca deben almacenarse en texto plano.
- Las credenciales deben almacenarse utilizando mecanismos seguros de hashing.
- El conjunto de Providers soportados por Authentication es abierto.
- La incorporación de un nuevo Provider no debe modificar las reglas fundamentales del dominio de Authentication.

### Authentication Account

- Toda credencial pertenece a un único usuario.
- Para el MVP, la estrategia soportada será Email + Password.
- El email utilizado para autenticación debe cumplir las reglas de identidad definidas por Identity.
- La contraseña almacenada debe ser un hash y nunca la contraseña original.
- Una credencial no debe exponer la contraseña original.
- Las credenciales deben poder actualizarse de forma segura.
- Una credencial comprometida o invalidada no puede utilizarse para iniciar una sesión.
- Una Authentication Account utiliza un único Provider.
- El Provider de una Authentication Account es inmutable durante su ciclo de vida en el MVP.
- El Provider determina el mecanismo mediante el cual una Authentication Account puede autenticarse.
- El Provider de una Authentication Account es inmutable durante su ciclo de vida en el MVP.

### Authentication Session

- Toda Authentication Session pertenece a una única Authentication Account.
- Una sesión debe poseer un identificador único.
- Una sesión debe tener un momento de creación.
- Una sesión debe tener un período de expiración.
- Una sesión puede ser revocada antes de su expiración.
- Una sesión expirada no puede utilizarse para renovar el acceso.
- Una sesión revocada no puede utilizarse para renovar el acceso.
- El Refresh Token debe permitir identificar y renovar la sesión correspondiente.
- La renovación de una sesión debe respetar las reglas de seguridad definidas por Authentication.
- El Access Token debe tener una duración limitada.
- El Refresh Token debe tener una duración mayor que el Access Token.

### Email Verification

- Una Email Verification pertenece a una única Authentication Account.
- Una solicitud debe tener un mecanismo de identificación único.
- Una solicitud debe tener una fecha de expiración.
- Una solicitud expirada no puede utilizarse.
- Una solicitud utilizada correctamente no puede reutilizarse.
- La verificación completada debe invalidar las solicitudes pendientes correspondientes.
- La verificación del email no modifica directamente la entidad User de Identity; cualquier actualización relacionada con la identidad debe realizarse mediante el contrato público de Identity.

### Password Reset

- Una Password Reset pertenece a una única Authentication Account.
- Una solicitud debe tener una fecha de expiración.
- Una solicitud expirada no puede utilizarse.
- Una solicitud utilizada correctamente no puede reutilizarse.
- El proceso de recuperación no debe revelar si un email pertenece o no a un usuario cuando esto permita enumerar cuentas.
- Una nueva contraseña debe almacenarse mediante un hash seguro.
- Una solicitud de recuperación debe invalidarse después de establecer correctamente la nueva contraseña.
- El cambio de contraseña debe invalidar las sesiones que deban considerarse comprometidas según las políticas de seguridad definidas por Authentication.

# Paso 5 — Definir el Lenguaje Ubicuo

## Diccionario del dominio

| Español                        | Inglés (Código)          | Tipo           | Descripción                                                                                                                  |
| ------------------------------ | ------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Credencial de Autenticación    | `AuthenticationAccount`  | Entidad        | Representa la cuenta de autenticación asociada a un User y mediante la cual puede autenticarse utilizando un único Provider. |
| Sesión de Autenticación        | `AuthenticationSession`  | Entidad        | Representa una sesión autenticada de un usuario y controla su ciclo de vida, expiración y revocación.                        |
| Verificación de Email          | `EmailVerification`      | Entidad        | Representa el proceso temporal mediante el cual se verifica que un usuario tiene acceso a una dirección de email.            |
| Restablecimiento de Contraseña | `PasswordReset`          | Entidad        | Representa el proceso temporal mediante el cual un usuario puede recuperar el acceso mediante una nueva contraseña.          |
| Estrategia de Autenticación    | `AuthenticationStrategy` | Domain Concept | Representa el comportamiento utilizado para autenticar una AuthenticationAccount mediante su Provider.                       |
| Proveedor de Autenticación     | `AuthenticationProvider` | Domain Concept | Representa el mecanismo mediante el cual una AuthenticationAccount puede autenticarse.                                       |
| Contraseña                     | `Password`               | Value Object   | Representa la credencial secreta utilizada por la estrategia Email + Password.                                               |
| Hash de Contraseña             | `PasswordHash`           | Value Object   | Representa la contraseña almacenada de forma segura mediante un mecanismo de hashing.                                        |
| Token de Acceso                | `AccessToken`            | Domain Concept | Credencial temporal utilizada para representar una sesión autenticada durante un período limitado.                           |
| Token de Renovación            | `RefreshToken`           | Domain Concept | Credencial utilizada para renovar una sesión autenticada sin volver a solicitar las credenciales principales del usuario.    |
| Revocación de Sesión           | `SessionRevocation`      | Domain Concept | Representa la invalidación de una sesión antes de su expiración natural.                                                     |
| Expiración de Sesión           | `SessionExpiration`      | Domain Concept | Representa el momento a partir del cual una sesión deja de ser válida.                                                       |

---

## Términos prohibidos

| ❌ No usar          | ✅ Usar                                 |
| ------------------- | --------------------------------------- |
| Auth User           | `User` / `Authentication`               |
| Auth Token          | `AccessToken`                           |
| Refresh Auth        | `RefreshToken`                          |
| Password Token      | `PasswordReset`                         |
| Reset Token         | `PasswordReset`                         |
| Session Token       | `AuthenticationSession`                 |
| Credential Token    | `AuthenticationAccount`                 |
| Password Encryption | `Password Hashing`                      |
| Plain Password      | `Password`                              |
| JWT User            | `AuthenticationSession` / `AccessToken` |
| Auth Provider       | `AuthenticationProvider`                |

---

## Convenciones del dominio

- Todo el código del dominio se escribirá en **inglés**.
- Cada concepto tendrá un único nombre; no se utilizarán sinónimos.
- `Authentication` representa el proceso y contexto responsable de verificar la identidad.
- `Identity` continúa siendo responsable de la entidad `User`.
- `Authentication` no administra directamente la entidad `User`.
- Las credenciales de autenticación pertenecen al contexto de `Authentication`.
- Las contraseñas nunca se almacenarán en texto plano.
- `RefreshToken` representa una credencial utilizada para renovar una sesión autenticada.
- Los `AccessToken` y `RefreshToken` representan mecanismos de sesión y no deben convertirse automáticamente en entidades independientes.
- `JWT` representa una tecnología utilizada para implementar tokens; no constituye el lenguaje principal del dominio.
- `Email + Password` será el Provider inicial de autenticación.
- El comportamiento correspondiente será implementado mediante una `AuthenticationStrategy`.
- Las estrategias de autenticación deben poder extenderse sin modificar las entidades centrales del dominio.
- Las estrategias futuras, como Google, GitHub o Facebook, deberán integrarse mediante `AuthenticationStrategy`.
- Las sesiones deben poder expirar y revocarse.
- Los procesos temporales de verificación de email y recuperación de contraseña deben tener mecanismos de expiración e invalidación.
- Las reglas de seguridad de `Authentication` deben permanecer independientes de infraestructura.
- Si aparece un nuevo concepto durante el desarrollo, primero deberá incorporarse al Lenguaje Ubicuo antes de implementarse.

# Resultado

Con este documento se establece el modelado inicial del dominio **Authentication** para el MVP.

El dominio queda preparado para soportar inicialmente:

```text
Email + Password
        │
        ▼
Authentication
        │
        ▼
AuthenticationSession
        │
        ├── AccessToken
        └── RefreshToken
```

y posteriormente incorporar nuevas estrategias:

```text
AuthenticationProvider
        │
        └── AuthenticationStrategy
```

El MVP implementará únicamente el Provider `Email + Password` mediante la Strategy correspondiente.

Los futuros Providers podrán incorporar sus propias Strategies sin que el dominio defina de antemano una lista cerrada de Providers.

## Ubicación dentro del repositorio

```text
core/
└── authentication/
    └── docs/
        └── DDD.md
```

Este documento debe mantenerse actualizado conforme evolucione el dominio y constituye la documentación oficial del módulo **Authentication**.

## Dependencias del dominio

El dominio **Authentication** no depende directamente de otros dominios del Core.

Cuando **Authentication** necesite interactuar con otro Bounded Context, dicha comunicación deberá realizarse mediante las interfaces públicas (api/) definidas por el módulo correspondiente.

El dominio **Authentication** únicamente puede depender de componentes ubicados en shared.
