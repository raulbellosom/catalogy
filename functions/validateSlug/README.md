# validateSlug

## Proposito

Validar que un slug sea unico y cumpla el formato URL-safe antes de que el usuario pueda usarlo para su tienda.

El slug debe:

- Tener entre 3 y 50 caracteres
- Ser lowercase alfanumerico con guiones permitidos
- No empezar ni terminar con guion
- No tener guiones consecutivos
- No estar en uso por otra tienda activa

## Runtime

- Runtime: Node 18
- Entrypoint: src/main.js

## Configuracion de trigger

- Tipo de trigger: manual (HTTP)
- Events: N/A
- Cron: N/A

## Scopes requeridos (least privilege)

- databases.read

## Variables de entorno

Config publica (safe):

- VITE_APPWRITE_ENDPOINT
- VITE_APPWRITE_PROJECT_ID
- VITE_APPWRITE_DATABASE_ID
- VITE_APPWRITE_COLLECTION_STORES_ID

Secretos (solo functions):

- APPWRITE_FUNCTION_API_KEY (dinamico, provisto por Appwrite)
- APPWRITE_ADMIN_API_KEY (solo dev, opcional)

## Dependencias de datos

Colecciones:

- stores (lectura)

Buckets:

- ninguno

## Comportamiento

### Pasos principales

1. Recibir slug en el body del request
2. Validar formato del slug (regex)
3. Buscar en coleccion stores si existe un documento con ese slug y enabled=true
4. Retornar resultado de validacion

### Casos edge

- Slug vacio o null: retornar invalid
- Slug con caracteres invalidos: retornar invalid con mensaje especifico
- Slug en uso: retornar invalid con mensaje "slug ya en uso"
- Error de BD: retornar error 500

### Estrategia de idempotencia

- Operacion de solo lectura, no aplica

### Estrategia de logging

- Loggear slug recibido (no es secreto)
- Loggear resultado de validacion
- NO loggear API keys

## Desarrollo local

```bash
cd functions/validateSlug
npm install
# Configurar .env con variables requeridas
# Usar Appwrite CLI o simulador local
```

## Ejemplo de request

```json
{
  "slug": "mi-tienda"
}
```

## Ejemplo de response (valido)

```json
{
  "ok": true,
  "valid": true,
  "slug": "mi-tienda"
}
```

## Ejemplo de response (invalido - formato)

```json
{
  "ok": true,
  "valid": false,
  "slug": "Mi Tienda!",
  "reason": "format",
  "message": "El slug solo puede contener letras minusculas, numeros y guiones"
}
```

## Ejemplo de response (invalido - en uso)

```json
{
  "ok": true,
  "valid": false,
  "slug": "mi-tienda",
  "reason": "taken",
  "message": "Este slug ya esta en uso"
}
```
