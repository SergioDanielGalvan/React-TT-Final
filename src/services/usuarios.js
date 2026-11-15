import { collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'

/*
  Gestión de usuarios registrados (colección "usuarios" de Firestore).
  Cada documento tiene como ID el UID de Firebase Authentication.

  Importante: desde el navegador un admin puede leer, cambiar el rol y borrar
  los DATOS de un usuario, pero no su cuenta de acceso (eso requiere el
  Admin SDK de Firebase). La cuenta de acceso la borra el propio usuario
  desde "Mi perfil" o un admin desde la consola de Firebase.
*/
const COLECCION = 'usuarios'

export async function obtenerUsuarios() {
  const snap = await getDocs(collection(db, COLECCION))
  return snap.docs
    .map((d) => {
      const datos = d.data()
      return {
        uid: d.id,
        nombre: datos.nombre ?? '(sin nombre)',
        correo: datos.correo ?? '',
        rol: datos.rol === 'admin' ? 'admin' : 'cliente',
        creado: datos.creado?.toDate?.() ?? null,
      }
    })
    .sort((a, b) => (a.rol === b.rol ? a.nombre.localeCompare(b.nombre) : a.rol === 'admin' ? -1 : 1))
}

export async function cambiarRol(uid, rol) {
  await updateDoc(doc(db, COLECCION, uid), { rol, actualizado: serverTimestamp() })
}

export async function eliminarDatosUsuario(uid) {
  await deleteDoc(doc(db, COLECCION, uid))
}
