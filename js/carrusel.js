document.addEventListener('DOMContentLoaded', async function () {
  const lista = document.getElementById('lista-productos');

  try {
    const res = await fetch('data/productos.json');
    const productos = await res.json();

    // 🏆 Filtrar solo los productos destacados
    const destacados = productos.filter(producto => producto.destacado === true);
    // Este fragmento recorre los productos filtrados como "destacados" desde el JSON,
    // y genera dinámicamente cada slide del carrusel. 
    destacados.forEach(producto => {
      const li = document.createElement('li');
      li.className = 'splide__slide';
      li.innerHTML = `
        <a href="pages/productos.html" class="text-decoration-none text-dark">
          <div class="card-producto">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toLocaleString('es-AR')}</p>
          </div>
        </a>
      `;
      lista.appendChild(li);
    });
// Este bloque inicializa el carrusel con comportamiento de bucle infinito, animación automática,
  new Splide('#splide', {
    type: 'loop',              // 🔁 Reproduce los slides en bucle continuo
    perPage: 1,                // 🧱 Muestra un producto por vista
    gap: '1rem',               // 🌬️ Espacio entre slides
    pagination: false,         // 🚫 Oculta los puntos de navegación
    arrows: true,              // ➡️ Muestra flechas de navegación
    drag: true,                // 🖐️ Permite arrastrar manualmente
    pauseOnFocus: true,        // 🧘‍♂️ Pausa si el usuario interactúa
    pauseOnHover: true,        // 🐭 Pausa al pasar el mouse
    autoplay: true,            // ⏱️ Reproducción automática
    interval: 3000,            // 🕒 Tiempo entre slides (ms)
    breakpoints: {
      768: { perPage: 1 },     // 📱 Configuración para tablets
      480: { perPage: 1 }      // 📱 Configuración para móviles
    }
  }).mount();
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
});
