# AI Prompt Starters

Estos prompts estan disenados para ser copy/paste starters para agentes AI de codigo.
Asumen que el repositorio contiene la carpeta /documentation.

## Reglas globales del agente (OBLIGATORIAS)

Antes de hacer cualquier trabajo, leer estos archivos completamente:

- documentation/00_project_brief.md
- documentation/01_frontend_requirements.md
- documentation/02_backend_appwrite_requirements.md
- documentation/03_appwrite_db_mirror.md
- documentation/04_appwrite_functions_rules.md
- documentation/05_environment_variables.md

Reglas duras:

- Seguir el stack documentado
- Mantener archivos modulares: dividir a ~300 lineas; nunca exceder 700
- No atributos relationship de Appwrite; usar IDs escalares
- Mantener el DB mirror actualizado (03_appwrite_db_mirror.md)
- Mantener nombres de env vars estables (05_environment_variables.md)
- Lenguaje de implementacion default: JavaScript + JSDoc (no TypeScript)
- Lenguaje de UI default: Espanol
- NUNCA usar emojis; SIEMPRE usar iconos de Lucide React

Si algo falta:

- Hacer suposiciones razonables
- Listarlas explicitamente bajo "Suposiciones"
- No bloquear progreso haciendo muchas preguntas

## Formato de output standard (OBLIGATORIO)

Cada respuesta debe seguir esta estructura:

1. Recapitulacion de requisitos
2. Suposiciones (si hay)
3. Plan (corto)
4. Arbol de archivos
5. Cambios agrupados por ruta de archivo (codigo)
6. Checklist de QA

Nunca outputear un solo archivo masivo cuando la modularizacion es posible.

## Prompt master de kickoff (bootstrap del proyecto)

Copy/paste:

```
Eres un ingeniero full-stack experto construyendo un producto premium PWA-first.

Primero, lee estos archivos completamente:
- documentation/00_project_brief.md
- documentation/01_frontend_requirements.md
- documentation/02_backend_appwrite_requirements.md
- documentation/03_appwrite_db_mirror.md
- documentation/04_appwrite_functions_rules.md
- documentation/05_environment_variables.md

Luego haz lo siguiente:
1. Resume los requisitos en tus propias palabras
2. Lista suposiciones (si hay)
3. Propone la arquitectura de archivos/carpetas del repo (frontend + functions)
4. Propone el schema backend de Appwrite:
   - colecciones, atributos, constraints, indices, buckets
   - NO atributos relationship
5. Actualiza documentation/03_appwrite_db_mirror.md con el mirror del schema
6. Lista variables de entorno requeridas usando nombres exactos de documentation/05_environment_variables.md
7. Genera el esqueleto inicial del proyecto y archivos clave de implementacion

Formato de output:
- Recapitulacion de requisitos
- Suposiciones
- Plan
- Arbol de archivos
- Docs actualizados (como patches por ruta de archivo)
- Codigo agrupado por ruta de archivo
- Checklist de QA
```

## Prompt: implementar una feature de frontend

Copy/paste:

```
Lee:
- documentation/00_project_brief.md
- documentation/01_frontend_requirements.md

Tarea:
Implementar esta feature:
<describir feature>

Reglas:
- Mantener archivos pequenos y modulares (dividir a ~300 lineas; nunca exceder 700)
- Usar Motion para animaciones (Framer Motion solo como fallback)
- Tailwind v4.x; dark mode class strategy; theme tokens via CSS variables
- UI premium; mobile-first; safe-area aware
- Implementar estados de loading/empty/error
- Agregar tipos JSDoc para modelos y funciones clave
- NUNCA emojis; SIEMPRE iconos de Lucide React

Output:
- Recapitulacion de requisitos
- Suposiciones
- Plan
- Arbol de archivos actualizado (solo archivos cambiados/agregados)
- Codigo agrupado por ruta de archivo
- Checklist de QA
```

## Prompt: actualizar schema backend + DB mirror

Copy/paste:

```
Lee:
- documentation/00_project_brief.md
- documentation/02_backend_appwrite_requirements.md
- documentation/03_appwrite_db_mirror.md

Tarea:
Disenar/actualizar schema para:
<describir entidades + relaciones + queries>

Reglas:
- No atributos relationship
- Claves en camelCase
- No required+default
- Numbers deben tener min+max
- Strings deben tener size
- Agregar indices para cada patron de query
- Actualizar 03_appwrite_db_mirror.md en el mismo output

Output:
- Recapitulacion de requisitos
- Suposiciones
- Diff del schema (que cambio, por que)
- Secciones actualizadas de 03_appwrite_db_mirror.md
- Queries de ejemplo usados por frontend/functions
```

## Prompt: crear una Appwrite Function

Copy/paste:

```
Lee:
- documentation/04_appwrite_functions_rules.md
- documentation/05_environment_variables.md
- documentation/03_appwrite_db_mirror.md

Crear function:
- nombre:
- runtime:
- trigger:
- proposito:
- colecciones/buckets tocados:

Reglas:
- Crear carpeta functions/<nombre>/ con:
  - README.md
  - .env.example
  - src/main.js
- Usar scopes least privilege
- Preferir dynamic api key (APPWRITE_FUNCTION_API_KEY)
- Nunca loggear secretos
- Modularizar codigo si crece

Output:
- Recapitulacion de requisitos
- Suposiciones
- Plan
- Contenidos completos de la carpeta agrupados por ruta de archivo
- Checklist de QA
```

## Prompt: deteccion de subdominio (especifico de Catalogy)

Copy/paste:

```
Lee:
- documentation/00_project_brief.md
- documentation/01_frontend_requirements.md

Tarea:
Implementar la logica de deteccion y resolucion de subdominio para el sistema multi-tenant.

Requisitos:
1. Detectar hostname actual (window.location.hostname)
2. Extraer slug del subdominio si existe
3. Determinar contexto:
   - catalogy.racoondevs.com -> Dominio raiz -> Mostrar landing/app
   - {slug}.catalogy.racoondevs.com -> Subdominio -> Consultar tienda por slug
4. Crear hook useSubdomain() que retorne:
   - isRootDomain: boolean
   - slug: string | null
   - isLoading: boolean
5. Crear servicio para consultar tienda por slug
6. Manejar estados:
   - Tienda encontrada y publicada -> Catalogo
   - Tienda encontrada pero no publicada -> "Catalogo no disponible"
   - Tienda no encontrada -> 404
   - enabled=false -> 404

Reglas:
- La variable VITE_APP_BASE_DOMAIN define el dominio base
- Desarrollo local debe funcionar (localhost con query param ?slug=xxx como fallback)
- Codigo modular y testeable
- NUNCA emojis; SIEMPRE iconos de Lucide React

Output:
- Recapitulacion de requisitos
- Suposiciones
- Plan
- Codigo agrupado por ruta de archivo
- Checklist de QA
```
