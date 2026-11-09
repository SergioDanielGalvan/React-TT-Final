import { Row, Col } from 'react-bootstrap'
import Item from './Item.jsx'

/**
 * Grilla responsive con React-Bootstrap: 1 columna en celular,
 * 2 en tablet, 3 en notebook y 4 en pantallas grandes.
 */
function ItemList({ productos, columnas = { xs: 12, sm: 6, lg: 4, xl: 3 }, marcarDestacados = false, vacio }) {
  if (productos.length === 0) {
    return <p className="estado">{vacio ?? 'No hay productos para mostrar.'}</p>
  }

  return (
    <Row className="g-4">
      {productos.map((producto) => (
        <Col key={producto.id} {...columnas}>
          <Item {...producto} marcarDestacado={marcarDestacados} />
        </Col>
      ))}
    </Row>
  )
}

export default ItemList
