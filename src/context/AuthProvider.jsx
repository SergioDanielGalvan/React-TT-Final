import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
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
    default:
      return 'No se pudo completar la operación. Intentá de nuevo.'
  }
}

/** Lee el perfil del usuario (nombre y rol) en Firestore: usuarios/{uid}. */
async function leerPerfil(cuenta) {
  let perfil = null
  try {
    const snap = await getDoc(doc(db, 'usuarios', cuenta.uid))
    if (snap.exists()) perfil = snap.data()
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
      const perfil = await leerPerfil(user)
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

  const esAdmin = usuario?.rol === 'admin'

  return (
    <AuthContext.Provider value={{ usuario, cargando, esAdmin, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
