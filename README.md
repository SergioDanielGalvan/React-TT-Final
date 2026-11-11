# Mundo Gaming · Entrega final React (Talento Tech)

E-commerce de hardware gamer (placas madre, tarjetas de video y gabinetes) hecho con **React + Vite**,
con **Firebase** (Authentication + Cloud Firestore) como backend.

- **Sitio publicado:** <https://react-tt-final-pi.vercel.app/>
- **Repositorio:** <https://github.com/SergioDanielGalvan/React-TT-Final>
- **Pre-entrega:** [React-TT-PreEntrega](https://github.com/SergioDanielGalvan/React-TT-PreEntrega) · <https://react-tt-pre-entrega.vercel.app/>
- **Autor:** Sergio Daniel Galván

Es la migración a React del sitio HTML/JS del proyecto final de Front
([TPFinal-Front-TalentoTech-New](https://github.com/SergioDanielGalvan/TPFinal-Front-TalentoTech-New)),
con ideas del TP grupal **MocoSoft** ([front_tp2_grupal](https://github.com/alerod88/front_tp2_grupal)).

---

## Instalación y ejecución local

Requisitos: **Node.js 20 o superior** y npm.

```bash
git clone https://github.com/SergioDanielGalvan/React-TT-Final.git
cd React-TT-Final
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# completá .env con los datos de Firebase y la key de ImgBB (ver abajo)
npm run dev               # http://localhost:5173
```

Otros comandos:

| Comando | Qué hace |
|---------|----------|
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build para probarlo |
| `npm run lint` | Revisa el código con ESLint |

### Variables de entorno

Todas empiezan con `VITE_` para que Vite las incluya en el sitio. El archivo `.env` **no se sube a
GitHub** (está en `.gitignore`); en Vercel se cargan en *Settings → Environment Variables* y después
se hace *Redeploy*.

| Variable | De dónde sale |
|----------|---------------|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Consola de Firebase → Configuración del proyecto → Tus apps → `firebaseConfig` |
| `VITE_IMGBB_KEY` | <https://api.imgbb.com/> con la cuenta de ImgBB iniciada |

> La configuración web de Firebase no es secreta: lo que protege los datos son las **reglas de
> Firestore**. La key de ImgBB sí conviene no publicarla en el repositorio.

---

## Firebase

### Authentication

Método **Correo electrónico/contraseña**. Las contraseñas las guarda y verifica Firebase (nunca pasan
por el código del sitio). La sesión se mantiene al recargar con `onAuthStateChanged`.

- `/registro` crea la cuenta y su documento `usuarios/{uid}` con `rol: "cliente"`.
- `/login` inicia sesión; los errores de Firebase se muestran en castellano.

### Cloud Firestore

| Colección | Documento | Campos |
|-----------|-----------|--------|
| `productos` | ID legible (ej. `gpu-rtx3090ti`) | `titulo`, `categoria`, `precio`, `imagen`, `specs` (array), `url`, `destacado`, `creado` |
| `usuarios` | UID de Authentication | `nombre`, `correo`, `rol` (`cliente` o `admin`), `creado` |

**Reglas de seguridad** (pestaña *Reglas* de Firestore):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function esAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    match /productos/{id} {
      allow read: if true;
      allow create, update, delete: if esAdmin();
    }
    match /usuarios/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || esAdmin());
      allow create: if request.auth != null && request.auth.uid == uid
                    && request.resource.data.rol == 'cliente';
      allow update: if request.auth != null && request.auth.uid == uid
                    && request.resource.data.rol == resource.data.rol;
    }
  }
}
```

- Cualquiera puede **ver** el catálogo; solo un **admin** puede crear, editar o borrar productos.
- Nadie puede registrarse como admin ni cambiarse el rol a sí mismo.

### Crear el primer administrador

1. Registrate en el sitio (`/registro`).
2. En la consola de Firebase → Firestore → `usuarios` → tu documento → cambiá `rol` a `admin`.
3. Cerrá sesión y volvé a ingresar: aparece el menú **Gestión**.

### Carga inicial del catálogo

En **Gestión → Importar catálogo inicial** se suben a Firestore, en un solo lote (`writeBatch`), los
13 productos de `public/productos.json`. Desde ahí el catálogo se administra con el CRUD.

Las credenciales de prueba (admin y cliente) se entregan aparte; no están en el repositorio.

---

## Funcionalidades y requisitos de la entrega final

| # | Requisito | Dónde está |
|---|-----------|------------|
| 1 | **Carrito con Context API** (agregar, eliminar, vaciar) | `src/context/CartProvider.jsx` + hook `useCart`; persistente en `localStorage` |
| 1 | **Autenticación** con Firebase (login y registro) | `src/context/AuthProvider.jsx`, `pages/Login.jsx`, `pages/Registro.jsx` |
| 1 | **Rutas protegidas** | `components/ProtectedRoute.jsx`: `/checkout` y `/perfil` piden sesión; `/admin/...` pide rol admin (si no, 403) |
| 2 | **CRUD de productos** en Firestore | `src/services/productos.js` (getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch) |
| 2 | Formulario controlado con **validaciones** | `pages/admin/ProductoForm.jsx`: nombre (3+ caracteres), precio > 0, al menos una característica, URL válida, imagen |
| 2 | **Modal de confirmación** antes de eliminar | `components/ConfirmModal.jsx` (Modal de React-Bootstrap), usado en Gestión y en *Vaciar carrito* |
| 2 | **Spinners y errores** | `components/Estado.jsx` (Spinner / Alert con *Reintentar*); mensajes de Firestore y Auth traducidos; avisos con React Toastify |
| 3 | **React-Bootstrap** (grilla y componentes) | `ItemList` con `Row`/`Col` (1-2-3-4 columnas), `Navbar`, `Modal`, `Form`, `Table`, `Pagination`, `Card`, `Spinner`, `Alert` |
| 3 | **React Icons** en botones | Carrito, editar, eliminar, buscar, login, tema, etc. |
| 3 | **styled-components** | `components/styled/ProductoCard.styles.js` (card de producto, con variante "destacado") |
| 3 | **React Helmet** (title y meta por página) | `components/Seo.jsx` con `react-helmet-async`; título dinámico en el detalle de cada producto |
| 4 | **Búsqueda en tiempo real** | `/productos`: filtra con cada tecla por nombre, categoría o característica (sin importar tildes) |
| 4 | **Paginador** | `/productos`: 8 productos por página con `Pagination` de React-Bootstrap |
| 5 | Compatibilidad y limpieza | Build de Vite para navegadores modernos, diseño responsive, código y archivos sin uso eliminados, ESLint sin errores |

Búsqueda, categoría y página quedan en la URL (`/productos?q=rtx&categoria=Tarjetas+de+Video&pagina=2`),
así se pueden compartir y el botón *Atrás* del navegador funciona.

### Extras

- **Imágenes con ImgBB:** en el alta/edición se puede subir la imagen a ImgBB o pegar la URL de una ya subida.
- **Dólar oficial** en la NavBar y precio aproximado en pesos en el detalle ([dolarapi.com](https://dolarapi.com)).
- **Contacto con Formspree** (`@formspree/react`) y mapa de Google Maps del local.
- **Modo claro / oscuro** con `data-bs-theme` de Bootstrap.
- Perfil de usuario, checkout simulado, página 404, carrusel y `ScrollToTop`.

---

## Estructura

```
public/
  productos.json            catálogo inicial (para importar a Firestore)
  imagenes/                 logos, slider, equipo
src/
  App.jsx                   rutas
  firebase/config.js        inicialización de Firebase (Auth + Firestore)
  services/productos.js     CRUD de productos en Firestore
  context/                  CartContext/CartProvider, AuthContext/AuthProvider
  hooks/                    useCart, useAuth, useProductos, useDolar
  components/
    layout/                 Layout, Header, NavBar, Footer, TeamCard
    styled/                 estilos con styled-components
    Item, ItemList, ItemDetail, ItemCount, CartWidget, ConfirmModal, Estado, Seo, ProtectedRoute, ...
  pages/                    Home, ItemListContainer, ItemDetailContainer, Cart, Checkout,
                            Login, Registro, Perfil, Contacto, NotFound
  pages/admin/              AdminProductos (listado), ProductoForm (alta/edición)
  data/                     equipo, reseñas y marcas (JSON)
  utils/                    formato de precios, imgbb.js (subida de imágenes)
  styles/index.css          tema Mundo Gaming sobre Bootstrap 5
```

## Deploy

Publicado en **Vercel** (<https://react-tt-final-pi.vercel.app/>) desde la rama `main`; cada push a `main` genera un deploy nuevo. El dominio `react-tt-final-pi.vercel.app` está agregado en Firebase → Authentication → Dominios autorizados. `vercel.json` (y `public/_redirects` para Netlify)
redirigen todas las rutas a `index.html`, así no dan 404 al recargar.

## Tecnologías

React 19 · Vite · react-router-dom · Firebase (Auth + Firestore) · React-Bootstrap / Bootstrap 5 ·
styled-components · React Icons · react-helmet-async · React Toastify · @formspree/react
