// Formulario para crear y editar productos
// Maneja la subida de imagenes al bucket de Supabase Storage
// Se usa tanto para crear productos nuevos como para editar existentes

import { useEffect, useState } from "react";
import { supabase, type Product } from "../../lib/supabase";
import ProteccionRuta from "./ProteccionRuta";

interface Props {
  productoId?: string; // Si se pasa un ID, es modo edicion
}

export default function FormularioProducto({ productoId }: Props) {
  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [activo, setActivo] = useState(true);

  // Estado de la interfaz
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(!!productoId);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Si estamos editando, cargamos los datos del producto
  useEffect(() => {
    if (productoId) {
      cargarProducto(productoId);
    }
  }, [productoId]);

  async function cargarProducto(id: string) {
    setCargandoDatos(true);
    try {
      const { data, error: dbError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (dbError || !data) {
        setError("No se encontro el producto.");
        return;
      }

      // Llenamos el formulario con los datos existentes
      const producto = data as Product;
      setNombre(producto.name);
      setDescripcion(producto.description || "");
      setPrecio(String(producto.price));
      setCategoria(producto.category || "");
      setImagenUrl(producto.image_url || "");
      setActivo(producto.is_active);
    } catch {
      setError("Error al cargar el producto.");
    } finally {
      setCargandoDatos(false);
    }
  }

  // Subir imagen al bucket de Supabase Storage
  async function subirImagen(archivo: File) {
    setSubiendoImagen(true);
    setError("");

    try {
      // Generamos un nombre unico para el archivo usando timestamp
      const extension = archivo.name.split(".").pop();
      const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(nombreArchivo, archivo);

      if (uploadError) throw uploadError;

      // Obtenemos la URL publica de la imagen
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(nombreArchivo);

      setImagenUrl(urlData.publicUrl);
    } catch {
      setError("Error al subir la imagen. Verifica los permisos del bucket.");
    } finally {
      setSubiendoImagen(false);
    }
  }

  // Guardar el producto (crear o actualizar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    setExito("");

    // Validaciones basicas
    if (!nombre.trim() || !precio.trim() || !categoria.trim()) {
      setError("El nombre, precio y categoria son obligatorios.");
      setCargando(false);
      return;
    }

    const precioNumero = parseFloat(precio);
    if (isNaN(precioNumero) || precioNumero < 0) {
      setError("El precio debe ser un numero valido mayor o igual a 0.");
      setCargando(false);
      return;
    }

    // Datos del producto para enviar a Supabase
    const datosProducto = {
      name: nombre.trim(),
      description: descripcion.trim(),
      price: precioNumero,
      category: categoria.trim(),
      image_url: imagenUrl,
      is_active: activo,
      updated_at: new Date().toISOString(),
    };

    try {
      if (productoId) {
        // Modo edicion: actualizamos el producto existente
        const { error: dbError } = await supabase
          .from("products")
          .update(datosProducto)
          .eq("id", productoId);

        if (dbError) throw dbError;
        setExito("Producto actualizado correctamente.");
      } else {
        // Modo creacion: insertamos un nuevo producto
        const { error: dbError } = await supabase
          .from("products")
          .insert([datosProducto]);

        if (dbError) throw dbError;
        setExito("Producto creado correctamente.");

        // Limpiamos el formulario despues de crear
        setNombre("");
        setDescripcion("");
        setPrecio("");
        setCategoria("");
        setImagenUrl("");
        setActivo(true);
      }
    } catch {
      setError("Error al guardar el producto. Verifica tus permisos.");
    } finally {
      setCargando(false);
    }
  }

  // Categorias oficiales de la tienda (mismas usadas en el catalogo publico)
  const categoriasPredefinidas = [
    "Accesorios",
    "Audio",
    "Celulares",
    "Electronica",
    "Portátiles",
    "Tablets",
  ];

  return (
    <ProteccionRuta>
      <div className="max-w-2xl mx-auto">
        {/* Titulo dinamico segun el modo */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {productoId ? "Editar producto" : "Nuevo producto"}
          </h1>
          <a
            href="/admin"
            className="text-gray-400 hover:text-gray-200 transition-colors text-sm"
          >
            Volver a la lista
          </a>
        </div>

        {/* Indicador de carga inicial */}
        {cargandoDatos ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Mensajes de estado */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            {exito && (
              <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
                {exito}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
              {/* Nombre del producto */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del producto *
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej: Auriculares Bluetooth"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Descripcion */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-2">
                  Descripcion
                </label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                  placeholder="Describe el producto..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Precio y Categoria en dos columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-300 mb-2">
                    Precio (COP) *
                  </label>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar...</option>
                    {categoriasPredefinidas.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subida de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen del producto
                </label>

                {/* Vista previa de la imagen actual */}
                {imagenUrl && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagenUrl}
                      alt="Vista previa"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setImagenUrl("")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      X
                    </button>
                  </div>
                )}

                {/* Input para seleccionar archivo */}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-300 transition-colors">
                    {subiendoImagen ? "Subiendo..." : "Seleccionar imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const archivo = e.target.files?.[0];
                        if (archivo) subirImagen(archivo);
                      }}
                      disabled={subiendoImagen}
                      className="hidden"
                    />
                  </label>
                  {subiendoImagen && (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Formatos aceptados: JPG, PNG, WebP. Maximo 5MB.
                </p>
              </div>

              {/* Estado activo/inactivo */}
              <div className="flex items-center gap-3">
                <input
                  id="activo"
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="activo" className="text-sm text-gray-300">
                  Producto activo (visible en la tienda)
                </label>
              </div>

              {/* Botones de accion */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <button
                  type="submit"
                  disabled={cargando || subiendoImagen}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  {cargando
                    ? "Guardando..."
                    : productoId
                      ? "Actualizar producto"
                      : "Crear producto"}
                </button>
                <a
                  href="/admin"
                  className="text-gray-400 hover:text-gray-200 transition-colors px-4 py-3"
                >
                  Cancelar
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </ProteccionRuta>
  );
}
