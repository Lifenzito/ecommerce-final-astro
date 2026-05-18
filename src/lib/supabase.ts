// Cliente de Supabase
// Este archivo crea la conexion con Supabase usando la clave publica.
// NUNCA usamos la clave secreta (service_role) en el frontend.

import { createClient } from "@supabase/supabase-js";

// Tipos para la tabla de productos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Leemos las variables de entorno con el prefijo PUBLIC_ para que Astro las exponga al cliente
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Detectamos si estamos en el navegador para poder usar localStorage
const esNavegador = typeof window !== "undefined";

// Creamos el cliente de Supabase que se reutiliza en toda la aplicacion
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Guardar sesion entre recargas y navegación
    persistSession: true,
    // Refrescar el token automaticamente cuando sea necesario
    autoRefreshToken: true,
    // En cliente usamos localStorage para persistir la sesión
    storage: esNavegador ? window.localStorage : undefined,
  },
});
