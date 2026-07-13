# Documentación de APIs con Swagger

Este proyecto utiliza **Swagger (OpenAPI)** para centralizar la documentación de todos los servicios REST.

El objetivo es mantener una documentación consistente, automática y fácil de mantener.

---

# Principios

## 1. Swagger se configura una sola vez

La configuración de Swagger es **global** y se realiza únicamente durante el arranque de la aplicación.

No debe volver a configurarse dentro de módulos o controladores.

---

## 2. Cada módulo documenta únicamente sus endpoints

Cada módulo es responsable únicamente de documentar sus propios recursos mediante decoradores de Swagger.

Ejemplo:

- Auth
- ATS
- Users
- Billing

Cada uno documenta únicamente sus controladores.

---

## 3. La configuración global define

La configuración central debe incluir:

- Título de la API
- Descripción
- Versión
- Ruta de documentación (`/docs`)
- Esquema de autenticación (cuando aplique)
- Información general de la API

Toda esta información debe existir en un único punto de configuración.

---

## 4. Los DTO son la fuente de verdad

Los modelos de entrada y salida deben documentarse utilizando los DTO.

Swagger obtiene automáticamente los esquemas desde:

- `@ApiProperty()`
- Clases DTO

> **No se deben documentar manualmente estructuras JSON** dentro de los controladores.

### ✅ Correcto

```ts
export class CreateUserDto {
    @ApiProperty({
        example: "Juan Pérez",
        description: "Nombre completo del usuario",
    })
    name: string;
}
```

### ❌ Incorrecto

```ts
@ApiBody({
  schema: {
    example: {
      name: 'Juan',
    },
  },
})
```

---

## 5. Los controladores no conocen Swagger

Los controladores **no deben**:

- Crear documentos Swagger.
- Configurar Swagger.
- Inicializar OpenAPI.

Únicamente utilizan decoradores para documentar sus endpoints.

Ejemplo:

```ts
@ApiTags('Users')
@ApiOperation({
  summary: 'Crear usuario',
})
@ApiResponse({
  status: 201,
  description: 'Usuario creado correctamente',
})
```

---

## 6. Un único documento

Toda la documentación de la API debe encontrarse en un solo lugar.

```
/docs
```

Allí deben aparecer todos los módulos:

- Auth
- ATS
- Users
- Billing

**No debe existir un Swagger independiente por módulo.**

---

## 7. Toda nueva API debe documentarse

Cada vez que se agregue:

- Una nueva historia.
- Un nuevo recurso.
- Un nuevo endpoint.

Debe incluir obligatoriamente:

- `@ApiTags`
- `@ApiOperation`
- `@ApiResponse`

Ejemplo:

```ts
@ApiTags("Users")
@Controller("users")
export class UsersController {
    @Post()
    @ApiOperation({
        summary: "Crear un nuevo usuario",
    })
    @ApiResponse({
        status: 201,
        description: "Usuario creado exitosamente",
    })
    create(@Body() dto: CreateUserDto) {
        // ...
    }
}
```

---

# Buenas prácticas

- Configurar Swagger únicamente en `main.ts`.
- Utilizar DTO para todas las entradas y salidas.
- Documentar todas las propiedades con `@ApiProperty()`.
- Agrupar los endpoints mediante `@ApiTags`.
- Describir claramente cada operación con `@ApiOperation`.
- Documentar los códigos de respuesta utilizando `@ApiResponse`.
- Mantener una única documentación accesible desde `/docs`.

---

# Resumen

| Regla                      | Descripción                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| Configuración única        | Swagger se configura una sola vez.                                             |
| Documentación por módulo   | Cada módulo documenta únicamente sus endpoints.                                |
| Configuración global       | Define título, descripción, versión, autenticación y ruta `/docs`.             |
| DTO como fuente de verdad  | Los esquemas se generan desde `@ApiProperty()` y los DTO.                      |
| Controladores desacoplados | Los controladores solo usan decoradores; no configuran Swagger.                |
| Un único documento         | Toda la API se expone en `/docs`.                                              |
| Documentación obligatoria  | Todo nuevo endpoint debe incluir `@ApiTags`, `@ApiOperation` y `@ApiResponse`. |
