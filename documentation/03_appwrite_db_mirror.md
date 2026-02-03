# Appwrite DB Mirror

Este archivo es la fuente de verdad para el schema del backend.
Los agentes AI DEBEN mantenerlo sincronizado con la consola de Appwrite.

## Como actualizar este mirror

Cuando cambies el schema del backend:

1. Actualizar este archivo primero (o en el mismo commit)
2. Aplicar los cambios correspondientes en la consola de Appwrite (o via SDK/CLI)
3. Asegurar que existan indices para cada patron de query usado por frontend/functions

### Formato de indices

Todos los índices deben documentarse usando el siguiente formato:

| Index Name             | Type    | Attributes  | Notes                   |
| ---------------------- | ------- | ----------- | ----------------------- |
| uq_collection_attr     | unique  | attribute ↑ | descripción del índice  |
| key_collection_attr    | key     | attribute ↑ | descripción del índice  |
| spatial_collection_loc | spatial | location    | búsquedas geoespaciales |

**Reglas:**

- **Index Name**: Máximo 60 caracteres
  - Formato: `<tipo>_<collection>_<campos>`
  - Tipo prefix: `uq_` para unique, `key_` para key, `full_` para fulltext, `spatial_` para spatial
  - Ejemplos: `uq_profiles_email`, `key_tasks_profileid`, `full_products_desc`, `spatial_stores_location`
- **Type**: `unique`, `key`, `fulltext`, o `spatial`
- **Attributes**: Cada campo con flecha de dirección
  - ↑ = ASC (ascendente)
  - ↓ = DESC (descendente)
  - Múltiples campos separados por coma: `field1 ↑, field2 ↓`
  - Para spatial: no usar flechas, solo nombre del atributo
- **Notes**: Explicar qué patrón de query soporta este índice

**Nota sobre spatial indexes:**

- Solo para atributos de tipo `string` que almacenan coordenadas en formato GeoJSON
- Usados para búsquedas de proximidad (ej: tiendas cercanas, ubicaciones en radio)
- No requieren dirección ASC/DESC
- Ejemplo de campo: `location` con valor `{"type":"Point","coordinates":[-99.1332,19.4326]}`

## Instancia

- endpoint: https://appwrite.racoondevs.com
- projectId: (por definir al crear el proyecto)
- appwriteVersion: 1.5.x
- notes: Instancia self-hosted de RacoonDevs

## Database

- databaseId: main

## Buckets

| Bucket key (env var)                   | bucketId      | Purpose            | Max single file size | Allowed extensions | Public? |
| -------------------------------------- | ------------- | ------------------ | -------------------- | ------------------ | ------- |
| VITE_APPWRITE_BUCKET_AVATARS_ID        | avatars       | Avatar de usuarios | 5MB                  | png,jpg,jpeg,webp  | no      |
| VITE_APPWRITE_BUCKET_PRODUCT_IMAGES_ID | productImages | Imagenes productos | 10MB                 | png,jpg,jpeg,webp  | yes     |
| VITE_APPWRITE_BUCKET_STORE_LOGOS_ID    | storeLogos    | Logos de tiendas   | 5MB                  | png,jpg,jpeg,webp  | yes     |

## Collections

### profiles (obligatorio)

Purpose:

- Mirror de usuarios Auth y almacenar campos de perfil extendidos

Document ID:

- Preferido: documentId == Auth userId

| Attribute         | Type     | Required | Default | Constraint(s) | Notes                                    |
| ----------------- | -------- | -------- | ------- | ------------- | ---------------------------------------- |
| firstName         | string   | yes      |         | size=80       | min length validado en frontend          |
| lastName          | string   | yes      |         | size=80       | min length validado en frontend          |
| email             | email    | yes      |         |               | debe coincidir con Auth email            |
| emailVerified     | boolean  | no       | false   |               |                                          |
| phone             | string   | no       |         | size=30       | opcional                                 |
| phoneVerified     | boolean  | no       | false   |               |                                          |
| avatarFileId      | string   | no       |         | size=64       | Storage fileId                           |
| role              | enum     | no       | user    | admin,user    | control de acceso                        |
| enabled           | boolean  | no       | true    |               | soft delete                              |
| active            | boolean  | no       | true    |               | estado de negocio                        |
| termsAcceptedAt   | datetime | no       |         |               | fecha/hora de aceptación de términos     |
| termsVersion      | string   | no       |         | size=20       | versión de términos aceptada (ej: 1.0.0) |
| privacyAcceptedAt | datetime | no       |         |               | fecha/hora de aceptación de privacidad   |

Indexes:

