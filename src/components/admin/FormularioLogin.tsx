// Formulario de inicio de sesion para el panel de administracion
// Usa Supabase Auth para autenticar al usuario con email y contrasena

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FormularioLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [error, setError] = useState("");

  // Si ya hay sesion activa, enviamos directo al panel admin
  useEffect(() => {
    void verificarSesionActiva();
  }, []);

  async function verificarSesionActiva() {
    try {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        window.location.href = "/admin";
        return;
      }
    } finally {
      setVerificandoSesion(false);
    }
  }

  // Manejar el envio del formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Credenciales incorrectas. Verifica tu email y contrasena.");
        return;
      }

      // Si el login fue exitoso, redirigimos al panel de admin
      window.location.href = "/admin";
    } catch {
      setError("Ocurrio un error inesperado. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {verificandoSesion ? (
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Verificando sesion...</p>
        </div>
      ) : (
      <div className="w-full max-w-md bg-gray-900 rounded-lg border border-gray-800 p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesion</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Ingresa tus credenciales para acceder al panel de administracion
        </p>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ejemplo.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Campo de contrasena */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contrasena"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Boton de enviar */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
      )}
    </div>
  );
}
