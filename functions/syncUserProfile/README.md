# Catalogy — syncUserProfile

**Tipo:** HTTP Function (invocada desde frontend)  
**Runtime:** Node 18  
**SDK:** node-appwrite ^14

## Qué hace

- Actualiza `profiles/{userId}` (firstName, lastName, email, phone, avatarFileId)
- Sincroniza `users.updateName(userId, fullName)`, `email` y `phone` en Auth
- Si el email cambia, resetea `emailVerified` a `false`

## Seguridad

- Si se invoca desde el frontend con sesión, Appwrite inyecta `APPWRITE_FUNCTION_USER_ID`.
- El usuario solo puede actualizar su propio perfil.

## Variables de entorno

| Variable                          | Descripción          | Default    |
| --------------------------------- | -------------------- | ---------- |
| `APPWRITE_FUNCTION_ENDPOINT`      | Endpoint de Appwrite |            |
| `APPWRITE_FUNCTION_PROJECT_ID`    | Project ID           |            |
| `APPWRITE_FUNCTION_API_KEY`       | API Key              |            |
| `APPWRITE_DATABASE_ID`            | ID de la BD          | `main`     |
| `APPWRITE_PROFILES_COLLECTION_ID` | Colección `profiles` | `profiles` |

## Permisos de API Key

- `users.read`
- `users.write` (para actualizar nombre, email, phone en Auth)
- `databases.read`
- `databases.write`

## Body esperado

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "+5215512345678",
  "avatarFileId": "file123"
}
```

Solo se actualizan los campos proporcionados.
