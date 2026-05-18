// Boton para cerrar sesion del admin
// Llama a supabase.auth.signOut() y redirige al login

import { supabase } from "../../lib/supabase";

export default function BotonCerrarSesion() {
  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <button
      onClick={cerrarSesion}
      className="text-gray-400 hover:text-red-400 transition-colors text-sm"
    >
      Cerrar sesion
    </button>
  );
}
