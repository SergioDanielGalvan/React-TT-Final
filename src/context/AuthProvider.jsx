import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { AuthContext } from './AuthContext.js'
import { auth, db } from '../firebase/config.js'

/** Mensajes en castellano para los códigos de error de Firebase Auth. */
function mensajeAuth(err) {
  switch (err?.code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.'
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo. Probá ingresar.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y volvé a probar.'
    case 'auth/network-request-failed':
      return 'Sin conexión con el servidor de autenticación.'
    case 'auth/requires-recent-login':
      return 'Por seguridad, cerrá sesión, volvé a ingresar y repetí la operación.'
    default:
      return 'No se pudo completar la operación. Intentá de nuevo.'
  }
}

/**
 * Lee el perfil del usuario (nombre y rol) en Firestore: usuarios/{uid}.
 * Con reparar = true (al iniciar sesión), si la cuenta existe pero su
 * documento no (por ejemplo, un admin lo borró), lo vuelve a crear como
 * cliente para que la cuenta no quede a medias.
 */
async function leerPerfil(cuenta, reparar = false) {
  let perfil = null
  try {
    const ref = doc(db, 'usuarios', cuenta.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      perfil = snap.data()
    } else if (reparar) {
      perfil = {
        nombre: cuenta.displayName || cuenta.email.split('@')[0],
        correo: cuenta.email,
        rol: 'cliente',
      }
      await setDoc(ref, { ...perfil, creado: serverTimestamp() })
    }
  } catch (err) {
    console.error('No se pudo leer el perfil', err)
  }
  return {
    uid: cuenta.uid,
    correo: cuenta.email,
    nombre: perfil?.nombre || cuenta.displayName || cuenta.email.split('@')[0],
    rol: perfil?.rol === 'admin' ? 'admin' : 'cliente',
  }
}

/**
 * Sesión con Firebase Authentication (correo y contraseña).
 * - La contraseña la guarda y verifica Firebase: nunca pasa por nuestro código.
 * - El rol ("admin" o "cliente") vive en Firestore, en usuarios/{uid}.
 *   Al registrarse todos son "cliente"; un admin se asigna desde la consola
 *   de Firebase (las reglas no dejan que un usuario cambie su propio rol).
 * - onAuthStateChanged mantiene la sesión al recargar la página.
 */
function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (cuenta) => {
      setUsuario(cuenta ? await leerPerfil(cuenta) : null)
      setCargando(false)
    })
    return desuscribir
  }, [])

  const login = async (correo, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, correo.trim(), password)
      const perfil = await leerPerfil(user, true)
      setUsuario(perfil)
      return perfil
    } catch (err) {
      throw new Error(mensajeAuth(err), { cause: err })
    }
  }

  const registrar = async (nombre, correo, password) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, correo.trim(), password)
      await updateProfile(user, { displayName: nombre })
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre,
        correo: user.email,
        rol: 'cliente',
        creado: serverTimestamp(),
      })
      const perfil = { uid: user.uid, correo: user.email, nombre, rol: 'cliente' }
      setUsuario(perfil)
      return perfil
    } catch (err) {
      throw new Error(mensajeAuth(err), { cause: err })
    }
  }

  const logout = () => signOut(auth)

  /** Borra la cuenta propia: primero los datos (Firestore) y después el acceso (Auth). */
  const eliminarCuenta = async () => {
    const cuenta = auth.currentUser
    if (!cuenta) return
    try {
      await deleteDoc(doc(db, 'usuarios', cuenta.uid))
      await deleteUser(cuenta)
      try {
        localStorage.removeItem(`mg-carrito-${cuenta.uid}`)
      } catch {
        /* sin storage: nada que limpiar */
      }
    } catch (err) {
      // Si Firebase pide un login reciente, el documento ya se borró:
      // al volver a ingresar se recrea solo (leerPerfil) y se puede repetir.
      throw new Error(mensajeAuth(err), { cause: err })
    }
  }

  const esAdmin = usuario?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ usuario, cargando, esAdmin, login, registrar, logout, eliminarCuenta }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
