import { useSearchParams } from 'react-router-dom'
import { Form, InputGroup, Pagination, Button } from 'react-bootstrap'
import { FaSearch, FaTimes } from 'react-icons/fa'
import ItemList from '../components/ItemList.jsx'
import { Cargando, ErrorCarga } from '../components/Estado.jsx'
import Seo from '../components/Seo.jsx'
import { useProductos } from '../hooks/useProductos.js'

const POR_PAGINA = 8

/** Normaliza para buscar sin importar mayúsculas ni tildes. */
const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/**
 * Contenedor del catálogo: trae los productos de Firestore (useProductos),
 * maneja carga y error, y delega el dibujo en <ItemList /> → <Item />.
 *
 * - En /productos: búsqueda en tiempo real (?q=), filtro por categoría
 *   (?categoria=) y paginador (?pagina=). Todo vive en la URL, así una
 *   búsqueda se puede compartir o volver atrás con el navegador.
 * - En la Home se usa con soloDestacados para la fila de destacados.
 */
function ItemListContainer({ soloDestacados = false }) {
  const { productos, cargando, error, recargar } = useProductos()
  const [params, setParams] = useSearchParams()

  const categoria = soloDestacados ? null : params.get('categoria')
  const busqueda = soloDestacados ? '' : (params.get('q') ?? '')
  const paginaPedida = Number(params.get('pagina')) || 1

  // Cambia un parámetro de la URL; al buscar o filtrar se vuelve a la página 1.
  const actualizar = (cambios) => {
    const nuevos = new URLSearchParams(params)
    Object.entries(cambios).forEach(([k, v]) => (v ? nuevos.set(k, v) : nuevos.delete(k)))
    if (!('pagina' in cambios)) nuevos.delete('pagina')
    setParams(nuevos, { replace: 'q' in cambios }) // no llena el historial con cada tecla
  }

  const categorias = [...new Set(productos.map((p) => p.categoria))]

  let visibles = productos
  if (soloDestacados) {
    visibles = productos.filter((p) => p.destacado)
  } else {
    if (categoria) visibles = visibles.filter((p) => p.categoria === categoria)
    const termino = normalizar(busqueda.trim())
    if (termino) {
      visibles = visibles.filter((p) =>
        normalizar(`${p.titulo} ${p.categoria} ${(p.specs ?? []).join(' ')}`).includes(termino),
      )
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pagina = Math.min(Math.max(1, paginaPedida), totalPaginas)
  const deLaPagina = soloDestacados ? visibles : visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const irAPagina = (n) => {
    actualizar({ pagina: n > 1 ? String(n) : null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const contenido = cargando ? (
    <Cargando texto={soloDestacados ? 'Cargando destacados…' : 'Cargando productos…'} />
  ) : error ? (
    <ErrorCarga mensaje={error} onReintentar={recargar} />
  ) : (
    <ItemList
      productos={deLaPagina}
      columnas={soloDestacados ? { xs: 12, sm: 6, lg: 4 } : undefined}
      marcarDestacados={!soloDestacados}
      vacio={
        productos.length === 0
          ? 'Todavía no hay productos cargados en el catálogo.'
          : `No encontramos productos para "${busqueda}"${categoria ? ` en ${categoria}` : ''}.`
      }
    />
  )

  // En la Home solo devolvemos la grilla; la sección la arma Home.jsx.
  if (soloDestacados) return contenido

  return (
    <section className="seccion">
      <Seo
        titulo={categoria ?? 'Productos'}
        descripcion={`Catálogo de Mundo Gaming${categoria ? `: ${categoria}` : ''}. Placas madre, tarjetas de video y gabinetes.`}
      />
      <div className="container">
        <span className="seccion__eyebrow">Catálogo</span>
        <h1 className="seccion__titulo">{categoria ?? 'Todos los productos'}</h1>
        <p className="text-suave mb-4">Elegí un producto para ver su detalle y agregarlo al carrito.</p>

        {!cargando && !error && productos.length > 0 && (
          <>
            {/* Búsqueda en tiempo real: filtra con cada tecla */}
            <InputGroup className="buscador mb-3" role="search">
              <InputGroup.Text>
                <FaSearch aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Buscar por nombre, categoría o característica…"
                value={busqueda}
                onChange={(e) => actualizar({ q: e.target.value })}
                aria-label="Buscar productos"
              />
              {busqueda && (
                <Button variant="outline-secondary" onClick={() => actualizar({ q: null })} aria-label="Limpiar búsqueda">
                  <FaTimes aria-hidden="true" />
                </Button>
              )}
            </InputGroup>

            <div className="filtros" role="group" aria-label="Filtrar por categoría">
              <button
                className={`btn btn-sm btn-borde ${!categoria ? 'active' : ''}`}
                onClick={() => actualizar({ categoria: null })}
              >
                Todos ({productos.length})
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  className={`btn btn-sm btn-borde ${categoria === c ? 'active' : ''}`}
                  onClick={() => actualizar({ categoria: c })}
                >
                  {c} ({productos.filter((p) => p.categoria === c).length})
                </button>
              ))}
            </div>

            <p className="text-suave small mb-3" aria-live="polite">
              {visibles.length === 1 ? '1 producto' : `${visibles.length} productos`}
              {totalPaginas > 1 && ` · página ${pagina} de ${totalPaginas}`}
            </p>
          </>
        )}

        {contenido}

        {!cargando && !error && totalPaginas > 1 && (
          <Pagination className="mg-paginador justify-content-center mt-4" aria-label="Paginación del catálogo">
            <Pagination.Prev disabled={pagina === 1} onClick={() => irAPagina(pagina - 1)} aria-label="Página anterior" />
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <Pagination.Item key={n} active={n === pagina} onClick={() => irAPagina(n)}>
                {n}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={pagina === totalPaginas}
              onClick={() => irAPagina(pagina + 1)}
              aria-label="Página siguiente"
            />
          </Pagination>
        )}
      </div>
    </section>
  )
}

export default ItemListContainer
