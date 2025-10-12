# Blueprint de la Aplicación de Comercio Electrónico

## Descripción General

Esta aplicación es una plataforma de comercio electrónico moderna construida con React y Firebase. Ofrece una experiencia de compra completa, desde la navegación y búsqueda de productos hasta el proceso de pago y la gestión de pedidos. La aplicación cuenta con un diseño totalmente renovado, que incluye un tema personalizable con modos claro y oscuro, y un panel de administración para la gestión de productos, pedidos, cupones y reseñas.

## Esquema del Proyecto

### Estilo y Diseño

*   **Componentes de la Interfaz de Usuario:** La aplicación utiliza [Material-UI (MUI)](https://mui.com/) como biblioteca de componentes principal.
*   **Diseño Responsivo:** La aplicación está diseñada para ser totalmente responsiva.

### Enrutamiento y Navegación

*   **Enrutador:** Se utiliza [React Router DOM](https://reactrouter.com/) para la navegación.
*   **Rutas Protegidas y de Administrador:** La aplicación implementa rutas protegidas para controlar el acceso a páginas específicas.

### Gestión del Estado

*   **Estado Global:** Se utilizan `AuthContext` y `ThemeContext` para gestionar la autenticación y el tema de la aplicación.

### Backend y Base de Datos

*   **Firebase:** Se utiliza como plataforma de backend para la autenticación (Authentication) y la base de datos (Firestore).

## Plan de Desarrollo Actual

**Objetivo:** Implementar un panel de cuenta de usuario completo y estructurado basado en el esquema de datos proporcionado.

### 1. Modelo de Datos del Cliente (Firestore)

Se organizará la información del usuario en la colección `users` de la siguiente manera:

*   **Documento Principal (`users/{userId}`):**
    *   `personal_info`: (Objeto) Nombre, apellido, fecha de nacimiento, etc.
    *   `contact_info`: (Objeto) Email, teléfono.
    *   `account_info`: (Objeto) Fecha de registro, rol, estado.
    *   `preferences`: (Objeto) Idioma, notificaciones, foto de perfil.
    *   `wishlist`: (Array) Lista de IDs de productos favoritos.
*   **Subcolecciones:**
    *   `users/{userId}/addresses`: Para almacenar múltiples direcciones de envío y facturación.
    *   `users/{userId}/payment_methods`: Para almacenar de forma segura los métodos de pago.

### 2. Diseño del Panel de Cuenta (`/account`)

Se rediseñará el panel de usuario con una navegación lateral mejorada y las siguientes secciones:

*   **Mi Perfil (`/account/profile`):**
    *   **Funcionalidad:** Ver y editar datos personales y de contacto.
    *   **Componente:** `src/pages/account/Profile.jsx` (será actualizado).

*   **Mis Pedidos (`/account/orders`):**
    *   **Funcionalidad:** Ver el historial de pedidos y el detalle de cada uno.
    *   **Componentes:** `src/pages/account/Orders.jsx` y `src/pages/account/OrderDetail.jsx` (ya creados).

*   **Direcciones (`/account/addresses`):**
    *   **Funcionalidad:** Añadir, editar y eliminar direcciones de envío y facturación.
    *   **Componente:** `src/pages/account/Addresses.jsx` (nuevo).

*   **Métodos de Pago (`/account/payment-methods`):**
    *   **Funcionalidad:** Gestionar tarjetas de crédito/débito y otros métodos de pago.
    *   **Componente:** `src/pages/account/PaymentMethods.jsx` (nuevo).

*   **Seguridad (`/account/security`):**
    *   **Funcionalidad:** Cambiar contraseña y gestionar la seguridad de la cuenta.
    *   **Componente:** `src/pages/account/Security.jsx` (nuevo).

*   **Preferencias (`/account/preferences`):**
    *   **Funcionalidad:** Configurar preferencias de notificaciones, idioma, etc.
    *   **Componente:** `src/pages/account/Preferences.jsx` (nuevo).

---
