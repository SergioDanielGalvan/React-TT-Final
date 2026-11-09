import { Link } from 'react-router-dom'
import { FaStar, FaEye } from 'react-icons/fa'
import { formatearPrecio } from '../utils/formato.js'
import {
  Tarjeta,
  Media,
  Categoria,
  Destacado,
  Cuerpo,
  Titulo,
  Specs,
  Pie,
  Precio,
} from './styled/ProductoCard.styles.js'

/**
 * Card reutilizable de un producto (styled-components). Recibe sus datos
 * por props y enlaza a la vista de detalle /producto/:id.
 * Con marcarDestacado, los productos "destacado" llevan una estrella
 * (se usa en el catálogo; en la fila de destacados de Inicio no hace falta).
 */
function Item({ id, titulo, categoria, precio, imagen, specs = [], destacado = false, marcarDestacado = false }) {
  const conEstrella = marcarDestacado && destacado

  return (
    <Tarjeta $destacado={conEstrella}>
      <Media to={`/producto/${id}`} tabIndex={-1} aria-hidden="true">
        <Categoria>{categoria}</Categoria>
        {conEstrella && (
          <Destacado title="Producto destacado">
            <FaStar aria-hidden="true" /> Destacado
          </Destacado>
        )}
        <img src={imagen} alt="" loading="lazy" />
      </Media>
      <Cuerpo>
        <Titulo>
          <Link to={`/producto/${id}`}>{titulo}</Link>
          {conEstrella && <span className="visually-hidden"> (producto destacado)</span>}
        </Titulo>
        <Specs>
          {specs.slice(0, 3).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </Specs>
        <Pie>
          <Precio>{formatearPrecio(precio)}</Precio>
          <Link to={`/producto/${id}`} className="btn btn-borde btn-sm">
            <FaEye className="me-1" aria-hidden="true" />
            Ver detalle
          </Link>
        </Pie>
      </Cuerpo>
    </Tarjeta>
  )
}

export default Item
