import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from 'react-bootstrap'
import { FaUserCircle, FaSignOutAlt, FaTools, FaShoppingCart, FaUserTimes, FaUsers } from 'react-icons/fa'
import { toast } from 'react-toastify'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCart } from '../hooks/useCart.js'
import Seo from '../components/Seo.jsx'

/** Ruta protegida: datos de la cuenta del usuario logueado. */
function Perfil() {
  const { usuario, esAdmin, logout, eliminarCuenta } = useAuth()
  const [confirmarBaja, setConfirmarBaja] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const { totalQuantity } = useCart()
  const navigate = useNavigate()

  const salir = async () => {
    await logout()
    navigate('/')
  }

  const darseDeBaja = async () => {
    setProcesando(true)
    // Primero vamos al inicio: /perfil es una ruta protegida y, al borrarse
    // la sesión, mandaría a /login.
    navigate('/', { replace: true })
    try {
      await eliminarCuenta()
      toast.info('Tu cuenta se eliminó.')
    } catch (err) {
      toast.error(err.message)
    }
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
                <>
                  <Link to="/admin/productos" className="btn btn-borde">
                    <FaTools className="me-2" aria-hidden="true" />
                    Gestión de productos
                  </Link>
                  <Link to="/admin/usuarios" className="btn btn-borde">
                    <FaUsers className="me-2" aria-hidden="true" />
                    Gestión de usuarios
                  </Link>
                </>
              )}
              <Button variant="outline-danger" onClick={salir}>
                <FaSignOutAlt className="me-2" aria-hidden="true" />
                Cerrar sesión
              </Button>
            </div>
          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <Button variant="link" className="text-danger small" onClick={() => setConfirmarBaja(true)}>
            <FaUserTimes className="me-1" aria-hidden="true" />
            Eliminar mi cuenta
          </Button>
        </div>

        <ConfirmModal
          show={confirmarBaja}
          titulo="Eliminar mi cuenta"
          textoConfirmar="Eliminar mi cuenta"
          procesando={procesando}
          onConfirmar={darseDeBaja}
          onCancelar={() => setConfirmarBaja(false)}
        >
          Se borran tu acceso ({usuario.correo}), tus datos y tu carrito. Esta acción no se puede deshacer.
          {esAdmin && (
            <p className="mt-2 mb-0 text-warning">
              Sos administrador: asegurate de que quede otro admin antes de eliminar tu cuenta.
            </p>
          )}
        </ConfirmModal>
      </div>
    </section>
  )
}

export default Perfil
