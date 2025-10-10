# Blueprint de la Aplicación de Comercio Electrónico

## Descripción General

Esta aplicación es una plataforma de comercio electrónico moderna construida con React y Firebase. Ofrece una experiencia de compra completa, desde la navegación y búsqueda de productos hasta el proceso de pago y la gestión de pedidos. La aplicación también incluye un panel de administración para la gestión de productos, pedidos, cupones y reseñas.

## Esquema del Proyecto

### Estilo y Diseño

*   **Componentes de la Interfaz de Usuario:** La aplicación utiliza [Material-UI (MUI)](https://mui.com/) como biblioteca de componentes principal, lo que garantiza una interfaz de usuario coherente y visualmente atractiva.
*   **Diseño Responsivo:** La aplicación está diseñada para ser totalmente responsiva, adaptándose a diferentes tamaños de pantalla para una experiencia de usuario óptima en dispositivos de escritorio y móviles.

### Enrutamiento y Navegación

*   **Enrutador:** Se utiliza [React Router DOM](https://reactrouter.com/) para gestionar la navegación dentro de la aplicación.
*   **Rutas Protegidas:** La aplicación implementa rutas protegidas para garantizar que solo los usuarios autenticados puedan acceder a ciertas páginas, como el perfil de usuario y el proceso de pago.
*   **Rutas de Administrador:** Se utilizan rutas de administrador para restringir el acceso al panel de administración solo a los usuarios con el rol de "administrador".

### Gestión del Estado

*   **Estado Local:** El estado local de los componentes se gestiona con los hooks `useState` y `useReducer` de React.
*   **Estado Global:**
    *   `AuthContext`: Gestiona el estado de autenticación del usuario en toda la aplicación.
    *   `ThemeContext`: Gestiona el tema de la aplicación (claro/oscuro).

### Backend y Base de Datos

*   **Firebase:** La aplicación utiliza Firebase como plataforma de backend, aprovechando los siguientes servicios:
    *   **Firebase Authentication:** Para la autenticación de usuarios (correo electrónico/contraseña y Google).
    *   **Firestore:** Como base de datos NoSQL para almacenar información de productos, pedidos, usuarios, cupones y reseñas.

## Plan de Rediseño de la Interfaz de Usuario (UI)

**Objetivo:** Rediseñar la interfaz de usuario de la aplicación para que coincida con el diseño proporcionado, creando una experiencia más moderna y atractiva.

**Plan de Acción:**

1.  **Página de Inicio (`src/pages/Home.jsx`):**
    *   **Sección Hero:** Implementar una sección "hero" prominente con el título "Estilo que Define tu Espacio" y un subtítulo.
    *   **Botón de Llamada a la Acción (CTA):** Añadir un botón "EXPLORAR COLECCIÓN AHORA".
    *   **Catálogo de Productos:** Crear una sección "Nuestro Catálogo" para mostrar la lista de productos.
    *   **Lógica de Datos:** Trasladar la lógica de obtención de productos desde `App.jsx` a `Home.jsx` para una mejor separación de responsabilidades.

2.  **Encabezado (`src/components/Header.jsx`):**
    *   **Logo:** Actualizar el logo a "MiTienda".
    *   **Barra de Búsqueda:** Integrar una barra de búsqueda de productos.
    *   **Iconos de Usuario:** Añadir iconos para la "Lista de Deseos" y el "Carrito de Compras".
    *   **Autenticación:** Incluir botones de "INICIAR SESIÓN" y "REGISTRARSE".

3.  **Componente Principal (`src/App.jsx`):**
    *   **Simplificación:** Refactorizar `App.jsx` para que se centre principalmente en la configuración de rutas, eliminando la lógica de obtención de datos que se moverá a `Home.jsx`.
