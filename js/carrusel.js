document.addEventListener('DOMContentLoaded', async function () {
  const lista = document.getElementById('lista-productos');

  try {
    const res = await fetch('data/productos.json');
    const productos = await res.json();

    productos.forEach(producto => {
      const li = document.createElement('li');
      li.className = 'splide__slide';
      li.innerHTML = `
        <div class="card-producto">
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <h3>${producto.nombre}</h3>
          <p>$${producto.precio}</p>
        </div>
      `;
      lista.appendChild(li);
    });

    new Splide('#splide', {
      type: 'loop',
      perPage: 1,
      gap: '1rem',
      pagination: false,
      arrows: true,
      drag: true,
      pauseOnFocus: true,
      pauseOnHover: true,
      autoplay: true,         // ✅ Activa el cambio automático
      interval: 3000,         // ⏱️ Tiempo entre slides (en milisegundos)
      breakpoints: {
        768: { perPage: 1 },
        480: { perPage: 1 }
      }
    }).mount();
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
});