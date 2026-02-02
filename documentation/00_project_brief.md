# Project Brief — Catalogy

Este archivo define que construir y que NO construir.
Los agentes AI DEBEN tratar este archivo como autoritativo y NO DEBEN inventar requisitos.

## Identidad del proyecto

- Nombre del proyecto: Catalogy
- Nombre del repo: catalogy
- Categoria de la app: e-commerce / catalogos
- Descripcion corta del producto:
  Plataforma multi-tenant que permite a usuarios crear y publicar su propio catalogo de productos. Cada catalogo es accesible mediante un subdominio unico del tipo `{slug}.catalog.racoondevs.com`. Un solo Appwrite Site sirve todos los catalogos usando wildcard subdomains.
- Usuarios objetivo: Pequenos comerciantes, emprendedores, vendedores independientes que necesitan un catalogo digital rapido
- Dispositivos primarios: mobile-first (default)
- Zona horaria default: America/Mexico_City

## Criterios de exito

### Funcionalidades must-have

- Registro e inicio de sesion de usuarios
- Creacion de tienda con slug unico
- Gestion de productos (CRUD)
- Publicacion/despublicacion de catalogo
- Deteccion automatica de subdominio para renderizar catalogo correcto
- Landing page general en dominio raiz
- Vista publica de catalogo por subdominio
- Pagina 404 para slugs inexistentes
- Pagina "catalogo no disponible" para tiendas no publicadas

### Paginas must-have

- `/` — Landing page (dominio raiz) o Catalogo publico (subdominio)
- `/auth/login` — Inicio de sesion
- `/auth/register` — Registro
- `/app` — Dashboard del usuario
- `/app/store` — Configuracion de tienda
- `/app/products` — Gestion de productos
- `/app/settings` — Preferencias de usuario

### Integraciones must-have

- Appwrite Auth (email/password)
- Appwrite Database
- Appwrite Storage (imagenes de productos)
- Appwrite Sites (hosting)

### Fuera de alcance (explicito)

- Pagos / checkout / carrito de compras (version inicial)
- Dominios personalizados (futuro)
- Multiples tiendas por usuario (futuro)
- Integraciones con redes sociales
- Analytics avanzados
- Notificaciones push

## No negociables

- UI premium (no aspecto de template generico)
- Mobile-first + completamente responsivo
- Layout aware de safe-area (barras superior/inferior)
- Micro-interacciones y transiciones intencionales
- Codigo modular; no spaghetti; evitar archivos largos
- Reglas de schema de Appwrite DEBEN seguirse (ver backend requirements)
- NUNCA usar emojis; SIEMPRE usar iconos (Lucide React)

## Usuarios, roles y permisos

- Acceso de invitado permitido? Si (solo lectura de catalogos publicos)
- Roles necesarios? No (version inicial)
- Multi-tenant (grupos/workspaces)? Si
  - Cada usuario puede tener UNA tienda
  - Cada tienda es un tenant independiente
  - Los subdominios son el mecanismo de aislamiento

## Lenguaje e i18n

- Idioma default: Espanol
- Estilo de UI copy: casual / amigable
- i18n necesario? No (version inicial)

## Alcance del frontend

### PWA

- PWA requerida? Si
- Prompt de instalacion UX requerido? Si
- Soporte offline requerido? Si
  - Flujos criticos offline:
    - Vista de catalogo publico (cache)
    - Dashboard basico (solo lectura)

### Theming

- Modo oscuro requerido? Si
- Tema default: system
- Animacion de cambio de tema requerida? Si

### Routing

Rutas del sistema:

