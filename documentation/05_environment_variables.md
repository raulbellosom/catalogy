# Environment Variables Contract

Objetivo: usar un conjunto estable y reutilizable de nombres de variables de entorno para configurar Appwrite consistentemente.

## Regla core: publico vs secreto

- Valores de configuracion publica DEBEN usar el prefijo `VITE_` para que puedan leerse en el frontend
- Secretos NO DEBEN usar `VITE_` porque Vite expone variables `VITE_` al codigo cliente

## Variables publicas (frontend + functions)

Estas son safe para incluir en el bundle del frontend porque no son secretos.

### Core (requeridas para todos los proyectos)

- VITE_APPWRITE_ENDPOINT
- VITE_APPWRITE_PROJECT_ID
- VITE_APPWRITE_DATABASE_ID

### Colecciones (establecer cuando se usen)

- VITE_APPWRITE_COLLECTION_PROFILES_ID
- VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID
- VITE_APPWRITE_COLLECTION_EMAIL_VERIFICATIONS_ID
- VITE_APPWRITE_COLLECTION_STORES_ID
- VITE_APPWRITE_COLLECTION_PRODUCTS_ID

### Buckets (establecer cuando se usen)

- VITE_APPWRITE_BUCKET_AVATARS_ID
- VITE_APPWRITE_BUCKET_PRODUCT_IMAGES_ID
- VITE_APPWRITE_BUCKET_STORE_LOGOS_ID

### Functions

- VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID — ID de la función de verificación de email

### App-specific

- VITE_APP_BASE_DOMAIN — dominio base para resolucion de subdominios (ej: catalogy.racoondevs.com)
- VITE_APP_BASE_URL — URL completa del frontend (ej: https://catalogy.com)

## Variables secretas (solo functions)

Preferido:

- APPWRITE_FUNCTION_API_KEY (dynamic key provista por Appwrite runtime; scopes configurados por function)

Fallback (solo para dev local o casos especiales):

- APPWRITE_ADMIN_API_KEY

### Email (SMTP) - Solo functions

Estas variables son necesarias para el envío de correos de verificación:

- EMAIL_SMTP_HOST — Host del servidor SMTP (ej: smtp.gmail.com)
- EMAIL_SMTP_PORT — Puerto SMTP (ej: 587)
- EMAIL_SMTP_SECURE — Usar TLS (true/false, default: false)
- EMAIL_SMTP_USER — Usuario SMTP
- EMAIL_SMTP_PASS — Contraseña SMTP
- EMAIL_FROM_NAME — Nombre del remitente (ej: Catalogy)
- EMAIL_FROM_ADDRESS — Email del remitente (ej: no-reply@catalogy.com)

## Patrones de uso

### Frontend (Vite)

- Leer via `import.meta.env.VITE_APPWRITE_ENDPOINT`
- Nunca leer secretos en codigo frontend

### Functions (Node)

- Leer config publica via `EMAIL_VERIFICATIONS_ID | no     | functions            | no      | email_verifications             |
| VITE_APPWRITE_COLLECTION_process.env.VITE_APPWRITE_ENDPOINT`
- Leer secretos via `process.env.APPWRITE_FUNCTION_API_KEY` (preferido) o `process.env.APPWRITE_ADMIN_API_KEY` (fallback dev)

## Tabla de referencia de variables

| Variable                                     | Required? | Used by              | Secret? | Example                         |
| -------------------------------------------- | --------- | -------------------- | ------- | ------------------------------- |
| VITE_APPWRITE_ENDPOINT                       | yes       | frontend + functions | no      | https://appwrite.racoondevs.com |
| VITE_APPWRITE_PROJECT_ID                     | yes       | frontend + functions | no      | 65f...                          |
| VITE_APPWRITE_DATABASE_ID                    | yes       | frontend + functions | no      | main                            |
| VITE_APPWRITE_COLLECTION_PROFILES_ID         | yes       | frontend + functions | no      | profiles                        |
| VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID | yes       | frontend + functions | no      | userPreferences                 |
| VITE_APPWRITE_COLLECTION_STORES_ID           | yes       | frontend + functions | no      | stores                          |
| VITE_APPWRITE_COLLECTION_PRODUCTS_ID         | yes       | frontend + functions | no      | products                        |
| VITE_APPWRITE_BUCKET_AVATARS_ID              | no        | frontend + functions | no      | avatars                         |
| VITE_APPWRITE_BUCKET_PRODUCT_IMAGES_ID       | yes       | frontend + functions | no      | productImages                   |
| VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID | no        | functions            | no      | (ID de la función)              |
| VITE_APP_BASE_DOMAIN                         | yes       | frontend             | no      | catalogy.racoondevs.com         |
| VITE_APP_BASE_URL                            | no        | frontend + functions | no      | https://catalogy.com            |
| APPWRITE_FUNCTION_API_KEY                    | no        | functions            | yes     | (provisto por runtime)          |
| APPWRITE_ADMIN_API_KEY                       | no        | functions            | yes     | (solo dev)                      |
| EMAIL_SMTP_HOST                              | no        | functions            | yes     | smtp.gmail.com                  |
| EMAIL_SMTP_PORT                              | no        | functions            | no      | 587                             |
| EMAIL_SMTP_SECURE                            | no        | functions            | no      | false                           |
| EMAIL_SMTP_USER                              | no        | functions            | yes     | user@gmail.com                  |
| EMAIL_SMTP_PASS                              | no        | functions            | yes     | app_password                    |
| EMAIL_FROM_NAME                              | no        | functions            | no      | Catalogy                        |
| EMAIL_FROM_ADDRESS                           | no        | functions            | yes     | no-reply@catalogy.com)          |
| APPWRITE_ADMIN_API_KEY                       | no        | functions            | yes     | (solo dev)                      |

## Ejemplo: frontend .env.example

EMAIL_VERIFICATIONS_ID=email_verifications
VITE_APPWRITE_COLLECTION_STORES_ID=stores
VITE_APPWRITE_COLLECTION_PRODUCTS_ID=products

# Functions

VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID=

# Appwrite Core

VITE_APPWRITE_ENDPOINT=https://appwrite.racoondevs.com
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=main
VITE_APP_BASE_URL=https://catalogy.com

```

## Ejemplo: function .env.example

```

# Appwrite Core

VITE_APPWRITE_ENDPOINT=https://appwrite.racoondevs.com
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=main

# Collections (las que use la function)

VITE_APPWRITE_COLLECTION_PROFILES_ID=profiles
VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID=userPreferences
VITE_APPWRITE_COLLECTION_EMAIL_VERIFICATIONS_ID=email_verifications
VITE_APPWRITE_COLLECTION_STORES_ID=stores

# Functions

VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID=

# Secrets

APPWRITE_ADMIN_API_KEY=

# Email (SMTP)

EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_USER=
EMAIL_SMTP_PASS=
EMAIL_FROM_NAME=Catalogy
EMAIL_FROM_ADDRESS

## Ejemplo: function .env.example

```
# Appwrite Core
VITE_APPWRITE_ENDPOINT=https://appwrite.racoondevs.com
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=main

# Collections (las que use la function)
VITE_APPWRITE_COLLECTION_PROFILES_ID=profiles
VITE_APPWRITE_COLLECTION_STORES_ID=stores

# Secrets
APPWRITE_ADMIN_API_KEY=
```

## Regla de nombres estricta

- No inventar nuevos nombres como APPWRITE_ENDPOINT o REACT_APPWRITE_ENDPOINT en nuevos proyectos
- Usar este contrato tal cual para maximizar reutilizacion entre repositorios
