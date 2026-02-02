# Catalogy — onUserCreated

**Trigger:** `users.*.create`  
**Runtime:** Node 18+  
**SDK:** node-appwrite ^17

## Qué hace

1. **Profiles**: Crea un documento en la colección `profiles` con el mismo `$id` del usuario Auth.
2. **User Preferences**: Crea un documento de preferencias iniciales.
3. **Email Verification**: Invoca automáticamente a la función `emailVerification` para enviar el correo de verificación.

## Requiere env vars

| Variable                                  | Descripción                          | Default           |
| ----------------------------------------- | ------------------------------------ | ----------------- |
| `APPWRITE_FUNCTION_ENDPOINT`              | Endpoint de Appwrite (system)        |                   |
| `APPWRITE_FUNCTION_PROJECT_ID`            | Project ID (system)                  |                   |
| `APPWRITE_FUNCTION_API_KEY`               | API Key (ver permisos)               |                   |
| `APPWRITE_DATABASE_ID`                    | ID de la BD                          | `main`            |
| `APPWRITE_PROFILES_COLLECTION_ID`         | Colección `profiles`                 | `profiles`        |
| `APPWRITE_USER_PREFERENCES_COLLECTION_ID` | Colección `userPreferences`          | `userPreferences` |
| `APPWRITE_FN_EMAIL_VERIFICATION`          | ID de la función `emailVerification` |                   |

## Permisos de API Key

- `users.read`
- `databases.read`
- `databases.write` (para crear documentos en profiles/preferences)
- `execution.write` (para invocar `emailVerification`)

## Notas

- El documentId del perfil será el mismo que el userId de Auth.
- firstName y lastName se extraen del campo `name` del usuario Auth.
- Se asigna rol `user` por defecto (no `admin`).