- `/` — Landing (root) o Catalogo (subdominio)
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/app` — Dashboard
- `/app/store` — Configuracion de tienda
- `/app/products` — Lista de productos
- `/app/products/new` — Crear producto
- `/app/products/:id` — Editar producto
- `/app/settings` — Preferencias

Rutas publicas (subdominio):

- `/` — Catalogo completo
- `/product/:id` — Detalle de producto

### Data

- Real-time requerido? No (version inicial)
- Cached queries requerido? Si (React Query)
- Persistencia requerida (offline cache)? Si (catalogos publicos)

## Alcance del backend (Appwrite)

- Appwrite endpoint: https://appwrite.racoondevs.com
- Appwrite project ID: (por definir)
- Database ID: main
- Buckets necesarios:
  - avatars: Si
  - productImages: Si
  - storeLogos: Si

### Auth

- Metodos de auth:
  - Email/password: Si
  - Phone/SMS: No
  - Email OTP / Magic URL: No
  - OAuth2 providers: No (version inicial)
- Reglas de verificacion:
  - Usar verificacion de Appwrite? Si
  - Workflow de verificacion custom? No

### Colecciones obligatorias

- profiles
- userPreferences

### Colecciones de dominio

#### stores

- Nombre de entidad: stores
- Modelo de propietario: profileId
- Campos must-have:
  - slug (unico, URL-safe)
  - name
  - description
  - logoFileId
  - templateId (template visual del catalogo)
  - puckData (configuracion JSON de Puck Editor)
  - published
  - enabled
- Queries must-have:
  - Por slug (publico)
  - Por profileId (owner)
- Soft delete? Si (enabled=true)
- Validaciones importantes:
  - slug debe ser unico
  - slug debe ser URL-safe (lowercase, sin espacios, alfanumerico + guiones)

## Sistema de templates

### Templates disponibles

Cada tienda puede elegir un template visual predefinido:

- **minimal**: Tipografia simple, fondo limpio, lista directa de productos. Default.
- **storefront**: Header prominente + descripcion, estilo tienda clasica.
- **gallery**: Grid visual, pensado para productos con fuerte componente visual (ropa, arte).

### Puck Editor

Cada template es personalizable via Puck Editor (@puckeditor/core):

- Puck es open source y gratuito (sin licencia, sin cargos)
- Permite edicion visual drag-and-drop de bloques
- El layout se guarda como JSON en el campo `puckData` de la tienda
- Cada template define sus propios componentes/bloques disponibles

### Pagina de edicion

- `/app/editor` — Editor visual Puck para personalizar el catalogo
- Solo accesible para el owner de la tienda
- Los cambios se guardan en tiempo real o al hacer "Publicar"

#### products

- Nombre de entidad: products
- Modelo de propietario: storeId
- Campos must-have:
  - storeId (FK)
  - name
  - description
  - price
  - imageFileId
  - sortOrder
  - enabled
- Queries must-have:
  - Por storeId + enabled
  - Por storeId ordenado por sortOrder
- Soft delete? Si (enabled=true)

#### categories (opcional, futuro)

- Para organizar productos por categoria
- No implementar en version inicial

## Appwrite Functions

### validateSlug

- Nombre: validateSlug
- Proposito: Validar que un slug sea unico y cumpla formato URL-safe
- Tipo de trigger: manual (HTTP)
- Scopes necesarios: databases.read
- Colecciones/buckets tocados: stores
- Inputs: { slug: string }
- Outputs: { valid: boolean, message?: string }

### onUserCreated

- Nombre: onUserCreated
- Proposito: Crear perfil y preferencias automaticamente cuando se registra un usuario, y enviar email de verificación
- Tipo de trigger: event (users.\*.create)
- Scopes necesarios: databases.write, users.read, execution.write
- Colecciones/buckets tocados: profiles, userPreferences
- Inputs: evento de usuario
- Outputs: perfil creado, preferencias creadas, email enviado

### syncUserProfile

- Nombre: syncUserProfile
- Proposito: Sincronizar cambios de perfil entre la colección profiles y Appwrite Auth
- Tipo de trigger: manual (HTTP autenticado)
- Scopes necesarios: databases.write, users.write
- Colecciones/buckets tocados: profiles
- Inputs: { firstName, lastName, email, phone, avatarFileId }
- Outputs: perfil actualizado

### emailVerification

- Nombre: emailVerification
- Proposito: Gestionar envío, verificación y reenvío de correos de verificación de email
- Tipo de trigger: manual (HTTP)
- Scopes necesarios: databases.write, users.read
- Colecciones/buckets tocados: profiles, emailVerifications
- Inputs: { action, token?, userAuthId?, email? }
- Outputs: email enviado, verificación confirmada

## Requisitos no funcionales

- Performance:
  - target LCP: < 2.5s
  - target bundle size: < 500KB inicial
- Seguridad:
  - Secretos nunca en frontend
  - Validacion de slugs server-side
- Observabilidad:
  - Logging basico en functions

## Entregables y mantenimiento de documentacion

El agente DEBE mantener sincronizados:

- 03_appwrite_db_mirror.md refleja Appwrite Console
- Cada carpeta de function tiene README.md + .env.example
- Cualquier nueva variable de entorno debe agregarse a 05_environment_variables.md

## Logica de resolucion de subdominio

El frontend DEBE:

1. Detectar el hostname actual (`window.location.hostname`)
2. Extraer el slug del subdominio si existe
3. Determinar el contexto:
   - `catalog.racoondevs.com` → Dominio raiz → Mostrar landing/app
   - `{slug}.catalog.racoondevs.com` → Subdominio → Consultar tienda por slug
4. Renderizar segun el resultado:
   - Tienda encontrada y publicada → Catalogo
   - Tienda encontrada pero no publicada → "Catalogo no disponible"
   - Tienda no encontrada → 404
   - enabled=false → Tratar como inexistente (404)
