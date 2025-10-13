# Project Blueprint

## 1. Project Overview

This document outlines the architecture, features, and development plan for the "MiTienda" e-commerce application. The goal is to build a modern, responsive, and feature-rich online store using React, Material-UI, and Firebase.

## 2. Implemented Features & Design

This section documents all the style, design, and features implemented in the application from the initial version to the current version.

### 2.1. Core Functionality
- **User Authentication:** Secure user sign-up and login with email/password and Google social sign-on.
- **Product Catalog:** Dynamic product listing with search, category filtering, price range, and stock availability filters.
- **Product Reviews & Ratings:** Users can submit star ratings and written reviews for products.
- **Shopping Cart:** Fully functional cart to add, remove, and manage items.
- **Wishlist:** Users can save their favorite products to a wishlist.
- **Checkout Process:** Multi-step checkout for a smooth purchasing experience.
- **Order History:** Users can view their past orders.
- **Admin Dashboard:** A dedicated area for administrators to manage the store.

### 2.2. UI/UX and Design
- **Modern Aesthetics:** Clean, modern design using Material-UI components.
- **Responsive Layout:** The application is fully responsive and works on web and mobile devices.
- **Theme Customization:** Users can switch between light and dark modes.
- **Client-Side Pagination:** The product catalog is paginated for better performance and user experience.

### 2.3. Component & State Management
- **Status Badges:** A reusable `StatusBadge.jsx` component to display order statuses consistently.
- **Internationalization (i18n):** The app supports English and Spanish translations.
- **Centralized State Management:** The application follows a robust "lift state up" pattern. `App.jsx` acts as the central controller, consuming state from various React Contexts. This state is then passed down via props to the page components, ensuring a single source of truth.

## 3. User Roles and Permissions

| Rol                   | Permisos                                                                                                                                                                           |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 👤 **Usuario (cliente)** | - Crear nuevos pedidos. <br> - Ver el estado actual de sus pedidos. <br> - Cancelar un pedido **únicamente** si su estado es "En proceso".                                           |
| 🧑‍💼 **Administrador**   | - Acceso completo a la gestión de pedidos. <br> - Puede cambiar el estado de cualquier pedido en cualquier momento. <br> - Acceso al panel de administración. |

---

## 4. Current Epic: Enhance Core E-commerce Functionality

**Objective:** To implement a series of key features that will significantly upgrade the application's capabilities, turning it into a more complete and competitive e-commerce platform.

**Development Phases:**

- **Phase 1: Advanced Search Filters (✅ Completed)**
    - **Outcome:** Users can filter products by price range and stock availability. Filtering is handled client-side for an instantaneous user experience.

- **Phase 2: Product Page Pagination (✅ Completed)**
    - **Outcome:** The product catalog is now paginated on the client-side using Material-UI's `<Pagination>` component, improving usability for large catalogs.

- **Phase 3: Product Reviews & Ratings (✅ Completed)**
    - **Outcome:** Users can now submit star ratings and written reviews on product detail pages. A transaction ensures that the product's average rating is updated atomically with each new review.

- **Phase 4: Coupon & Discount System (In Progress)**
    - **Goal:** Create a system for admins to generate discount codes that users can apply at checkout.
    - **Implementation:** Develop a new `coupons` collection in Firestore, a full management UI in the admin panel (`CouponManagement.jsx`), and integrate the coupon application logic into the `CartContext` and `Cart.jsx` page.

- **Phase 5: Checkout Flow Implementation**
    - **Goal:** Build the multi-step process for users to finalize their purchase, including shipping and payment.
