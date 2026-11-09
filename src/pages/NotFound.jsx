import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

function NotFound() {
  return (
    <section className="seccion text-center">
      <Seo titulo="Página no encontrada" noIndex />
      <div className="container">
        <p className="no-encontrado__codigo">404</p>
        <h1 className="h3">Esta página se quedó sin señal</h1>
        <p className="text-suave">La ruta que buscás no existe.</p>
        <Link to="/" className="btn btn-acento">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}

export default NotFound
