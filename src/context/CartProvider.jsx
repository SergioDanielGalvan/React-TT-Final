import { useEffect, useState } from 'react'
import { CartContext } from './CartContext.js'
import { useAuth } from '../hooks/useAuth.js'

/*
  Carrito por usuario.
  - Sin sesión se usa el carrito "invitado" (clave mg-carrito).
  - Cada cuenta tiene el suyo (mg-carrito-<uid>), guardado en localStorage:
    al cerrar sesión el carrito queda vacío y al volver a ingresar se recupera.
  - Si alguien arma el carrito sin sesión y después ingresa, esos productos
    se suman a los de su cuenta (no se pierde la compra a medio hacer).
*/
const CLAVE_INVITADO = 'mg-carrito'
const clave = (uid) => (uid ? `${CLAVE_INVITADO}-${uid}` : CLAVE_INVITADO)

/** Lee un carrito guardado; si no hay (o el storage falla), devuelve []. */
function leer(uid) {
  try {
    const guardado = localStorage.getItem(clave(uid))
    return guardado ? JSON.parse(guardado) : []
  } catch {
    return []
  }
}

/** Suma los ítems de "extra" a "base" (si un producto se repite, suma cantidades). */
function fusionar(base, extra) {
  const resultado = base.map((item) => ({ ...item }))
  extra.forEach((item) => {
    const existente = resultado.find((r) => r.id === item.id)
    if (existente) existente.cantidad += item.cantidad
    else resultado.push({ ...item })
  })
  return resultado
}

function CartProvider({ children }) {
  const { usuario, cargando } = useAuth()
  // undefined = Firebase todavía está verificando la sesión
  const uid = cargando ? undefined : (usuario?.uid ?? null)

  // useState controla de quién es el carrito y sus productos.
  const [estado, setEstado] = useState(() => ({ duenio: null, items: leer(null) }))

  // Cambió el usuario (ingresó, salió o cambió de cuenta): se carga su carrito.
  // Se ajusta durante el render, como recomienda React para estado que
  // depende de otro valor, así nunca se ve el carrito de otra persona.
  if (uid !== undefined && uid !== estado.duenio) {
    const items = uid
      ? fusionar(leer(uid), estado.duenio === null ? estado.items : [])
      : leer(null)
    setEstado({ duenio: uid, items })
  }

  // Cada cambio se persiste en la clave del dueño actual.
  useEffect(() => {
    try {
      localStorage.setItem(clave(estado.duenio), JSON.stringify(estado.items))
      // Con sesión iniciada, el carrito invitado ya se sumó a la cuenta.
      if (estado.duenio) localStorage.removeItem(CLAVE_INVITADO)
    } catch {
      /* modo privado o storage lleno: el carrito sigue funcionando en memoria */
    }
  }, [estado])

  const cart = estado.items
  const setCart = (cambio) => setEstado((e) => ({ ...e, items: cambio(e.items) }))

  /** Agrega un producto. Si ya estaba, suma la cantidad. */
  const addToCart = (producto, cantidad = 1) => {
    setCart((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item,
        )
      }
      const { id, titulo, precio, imagen, categoria } = producto
      return [...prev, { id, titulo, precio, imagen, categoria, cantidad }]
    })
  }

  /** Cambia la cantidad de un ítem; si llega a 0 lo quita. */
  const updateQuantity = (id, cantidad) => {
    setCart((prev) =>
      cantidad <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, cantidad } : item)),
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setCart(() => [])

  const isInCart = (id) => cart.some((item) => item.id === id)

  // Valores derivados: se recalculan en cada render, siempre al día.
  const totalQuantity = cart.reduce((acc, item) => acc + item.cantidad, 0)
  const totalPrice = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        totalQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider
