import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { FaBoxOpen, FaEnvelope, FaHome, FaSignInAlt, FaSignOutAlt, FaTools, FaUserCircle } from 'react-icons/fa'
import CartWidget from '../CartWidget.jsx'
import DolarWidget from '../DolarWidget.jsx'
import ThemeToggle from '../ThemeToggle.jsx'
import { useAuth } from '../../hooks/useAuth.js'

const SECCIONES = [
  { to: '/', texto: 'Inicio', icono: FaHome, end: true },
  { to: '/productos', texto: 'Productos', icono: FaBoxOpen },
  { to: '/contacto', texto: 'Contacto', icono: FaEnvelope },
]

/** Barra de navegación con React-Bootstrap (Navbar colapsable en celular). */
function NavBar() {
  const [abierto, setAbierto] = useState(false)
  const { usuario, esAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const cerrar = () => setAbierto(false)

  const cerrarSesion = async () => {
    cerrar()
    await logout()
    navigate('/')
  }

  return (
    <Navbar expand="lg" expanded={abierto} onToggle={setAbierto} className="mg-nav" aria-label="Navegación principal">
      <Container>
        <Navbar.Brand as={Link} to="/" className="marca d-flex align-items-center gap-2" onClick={cerrar}>
          <img src="/imagenes/logo-mg.svg" alt="" width="36" height="26" />
          <span>Mundo Gaming</span>
        </Navbar.Brand>

        <div className="d-flex align-items-center gap-3 order-lg-last">
          <CartWidget onClick={cerrar} />
          <Navbar.Toggle aria-controls="menuPrincipal" aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} />
        </div>

        <Navbar.Collapse id="menuPrincipal">
          <Nav className="me-auto mb-2 mb-lg-0">
            {SECCIONES.map(({ to, texto, icono: Icono, end }) => (
              // NavLink agrega la clase "active" a la sección actual
              <Nav.Link as={NavLink} key={to} to={to} end={end} onClick={cerrar}>
                <Icono className="me-1 d-lg-none" aria-hidden="true" />
                {texto}
              </Nav.Link>
            ))}
            {esAdmin && (
              <Nav.Link as={NavLink} to="/admin/productos" onClick={cerrar}>
                <FaTools className="me-1" aria-hidden="true" />
                Gestión
              </Nav.Link>
            )}
          </Nav>

          <div className="d-flex flex-wrap align-items-center gap-3 me-lg-3">
            <DolarWidget />
            <ThemeToggle />
            {usuario ? (
              <NavDropdown
                align="end"
                id="menuUsuario"
                title={
                  <span>
                    <FaUserCircle className="me-1" aria-hidden="true" />
                    {usuario.nombre}
                    {esAdmin && <span className="badge text-bg-info ms-1">admin</span>}
                  </span>
                }
              >
                <NavDropdown.Item as={Link} to="/perfil" onClick={cerrar}>
                  <FaUserCircle className="me-2" aria-hidden="true" /> Mi perfil
                </NavDropdown.Item>
                {esAdmin && (
                  <NavDropdown.Item as={Link} to="/admin/productos" onClick={cerrar}>
                    <FaTools className="me-2" aria-hidden="true" /> Gestión de productos
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item as="button" onClick={cerrarSesion}>
                  <FaSignOutAlt className="me-2" aria-hidden="true" /> Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={NavLink} to="/login" onClick={cerrar}>
                <FaSignInAlt className="me-1" aria-hidden="true" />
                Ingresar
              </Nav.Link>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
