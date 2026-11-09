import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCheckCircle } from 'react-icons/fa'
import Seo from '../components/Seo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCart } from '../hooks/useCart.js'
import { formatearPrecio } from '../utils/formato.js'

/** Ruta protegida: confirma la compra (simulada) del usuario logueado. */
function Checkout() {
  const { usuario } = useAuth()
  const { cart, totalPrice, totalQuantity, clearCart } = useCart()
  const [orden, setOrden] = useState(null)

  const confirmar = () => {
    // Sin backend: generamos un número de orden y vaciamos el carrito.
    setOrden({
      numero: `MG-${Date.now().toString().slice(-6)}`,
      total: totalPrice,
      unidades: totalQuantity,
    })
    clearCart()
  }

  if (orden) {
    return (
      <section className="seccion">
        <div className="container">
          <div className="vacio">
            <FaCheckCircle className="vacio__icono text-success" aria-hidden="true" />
            <h1 className="h3">¡Gracias por tu compra, {usuario.nombre}!</h1>
            <p className="text-suave mb-1">
              Orden <strong>{orden.numero}</strong> · {orden.unidades} productos · {formatearPrecio(orden.total)}
            </p>
            <p className="text-suave">Te enviamos el detalle a {usuario.correo} (simulado).</p>
            <Link to="/productos" className="btn btn-acento">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (cart.length === 0) {
    return (
      <section className="seccion">
        <div className="container">
          <div className="vacio">
            <h1 className="h3">No hay nada para pagar</h1>
            <Link to="/productos" className="btn btn-acento mt-2">
              Ver productos
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="seccion">
      <Seo titulo="Confirmar compra" noIndex />
      <div className="container" style={{ maxWidth: 640 }}>
        <span className="seccion__eyebrow">Checkout</span>
        <h1 className="seccion__titulo">Confirmar compra</h1>
        <p className="text-suave">Comprando como <strong>{usuario.correo}</strong></p>

        <ul className="list-group mb-3">
          {cart.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between gap-3">
              <span>
                {item.cantidad} × {item.titulo}
              </span>
              <span>{formatearPrecio(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>

        <div className="carrito-total mb-4">
          <span>Total</span>
          <span>{formatearPrecio(totalPrice)}</span>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-acento" onClick={confirmar}>
            <FaCheckCircle className="me-2" aria-hidden="true" />
            Confirmar compra (simulada)
          </button>
          <Link to="/carrito" className="btn btn-borde">
            Volver al carrito
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Checkout