| Index Name                   | Type   | Attributes        | Notes                     |
| ---------------------------- | ------ | ----------------- | ------------------------- |
| uq_profiles_email            | unique | email ↑           | unicidad de email         |
| key_profiles_enabled         | key    | enabled ↑         | queries por estado        |
| key_profiles_active          | key    | active ↑          | queries por estado activo |
| key_profiles_role            | key    | role ↑            | queries por rol           |
| key_profiles_termsacceptedat | key    | termsAcceptedAt ↑ | queries por aceptación    |

Permissions:

- read("user:{userId}") — usuario puede leer su propio perfil
- update("user:{userId}") — usuario puede actualizar su propio perfil

### userPreferences (obligatorio)

Purpose:

- Almacenar preferencias UX por perfil (tema, locale, flags)

| Attribute | Type    | Required | Default | Constraint(s)     | Notes              |
| --------- | ------- | -------- | ------- | ----------------- | ------------------ |
| profileId | string  | yes      |         | size=64           | FK -> profiles.$id |
| theme     | enum    | no       | system  | light,dark,system |                    |
| locale    | string  | no       | es      | size=10           | default espanol    |
| enabled   | boolean | no       | true    |                   |                    |
| flagsJson | string  | no       | "{}"    | size=10000        | small JSON blob    |

Indexes:

| Index Name             | Type   | Attributes  | Notes                    |
| ---------------------- | ------ | ----------- | ------------------------ |
| uq_userprefs_profileid | unique | profileId ↑ | un preference por perfil |

Permissions:

- read("user:{userId}") via profileId
- update("user:{userId}") via profileId

### email_verifications (obligatorio)

Purpose:

- Almacenar tokens de verificación de email generados al registrarse o cambiar email

Document ID:

- Auto-generated

| Attribute   | Type     | Required | Default | Constraint(s) | Notes                                    |
| ----------- | -------- | -------- | ------- | ------------- | ---------------------------------------- |
| userAuthId  | string   | yes      |         | size=64       | FK -> Auth userId                        |
| email       | email    | yes      |         |               | Email a verificar                        |
| token       | string   | yes      |         | size=128      | Token único de verificación (64 hex)     |
| expireAt    | datetime | yes      |         |               | Expiración del token (típicamente 24hrs) |
| used        | boolean  | no       | false   |               | Si el token ya fue usado                 |
| invalidated | boolean  | no       | false   |               | Si el token fue invalidado               |

Indexes:

| Index Name            | Type   | Attributes   | Notes                  |
| --------------------- | ------ | ------------ | ---------------------- |
| uq_emailver_token     | unique | token ↑      | unicidad de token      |
| key_emailver_authid   | key    | userAuthId ↑ | queries por usuario    |
| key_emailver_email    | key    | email ↑      | queries por email      |
| key_emailver_used     | key    | used ↑       | filtrar tokens usados  |
| key_emailver_expireat | key    | expireAt ↑   | queries por expiración |

Permissions:

- read("any") — la función necesita leer tokens
- create("any") — la función crea tokens
- update("any") — la función actualiza tokens al usarlos

### stores (dominio)

Purpose:

- Almacenar informacion de tiendas/catalogos de usuarios

Document ID:

- Auto-generated

| Attribute            | Type    | Required | Default  | Constraint(s) | Notes                                        |
| -------------------- | ------- | -------- | -------- | ------------- | -------------------------------------------- |
| profileId            | string  | yes      |          | size=64       | FK -> profiles.$id (owner)                   |
| slug                 | string  | yes      |          | size=50       | URL-safe, unico, lowercase                   |
| name                 | string  | yes      |          | size=120      | nombre de la tienda                          |
| description          | string  | no       |          | size=500      | descripcion corta                            |
| logoFileId           | string  | no       |          | size=64       | FK -> storeLogos bucket                      |
| templateId           | string  | no       | minimal  | size=50       | ID del template (minimal/storefront/gallery) |
| activeRenderer       | enum    | no       | template | template,puck | decide que render se publica                 |
| categoriesJson       | string  | no       | "[]"     | size=2000     | JSON de categorias propias de la tienda      |
| purchaseInstructions | string  | no       | ""       | size=2000     | instrucciones de compra                      |
| paymentLink          | URL     | no       | ""       |               | link de pago opcional                        |
| settings             | string  | no       | "{}"     | size=2000     | JSON de configuracion (colores, fonts)       |
| puckData             | string  | no       | null     | size=100000   | JSON de configuracion Puck Editor            |
| published            | boolean | no       | false    |               | si el catalogo es publico                    |
| enabled              | boolean | no       | true     |               | soft delete                                  |

Indexes:

| Index Name           | Type   | Attributes             | Notes                       |
| -------------------- | ------ | ---------------------- | --------------------------- |
| uq_stores_slug       | unique | slug ↑                 | unicidad de slug            |
| key_stores_profileid | key    | profileId ↑            | queries por owner           |
| key_stores_enabled   | key    | enabled ↑              | filtrar activas             |
| key_stores_published | key    | published ↑            | filtrar publicadas          |
| key_stores_pub_enab  | key    | published ↑, enabled ↑ | queries publicas eficientes |

