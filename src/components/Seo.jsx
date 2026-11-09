import { Helmet } from 'react-helmet-async'

const SITIO = 'Mundo Gaming'
const DESCRIPCION_BASE =
  'Tienda de hardware gamer: placas madre AORUS, tarjetas de video y gabinetes Thermaltake.'

/**
 * <title> y <meta> de cada página con React Helmet.
 * Uso: <Seo titulo="Carrito" descripcion="…" />
 */
function Seo({ titulo, descripcion = DESCRIPCION_BASE, imagen, noIndex = false }) {
  const tituloCompleto = titulo ? `${titulo} · ${SITIO}` : `${SITIO} · Hardware para tu setup gamer`

  return (
    <Helmet>
      <title>{tituloCompleto}</title>
      <meta name="description" content={descripcion} />
      <meta property="og:title" content={tituloCompleto} />
      <meta property="og:description" content={descripcion} />
      {imagen && <meta property="og:image" content={imagen} />}
      {noIndex && <meta name="robots" content="noindex" />}
    </Helmet>
  )
}

export default Seo
