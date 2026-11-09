import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Form, InputGroup, Table } from 'react-bootstrap'
import { FaDownload, FaEdit, FaFileImport, FaPlus, FaSearch, FaStar, FaTrashAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Cargando, ErrorCarga } from '../../components/Estado.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import Seo from '../../components/Seo.jsx'
import { useProductos } from '../../hooks/useProductos.js'
import { eliminarProducto, importarCatalogo, mensajeFirestore } from '../../services/productos.js'
import { formatearPrecio } from '../../utils/formato.js'

/** Archivo con el catálogo inicial (carga de Firestore con un clic). */
const CATALOGO_INICIAL = '/productos.json'

/** Descarga el catálogo actual como JSON (copia de respaldo). */
function descargarJSON(productos) {
  const blob = new Blob([JSON.stringify(productos, null, 2)], { type: 'application/json' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(blob)
  enlace.download = 'productos-firestore.json'
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

/**
 * Panel de gestión (ruta protegida, solo admin): listado (Read) con acceso
 * a alta, edición y baja. Las bajas piden confirmación en un modal.
 */
function AdminProductos() {
  const { productos, cargando, error, recargar } = useProductos()
  const [busqueda, setBusqueda] = useState('')
  const [aEliminar, setAEliminar] = useState(null)
  const [confirmarImport, setConfirmarImport] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const filtrados = productos.filter((p) =>
    `${p.titulo} ${p.categoria}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
  )

  const borrar = async () => {
    setProcesando(true)
    try {
      await eliminarProducto(aEliminar.id)
      toast.success(`"${aEliminar.titulo}" se eliminó.`)
      setAEliminar(null)
      recargar()
    } catch (err) {
      console.error(err)
      toast.error(mensajeFirestore(err, 'eliminar el producto'))
    } finally {
      setProcesando(false)
    }
  }

  const importar = async () => {
    setProcesando(true)
    try {
      const r = await fetch(CATALOGO_INICIAL)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const cantidad = await importarCatalogo(await r.json())
      toast.success(`Se cargaron ${cantidad} productos en Firestore.`)
      setConfirmarImport(false)
      recargar()
    } catch (err) {
      console.error(err)
      toast.error(mensajeFirestore(err, 'importar el catálogo'))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <section className="seccion">
      <Seo titulo="Gestión de productos" noIndex />
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span className="seccion__eyebrow">Administración</span>
            <h1 className="seccion__titulo mb-0">Productos</h1>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/productos/nuevo" className="btn btn-acento">
              <FaPlus className="me-1" aria-hidden="true" /> Nuevo producto
            </Link>
            <Button variant="" className="btn-borde" onClick={() => setConfirmarImport(true)} disabled={cargando}>
              <FaFileImport className="me-1" aria-hidden="true" /> Importar catálogo inicial
            </Button>
            <Button
              variant=""
              className="btn-borde"
              onClick={() => descargarJSON(productos)}
              disabled={cargando || productos.length === 0}
            >
              <FaDownload className="me-1" aria-hidden="true" /> Exportar JSON
            </Button>
          </div>
        </div>

        <p className="text-suave small">
          Los cambios se guardan en <strong>Cloud Firestore</strong> y se ven al instante en el sitio publicado.
        </p>

        <InputGroup className="mb-3 admin-buscador">
          <InputGroup.Text>
            <FaSearch aria-hidden="true" />
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Buscar por nombre o categoría…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
        </InputGroup>

        {cargando ? (
          <Cargando texto="Cargando catálogo…" />
        ) : error ? (
          <ErrorCarga mensaje={error} onReintentar={recargar} />
        ) : (
          <div className="admin-tabla">
            <Table responsive className="align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoría</th>
                  <th scope="col" className="text-end">Precio</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={p.imagen} alt="" className="admin-miniatura" />
                        <div>
                          <Link to={`/producto/${p.id}`} className="carrito-fila__titulo">
                            {p.titulo}
                          </Link>
                          {p.destacado && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              <FaStar aria-hidden="true" /> Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-suave">{p.categoria}</td>
                    <td className="text-end">{formatearPrecio(p.precio)}</td>
                    <td className="text-end text-nowrap">
                      <Link
                        to={`/admin/productos/editar/${p.id}`}
                        className="btn btn-sm btn-borde me-2"
                        title="Editar"
                      >
                        <FaEdit aria-hidden="true" />
                        <span className="d-none d-md-inline ms-1">Editar</span>
                      </Link>
                      <Button size="sm" variant="outline-danger" onClick={() => setAEliminar(p)} title="Eliminar">
                        <FaTrashAlt aria-hidden="true" />
                        <span className="d-none d-md-inline ms-1">Eliminar</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-suave py-4">
                      {productos.length === 0
                        ? 'El catálogo está vacío. Usá "Importar catálogo inicial" para cargar los productos.'
                        : 'No hay productos que coincidan con la búsqueda.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
        <p className="text-suave small mt-2">{productos.length} productos en total.</p>
      </div>

      {/* Modal de confirmación antes de eliminar */}
      <ConfirmModal
        show={!!aEliminar}
        titulo="Eliminar producto"
        procesando={procesando}
        onConfirmar={borrar}
        onCancelar={() => setAEliminar(null)}
      >
        ¿Seguro que querés eliminar <strong>{aEliminar?.titulo}</strong>? Esta acción no se puede deshacer.
      </ConfirmModal>

      <ConfirmModal
        show={confirmarImport}
        titulo="Importar catálogo inicial"
        textoConfirmar="Importar"
        variante="primary"
        procesando={procesando}
        onConfirmar={importar}
        onCancelar={() => setConfirmarImport(false)}
      >
        Se van a cargar en Firestore los productos de <code>productos.json</code>. Si alguno ya existe con el mismo
        ID, se sobrescribe con los datos originales.
      </ConfirmModal>

    </section>
  )
}

export default AdminProductos
