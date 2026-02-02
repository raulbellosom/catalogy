# Guía de Manejo de Errores en Catalogy

Este documento explica cómo utilizar el sistema de manejo de errores mejorado.

## Componentes de Error Disponibles

### 1. NotFoundPage (404)

Página para cuando un recurso no se encuentra.

```jsx
import { NotFoundPage } from "@/shared/ui/organisms";

// Uso básico (404 por defecto)
<NotFoundPage />

// Con mensaje personalizado
<NotFoundPage code={404} message="Este producto no existe" />
```

### 2. ForbiddenPage (403)

Página para acceso denegado.

```jsx
import { ForbiddenPage } from "@/shared/ui/organisms";

<Route
  path="/admin/*"
  element={isAdmin ? <AdminPanel /> : <ForbiddenPage />}
/>;
```

### 3. UnauthorizedPage (401)

Página para usuarios no autenticados.

```jsx
import { UnauthorizedPage } from "@/shared/ui/organisms";

<Route
  path="/dashboard"
  element={isAuthenticated ? <Dashboard /> : <UnauthorizedPage />}
/>;
```

### 4. ServerErrorPage (500)

Página para errores del servidor.

```jsx
import { ServerErrorPage } from "@/shared/ui/organisms";

<ServerErrorPage message="No pudimos procesar tu solicitud" />;
```

## ErrorBoundary

Componente para capturar errores de React en tiempo de ejecución.

```jsx
import { ErrorBoundary } from "@/shared/ui/organisms";

// En App.jsx o layout principal
function App() {
  return (
    <ErrorBoundary fallbackMessage="Algo salió mal en la aplicación">
      <YourApp />
    </ErrorBoundary>
  );
}
```

## useErrorStore Hook

Hook para manejo global de errores.

```jsx
import { useErrorStore } from "@/shared/hooks";

function MyComponent() {
  const { setError, setNotFound, clearError } = useErrorStore();

  const fetchData = async () => {
    try {
      const data = await api.getData();
    } catch (error) {
      if (error.status === 404) {
        setNotFound("Datos no encontrados");
      } else if (error.status === 500) {
        setError(500, "Error del servidor");
      }
    }
  };

  return <div>{/* Tu componente */}</div>;
}
```

## Ejemplos de Uso en Rutas

### En AppRoutes.jsx

```jsx
import {
  NotFoundPage,
  UnauthorizedPage,
  ForbiddenPage,
} from "@/shared/ui/organisms";

// Ruta catch-all para 404
<Route path="*" element={<NotFoundPage />} />

// Rutas protegidas
<Route
  path="/admin/*"
  element={
    <ProtectedRoute requireAdmin>
      <AdminRoutes />
    </ProtectedRoute>
  }
/>
```

### En Componentes de Datos

```jsx
function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct(id)
      .then(setProduct)
      .catch((err) => {
        if (err.status === 404) {
          setError(404);
        } else {
          setError(500);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error === 404) return <NotFoundPage message="Producto no encontrado" />;
  if (error === 500) return <ServerErrorPage />;

  return <ProductView product={product} />;
}
```

## Características de las Páginas de Error

✅ **Animaciones suaves**: Los elementos flotan y tienen transiciones suaves
✅ **Responsive**: Se adapta a todos los tamaños de pantalla
✅ **Dark mode**: Soporte automático para modo oscuro
✅ **Códigos de error personalizables**: 404, 403, 401, 500
✅ **Mensajes personalizados**: Puedes pasar mensajes específicos
✅ **Acciones útiles**: Botones para volver atrás, ir al inicio, contactar soporte
✅ **Gradientes dinámicos**: Cada tipo de error tiene su propio esquema de color

## Personalización

Si necesitas agregar un nuevo tipo de error, edita `NotFoundPage.jsx`:

```jsx
const errorConfigs = {
  // ... existentes
  418: {
    icon: Coffee,
    title: "Soy una tetera",
    description: "Este servidor se niega a preparar café con una tetera.",
    gradient: "from-brown-400 to-brown-600",
    bgGradient: "from-brown-50 to-amber-50",
  },
};
```

## Mejores Prácticas

1. **Usa el código de error apropiado**:
   - 404: Recurso no encontrado
   - 403: Acceso denegado (usuario autenticado pero sin permisos)
   - 401: No autenticado (necesita login)
   - 500: Error del servidor

2. **Proporciona mensajes útiles**: Ayuda al usuario a entender qué pasó y qué puede hacer.

3. **Usa ErrorBoundary**: Envuelve secciones críticas de tu app para capturar errores inesperados.

4. **Log de errores**: Considera integrar un servicio como Sentry para tracking de errores en producción.
