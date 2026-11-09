import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from '../ScrollToTop.jsx'
import Seo from '../Seo.jsx'

/**
 * Estructura común a todas las páginas: Header (con la NavBar),
 * el contenido de la ruta activa (<Outlet />) y el Footer.
 * ToastContainer muestra los avisos (agregado al carrito, alta, baja…).
 */
function Layout() {
  return (
    <>
      <Seo />
      <ScrollToTop />
      <Header />
      <main className="mg-main">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={2500} theme="colored" newestOnTop />
    </>
  )
}

export default Layout
