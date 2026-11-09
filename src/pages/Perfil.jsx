import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from 'react-bootstrap'
import { FaUserCircle, FaSignOutAlt, FaTools, FaShoppingCart } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth.js'
import { useCart } from '../hooks/useCart.js'
import Seo from '../components/Seo.jsx'

/** Ruta protegida: datos de la cuenta del usuario logueado. */
function Perfil() {
  const { usuario, esAdmin, logout } = useAuth()
  const { totalQuantity } = useCart()
  const navigate = useNavigate()

  const salir = async () => {
    await logout()
    navigate('/')
  }

  return (
    <section className="seccion">
      <Seo titulo="Mi perfil" noIndex />
      <div className="container" style={{ maxWidth: 560 }}>
        <span className="seccion__eyebrow">Mi cuenta</span>
        <h1 className="seccion__titulo">Perfil</h1>

        <Card className="mg-card-perfil mt-3">
          <Card.Body className="text-center p-4">
            <FaUserCircle className="perfil__avatar mb-2" aria-hidden="true" />
            <h2 className="h4 mb-1">{usuario.nombre}</h2>
            <p className="text-suave mb-2">{usuario.correo}</p>
            <Badge bg={esAdmin ? 'info' : 'secondary'}>{esAdmin ? 'Administrador' : 'Cliente'}</Badge>

            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
              <Link to="/carrito" className="btn btn-borde">
                <FaShoppingCart className="me-2" aria-hidden="true" />
                Mi carrito ({totalQuantity})
              </Link>
              {esAdmin && (
                <Link to="/admin/productos" className="btn btn-borde">
                  <FaTools className="me-2" aria-hidden="true" />
                  Gestión de productos
                </Link>
              )}
              <Button variant="outline-danger" onClick={salir}>
                <FaSignOutAlt className="me-2" aria-hidden="true" />
                Cerrar sesión
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </section>
  )
}

export default Perfil
