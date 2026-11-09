import { Link } from 'react-router-dom'
import { useForm, ValidationError } from '@formspree/react'
import Seo from '../components/Seo.jsx'

// Mismo formulario de Formspree que usaba el sitio HTML de Mundo Gaming.
const FORMSPREE_ID = 'meenrgll'

// Mapa del local (el mismo iframe de la página "Acerca" del sitio HTML).
const MAPA_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.0889862597946!2d-58.45882738476981!3d-34.627191480453384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca25dab9afd5%3A0x59532861e9ad8816!2sAv.%20Carabobo%2025%2C%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1662645791679!5m2!1ses!2sar'

/** Contacto con @formspree/react (patrón tomado del TP grupal) + mapa. */
function Contacto() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID)

  return (
    <section className="seccion">
      <Seo titulo="Contacto" descripcion="Escribinos o visitá el showroom de Mundo Gaming en Av. Carabobo 25, CABA." />
      <div className="container">
        <span className="seccion__eyebrow">Hablemos</span>
        <h1 className="seccion__titulo">Formulario de contacto</h1>
        <p className="text-suave mb-4">¿Dudas con tu armado? Escribinos o pasá por el showroom.</p>

        <div className="row g-4 align-items-stretch">
          {/* ---------- Formulario (izquierda) ---------- */}
          <div className="col-12 col-lg-6">
            {state.succeeded ? (
              <div className="mg-form mg-form--ancho h-100 text-center d-flex flex-column justify-content-center">
                <p className="fs-1 mb-2" aria-hidden="true">✅</p>
                <h2 className="h4">¡Mensaje enviado!</h2>
                <p className="text-suave">Te respondemos a la brevedad.</p>
                <div>
                  <Link to="/productos" className="btn btn-acento">
                    Seguir viendo productos
                  </Link>
                </div>
              </div>
            ) : (
              <form className="mg-form mg-form--ancho h-100" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="nombre">Nombre</label>
                  <input className="form-control" id="nombre" name="nombre" placeholder="Juan Pérez" required />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input className="form-control" id="email" type="email" name="email" placeholder="juan@perez.com" required />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-danger small" />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="mensaje">Mensaje</label>
                  <textarea className="form-control" id="mensaje" name="mensaje" rows="5" placeholder="Contanos en qué te ayudamos" required />
                  <ValidationError prefix="Mensaje" field="mensaje" errors={state.errors} className="text-danger small" />
                </div>
                <ValidationError errors={state.errors} className="alert alert-danger py-2" />
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-acento" disabled={state.submitting}>
                    {state.submitting ? 'Enviando…' : 'Enviar mensaje'}
                  </button>
                  <button type="reset" className="btn btn-borde">
                    Limpiar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ---------- Mapa (derecha) ---------- */}
          <div className="col-12 col-lg-6">
            <div className="mapa h-100">
              <iframe
                src={MAPA_URL}
                title="Ubicación de Mundo Gaming en Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="mapa__pie">
                <strong>📍 Av. Carabobo 25, CABA</strong>
                <span className="text-suave small">Lunes a viernes de 9 a 18 h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contacto
