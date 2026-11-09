import { useCallback, useEffect, useState } from 'react'
import { obtenerProductos } from '../services/productos.js'

/**
 * Trae el catálogo desde Firestore.
 * Devuelve { productos, cargando, error, recargar }.
 */
export function useProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let activo = true // evita actualizar el estado si el componente se desmontó

    obtenerProductos()
      .then((lista) => {
        if (!activo) return
        setProductos(lista)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        if (activo) setError('No se pudieron cargar los productos.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [version])

  // Vuelve a consultar (después de un alta/baja o al tocar "Reintentar").
  const recargar = useCallback(() => {
    setCargando(true)
    setVersion((v) => v + 1)
  }, [])

  return { productos, cargando, error, recargar }
}
