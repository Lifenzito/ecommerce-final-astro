// Componente que protege las rutas del admin
// Verifica si el usuario esta autenticado antes de mostrar el contenido.
// Si no hay sesion activa, redirige al login.

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  children: ReactNode;
}

export default function ProteccionRuta({ children }: Props) {
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    try {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setAutenticado(true);
      } else {
        // No hay sesion, redirigimos al login
        window.location.href = "/admin/login";
      }
    } catch {
      window.location.href = "/admin/login";
    } finally {
      setVerificando(false);
    }
  }

  // Mientras verificamos la sesion, mostramos un indicador de carga
  if (verificando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  // Solo mostramos el contenido si el usuario esta autenticado
  if (!autenticado) return null;

  return <>{children}</>;
}
