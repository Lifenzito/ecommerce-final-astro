# TechStore - E-commerce con Astro, Supabase y Cloudflare

Proyecto final universitario: una tienda en linea completa con arquitectura hibrida.

- La tienda publica usa **SSR** (Server-Side Rendering) para contenido dinamico.
- El panel de administracion usa **paginas estaticas** con logica del lado del cliente.

## Tecnologias utilizadas

- **Astro** - Framework web con arquitectura de islas
- **TailwindCSS** - Framework de estilos utilitarios
- **Supabase** - Backend como servicio (base de datos, autenticacion, almacenamiento)
- **Cloudflare Pages** - Plataforma de despliegue con soporte SSR
- **React** - Componentes interactivos del panel de administracion
- **TypeScript** - Tipado estatico para mayor seguridad en el codigo

## Estructura del proyecto

```
src/
  components/
    tienda/          --> Componentes de la tienda publica (Astro)
      BarraBusqueda.astro
      FiltroCategoria.astro
      Paginacion.astro
      TarjetaProducto.astro
    admin/           --> Componentes del admin (React)
      BotonCerrarSesion.tsx
      FormularioLogin.tsx
      FormularioProducto.tsx
      ListaProductos.tsx
      ProteccionRuta.tsx
  layouts/
    LayoutPublico.astro   --> Layout de la tienda
    LayoutAdmin.astro     --> Layout del admin
  lib/
    supabase.ts           --> Cliente de Supabase
  pages/
    index.astro           --> Catalogo de productos (SSR)
    producto/[id].astro   --> Detalle de producto (SSR)
    admin/
      login.astro         --> Inicio de sesion (estatico)
      index.astro         --> Lista de productos admin (estatico)
      productos/
        nuevo.astro       --> Crear producto (estatico)
        editar/[id].astro --> Editar producto (SSR)
  styles/
    global.css            --> Estilos globales con Tailwind
```

## Requisitos previos

- Node.js 18 o superior
- Una cuenta en Supabase con el proyecto configurado
- (Opcional) Una cuenta en Cloudflare para el despliegue

## Configuracion de Supabase

### 1. Crear la tabla de productos

Ejecuta este SQL en el editor de Supabase (SQL Editor):

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en la tabla
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politica de lectura: cualquier persona puede ver productos activos
CREATE POLICY "Lectura publica de productos activos"
  ON products FOR SELECT
  USING (is_active = true);

-- Politica de lectura admin: usuarios autenticados ven todos los productos
CREATE POLICY "Admin lee todos los productos"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Politica de insercion: solo usuarios autenticados
CREATE POLICY "Admin inserta productos"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politica de actualizacion: solo usuarios autenticados
CREATE POLICY "Admin actualiza productos"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

-- Politica de eliminacion: solo usuarios autenticados
CREATE POLICY "Admin elimina productos"
  ON products FOR DELETE
  TO authenticated
  USING (true);
```

### 3. Crear el bucket de imagenes

En Supabase > Storage:
1. Crea un bucket llamado `product-images`
2. Marcalo como publico para que las imagenes sean accesibles
3. Agrega una politica que permita a usuarios autenticados subir archivos

### 4. Crear un usuario admin

En Supabase > Authentication > Users:
1. Haz clic en "Add user"
2. Ingresa un email y contrasena para el administrador
3. Usa esas credenciales para iniciar sesion en el panel de admin

## Instalacion local

1. Clona el repositorio:

```bash
git clone https://github.com/Lifenzito/ecommerce-final-astro.git
cd ecommerce-final-astro
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:

```
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica
```

4. (Opcional) Inserta productos de ejemplo:

```bash
npm run seed
```

5. Inicia el servidor de desarrollo:

```bash
npm run dev
```

6. Abre tu navegador en `http://localhost:4321`

## Despliegue en Cloudflare Pages

### Desde el dashboard de Cloudflare

1. Ve a [Cloudflare Pages](https://pages.cloudflare.com/)
2. Conecta tu repositorio de GitHub
3. Configura el proyecto:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Agrega las variables de entorno:
   - `PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `PUBLIC_SUPABASE_ANON_KEY` = tu clave publica de Supabase
5. Haz clic en "Save and Deploy"

### Desde la terminal (Wrangler)

```bash
npm install -g wrangler
wrangler login
npx astro build
wrangler pages deploy dist
```

## Funcionalidades

### Tienda publica (SSR)
- Catalogo de productos con grid responsivo
- Pagina de detalle de cada producto
- Busqueda de productos por nombre
- Filtrado por categoria
- Paginacion de resultados
- Solo muestra productos activos

### Panel de administracion (estatico + cliente)
- Inicio de sesion con Supabase Auth
- Rutas protegidas (redirige al login si no hay sesion)
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Subir imagenes al bucket de Supabase Storage
- Estados de carga y mensajes de error

## Seguridad

- Solo se usa la clave publica (anon key) de Supabase
- La clave secreta (service_role) nunca se expone en el frontend
- Row Level Security (RLS) controla el acceso a los datos
- Los usuarios publicos solo pueden leer productos activos
- Solo los usuarios autenticados pueden crear, editar y eliminar

## Arquitectura

El proyecto usa una arquitectura hibrida:

- **SSR (Server-Side Rendering)**: Las paginas de la tienda publica se renderizan en el servidor de Cloudflare en cada peticion. Esto permite mostrar datos actualizados y mejorar el SEO.

- **SSG (Static Site Generation)**: Las paginas del admin se generan como HTML estatico en el momento del build. Toda la interactividad (CRUD, autenticacion) se maneja en el navegador con componentes React que se comunican directamente con Supabase.

Esta separacion permite que la tienda sea rapida y optimizada para SEO, mientras que el admin es una aplicacion interactiva que funciona completamente en el cliente.

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la version de produccion |
| `npm run preview` | Previsualiza la version de produccion |
| `npm run seed` | Inserta productos de ejemplo en Supabase |
