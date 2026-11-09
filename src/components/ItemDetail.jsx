import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCartPlus, FaExternalLinkAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import ItemCount from './ItemCount.jsx'
import { useCart } from '../hooks/useCart.js'
import { useDolar } from '../hooks/useDolar.js'
import { formatearPesos, formatearPrecio } from '../utils/formato.js'

/** Vista completa de un producto, con el botón que llama a addToCart. */
function ItemDetail({ producto }) {
  const { addToCart, cart } = useCart()
  const dolar = useDolar()
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  const enCarrito = cart.find((item) => item.id === producto.id)?.cantidad ?? 0

  const handleAgregar = () => {
    addToCart(producto, cantidad)
    toast.success(`Agregaste ${cantidad} × ${producto.titulo} al carrito.`)
    setAgregado(true)
    setCantidad(1)
  }

  return (
    <article className="detalle row g-0">
      <div className="col-12 col-lg-6">
        <div className="detalle__media">
          <img src={producto.imagen} alt={producto.titulo} />
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="detalle__cuerpo">
          <span className="seccion__eyebrow">{producto.categoria}</span>
          <h1 className="detalle__titulo">{producto.titulo}</h1>

          <p className="detalle__precio mb-0">{formatearPrecio(producto.precio)}</p>
          {dolar && (
            <p className="text-suave small">
              ≈ {formatearPesos(producto.precio * dolar.venta)} al dólar oficial
            </p>
          )}

          <ul className="detalle__specs">
            {producto.specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          {producto.url && (
            <p>
              <a href={producto.url} target="_blank" rel="noopener noreferrer">
                Ver ficha en el sitio del fabricante <FaExternalLinkAlt className="ms-1" aria-hidden="true" />
              </a>
            </p>
          )}

          <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
            <ItemCount cantidad={cantidad} setCantidad={setCantidad} />
            <button className="btn btn-acento" onClick={handleAgregar}>
              <FaCartPlus className="me-2" aria-hidden="true" />
              Agregar al carrito
            </button>
          </div>

          {agregado && (
            <div className="alert alert-success d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 mb-0" role="status">
              <span>✓ Listo. Tenés {enCarrito} en el carrito.</span>
              <Link to="/carrito" className="alert-link">
                Ir al carrito →
              </Link>
            </div>
          )}

          <p className="mt-4 mb-0">
            <Link to="/productos" className="text-suave">
              <FaArrowLeft className="me-1" aria-hidden="true" /> Volver al catálogo
            </Link>
          </p>
        </div>
      </div>
    </article>
  )
}

export default ItemDetail
