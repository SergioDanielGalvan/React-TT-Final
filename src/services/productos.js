import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config.js'

/*
  CRUD de productos contra Cloud Firestore (colección "productos").
  Cada documento usa como ID un "slug" legible (ej. gpu-rtx3090ti), que es
  el mismo que aparece en la URL /producto/:id.
*/
const COLECCION = 'productos'
const productosRef = collection(db, COLECCION)

/** Firestore → objeto del sitio (el id del documento pasa a ser p.id). */
function aProducto(snap) {
  const datos = { id: snap.id, ...snap.data() }
  delete datos.creado // fechas internas de Firestore: no viajan al carrito
  delete datos.actualizado
  return datos
}

/** Quita el id y campos internos antes de guardar. */
function aDocumento(producto) {
  const datos = { ...producto }
  delete datos.id
  return datos
}

/** Traduce los errores de Firestore a mensajes para el usuario. */
export function mensajeFirestore(err, accion = 'completar la operación') {
  switch (err?.code) {
    case 'permission-denied':
      return `No tenés permisos para ${accion}. Solo los administradores pueden modificar el catálogo.`
    case 'unavailable':
      return 'No hay conexión con la base de datos. Revisá tu conexión a internet.'
    case 'not-found':
      return 'El producto ya no existe.'
    default:
      return `No se pudo ${accion}. Intentá de nuevo.`
  }
}

/* ---------------- R · Read ---------------- */

export async function obtenerProductos() {
  const snap = await getDocs(productosRef)
  return snap.docs
    .map(aProducto)
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.titulo.localeCompare(b.titulo))
}

export async function obtenerProducto(id) {
  const snap = await getDoc(doc(db, COLECCION, id))
  return snap.exists() ? aProducto(snap) : null
}

/* ---------------- C · U · D ---------------- */

export async function crearProducto(producto) {
  await setDoc(doc(db, COLECCION, producto.id), {
    ...aDocumento(producto),
    creado: serverTimestamp(),
  })
}

export async function actualizarProducto(producto) {
  await updateDoc(doc(db, COLECCION, producto.id), {
    ...aDocumento(producto),
    actualizado: serverTimestamp(),
  })
}

export async function eliminarProducto(id) {
  await deleteDoc(doc(db, COLECCION, id))
}

/**
 * Carga inicial: sube a Firestore los productos de public/productos.json
 * en un solo lote (writeBatch). Si un ID ya existe, lo sobrescribe.
 */
export async function importarCatalogo(productos) {
  const lote = writeBatch(db)
  productos.forEach((p) => {
    lote.set(doc(db, COLECCION, p.id), { ...aDocumento(p), creado: serverTimestamp() })
  })
  await lote.commit()
  return productos.length
}

/** "RTX 4070 Ti Súper" → "rtx-4070-ti-super-lq3k9" (id legible y único). */
export function generarId(titulo) {
  const base = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `${base || 'producto'}-${Date.now().toString(36).slice(-5)}`
}
