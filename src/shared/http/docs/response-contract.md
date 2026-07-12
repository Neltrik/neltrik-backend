# Sistema Global de Respuestas HTTP

## 1. Propósito

El Sistema Global de Respuestas HTTP es el componente encargado de estandarizar todas las respuestas generadas por la API de Neltrik.

Su objetivo es garantizar que todos los módulos expongan un contrato de respuesta único, consistente y predecible, independientemente del controlador, caso de uso o mecanismo interno que origine la respuesta.

Este componente elimina la construcción manual de respuestas HTTP, centraliza el formato de salida de la API y facilita la integración con clientes externos al proporcionar un único contrato para respuestas exitosas y respuestas de error.

## 2. Responsabilidades

### Debe

- Exponer un único contrato de respuesta para toda la API.
- Garantizar consistencia entre todos los módulos.
- Centralizar la construcción de respuestas HTTP.
- Permitir respuestas exitosas y respuestas de error utilizando el mismo contrato.
- Ser independiente del dominio de negocio.
- Ser reutilizable por cualquier módulo del sistema.

### No debe

- Contener reglas de negocio.
- Validar información de entrada.
- Manejar excepciones del sistema.
- Traducir errores de infraestructura.
- Conocer detalles de ningún módulo (ATS, Users, Auth, etc.).

## 3. Contrato

interface ApiResponse<T> {
data: T | null;
code: string;
message: string;
details: unknown[];
meta: Record<string, unknown>;
}

### data

Representa el resultado de la operación.

#### Reglas

- Existe siempre.
- En respuestas exitosas contiene información.
- En respuestas sin contenido o con error su valor es null.

### code

- Representa un identificador interno del resultado.
- No depende del idioma.
- No cambia si cambia el mensaje.

#### Reglas

- Existe siempre.
- Es único dentro del sistema.
- Nunca debe utilizarse el mensaje para tomar decisiones de negocio.

### message

Descripción legible para humanos.

#### Reglas

- Existe siempre.
- Está pensado para facilitar la lectura de la respuesta.
- No debe utilizarse como identificador de la operación.

### details

Información adicional asociada a la respuesta.
Ejemplos: Errores de validación, campos inválidos, advertencias, conflictos específicos.

#### Reglas

- Existe siempre.
- Cuando no existan detalles será un arreglo vacío.
- Su estructura dependerá del tipo de respuesta.

### meta

Información técnica relacionada con la respuesta.
Ejemplos: Paginación, traceId, requestId, executionTime, warnings, links

#### Reglas

- Existe siempre.
- Cuando no exista metadata será un objeto vacío.
- No contiene información del dominio.

## 4. Arquitectura del componente

Caso de uso
│
▼
Controller
│
▼
Response Metadata
│
▼
Response Interceptor
│
▼
Response Builder
│
▼
ApiResponse<T>
│
▼
Cliente

- Los controladores nunca construyen respuestas manualmente.
- Cada endpoint define el código y el mensaje mediante metadata.
- El interceptor es el único responsable de transformar el resultado del controlador al contrato ApiResponse<T>.
- El ResponseBuilder es el único componente autorizado para construir instancias de ApiResponse<T>.

## 5. Principios del contrato

- Todas las respuestas HTTP deben utilizar el mismo contrato.
- Ninguna propiedad podrá agregarse al contrato sin resolver un problema real.
- No se incluirá información redundante con el protocolo HTTP.
- Los consumidores deben poder interpretar cualquier respuesta utilizando únicamente este contrato.
- Los controladores nunca construirán respuestas HTTP manualmente.
- Toda respuesta generada por la API deberá pasar por el Response Interceptor antes de ser enviada al cliente.
