import { Link } from 'react-router-dom'
import BrandsSlider from '../components/BrandsSlider.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import Seo from '../components/Seo.jsx'
import ItemListContainer from './ItemListContainer.jsx'
import resenas from '../data/resenas.json'

function Estrellas({ cantidad }) {
  return (
    <p className="resena__estrellas" aria-label={`${cantidad} de 5 estrellas`}>
      {'★'.repeat(cantidad)}
      {'☆'.repeat(5 - cantidad)}
    </p>
  )
}

function Home() {
  return (
    <>
      <Seo />
      <BrandsSlider />

      <section className="pt-4">
        <div className="container">
          <HeroCarousel />
        </div>
      </section>

      <section className="hero">
        <div className="container">
          <h1 className="hero__titulo">
            Armá tu setup con <span>el mejor hardware</span>
          </h1>
          <p className="hero__bajada">
            Placas madre AORUS, tarjetas de video de última generación y gabinetes Thermaltake.
            Todo lo que tu PC gamer necesita, en un solo lugar.
          </p>
          <Link to="/productos" className="btn btn-acento btn-lg">
            Ver productos
          </Link>
        </div>
      </section>

      <section className="seccion">
        <div className="container">
          <span className="seccion__eyebrow">Selección</span>
          <h2 className="seccion__titulo">Productos destacados</h2>
          <p className="text-suave mb-4">
            Nuestra elección por categoría: placa madre, placa de video y gabinete.
          </p>
          <ItemListContainer soloDestacados />
        </div>
      </section>

      <section className="seccion seccion--alt">
        <div className="container">
          <span className="seccion__eyebrow">La comunidad</span>
          <h2 className="seccion__titulo">Reseñas de clientes</h2>
          <div className="grilla-resenas mt-4">
            {resenas.map((r) => (
              <article className="resena" key={r.id}>
                <Estrellas cantidad={r.estrellas} />
                <p>{r.texto}</p>
                <p className="resena__autor mb-0">— {r.autor}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
