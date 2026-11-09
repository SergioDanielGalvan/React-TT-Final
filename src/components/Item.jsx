import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaEye, FaChevronRight } from 'react-icons/fa'
import { formatearPrecio } from '../utils/formato.js'
import {
  Tarjeta,
  Media,
  Hoja,
  Esquina,
  Ficha,
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
 *
 * Efecto "pasar la hoja": la foto es una página que gira sobre su borde
 * izquierdo y deja ver la ficha técnica completa. En computadora se activa
 * al pasar el mouse; en celular, tocando la esquina doblada.
 *
 * Con marcarDestacado, los productos "destacado" llevan una estrella
 * (se usa en el catálogo; en la fila de destacados de Inicio no hace falta).
 */
function Item({ id, titulo, categoria, precio, imagen, specs = [], destacado = false, marcarDestacado = false }) {
  const [vuelta, setVuelta] = useState(false)
  const conEstrella = marcarDestacado && destacado

  return (
    // Al sacar el mouse la hoja vuelve a su lugar (con el dedo no aplica:
    // en celular se cierra tocando otra vez la esquina o el texto).
    <Tarjeta $destacado={conEstrella} onPointerLeave={(e) => e.pointerType === 'mouse' && setVuelta(false)}>
      <Media>
        {/* Debajo de la hoja: ficha técnica completa */}
        <Ficha aria-hidden={!vuelta}>
          <h4>Ficha técnica</h4>
          <ul>
            {specs.map((s) => (
              <li key={s}>
                <FaChevronRight aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
          <Link to={`/producto/${id}`} tabIndex={vuelta ? 0 : -1}>
            Ver detalle <FaChevronRight aria-hidden="true" />
          </Link>
        </Ficha>

        {/* La hoja: la foto del producto */}
        <Hoja to={`/producto/${id}`} $vuelta={vuelta} tabIndex={-1} aria-hidden="true">
          <Categoria>{categoria}</Categoria>
          {conEstrella && (
            <Destacado title="Producto destacado">
              <FaStar aria-hidden="true" /> Destacado
            </Destacado>
          )}
          <img src={imagen} alt="" loading="lazy" />
        </Hoja>

        <Esquina
          type="button"
          $vuelta={vuelta}
          onClick={() => setVuelta((v) => !v)}
          aria-pressed={vuelta}
          aria-label={`Ver ficha técnica de ${titulo}`}
          title="Ver ficha técnica"
        />
      </Media>

      <Cuerpo onClick={() => vuelta && setVuelta(false)}>
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
