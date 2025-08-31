/*
document.addEventListener('DOMContentLoaded', async function () {
  const contenedor = document.getElementById('contenedor-productos');

  try {
    const res = await fetch('../data/productos.json'); // Ajustá la ruta si estás en /pages/
    const productos = await res.json();

    productos.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';

      col.innerHTML = `
        <div class="card clay-card h-100 text-center p-3">
          <img src="../${producto.imagen}" class="card-img-top img-fluid" alt="${producto.nombre}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text color-page">$${producto.precio.toLocaleString('es-AR')}</p>
            <a href="#" class="btn btn-outline-dark">
              <i class="bi bi-bag-plus-fill fs-4 color-page"></i>
            </a>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar los productos.</p>`;
  }
});
*/
// Ajustá la ruta si estás en /pages/
document.addEventListener('DOMContentLoaded', async function () {
  const contenedor = document.getElementById('contenedor-productos');

  try {
    const res = await fetch('../data/productos.json'); // Ajustá la ruta si estás en /pages/
    const productos = await res.json();

    productos.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col-10 col-md-4 col-lg-3 mb-3 me-3';

      col.innerHTML = `
        <div class="card clay-card h-100 text-center p-3">
          <div class="flip-img-container mb-3">
            <div class="flip-img-inner">
              <div class="flip-img-front">
                <img src="../${producto.imagen}" class="img-fluid rounded" alt="${producto.nombre}">
              </div>
              <div class="flip-img-back d-flex align-items-center justify-content-center">
                <p class="small px-2">${producto.descripcion || 'Sin descripción disponible.'}</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text color-page">$${producto.precio.toLocaleString('es-AR')}</p>
            <a href="#" class="btn btn-outline-dark">
              <i class="bi bi-bag-plus-fill fs-4 color-page"></i>
            </a>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });

    // 📱 Compatibilidad táctil: activa el flip al tocar la imagen
    document.querySelectorAll('.flip-img-container').forEach(container => {
      container.addEventListener('click', () => {
        container.querySelector('.flip-img-inner')?.classList.toggle('flipped');
      });
    });

  } catch (error) {
    console.error('Error al cargar productos:', error);
    contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar los productos.</p>`;
  }
});


