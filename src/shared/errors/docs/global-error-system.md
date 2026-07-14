# Sistema Global de Errores

## Propósito

El **Sistema Global de Errores** es el componente compartido encargado de administrar el ciclo de vida de todas las excepciones generadas por la aplicación.

Su objetivo es centralizar la estrategia de manejo de errores del backend, garantizando un comportamiento uniforme para cualquier excepción, independientemente del módulo, la capa o la librería que la origine.

Este componente elimina la necesidad de que los módulos implementen lógica propia relacionada con el manejo de errores, permitiendo que únicamente generen las excepciones correspondientes a su contexto mientras el Sistema Global de Errores se encarga del resto del proceso.

---

# Responsabilidades

## Debe

- Centralizar el manejo de todas las excepciones de la aplicación.
- Definir una estrategia uniforme para el tratamiento de errores.
- Administrar el ciclo de vida de una excepción desde que es generada hasta que es entregada al mecanismo que la consumirá.
- Interpretar excepciones provenientes del dominio, de la infraestructura y de librerías externas.
- Permitir extender el sistema para soportar nuevos tipos de errores.
- Mantener desacoplados los módulos del mecanismo de manejo de errores.
- Exponer una representación uniforme de una excepción para que otros componentes puedan utilizarla.

## No debe

- Implementar reglas de negocio.
- Construir respuestas HTTP.
- Conocer el contrato HTTP de la aplicación.
- Depender de módulos específicos del negocio.
- Conocer controladores o casos de uso concretos.

---

# Flujo General

```text
Módulo / Librería
        │
        ▼
Genera excepción
        │
        ▼
Sistema Global de Errores
        │
        ▼
Representación uniforme del error
        │
        ▼
Componente consumidor
(HTTP, CLI, Eventos, WebSockets, etc.)
```

---

# Principios

## Los módulos únicamente generan excepciones

Cada módulo es responsable de generar las excepciones correspondientes a su propio contexto.

No implementa lógica para interpretar, clasificar, transformar o exponer errores.

---

## Existe un único punto de administración

Toda excepción generada por la aplicación deberá ser procesada por el Sistema Global de Errores antes de ser consumida por cualquier mecanismo externo.

Esto garantiza:

- Comportamiento consistente.
- Estrategias de registro centralizadas.
- Clasificación uniforme.
- Facilidad para incorporar nuevas políticas de manejo de errores.

---

## Independencia del transporte

El Sistema Global de Errores no conoce HTTP, GraphQL, CLI, WebSockets, gRPC ni ningún otro mecanismo de transporte.

Su responsabilidad finaliza cuando entrega una representación uniforme de la excepción.

Corresponde al componente consumidor decidir cómo transformar dicha representación en una respuesta apropiada para su protocolo.

---

## Arquitectura extensible

El sistema está diseñado para incorporar soporte para nuevos tipos de excepciones sin modificar la arquitectura existente.

Las nuevas excepciones pueden integrarse mediante mecanismos de extensión, preservando el principio de abierto/cerrado (Open/Closed Principle).

---

# Ciclo de Vida de una Excepción

Toda excepción dentro de la aplicación sigue el siguiente flujo:

1. Un módulo detecta una condición excepcional.
2. El módulo genera una excepción correspondiente a su contexto.
3. La excepción es capturada por el Sistema Global de Errores.
4. El sistema identifica el tipo de excepción.
5. Se obtiene una representación uniforme del error.
6. La representación es entregada al componente consumidor.
7. El consumidor decide cómo exponer el error (HTTP, CLI, eventos, etc.).

---

# Beneficios

- Manejo de errores centralizado.
- Consistencia en toda la aplicación.
- Desacoplamiento entre negocio y transporte.
- Arquitectura extensible.
- Facilidad para incorporar nuevas excepciones.
- Reutilización entre distintos mecanismos de exposición.
- Mayor mantenibilidad del sistema.

---

# Alcance

El Sistema Global de Errores es responsable únicamente de la administración de excepciones.

No define cómo deben responder los distintos protocolos de comunicación, sino que proporciona una representación uniforme para que cada consumidor pueda adaptarla a sus necesidades.

Este diseño permite reutilizar el mismo sistema de errores independientemente de si la aplicación expone una API HTTP, un servicio GraphQL, un proceso CLI, un sistema de eventos o cualquier otro mecanismo de interacción.
