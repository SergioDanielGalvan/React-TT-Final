import { Link, Navigate, useLocation } from 'react-router-dom'
import { FaLock } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth.js'
import { Cargando } from './Estado.jsx'
import Seo from './Seo.jsx'

/**
 * Envuelve rutas que requieren sesión.
 * - Mientras Firebase confirma la sesión: spinner (evita un rebote a /login).
 * - Sin sesión: redirige a /login recordando a dónde quería ir.
 * - Con soloAdmin y un usuario que no es admin: muestra "acceso denegado".
 */
function ProtectedRoute({ children, soloAdmin = false }) {
  const { usuario, cargando, esAdmin } = useAuth()
  const location = useLocation()

  if (cargando) return <Cargando texto="Verificando sesión…" />

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (soloAdmin && !esAdmin) {
    return (
      <section className="seccion text-center">
        <Seo titulo="Acceso denegado" noIndex />
        <div className="container">
          <p className="no-encontrado__codigo">403</p>
          <h1 className="h3">
            <FaLock className="me-2" aria-hidden="true" />
            Acceso solo para administradores
          </h1>
          <p className="text-suave">
            Ingresaste como <strong>{usuario.correo}</strong>, que no tiene permisos de administración.
          </p>
          <Link to="/" className="btn btn-acento">
            Volver al inicio
          </Link>
        </div>
      </section>
    )
  }

  return children
}

export default ProtectedRoute
