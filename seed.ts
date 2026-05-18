// Script para insertar productos de ejemplo en la base de datos
// Ejecutar con: npm run seed
// Nota: necesitas tener las variables de entorno configuradas en .env

import { createClient } from "@supabase/supabase-js";

// Leemos las variables de entorno directamente del proceso
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Configura PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY en tu archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Productos de ejemplo para demostrar la tienda
const productosEjemplo = [
  {
    name: "Laptop Ultrabook Pro",
    description:
      "Laptop ultradelgada con procesador de ultima generacion, 16GB RAM, 512GB SSD. Ideal para trabajo y estudio.",
    price: 1299.99,
    category: "Electronica",
    image_url: "",
    is_active: true,
  },
  {
    name: "Auriculares Inalambricos",
    description:
      "Auriculares Bluetooth con cancelacion de ruido activa. Bateria de 30 horas. Sonido Hi-Fi.",
    price: 89.99,
    category: "Electronica",
    image_url: "",
    is_active: true,
  },
  {
    name: "Monitor Curvo 27 pulgadas",
    description:
      "Monitor curvo QHD 2560x1440, 144Hz, tiempo de respuesta 1ms. Perfecto para gaming y diseno.",
    price: 449.99,
    category: "Electronica",
    image_url: "",
    is_active: true,
  },
  {
    name: "Teclado Mecanico RGB",
    description:
      "Teclado mecanico con switches Cherry MX, retroiluminacion RGB personalizable y reposamunecos.",
    price: 129.99,
    category: "Electronica",
    image_url: "",
    is_active: true,
  },
  {
    name: "Mochila para Laptop",
    description:
      "Mochila resistente al agua con compartimiento para laptop de hasta 15.6 pulgadas. Multiples bolsillos.",
    price: 59.99,
    category: "Ropa",
    image_url: "",
    is_active: true,
  },
  {
    name: "Camiseta Desarrollo Web",
    description:
      "Camiseta 100% algodon con diseno para desarrolladores. Disponible en varias tallas.",
    price: 24.99,
    category: "Ropa",
    image_url: "",
    is_active: true,
  },
  {
    name: "Escritorio Ergonomico",
    description:
      "Escritorio ajustable en altura, ideal para trabajar de pie o sentado. Superficie amplia de 120x60cm.",
    price: 349.99,
    category: "Hogar",
    image_url: "",
    is_active: true,
  },
  {
    name: "Lampara LED de Escritorio",
    description:
      "Lampara LED con 5 niveles de brillo y 3 temperaturas de color. Base con cargador inalambrico.",
    price: 45.99,
    category: "Hogar",
    image_url: "",
    is_active: true,
  },
  {
    name: "Silla Gamer Profesional",
    description:
      "Silla ergonomica con soporte lumbar ajustable, reposabrazos 4D y reclinacion de 180 grados.",
    price: 299.99,
    category: "Hogar",
    image_url: "",
    is_active: true,
  },
  {
    name: "Pelota de Futbol Profesional",
    description:
      "Pelota de futbol tamano 5, material sintetico de alta durabilidad. Aprobada por FIFA.",
    price: 39.99,
    category: "Deportes",
    image_url: "",
    is_active: true,
  },
  {
    name: "Banda de Resistencia Set",
    description:
      "Set de 5 bandas elasticas con diferentes niveles de resistencia. Incluye bolsa de transporte.",
    price: 19.99,
    category: "Deportes",
    image_url: "",
    is_active: true,
  },
  {
    name: "Clean Code - Robert C. Martin",
    description:
      "Libro esencial sobre buenas practicas de programacion. Aprende a escribir codigo limpio y mantenible.",
    price: 34.99,
    category: "Libros",
    image_url: "",
    is_active: true,
  },
  {
    name: "Mouse Ergonomico Vertical",
    description:
      "Mouse vertical inalambrico que reduce la tension en la muneca. 6 botones programables.",
    price: 49.99,
    category: "Electronica",
    image_url: "",
    is_active: true,
  },
  {
    name: "Hub USB-C 7 en 1",
    description:
      "Hub USB-C con HDMI 4K, 3 puertos USB 3.0, lector SD, y carga PD de 100W.",
    price: 39.99,
    category: "Electronica",
    image_url: "",
    is_active: true,
  },
  {
    name: "Webcam Full HD",
    description:
      "Camara web 1080p con microfono integrado y correccion de luz automatica. Compatible con Zoom y Meet.",
    price: 69.99,
    category: "Electronica",
    image_url: "",
    is_active: false,
  },
];

async function seedDatabase() {
  console.log("Insertando productos de ejemplo...");

  const { data, error } = await supabase.from("products").insert(productosEjemplo).select();

  if (error) {
    console.error("Error al insertar productos:", error.message);
    process.exit(1);
  }

  console.log(`Se insertaron ${data.length} productos correctamente.`);
  console.log("Productos insertados:");
  data.forEach((p) => {
    console.log(`  - ${p.name} ($${p.price}) [${p.category}]`);
  });
}

seedDatabase();
