import { NavLink } from 'react-router-dom'
import { Nav } from 'react-bootstrap'
import { FaBoxOpen, FaUsers } from 'react-icons/fa'

/** Pestañas del panel de gestión: Productos | Usuarios. */
function AdminTabs() {
  return (
    <Nav variant="tabs" className="admin-tabs mb-4">
      <Nav.Item>
        <Nav.Link as={NavLink} to="/admin/productos">
          <FaBoxOpen className="me-2" aria-hidden="true" />
          Productos
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="/admin/usuarios">
          <FaUsers className="me-2" aria-hidden="true" />
          Usuarios
        </Nav.Link>
      </Nav.Item>
    </Nav>
  )
}

export default AdminTabs
