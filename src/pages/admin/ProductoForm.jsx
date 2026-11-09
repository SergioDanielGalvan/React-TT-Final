import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Cargando, ErrorCarga } from '../../components/Estado.jsx'
import Seo from '../../components/Seo.jsx'
import {
  actualizarProducto,
  crearProducto,
  generarId,
  mensajeFirestore,
  obtenerProducto,
} from '../../services/productos.js'
import { IMGBB_KEY, TAMANO_MAXIMO_MB, subirImagen, validarImagen } from '../../utils/imgbb.js'

const CATEGORIAS = ['Placas Madre', 'Tarjetas de Video', 'Gabinetes']

const FORM_VACIO = {
  titulo: '',
  categoria: CATEGORIAS[0],
  precio: '',
  specs: '',
  url: '',
  imagenUrl: '',
  destacado: false,
}

/** Pasa un producto del catálogo al formato del formulario. */
function aFormulario(p) {
  return {
    titulo: p.titulo,
    categoria: p.categoria,
    precio: String(p.precio),
    specs: p.specs.join('\n'),
    url: p.url ?? '',
    imagenUrl: p.imagen,
    destacado: !!p.destacado,
  }
}

function validar(form, archivo) {
  const errores = {}
  if (form.titulo.trim().length < 3) errores.titulo = 'El nombre debe tener al menos 3 caracteres.'
  const precio = Number(form.precio)
  if (!form.precio || Number.isNaN(precio) || precio <= 0) errores.precio = 'Ingresá un precio mayor a 0.'
  if (form.specs.split('\n').filter((s) => s.trim()).length === 0)
    errores.specs = 'Cargá al menos una característica.'
  if (form.url && !/^https?:\/\/.+/i.test(form.url.trim()))
    errores.url = 'La URL debe empezar con http:// o https://'

  if (archivo) {
    const e = validarImagen(archivo)
    if (e) errores.imagen = e
  } else if (!form.imagenUrl.trim()) {
    errores.imagen = 'Subí una imagen o pegá la URL de una.'
  } else if (!/^(https?:\/\/|\/)/i.test(form.imagenUrl.trim())) {
    errores.imagen = 'La URL de la imagen debe empezar con http(s):// o /'
  }
  return errores
}

/**
 * Alta (/admin/productos/nuevo) y edición (/admin/productos/editar/:id).
 * La imagen se sube a ImgBB, o se puede pegar la URL de una ya subida
 * (por ejemplo, del álbum de ImgBB).
 */
