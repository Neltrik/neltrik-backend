# Códigos y Mensajes de Respuesta

## 1. Propósito

Los códigos y mensajes de respuesta definen el resultado de una operación HTTP dentro de la API.

Su objetivo es proporcionar un mecanismo consistente para identificar el resultado de una solicitud, permitiendo que los clientes interpreten las respuestas de forma predecible sin depender de textos descriptivos.

---

# 2. Principios

## Códigos

Los códigos representan exclusivamente el resultado de una operación HTTP.

### Reglas

- Representan resultados HTTP.
- No contienen contexto de negocio.
- Son reutilizables entre todos los módulos.
- Son independientes del idioma.
- No cambian aunque cambie el mensaje asociado.
- Deben ser únicos dentro del sistema.
- Son el único identificador que debe utilizar un cliente para interpretar una respuesta.

---

## Mensajes

Los mensajes son descripciones legibles para humanos del resultado de la operación.

### Reglas

- Pertenecen a la capa que los genera.
- Pueden variar según el contexto.
- Están orientados a facilitar la lectura de la respuesta.
- No deben utilizarse para tomar decisiones de negocio.
- Pueden modificarse sin afectar la compatibilidad de la API.

---

# 3. Separación de responsabilidades

La API separa explícitamente el significado funcional de una respuesta en dos componentes:

| Componente | Responsabilidad                               |
| ---------- | --------------------------------------------- |
| `code`     | Identificar el resultado de la operación.     |
| `message`  | Describir el resultado para un lector humano. |

Esta separación permite mantener la estabilidad del contrato de la API incluso cuando cambian los textos mostrados al usuario.

---

# 4. Ejemplo

```json
{
    "data": null,
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found.",
    "details": [],
    "meta": {}
}
```

En este ejemplo:

- `RESOURCE_NOT_FOUND` identifica el tipo de resultado.
- `"User not found."` describe el resultado para el consumidor humano.
- Si el mensaje cambia a `"The requested user does not exist."`, el contrato de la API permanece inalterado mientras el código continúe siendo `RESOURCE_NOT_FOUND`.

---

# 5. Beneficios

- Contrato de respuesta estable.
- Independencia entre lógica de negocio y presentación.
- Mayor reutilización de códigos entre módulos.
- Posibilidad de internacionalización sin modificar el contrato.
- Clientes más robustos al depender únicamente de los códigos para interpretar las respuestas.
