# Implementación de Verificación de Email

Este documento describe el sistema de verificación de email implementado en Catalogy.

## Componentes

### 1. Base de Datos

Se agregó una nueva colección `email_verifications` al esquema:

**Collection:** `email_verifications`

| Campo       | Tipo     | Descripción                                 |
| ----------- | -------- | ------------------------------------------- |
| userAuthId  | string   | ID del usuario en Auth                      |
| email       | email    | Email a verificar                           |
| token       | string   | Token único de verificación (auto-generado) |
| expireAt    | datetime | Fecha de expiración (2 horas)               |
| used        | boolean  | Si el token fue usado                       |
| invalidated | boolean  | Si el token fue invalidado                  |

**Indexes:** unique(token), key(userAuthId), key(email), key(used), key(expireAt)

### 2. Functions de Appwrite

Se implementaron 3 funciones:

#### a) `onUserCreated`

**Trigger:** `users.*.create` (evento de Appwrite)

**Qué hace:**

1. Cuando un usuario se registra en Auth, crea automáticamente su documento en `profiles`
2. Crea su documento en `userPreferences` con valores por defecto
3. Dispara la función `emailVerification` para enviar el correo de verificación

**Variables de entorno requeridas:**

- `APPWRITE_DATABASE_ID` (default: main)
- `APPWRITE_PROFILES_COLLECTION_ID` (default: profiles)
- `APPWRITE_USER_PREFERENCES_COLLECTION_ID` (default: userPreferences)
- `APPWRITE_FN_EMAIL_VERIFICATION` (ID de la función emailVerification)

**Permisos de API Key:**

- `users.read`
- `databases.read`
- `databases.write`
- `execution.write`

#### b) `emailVerification`

**Trigger:** HTTP (invocada por `onUserCreated` o por el frontend)

**Acciones soportadas:**

1. **send** - Enviar email de verificación
   - Body: `{ "action": "send", "userAuthId": "...", "email": "..." }`
   - Genera token único
   - Guarda token en BD
   - Envía correo con enlace de verificación

2. **verify** - Verificar token
   - Body: `{ "action": "verify", "token": "..." }`
   - Valida que el token exista y no haya expirado
   - Marca `emailVerified: true` en el perfil del usuario
   - Marca el token como usado

3. **resend** - Reenviar email
   - Body: `{ "action": "resend", "email": "..." }`
   - Invalida tokens anteriores
   - Genera nuevo token y envía correo

**Variables de entorno requeridas:**

- `APPWRITE_DATABASE_ID`
- `APPWRITE_PROFILES_COLLECTION_ID`
- `APPWRITE_EMAIL_VERIFICATIONS_COLLECTION_ID`
- `APP_BASE_URL` (URL del frontend para generar links)
- `EMAIL_SMTP_HOST`
- `EMAIL_SMTP_PORT`
- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`
- `EMAIL_FROM_NAME`
- `EMAIL_FROM_ADDRESS`

**Permisos de API Key:**

- `documents.read`
- `documents.write`

#### c) `syncUserProfile`

**Trigger:** HTTP (invocada desde el frontend por usuario autenticado)

**Qué hace:**

1. Actualiza el documento `profiles/{userId}` con los campos proporcionados
2. Sincroniza `name`, `email` y `phone` en Appwrite Auth
3. Si el email cambia, resetea `emailVerified` a `false`

**Variables de entorno requeridas:**

- `APPWRITE_DATABASE_ID`
- `APPWRITE_PROFILES_COLLECTION_ID`

**Permisos de API Key:**

- `users.read`
- `users.write`
- `databases.read`
- `databases.write`

## Flujo de Verificación de Email

### Registro de Usuario

1. Usuario se registra en el frontend
2. Appwrite crea el usuario en Auth
3. Se dispara el evento `users.*.create`
4. La función `onUserCreated` se ejecuta:
   - Crea documento en `profiles` (emailVerified: false)
   - Crea documento en `userPreferences`
   - Invoca `emailVerification` con action="send"
5. `emailVerification` genera token y envía correo

### Verificación

1. Usuario hace clic en el enlace del correo
2. Frontend captura el token y llama a `emailVerification` con action="verify"
3. La función valida el token y marca `emailVerified: true` en el perfil

### Reenvío

1. Usuario solicita reenvío de correo
2. Frontend llama a `emailVerification` con action="resend"
3. La función invalida tokens anteriores y envía nuevo correo

## Validación en Login

Para implementar la validación de email en el login, el frontend debe:

1. Después de `account.createSession()`, obtener el perfil del usuario
2. Verificar si `profile.emailVerified === false`
3. Si no está verificado:
   - Cerrar la sesión (`account.deleteSession('current')`)
   - Mostrar mensaje al usuario
   - Ofrecer opción de reenviar correo de verificación

## Configuración en Appwrite Console

### 1. Crear Collections

Crear la colección `email_verifications` con los campos y permisos especificados en [03_appwrite_db_mirror.md](./03_appwrite_db_mirror.md).

### 2. Crear Functions

Crear las 3 funciones en Appwrite Console:

**onUserCreated:**

- Runtime: Node 18+
- Trigger: Event `users.*.create`
- Variables de entorno: según `.env.example`

**emailVerification:**

- Runtime: Node 18+
- Trigger: HTTP
- Variables de entorno: según `.env.example`

**syncUserProfile:**

- Runtime: Node 18+
- Trigger: HTTP
- Variables de entorno: según `.env.example`

### 3. Configurar API Keys

Crear API Keys con los permisos necesarios para cada función (ver arriba).

### 4. Variables de Entorno

Configurar todas las variables de entorno según [05_environment_variables.md](./05_environment_variables.md).

## Notas Importantes

- Los tokens de verificación expiran en 2 horas
- El campo `phoneVerified` existe pero no se usa actualmente (sin validación de teléfono)
- El sistema es idempotente: si un usuario ya está verificado, no se envían correos adicionales
- Por seguridad, la acción "resend" no revela si un email existe o no en el sistema