function FormularioProducto({ id }) {
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  // En edición, el producto se lee de Firestore.
  const [original, setOriginal] = useState(null)
  const [cargando, setCargando] = useState(esEdicion)
  const [errorCarga, setErrorCarga] = useState(null)
  const [intento, setIntento] = useState(0)

  const [form, setForm] = useState(FORM_VACIO)
  const [cargado, setCargado] = useState(!esEdicion)
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  // En edición, completa el formulario cuando llega el producto.
  // (Se hace al renderizar y una sola vez, sin useEffect.)
  if (esEdicion && !cargado && original) {
    setForm(aFormulario(original))
    setCargado(true)
  }

  useEffect(() => {
    if (!esEdicion) return
    let activo = true
    obtenerProducto(id)
      .then((p) => activo && setOriginal(p))
      .catch((err) => {
        console.error(err)
        if (activo) setErrorCarga('No se pudo cargar el producto.')
      })
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [esEdicion, id, intento])

  // Libera la URL temporal de la vista previa.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  if (esEdicion && cargando) return <Cargando texto="Cargando producto…" />
  if (esEdicion && errorCarga) {
    return (
      <section className="seccion">
        <div className="container">
          <ErrorCarga
            mensaje={errorCarga}
            onReintentar={() => {
              setErrorCarga(null)
              setCargando(true)
              setIntento((n) => n + 1)
            }}
          />
        </div>
      </section>
    )
  }
  if (esEdicion && !original) {
    return (
      <section className="seccion">
        <div className="container vacio">
          <h1 className="h3">Ese producto no existe</h1>
          <Link to="/admin/productos" className="btn btn-acento mt-2">Volver al panel</Link>
        </div>
      </section>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrores((er) => ({ ...er, [name]: undefined, ...(name === 'imagenUrl' && { imagen: undefined }) }))
  }

  const handleArchivo = (e) => {
    const elegido = e.target.files[0] ?? null
    setArchivo(elegido)
    setPreview(elegido ? URL.createObjectURL(elegido) : null)
    setErrores((er) => ({ ...er, imagen: elegido ? validarImagen(elegido) ?? undefined : undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const encontrados = validar(form, archivo)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      const idFinal = esEdicion ? id : generarId(form.titulo)

      // Si eligió un archivo, se sube a ImgBB; si no, se usa la URL del campo.
      const imagen = archivo ? (await subirImagen(archivo, idFinal)).url : form.imagenUrl.trim()

      const producto = {
        id: idFinal,
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        precio: Number(form.precio),
        url: form.url.trim(),
        imagen,
        specs: form.specs.split('\n').map((s) => s.trim()).filter(Boolean),
        destacado: form.destacado,
      }

      if (esEdicion) await actualizarProducto(producto)
      else await crearProducto(producto)

      toast.success(esEdicion ? 'Cambios guardados.' : `"${producto.titulo}" se dio de alta.`)
      navigate('/admin/productos')
    } catch (err) {
      console.error(err)
      // Errores de Firestore traen "code"; los de ImgBB, un mensaje propio.
      setErrorGeneral(err.code ? mensajeFirestore(err, 'guardar el producto') : err.message)
      setGuardando(false)
    }
  }

  const claseCampo = (campo) => `form-control ${errores[campo] ? 'is-invalid' : ''}`
  const imagenVista = preview ?? (form.imagenUrl.trim() || null)

  return (
    <section className="seccion">
      <Seo titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'} noIndex />
      <div className="container" style={{ maxWidth: 820 }}>
        <Link to="/admin/productos" className="text-suave">
          <FaArrowLeft className="me-1" aria-hidden="true" /> Volver al panel
        </Link>
        <h1 className="seccion__titulo mt-2">{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h1>
        {esEdicion && <p className="text-suave small">ID: <code>{id}</code></p>}

        <form className="mg-form mg-form--ancho mt-3" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="titulo">Nombre del producto</label>
            <input id="titulo" name="titulo" className={claseCampo('titulo')} value={form.titulo}
                   onChange={handleChange} placeholder="AORUS GeForce RTX 4070 Ti" />
            <div className="invalid-feedback">{errores.titulo}</div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-7">
              <label className="form-label" htmlFor="categoria">Categoría</label>
              <select id="categoria" name="categoria" className="form-select" value={form.categoria}
                      onChange={handleChange}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-sm-5">
              <label className="form-label" htmlFor="precio">Precio (USD)</label>
              <input id="precio" name="precio" type="number" min="0" step="0.01"
                     className={claseCampo('precio')} value={form.precio} onChange={handleChange}
                     placeholder="799" />
              <div className="invalid-feedback">{errores.precio}</div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="specs">Características (una por línea)</label>
            <textarea id="specs" name="specs" rows="4" className={claseCampo('specs')} value={form.specs}
                      onChange={handleChange} placeholder={'12 GB GDDR6X\nPCIe 4.0 x16\nTriple ventilador'} />
            <div className="invalid-feedback">{errores.specs}</div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="url">Página del fabricante (opcional)</label>
            <input id="url" name="url" type="url" className={claseCampo('url')} value={form.url}
                   onChange={handleChange} placeholder="https://www.gigabyte.com/..." />
            <div className="invalid-feedback">{errores.url}</div>
          </div>

          <fieldset className="admin-imagen mb-3">
            <legend className="form-label">Imagen</legend>
            <div className="row g-3 align-items-start">
              <div className="col-md-7">
                <label className="form-label small" htmlFor="imagen">
                  Subir a ImgBB (JPG, PNG, WEBP o GIF · máx. {TAMANO_MAXIMO_MB} MB)
                </label>
                <input id="imagen" type="file" accept="image/*"
                       className={claseCampo('imagen')} onChange={handleArchivo} disabled={!IMGBB_KEY} />
                {!IMGBB_KEY && (
                  <p className="small text-warning mt-1 mb-0">
                    Subida deshabilitada: falta <code>VITE_IMGBB_KEY</code>.
                  </p>
                )}

                <label className="form-label small mt-3" htmlFor="imagenUrl">
                  …o pegá la URL de una imagen ya subida
                </label>
                <input id="imagenUrl" name="imagenUrl" className={claseCampo('imagen')}
                       value={form.imagenUrl} onChange={handleChange} disabled={!!archivo}
                       placeholder="https://i.ibb.co/.../imagen.jpg" />
                <div className="invalid-feedback">{errores.imagen}</div>
              </div>
              <div className="col-md-5">
                {imagenVista ? (
                  <img src={imagenVista} alt="Vista previa" className="admin-preview" />
                ) : (
                  <div className="admin-preview admin-preview--vacia">Sin imagen</div>
                )}
              </div>
            </div>
          </fieldset>

          <div className="form-check mb-4">
            <input id="destacado" name="destacado" type="checkbox" className="form-check-input"
                   checked={form.destacado} onChange={handleChange} />
            <label className="form-check-label" htmlFor="destacado">
              Mostrar en "Productos destacados" de la portada
            </label>
          </div>

          {errorGeneral && <div className="alert alert-danger py-2">{errorGeneral}</div>}

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-acento" disabled={guardando}>
              {guardando ? (
                <>
                  <Spinner size="sm" className="me-2" aria-hidden="true" />
                  {archivo ? 'Subiendo imagen…' : 'Guardando…'}
                </>
              ) : (
                <>
                  <FaSave className="me-2" aria-hidden="true" />
                  {esEdicion ? 'Guardar cambios' : 'Dar de alta'}
                </>
              )}
            </button>
            <Link to="/admin/productos" className="btn btn-borde">
              <FaTimes className="me-1" aria-hidden="true" /> Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

/** Se remonta con key al pasar de un producto a otro (o a "nuevo"). */
function ProductoForm() {
  const { id } = useParams()
  return <FormularioProducto key={id ?? 'nuevo'} id={id} />
}

export default ProductoForm
