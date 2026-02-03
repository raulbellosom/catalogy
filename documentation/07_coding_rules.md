# Reglas de Código - Catalogy

## 🚫 PROHIBICIONES ESTRICTAS

### Dialogs y Alertas Nativas

**ESTÁ COMPLETAMENTE PROHIBIDO** usar los siguientes métodos nativos del navegador:

- `alert()`
- `confirm()`
- `prompt()`
- `window.alert()`
- `window.confirm()`
- `window.prompt()`

### Emojis

**ESTÁ COMPLETAMENTE PROHIBIDO** usar emojis en el código y la UI:

- No usar emojis Unicode (⚠️, ✅, ❌, 🎯, etc.)
- No usar emojis en strings, componentes o mensajes
- No usar emojis en comentarios de código

**RAZÓN:** Los emojis:

- No son consistentes entre navegadores y sistemas operativos
- Pueden causar problemas de accesibilidad
- No son parte del sistema de diseño
- Pueden no renderizarse correctamente en todos los dispositivos

**ALTERNATIVA:** Usar iconos de Lucide React:

```jsx
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

// En lugar de ⚠️
<AlertCircle className="w-5 h-5" />

// En lugar de ✅
<CheckCircle2 className="w-5 h-5" />

// En lugar de ℹ️
<Info className="w-5 h-5" />
```

**RAZÓN:** Estos métodos:

- Bloquean la UI completamente
- No son personalizables
- Rompen la experiencia de usuario
- No son accesibles
- No se pueden testear fácilmente
- No respetan el diseño de la aplicación

### ✅ ALTERNATIVAS REQUERIDAS

En su lugar, SIEMPRE usar:

#### Para notificaciones y mensajes

```jsx
import { useToast } from "@/shared/ui/molecules";

function MyComponent() {
  const toast = useToast();

  // Éxito
  toast.success("Operación completada exitosamente");

  // Error
  toast.error("Algo salió mal");

  // Advertencia
  toast.warning("Ten cuidado con esta acción");

  // Información
  toast.info("Información importante");
}
```

#### Para confirmaciones y dialogs

```jsx
import { Modal, ModalFooter } from "@/shared/ui/molecules";
import { Button } from "@/shared/ui/atoms/Button";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Abrir Modal</Button>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Confirmar acción"
        description="¿Estás seguro de que quieres continuar?"
        dismissible={true} // permite cerrar con ESC o clic fuera
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Confirmar</Button>
          </ModalFooter>
        }
      >
        <p>Contenido del modal...</p>
      </Modal>
    </>
  );
}
```

## 📝 Guías de Uso

### Toast

**Cuándo usar:**

- Feedback de operaciones exitosas
- Notificaciones de error
- Advertencias no bloqueantes
- Información contextual

**Características:**

- Auto-desaparece después de 5 segundos (configurable)
- Se apilan múltiples toasts
- No bloquea la UI
- Posicionado en esquina inferior derecha

### Modal

**Cuándo usar:**

- Confirmaciones importantes
- Formularios complejos
- Mostrar información detallada
- Flujos que requieren atención del usuario

**Características:**

- Header fijo (título, descripción, botón cerrar)
- Content scrolleable (overflow-y-auto)
- Footer fijo (botones de acción)
- Configurable: dismissible, tamaño, etc.
- Bloquea scroll del body cuando está abierto

**Propiedades:**

```typescript
interface ModalProps {
  open: boolean; // Estado abierto/cerrado
  onClose: () => void; // Callback al cerrar
  title?: string; // Título del modal
  description?: string; // Descripción/subtítulo
  children: ReactNode; // Contenido principal (scrolleable)
  footer?: ReactNode; // Botones de acción (fijo)
  size?: "sm" | "md" | "lg" | "xl" | "full"; // Tamaño
  dismissible?: boolean; // Permitir cerrar con ESC/clic fuera (default: true)
  showClose?: boolean; // Mostrar botón X (default: true)
  className?: string; // Clases adicionales
}
```

## 🎯 Ejemplos Completos

### Confirmación de eliminación

```jsx
const [showDeleteModal, setShowDeleteModal] = useState(false);
const toast = useToast();

const handleDelete = async () => {
  try {
    await deleteItem(itemId);
    toast.success("Elemento eliminado correctamente");
    setShowDeleteModal(false);
  } catch (error) {
    toast.error("No se pudo eliminar el elemento");
  }
};

return (
  <>
    <Button onClick={() => setShowDeleteModal(true)} variant="danger">
      Eliminar
    </Button>

    <Modal
      open={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Confirmar eliminación"
      description="Esta acción no se puede deshacer"
      size="sm"
      footer={
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </ModalFooter>
      }
    >
      <p className="text-[var(--color-fg-secondary)]">
        ¿Estás seguro de que quieres eliminar este elemento?
      </p>
    </Modal>
  </>
);
```

### Registro exitoso (ejemplo real del proyecto)

```jsx
const [showSuccessModal, setShowSuccessModal] = useState(false);

// Después de crear la cuenta...
setShowSuccessModal(true);

<Modal
  open={showSuccessModal}
  onClose={() => {
    setShowSuccessModal(false);
    navigate("/auth/login");
  }}
  title="¡Cuenta creada exitosamente!"
  description="Te hemos enviado un correo de verificación."
  footer={
    <ModalFooter>
      <Button onClick={() => navigate("/auth/login")}>
        Ir a iniciar sesión
      </Button>
    </ModalFooter>
  }
>
  <div className="space-y-4">
    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
      <p>Por favor verifica tu correo antes de iniciar sesión.</p>
    </div>
  </div>
</Modal>;
```

## 🔍 Code Review Checklist

Antes de crear un PR, verificar:

- [ ] No hay `alert()`, `confirm()`, o `prompt()` en el código
- [ ] Todos los mensajes de éxito usan `toast.success()`
- [ ] Todos los errores usan `toast.error()`
- [ ] Las confirmaciones usan `<Modal>` con footer de acciones
- [ ] Los modales tienen header y footer fijos, content scrolleable
- [ ] Se importa `useToast` desde `@/shared/ui/molecules`
- [ ] Se importa `Modal` desde `@/shared/ui/molecules`

## ⚠️ Consecuencias

El uso de dialogs nativos en PRs será **rechazado automáticamente** durante code review.

Si encuentras código legacy con `alert()`, `confirm()`, o `prompt()`, por favor:

1. Crear un issue señalando la ubicación
2. Reemplazarlo con los componentes apropiados
3. Documentar el cambio en el PR
