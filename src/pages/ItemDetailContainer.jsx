import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import ItemDetail from '../components/ItemDetail.jsx'
import { Cargando, ErrorCarga } from '../components/Estado.jsx'
import Seo from '../components/Seo.jsx'
import { obtenerProducto } from '../services/productos.js'

/** Lee :id de la URL, busca ese producto en Firestore y muestra <ItemDetail />. */
function ItemDetailContainer() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true

    obtenerProducto(id)
      .then((p) => {
        if (!activo) return
        setProducto(p)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        if (activo) setError('No se pudo cargar el producto.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [id, intento])

  const reintentar = () => {
    setCargando(true)
    setIntento((n) => n + 1)
  }

  return (
    <section className="seccion">
      {producto && (
        <Seo
          titulo={producto.titulo}
          descripcion={`${producto.categoria}: ${producto.titulo}. ${producto.specs?.slice(0, 3).join(' · ')}`}
          imagen={producto.imagen}
        />
      )}
      <div className="container">
        {cargando ? (
          <Cargando texto="Cargando producto…" />
        ) : error ? (
          <ErrorCarga mensaje={error} onReintentar={reintentar} />
        ) : producto ? (
          <ItemDetail producto={producto} />
        ) : (
          <div className="vacio">
            <Seo titulo="Producto no encontrado" noIndex />
            <FaSearch className="vacio__icono" aria-hidden="true" />
            <h1 className="h3">Producto no encontrado</h1>
            <p className="text-suave">El producto que buscás no existe o ya no está disponible.</p>
            <Link to="/productos" className="btn btn-acento">
              Ver catálogo
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default ItemDetailContainer
