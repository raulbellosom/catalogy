# Backend Requirements (Appwrite)

Los agentes AI DEBEN seguir estas reglas a menos que 00_project_brief.md las sobreescriba explicitamente.

## Servicios de Appwrite en alcance

- Auth (requerido)
- Databases (requerido)
- Storage (requerido; diseno asume uploads <= 30MB por default)
- Functions (requerido cuando se necesita logica server-side)
- Sites (recomendado para hosting SPA/PWA)

## Modelo de identidad: Auth + Profile mirror (obligatorio)

Los usuarios de Appwrite Auth son las cuentas canonicas.
Todo proyecto DEBE incluir una coleccion Profile que refleje el Auth userId y almacene campos extendidos.

Regla:

- Preferido: profile documentId == auth userId (mirror 1:1)
- Profile extiende Auth con campos de negocio:
  - firstName, lastName
  - imageProfile (avatar fileId)
  - enabled (soft delete)
  - flags de estado activo
  - flags de validacion de email/phone segun se necesite

## Convenciones de nombres

- Colecciones: camelCase
- Atributos: camelCase
- Foreign keys: <entity>Id como string escalar (no atributos relationship)
  - profileId, groupId, storeId, createdByProfileId, etc.

## Politica de relationships: NO atributos relationship

No usar atributos relationship de Appwrite.
Representar relaciones usando IDs escalares en atributos string.

Esto significa:

- Puedes consultar/filtrar por IDs facilmente
- El schema permanece explicito y AI-friendly

## Politica de constraints de schema (estricta)

Required vs default:

- Nunca establecer un valor default en un atributo que es required

Numbers:

- campos integer/float DEBEN definir min y max

Strings:

- DEBEN definir size (longitud maxima)
- Reglas de negocio de longitud minima deben aplicarse en capa de validacion (frontend/functions)

Arrays:

- Permitidos solo con necesidad clara y plan de query
- Definir constraints de elementos
- Aplicar max items en capa de validacion si es necesario

## Politica de indexado (estricta)

- Crear un indice para cada atributo que consultaras
- Si consultas multiples campos juntos, crear un indice compuesto

Ejemplos:

- stores: key(slug), key(profileId), key(enabled), key(published, enabled)
- products: key(storeId), key(enabled), key(storeId, enabled)

## Soft delete (flag enabled)

Entidades clave de dominio deben incluir:

- enabled: boolean (default true, not required)

Eliminacion = enabled=false a menos que el Project Brief requiera explicitamente hard delete.

## Politica de Storage

- Tamano objetivo de upload de archivo unico por default: <= 30 MB
- Almacenar file IDs en documentos (no embeber binarios)
- Usar buckets separados para:
  - avatars (avatares de usuario)
  - productImages (imagenes de productos)
  - storeLogos (logos de tiendas)

## Politica de Functions

Usar Functions para:

- validacion server-side
- trabajos programados (cron)
- workflows event-driven
- operaciones privilegiadas que requieren scopes de admin

Least privilege:

- Preferir dynamic API key provista en runtime con scopes configurados
- No depender de API keys all-powerful en produccion cuando sea evitable

Cada function debe:

- vivir en /functions/<functionName>/
- incluir README.md y .env.example
- documentar runtime, trigger, y scopes requeridos

## Politica de hosting con Sites

Usar Appwrite Sites para hostear el frontend (SPA/PWA) a menos que el Project Brief especifique lo contrario.
Documentar la carpeta de output del build y estrategia de deployment en el README raiz.

## DB mirror (obligatorio)

03_appwrite_db_mirror.md debe siempre reflejar:

- todas las colecciones
- todos los atributos con constraints
- todos los indices
- todos los buckets
- convenciones de FK (solo IDs escalares)

Si el backend cambia, actualizar el mirror en el mismo commit.
