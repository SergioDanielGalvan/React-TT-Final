import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/*
  Configuración de Firebase (proyecto "mundo-gaming").
  Los valores vienen de variables de entorno VITE_FIREBASE_* (.env en local,
  Environment Variables en Vercel). No son secretos: la seguridad real la
  dan las reglas de Firestore, que solo dejan escribir a los administradores.
*/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Faltan las variables VITE_FIREBASE_* (ver .env.example).')
}

const app = initializeApp(firebaseConfig)

/** Firebase Authentication (login y registro con correo y contraseña). */
export const auth = getAuth(app)

/** Cloud Firestore (colecciones "productos" y "usuarios"). */
export const db = getFirestore(app)
