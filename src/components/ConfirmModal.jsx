import { Button, Modal, Spinner } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'

/**
 * Modal de confirmación reutilizable (React-Bootstrap).
 * Se usa antes de eliminar un producto, vaciar el carrito, etc.
 */
function ConfirmModal({
  show,
  titulo = '¿Confirmás?',
  children,
  textoConfirmar = 'Eliminar',
  variante = 'danger',
  procesando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal show={show} onHide={onCancelar} centered className="mg-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 d-flex align-items-center gap-2">
          <FaExclamationTriangle className="text-warning" aria-hidden="true" />
          {titulo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancelar} disabled={procesando}>
          Cancelar
        </Button>
        <Button variant={variante} onClick={onConfirmar} disabled={procesando}>
          {procesando && <Spinner animation="border" size="sm" className="me-2" />}
          {textoConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal
