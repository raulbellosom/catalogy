# createProfile

## Proposito

Crear automaticamente un documento de perfil y preferencias de usuario cuando se registra un nuevo usuario en Appwrite Auth.

Esta function se ejecuta como evento cuando se crea un usuario, asegurando que:

1. Siempre exista un perfil asociado al usuario
2. El perfil tenga el mismo ID que el usuario de Auth (mirror 1:1)
3. Se creen las preferencias de usuario con valores default

## Runtime

- Runtime: Node 18
- Entrypoint: src/main.js

## Configuracion de trigger

- Tipo de trigger: event
- Events: users.\*.create
- Cron: N/A

## Scopes requeridos (least privilege)

- databases.write
- users.read

## Variables de entorno

Config publica (safe):

- VITE_APPWRITE_ENDPOINT
- VITE_APPWRITE_PROJECT_ID
- VITE_APPWRITE_DATABASE_ID
- VITE_APPWRITE_COLLECTION_PROFILES_ID
- VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID

Secretos (solo functions):

- APPWRITE_FUNCTION_API_KEY (dinamico, provisto por Appwrite)
- APPWRITE_ADMIN_API_KEY (solo dev, opcional)

## Dependencias de datos

Colecciones:

- profiles (escritura)
- userPreferences (escritura)

Buckets:

- ninguno

## Comportamiento

### Pasos principales

1. Recibir evento de creacion de usuario
2. Extraer datos del usuario (id, email, name)
3. Crear documento en profiles con:
   - documentId = userId (mirror 1:1)
   - firstName y lastName extraidos del name o defaults
   - email del usuario
   - emailVerified = false
   - enabled = true
   - active = true
4. Crear documento en userPreferences con:
   - profileId = userId
   - theme = system
   - locale = es
   - enabled = true
5. Retornar exito

### Casos edge

- Usuario sin name: usar "Usuario" como firstName
- Error al crear profile: loggear y retornar error
- Error al crear preferences: loggear pero no fallar (profile ya creado)
- Perfil ya existe: skip (idempotente)

### Estrategia de idempotencia

- Verificar si el perfil ya existe antes de crear
- Si existe, no hacer nada (evita duplicados en re-ejecucion)

### Estrategia de logging

- Loggear userId y email (no son secretos)
- Loggear resultado de creacion
- NO loggear API keys

## Desarrollo local

```bash
cd functions/createProfile
npm install
# Configurar .env con variables requeridas
# Simular evento de creacion de usuario
```

## Ejemplo de evento recibido

```json
{
  "$id": "user123",
  "email": "usuario@ejemplo.com",
  "name": "Juan Perez",
  "emailVerification": false
}
```

## Ejemplo de response (exito)

```json
{
  "ok": true,
  "message": "Profile created successfully",
  "profileId": "user123"
}
```
