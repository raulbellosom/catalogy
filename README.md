# Catalogy — Plataforma de Catalogos Multi-tenant por Subdominio

Plataforma que permite a usuarios crear y publicar su propio catalogo de productos, accesible mediante subdominios dinamicos.

## Arquitectura

- **Frontend**: React + Vite + PWA + TailwindCSS + Motion
- **Backend**: Appwrite (Auth, Databases, Storage, Functions, Sites)
- **Multi-tenancy**: Wildcard subdomains (`*.catalogy.racoondevs.com`)

## Como funciona

1. Usuario se registra en `catalogy.racoondevs.com`
2. Crea su tienda y elige un slug unico
3. Agrega productos a su catalogo
4. Publica el catalogo
5. El catalogo queda accesible en `{slug}.catalogy.racoondevs.com`

## Estructura del proyecto

```
catalogy/
├── documentation/          # Documentacion del proyecto (AI-friendly)
├── functions/              # Appwrite Functions
├── src/                    # Codigo fuente frontend
│   ├── app/               # Rutas, providers, layouts
│   ├── features/          # Dominios de negocio
│   ├── shared/            # UI compartida, hooks, utils
│   └── assets/            # Recursos estaticos
├── public/                # Archivos publicos PWA
└── ...
```

## Documentacion

Toda la documentacion tecnica esta en `/documentation`:

- [README](documentation/README.md) — Como usar la documentacion
- [Project Brief](documentation/00_project_brief.md) — Requisitos del proyecto
- [Frontend Requirements](documentation/01_frontend_requirements.md) — Arquitectura frontend
- [Backend Requirements](documentation/02_backend_appwrite_requirements.md) — Reglas de Appwrite
- [DB Mirror](documentation/03_appwrite_db_mirror.md) — Schema de base de datos
- [Functions Rules](documentation/04_appwrite_functions_rules.md) — Reglas para functions
- [Environment Variables](documentation/05_environment_variables.md) — Variables de entorno
- [AI Prompts](documentation/06_ai_prompts.md) — Prompts para agentes AI

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de produccion
npm run build
```

## Variables de entorno

Copiar `.env.example` a `.env` y configurar las variables necesarias.

## Licencia

Privado — RacoonDevs
