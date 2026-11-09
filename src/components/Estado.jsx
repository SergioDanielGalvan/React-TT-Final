import { Alert, Button, Spinner } from 'react-bootstrap'
import { FaRedo, FaExclamationCircle } from 'react-icons/fa'

/** Indicador de carga (Spinner de React-Bootstrap). */
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="estado" role="status">
      <Spinner animation="border" variant="info" className="mb-3" aria-hidden="true" />
      <p className="mb-0">{texto}</p>
    </div>
  )
}

/** Mensaje de error con botón para reintentar. */
export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <Alert variant="danger" className="text-center my-4">
      <FaExclamationCircle className="fs-3 mb-2" aria-hidden="true" />
      <p className="mb-1 fw-semibold">{mensaje}</p>
      <small className="d-block mb-3">Verificá tu conexión o volvé a intentar.</small>
      {onReintentar && (
        <Button variant="outline-danger" size="sm" onClick={onReintentar}>
          <FaRedo className="me-1" aria-hidden="true" /> Reintentar
        </Button>
      )}
    </Alert>
  )
}