Query patterns:

- Buscar tienda por slug (publico): `slug = ? AND published = true AND enabled = true`
- Listar tienda del usuario: `profileId = ? AND enabled = true`

Renderer notes:

- `activeRenderer` decide que se renderiza en publico
- `templateId` y `puckData` pueden coexistir sin borrarse

Permissions:

- read("any") — lectura publica para catalogos publicados
- create("users") — usuarios autenticados pueden crear
- update("user:{userId}") via profileId — solo owner puede editar
- delete("user:{userId}") via profileId — solo owner puede eliminar

### products (dominio)

Purpose:

- Almacenar productos de cada tienda

Document ID:

- Auto-generated

| Attribute   | Type     | Required | Default | Constraint(s)   | Notes                             |
| ----------- | -------- | -------- | ------- | --------------- | --------------------------------- |
| storeId     | string   | yes      |         | size=64         | FK -> stores.$id                  |
| name        | string   | yes      |         | size=150        | nombre del producto               |
| description | string   | no       |         | size=2000       | descripcion detallada             |
| price       | float    | yes      |         | min=0           | precio (sin max por flexibilidad) |
| currency    | string   | no       | MXN     | size=3          | codigo de moneda ISO              |
| imageFileId | string   | no       |         | size=64         | FK -> productImages bucket        |
| categoryIds | string[] | no       |         | size=50         | ids de categorias asignadas       |
| stock       | integer  | no       | 0       | min=0           | cantidad en inventario            |
| sortOrder   | integer  | no       | 0       | min=0, max=9999 | orden de display                  |
| enabled     | boolean  | no       | true    |                 | soft delete                       |

Indexes:

| Index Name              | Type | Attributes             | Notes                       |
| ----------------------- | ---- | ---------------------- | --------------------------- |
| key_products_storeid    | key  | storeId ↑              | queries por tienda          |
| key_products_enabled    | key  | enabled ↑              | filtrar activos             |
| key_products_store_enab | key  | storeId ↑, enabled ↑   | listar productos activos    |
| key_products_store_sort | key  | storeId ↑, sortOrder ↑ | ordenar productos en tienda |

Query patterns:

- Listar productos de tienda: `storeId = ? AND enabled = true ORDER BY sortOrder ASC`
- Producto individual: `$id = ? AND enabled = true`

Permissions:

- read("any") — lectura publica (filtrado por tienda publicada se hace en app)
- create("users") — usuarios autenticados pueden crear
- update("user:{userId}") via store.profileId — solo owner de tienda puede editar
- delete("user:{userId}") via store.profileId — solo owner puede eliminar

## Notas sobre FK

Todas las relaciones usan IDs escalares (strings):

- `profileId` referencia `profiles.$id`
- `storeId` referencia `stores.$id`
- `*FileId` referencia file ID en el bucket correspondiente

NO se usan atributos relationship de Appwrite.

## Ejemplo de índice spatial (para uso futuro)

Si en el futuro se requiere búsqueda por ubicación geográfica, agregar a la colección stores:

**Nuevo atributo:**
| Attribute | Type | Required | Default | Constraint(s) | Notes |
| --------- | ------ | -------- | ------- | ------------- | ---------------------------------- |
| location | string | no | | size=200 | Coordenadas GeoJSON (lng,lat) |

**Nuevo índice:**
| Index Name | Type | Attributes | Notes |
| -------------------- | ------- | ---------- | -------------------------------------- |
| spatial_stores_loc | spatial | location | búsquedas de tiendas cercanas/en radio |

**Formato del valor:**

```json
{ "type": "Point", "coordinates": [-99.1332, 19.4326] }
```

Donde: `[longitud, latitud]` (orden importante: lng primero, lat segundo)

**Query ejemplo:**

```javascript
// Buscar tiendas en radio de 5km desde coordenadas
databases.listDocuments(
  databaseId,
  "stores",
  [Query.equal("published", true), Query.equal("enabled", true)],
  // SDK de Appwrite proveerá método para queries espaciales
);
```

## Validaciones de negocio (aplicar en frontend/functions)

### Slug

- Longitud minima: 3 caracteres
- Longitud maxima: 50 caracteres
- Solo lowercase alfanumerico y guiones
- No puede empezar ni terminar con guion
- No puede tener guiones consecutivos
- Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

### Nombres

- Longitud minima: 2 caracteres para firstName, lastName
- Longitud minima: 3 caracteres para name de tienda/producto

### Precio

- Debe ser >= 0
- Formato de display segun currency
