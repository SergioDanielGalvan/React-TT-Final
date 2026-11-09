import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

/*
  Card de producto con styled-components.
  Usa las variables CSS del tema (--superficie, --acento-a, …) para que
  funcione igual en modo claro y oscuro.
*/

export const Tarjeta = styled.article`
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

export const Media = styled(Link)`
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden; /* una imagen muy alta no estira la card */
  background: #fff;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
  }
`

const Etiqueta = styled.span`
  position: absolute;
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
