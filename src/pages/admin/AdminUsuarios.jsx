import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Form, InputGroup, Table } from 'react-bootstrap'
import { FaSearch, FaTrashAlt, FaUserCog, FaUserShield } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Cargando, ErrorCarga } from '../../components/Estado.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import AdminTabs from '../../components/AdminTabs.jsx'
import Seo from '../../components/Seo.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { cambiarRol, eliminarDatosUsuario, obtenerUsuarios } from '../../services/usuarios.js'
import { mensajeFirestore } from '../../services/productos.js'

const fecha = (d) => (d ? d.toLocaleDateString('es-AR') : '—')

/**
 * Gestión de usuarios registrados (ruta protegida, solo admin):
 * listado (Read), cambio de rol (Update) y borrado de datos (Delete).
 * El alta (Create) la hace cada persona desde /registro.
 */
function AdminUsuarios() {
  const { usuario: yo } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [accion, setAccion] = useState(null) // { tipo: 'rol' | 'borrar', usuario }
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    let activo = true
    obtenerUsuarios()
      .then((lista) => {
        if (!activo) return
        setUsuarios(lista)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        if (activo) setError('No se pudieron cargar los usuarios.')
      })
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [version])

  const recargar = () => {
    setCargando(true)
    setVersion((v) => v + 1)
  }

  const termino = busqueda.trim().toLowerCase()
  const filtrados = usuarios.filter((u) => `${u.nombre} ${u.correo}`.toLowerCase().includes(termino))
  const admins = usuarios.filter((u) => u.rol === 'admin').length

  const confirmar = async () => {
    const { tipo, usuario: u } = accion
    setProcesando(true)
    try {
      if (tipo === 'rol') {
        const nuevo = u.rol === 'admin' ? 'cliente' : 'admin'
        await cambiarRol(u.uid, nuevo)
        toast.success(`${u.nombre} ahora es ${nuevo}.`)
      } else {
        await eliminarDatosUsuario(u.uid)
        toast.success(`Se eliminaron los datos de ${u.nombre}.`)
      }
      setAccion(null)
      recargar()
    } catch (err) {
      console.error(err)
      toast.error(mensajeFirestore(err, tipo === 'rol' ? 'cambiar el rol' : 'eliminar el usuario'))
    } finally {
      setProcesando(false)
    }
  }

  const u = accion?.usuario
  const aAdmin = u?.rol !== 'admin'

  return (
    <section className="seccion">
      <Seo titulo="Gestión de usuarios" noIndex />
      <div className="container">
        <span className="seccion__eyebrow">Administración</span>
        <h1 className="seccion__titulo">Usuarios</h1>
        <AdminTabs />

        <p className="text-suave small">
          Usuarios registrados en el sitio. Los nuevos se dan de alta solos desde <strong>Crear cuenta</strong> con rol
          cliente.
        </p>

        <InputGroup className="mb-3 admin-buscador">
          <InputGroup.Text>
            <FaSearch aria-hidden="true" />
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Buscar por nombre o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar usuarios"
          />
        </InputGroup>

        {cargando ? (
          <Cargando texto="Cargando usuarios…" />
        ) : error ? (
          <ErrorCarga mensaje={error} onReintentar={recargar} />
        ) : (
          <div className="admin-tabla">
            <Table responsive className="align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Alta</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((usr) => {
                  const soyYo = usr.uid === yo.uid
                  return (
                    <tr key={usr.uid}>
                      <td>
                        <strong>{usr.nombre}</strong>
                        {soyYo && <span className="text-suave small"> (vos)</span>}
                        <div className="text-suave small">{usr.correo}</div>
                      </td>
                      <td>
                        <Badge bg={usr.rol === 'admin' ? 'info' : 'secondary'}>
                          {usr.rol === 'admin' ? 'Administrador' : 'Cliente'}
                        </Badge>
                      </td>
                      <td className="text-suave">{fecha(usr.creado)}</td>
                      <td className="text-end text-nowrap">
                        <Button
                          size="sm"
                          variant=""
                          className="btn-borde me-2"
                          disabled={soyYo}
                          title={soyYo ? 'No podés cambiar tu propio rol' : 'Cambiar rol'}
                          onClick={() => setAccion({ tipo: 'rol', usuario: usr })}
                        >
                          {usr.rol === 'admin' ? <FaUserCog aria-hidden="true" /> : <FaUserShield aria-hidden="true" />}
                          <span className="d-none d-md-inline ms-1">
                            {usr.rol === 'admin' ? 'Pasar a cliente' : 'Hacer admin'}
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={soyYo}
                          title={soyYo ? 'Tu cuenta se elimina desde Mi perfil' : 'Eliminar datos'}
                          onClick={() => setAccion({ tipo: 'borrar', usuario: usr })}
                        >
                          <FaTrashAlt aria-hidden="true" />
                          <span className="d-none d-md-inline ms-1">Eliminar</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-suave py-4">
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
        <p className="text-suave small mt-2">
          {usuarios.length} usuarios · {admins} {admins === 1 ? 'administrador' : 'administradores'}
        </p>

        <Alert variant="secondary" className="small mt-3">
          <strong>Eliminar</strong> borra los datos del usuario en el sitio (nombre y rol). Su cuenta de acceso de
          Firebase queda: si vuelve a ingresar, entra como cliente nuevo. Para borrar también el acceso: Consola de
          Firebase → Authentication → Usuarios, o el propio usuario desde <em>Mi perfil → Eliminar mi cuenta</em>.
        </Alert>
      </div>

      <ConfirmModal
        show={!!accion}
        titulo={accion?.tipo === 'rol' ? 'Cambiar rol' : 'Eliminar usuario'}
        textoConfirmar={accion?.tipo === 'rol' ? (aAdmin ? 'Hacer admin' : 'Pasar a cliente') : 'Eliminar'}
        variante={accion?.tipo === 'rol' ? 'primary' : 'danger'}
        procesando={procesando}
        onConfirmar={confirmar}
        onCancelar={() => setAccion(null)}
      >
        {accion?.tipo === 'rol' ? (
          aAdmin ? (
            <>
              ¿Dar permisos de <strong>administrador</strong> a {u?.nombre} ({u?.correo})? Va a poder modificar el
              catálogo y los usuarios.
            </>
          ) : (
            <>
              ¿Quitarle los permisos de administrador a {u?.nombre} ({u?.correo})?
            </>
          )
        ) : (
          <>
            ¿Eliminar los datos de <strong>{u?.nombre}</strong> ({u?.correo})? Esta acción no se puede deshacer.
          </>
        )}
      </ConfirmModal>
    </section>
  )
}

export default AdminUsuarios
