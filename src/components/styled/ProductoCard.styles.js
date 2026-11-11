import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

/*
  Card de producto con styled-components.
  Usa las variables CSS del tema (--superficie, --acento-a, …) para que
  funcione igual en modo claro y oscuro.
*/

export const Tarjeta = styled.article`
  ${() => conHover}
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(34, 211, 238, 0.4);
    box-shadow: var(--sombra);
  }

  ${({ $destacado }) =>
    $destacado &&
    css`
      border-color: rgba(245, 158, 11, 0.55);
      &:hover {
        border-color: #f59e0b;
      }
    `}
`

/* ---------- Media con efecto "pasar la hoja" ----------
   Hoja (la foto) gira sobre su borde izquierdo y deja ver Ficha
   (los datos técnicos) que está debajo. Se activa con el mouse sobre
   la card, o con la esquina doblada ($vuelta) en pantallas táctiles. */

export const Media = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden; /* la hoja que gira no se sale de la card */
  perspective: 1400px;
  background: var(--superficie-2);
`

export const Hoja = styled(Link)`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  background: #fff;
  transform-origin: left center;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: transform 0.85s cubic-bezier(0.45, 0.05, 0.25, 1), box-shadow 0.85s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
  }

  /* sombra que se oscurece mientras la hoja se levanta */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.35));
    opacity: 0;
    transition: opacity 0.85s ease;
    pointer-events: none;
  }

  ${({ $vuelta }) => $vuelta && vuelta}
`

const vuelta = css`
  transform: rotateY(-115deg);
  box-shadow: 12px 0 30px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  &::after {
    opacity: 1;
  }
`

/* La esquina doblada: pista visual y botón en pantallas táctiles. */
export const Esquina = styled.button`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 3;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: linear-gradient(315deg, var(--superficie-2) 0 50%, #d9dde6 50% 62%, #f4f6fa 62% 100%);
  border-top-left-radius: 6px;
  box-shadow: -2px -2px 6px rgba(0, 0, 0, 0.18);
  transition: width 0.25s ease, height 0.25s ease, opacity 0.3s ease;

  &:focus-visible {
    outline: 2px solid var(--acento-a);
    outline-offset: -2px;
  }

  ${({ $vuelta }) =>
    $vuelta &&
    css`
      opacity: 0;
    `}
`

export const Ficha = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 0.85rem 1rem;
  background:
    radial-gradient(circle at 100% 0, rgba(34, 211, 238, 0.12), transparent 55%),
    var(--superficie-2);
  font-size: 0.8rem;

  h4 {
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--acento-a);
    margin: 0 0 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  li {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    padding: 0.18rem 0;
    border-bottom: 1px dashed var(--borde);
  }

  li svg {
    flex-shrink: 0;
    color: var(--acento-a);
    font-size: 0.65rem;
  }

  a {
    margin-top: auto;
    align-self: flex-end;
    font-weight: 600;
    color: var(--acento-a);
    text-decoration: none;
  }
`

/* En computadoras: la hoja pasa sola al apoyar el mouse sobre la foto. */
export const conHover = css`
  @media (hover: hover) and (pointer: fine) {
    ${Media}:hover ${Hoja}, ${Media}:focus-within ${Hoja} {
      ${vuelta}
    }
    ${Media}:hover ${Esquina}, ${Media}:focus-within ${Esquina} {
      opacity: 0;
    }
    ${Esquina}:hover {
      width: 46px;
      height: 46px;
    }
  }

  /* Sin animaciones si el usuario las desactivó en su sistema */
  @media (prefers-reduced-motion: reduce) {
    ${Hoja} {
      transition: opacity 0.2s ease;
    }
    ${Media}:hover ${Hoja}, ${Media}:focus-within ${Hoja} {
      transform: none;
      opacity: 0;
    }
  }
`

const Etiqueta = styled.span`
  position: absolute;
  z-index: 1;
  top: 10px;
  font-size: 0.7rem;
  padding: 3px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

export const Categoria = styled(Etiqueta)`
  left: 10px;
  background: var(--nav-fondo);
  border: 1px solid var(--borde);
  color: var(--texto-suave);
`

export const Destacado = styled(Etiqueta)`
  right: 10px;
  font-weight: 700;
  color: #1a1300;
  background: linear-gradient(135deg, #fde68a, #f59e0b);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.45);
`

export const Cuerpo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem;
`

export const Titulo = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem;
  min-height: 2.6em;

  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    color: var(--acento-a);
  }

  @media (max-width: 575.98px) {
    min-height: auto;
  }
`

export const Specs = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--texto-suave);
`

export const Pie = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

export const Precio = styled.span`
  font-family: 'Chakra Petch', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
`
