# HTTP Input Sanitization

## 1. Propósito

El componente **HTTP Input Sanitization** garantiza que todas las entradas HTTP sean sanitizadas antes de llegar a las capas de aplicación y dominio.

Su objetivo es proteger la aplicación frente a contenido potencialmente malicioso, normalizar los datos de entrada y asegurar que todos los módulos reciban información consistente sin incorporar lógica de sanitización propia.

---

# 2. Responsabilidades

## Debe

- Sanitizar todas las entradas HTTP de forma global.
- Ejecutarse antes del proceso de validación.
- Aplicar las mismas reglas a todos los módulos de la aplicación.
- Centralizar las reglas de sanitización en un único componente.
- Ser independiente del dominio de negocio.
- Ser reutilizable por cualquier módulo del sistema.

## No debe

- Validar reglas de negocio.
- Transformar tipos de datos.
- Reemplazar el proceso de validación.
- Modificar información que no requiera sanitización.
- Conocer detalles de ningún módulo (ATS, Users, Auth, etc.).

---

# 3. Alcance

La sanitización se aplica sobre los siguientes elementos de una solicitud HTTP:

- `Body`
- `Query`
- `Params`

No se aplica sobre:

- `Headers`
- `Cookies`

---

# 4. Reglas de Sanitización

Actualmente únicamente los valores de tipo `string` son procesados.

Las reglas aplicadas son:

- Eliminar etiquetas HTML.
- Eliminar etiquetas `<script>`.
- Eliminar atributos potencialmente peligrosos.
- Eliminar contenido potencialmente ejecutable.
- Normalizar espacios en blanco.
- Eliminar espacios al inicio y al final.

Los siguientes tipos permanecen sin modificaciones:

- `number`
- `boolean`
- `Date`
- `null`
- `undefined`

---

# 5. Flujo de procesamiento

```text
HTTP Request
      │
      ▼
Sanitization Pipe
      │
      ▼
Validation (Zod)
      │
      ▼
Controller
      │
      ▼
Use Case
      │
      ▼
Domain
```

## Flujo

- Toda solicitud HTTP pasa primero por el **Sanitization Pipe**.
- La información sanitizada es enviada al proceso de validación.
- Si la validación es exitosa, el controlador recibe los datos ya sanitizados.
- Los casos de uso y el dominio nunca realizan procesos de sanitización.

---

# 6. Arquitectura

La sanitización se implementa mediante un **Pipe global** registrado en la aplicación.

Ningún módulo debe implementar lógica propia de sanitización.

Todas las reglas se encuentran centralizadas en el componente:

```text
shared/sanitization
```

Este componente constituye el único punto autorizado para modificar el comportamiento de la sanitización.

---

# 7. Principios

- Toda entrada HTTP debe ser sanitizada antes de validarse.
- La sanitización debe ser completamente transparente para los módulos de negocio.
- Las reglas de sanitización deben mantenerse centralizadas.
- Los controladores nunca deben sanitizar datos manualmente.
- La sanitización no reemplaza el proceso de validación.
- Solo los valores de tipo `string` son susceptibles de ser modificados.
- Los demás tipos deben conservarse sin alteraciones.

---

# 8. Extensibilidad

Las nuevas reglas de sanitización deberán incorporarse exclusivamente en el componente:

```text
shared/sanitization
```

La incorporación de nuevas reglas no debe requerir modificaciones en:

- Controladores.
- Casos de uso.
- Dominio.
- Módulos funcionales.

De esta forma se garantiza un comportamiento uniforme y una evolución controlada del proceso de sanitización para toda la aplicación.
