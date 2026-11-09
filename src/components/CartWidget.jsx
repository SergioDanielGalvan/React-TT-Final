import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../hooks/useCart.js'

/** Ícono del carrito con la cantidad total, leída del CartContext. */
function CartWidget({ onClick }) {
  const { totalQuantity } = useCart()
  const [animar, setAnimar] = useState(false)
  const anterior = useRef(totalQuantity)

  // Pequeño "pop" del contador cada vez que cambia la cantidad.
  useEffect(() => {
    if (totalQuantity === anterior.current) return
    anterior.current = totalQuantity
    setAnimar(true)
    const t = setTimeout(() => setAnimar(false), 300)
    return () => clearTimeout(t)
  }, [totalQuantity])

  return (
    <Link
      to="/carrito"
      className="btn btn-acento btn-sm cart-widget"
      aria-label={`Carrito: ${totalQuantity} productos`}
      onClick={onClick}
    >
      <FaShoppingCart aria-hidden="true" />
      <span className="d-none d-sm-inline">Carrito</span>
      {totalQuantity > 0 && (
        <span className={`cart-widget__badge ${animar ? 'pop' : ''}`}>{totalQuantity}</span>
      )}
    </Link>
  )
}

export default CartWidget
