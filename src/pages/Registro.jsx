import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { FaUserPlus } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth.js'
import Seo from '../components/Seo.jsx'

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VACIO = { nombre: '', correo: '', password: '', repetir: '' }

function validar(f) {
  const e = {}
  if (f.nombre.trim().length < 2) e.nombre = 'Ingresá tu nombre.'
  if (!RE_CORREO.test(f.correo.trim())) e.correo = 'Ingresá un correo válido.'
  if (f.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres.'
  if (f.repetir !== f.password) e.repetir = 'Las contraseñas no coinciden.'
  return e
}

/** Alta de cuenta de cliente con Firebase Authentication. */
function Registro() {
  const { usuario, registrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.desde ?? '/'

  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario && !enviando) return <Navigate to={destino} replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrores((er) => ({ ...er, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const encontrados = validar(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    try {
      await registrar(form.nombre.trim(), form.correo, form.password)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  const campo = (name, label, type, autoComplete, placeholder) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        isInvalid={!!errores[name]}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <Form.Control.Feedback type="invalid">{errores[name]}</Form.Control.Feedback>
    </Form.Group>
  )

  return (
    <section className="seccion">
      <Seo titulo="Crear cuenta" descripcion="Registrate en Mundo Gaming para comprar." noIndex />
      <div className="container">
        <Form className="mg-form" onSubmit={handleSubmit} noValidate>
          <h1 className="h3 mb-1">Crear cuenta</h1>
          <p className="text-suave small mb-4">Registrate para finalizar tus compras.</p>

          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          {campo('nombre', 'Nombre', 'text', 'name', 'Juan Pérez')}
          {campo('correo', 'Correo electrónico', 'email', 'email', 'juan@perez.com')}
          {campo('password', 'Contraseña', 'password', 'new-password', 'Mínimo 6 caracteres')}
          {campo('repetir', 'Repetir contraseña', 'password', 'new-password')}

          <Button type="submit" className="btn-acento w-100 mt-2" disabled={enviando}>
            {enviando ? (
              <>
                <Spinner size="sm" className="me-2" aria-hidden="true" /> Creando cuenta…
              </>
            ) : (
              <>
                <FaUserPlus className="me-2" aria-hidden="true" /> Registrarme
              </>
            )}
          </Button>
          <p className="text-suave small text-center mt-3 mb-0">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" state={location.state}>
              Ingresá
            </Link>
          </p>
        </Form>
      </div>
    </section>
  )
}

export default Registro
