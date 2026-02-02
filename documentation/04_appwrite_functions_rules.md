# Appwrite Functions Rules

Este archivo define como cada Appwrite Function debe estar estructurada y documentada.
Los agentes AI DEBEN seguir este contrato.

## Contrato de estructura de carpetas

Todas las functions viven bajo /functions:

```
functions/
├── _template/
│   ├── README.md
│   ├── .env.example
│   ├── src/
│   │   └── main.js
│   └── package.json
├── validateSlug/
│   ├── README.md
│   ├── .env.example
│   ├── src/
│   │   └── main.js
│   └── package.json
└── createProfile/
    ├── README.md
    ├── .env.example
    ├── src/
    │   └── main.js
    └── package.json
```

Reglas:

- Cada carpeta de function DEBE incluir README.md y .env.example
- Mantener codigo de function modular (dividir en src/lib si crece)
- Nunca commitear secretos reales en el repo

## Runtime y triggering

Cada README de function DEBE especificar:

- Runtime (ejemplo: Node 18)
- Entrypoint (ejemplo: src/main.js)
- Tipo de trigger:
  - event trigger (listar eventos)
  - cron schedule (listar expresion cron)
  - ejecucion manual/HTTP (como se invoca)

## Interfaz request/response

Las functions siguen un patron request/response.
Tu handler recibe `{ req, res, log, error }`.

Forma baseline recomendada del handler:

```js
export default async ({ req, res, log, error }) => {
  // ...
  return res.json({ ok: true });
};
```

## Permisos y scopes (least privilege)

Least privilege es obligatorio.
Preferir dynamic API keys (provistas por Appwrite para cada ejecucion) con scopes explicitos configurados en la consola de Appwrite.

Nunca otorgar "all scopes" a menos que la function realmente lo necesite.

## Variables de entorno

Usar el contrato global de nombres en 05_environment_variables.md.

Reglas:

- Nunca poner secretos en variables VITE\_
- Preferir variables de function de Appwrite para secretos
- Documentar cada variable de entorno en README.md + .env.example

Variables de entorno built-in provistas por Appwrite runtime pueden incluir:

- APPWRITE_FUNCTION_API_ENDPOINT
- APPWRITE_FUNCTION_API_KEY (dynamic key)
- APPWRITE_VERSION

(Ver docs de Appwrite para la lista completa)

## Template de README.md requerido (por function)

Copiar esto en functions/<functionName>/README.md:

---

# <functionName>

## Proposito

(Que hace esta function, en 1-3 parrafos)

## Runtime

- Runtime:
- Entrypoint:

## Configuracion de trigger

- Tipo de trigger: event / cron / manual
- Events (si es event trigger):
- Cron (si es cron trigger):

## Scopes requeridos (least privilege)

Listar los scopes exactos configurados para la dynamic key de la function.

## Variables de entorno

Config publica (safe):

- VITE_APPWRITE_ENDPOINT
- VITE_APPWRITE_PROJECT_ID
- VITE_APPWRITE_DATABASE_ID
- (cualquier ID de coleccion/bucket usado)

Secretos (solo functions):

- APPWRITE_FUNCTION_API_KEY (dinamico, provisto por Appwrite)
- APPWRITE_ADMIN_API_KEY (solo dev, opcional)

## Dependencias de datos

Colecciones:

- (lista)

Buckets:

- (lista)

## Comportamiento

- Pasos principales
- Casos edge
- Estrategia de idempotencia (si aplica)
- Estrategia de logging (no secretos)

## Desarrollo local

- Como correr localmente (si esta soportado)
- Como testear

---

## Template de .env.example requerido (por function)

Copiar esto en functions/<functionName>/.env.example:

```
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=

# IDs opcionales usados por esta function:
VITE_APPWRITE_COLLECTION_PROFILES_ID=
VITE_APPWRITE_COLLECTION_STORES_ID=

# Secretos (solo functions; nunca usados en frontend):
# APPWRITE_FUNCTION_API_KEY es provisto por Appwrite runtime en produccion.
APPWRITE_ADMIN_API_KEY=
```

## Functions del proyecto Catalogy

### validateSlug

- Proposito: Validar que un slug sea unico y cumpla formato URL-safe
- Trigger: manual (HTTP)
- Scopes: databases.read
- Colecciones: stores

### createProfile

- Proposito: Crear perfil automaticamente al registrarse un usuario
- Trigger: event (users.\*.create)
- Scopes: databases.write, users.read
- Colecciones: profiles, userPreferences
