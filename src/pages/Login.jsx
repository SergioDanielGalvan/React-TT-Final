import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { FaSignInAlt } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth.js'
import Seo from '../components/Seo.jsx'

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Inicio de sesión con Firebase Authentication. */
function Login() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.desde ?? '/'

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [verificando, setVerificando] = useState(false)

  // Si ya hay sesión, no tiene sentido mostrar el formulario.
  if (usuario && !verificando) return <Navigate to={destino} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!RE_CORREO.test(correo.trim())) return setError('Ingresá un correo válido.')
    if (!password) return setError('Ingresá tu contraseña.')

    setVerificando(true)
    try {
      await login(correo, password)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message)
      setVerificando(false)
    }
  }

  return (
    <section className="seccion">
      <Seo titulo="Ingresar" descripcion="Iniciá sesión en Mundo Gaming." noIndex />
      <div className="container">
        <Form className="mg-form" onSubmit={handleSubmit} noValidate>
          <h1 className="h3 mb-1">Ingresar</h1>
          <p className="text-suave small mb-4">
            {location.state?.desde ? 'Iniciá sesión para continuar.' : 'Accedé con tu cuenta de Mundo Gaming.'}
          </p>

          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="correo">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="juan@perez.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Form.Group>
          <Button type="submit" className="btn-acento w-100" disabled={verificando}>
            {verificando ? (
              <>
                <Spinner size="sm" className="me-2" aria-hidden="true" /> Verificando…
              </>
            ) : (
              <>
                <FaSignInAlt className="me-2" aria-hidden="true" /> Ingresar
              </>
            )}
          </Button>
          <p className="text-suave small text-center mt-3 mb-0">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" state={location.state}>
              Registrate
            </Link>
          </p>
        </Form>
      </div>
    </section>
  )
}

export default Login
