import { useEffect, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

const CLAVE = 'mg-tema'

function temaInicial() {
  return document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark'
}

/**
 * Alterna modo oscuro / claro (idea tomada del TP grupal MocoSoft).
 * Cambia data-bs-theme en <html>: Bootstrap y nuestras variables CSS
 * reaccionan solos.
 */
function ThemeToggle() {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema)
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      /* sin storage: el tema dura hasta recargar */
    }
  }, [tema])

  const oscuro = tema === 'dark'

  return (
    <button
      type="button"
      className="btn-tema"
      onClick={() => setTema(oscuro ? 'light' : 'dark')}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {oscuro ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
    </button>
  )
}

export default ThemeToggle
