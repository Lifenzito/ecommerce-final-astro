// Componente que muestra la lista de productos en el panel de admin
// Permite ver, editar y eliminar productos
// Toda la logica de Supabase se ejecuta en el cliente (no en el servidor)

import { useEffect, useState } from "react";
import { supabase, type Product } from "../../lib/supabase";
import ProteccionRuta from "./ProteccionRuta";
import BotonCerrarSesion from "./BotonCerrarSesion";

export default function ListaProductos() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  // Cargar todos los productos (activos e inactivos) para el admin
  async function cargarProductos() {
    setCargando(true);
    setError("");

    try {
      const { data, error: dbError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      setProductos(data || []);
    } catch {
      setError("Error al cargar los productos. Verifica tu conexion.");
    } finally {
      setCargando(false);
    }
  }

  // Eliminar un producto por su ID
  async function eliminarProducto(id: string, nombre: string) {
    if (!confirm(`Estas seguro de eliminar "${nombre}"?`)) return;

    setEliminando(id);
    try {
      const { error: dbError } = await supabase.from("products").delete().eq("id", id);

      if (dbError) throw dbError;

      // Actualizamos la lista local sin recargar todo
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Error al eliminar el producto.");
    } finally {
      setEliminando(null);
    }
  }

  // Formatear precio en pesos colombianos, sin decimales
  function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(precio);
  }

  return (
    <ProteccionRuta>
      {/* Montamos el boton de cerrar sesion en el navbar */}
      <BotonCerrarSesionPortal />

      <div className="space-y-6">
        {/* Encabezado con boton de nuevo producto */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Productos</h1>
          <a
            href="/admin/productos/nuevo"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Nuevo producto
          </a>
        </div>

        {/* Estado de error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Estado de carga */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : productos.length === 0 ? (
          /* Lista vacia */
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No hay productos todavia</p>
            <p className="text-sm">Crea tu primer producto para comenzar</p>
          </div>
        ) : (
          /* Tabla de productos */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Imagen</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Categoria</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Precio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="py-3 px-4">
                      {producto.image_url ? (
                        <img
                          src={producto.image_url}
                          alt={producto.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{producto.name}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{producto.category}</td>
                    <td className="py-3 px-4 text-primary-400">{formatearPrecio(producto.price)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          producto.is_active
                            ? "bg-green-900/30 text-green-400"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        {producto.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/admin/productos/editar/${producto.id}`}
                          className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                        >
                          Editar
                        </a>
                        <button
                          onClick={() => eliminarProducto(producto.id, producto.name)}
                          disabled={eliminando === producto.id}
                          className="text-red-400 hover:text-red-300 disabled:text-red-800 text-sm transition-colors"
                        >
                          {eliminando === producto.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProteccionRuta>
  );
}

// Componente auxiliar para montar el boton de cerrar sesion en el navbar
// Usamos un portal para colocarlo en el contenedor del navbar
import { createPortal } from "react-dom";

function BotonCerrarSesionPortal() {
  const [contenedor, setContenedor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("logout-container");
    if (el) setContenedor(el);
  }, []);

  if (!contenedor) return null;
  return createPortal(<BotonCerrarSesion />, contenedor);
}
