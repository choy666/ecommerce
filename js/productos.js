document.addEventListener('DOMContentLoaded', async function () {
  const contenedor = document.getElementById('contenedor-productos');
  const filtroDestacado = document.getElementById('filtroDestacado');
  const filtroContainer = document.getElementById('filtroCategoriaContainer');

  let productos = [];

  try {
    const res = await fetch('../data/productos.json');
    productos = await res.json();

    const categorias = [...new Set(
      productos.map(p => (p.categoria || '').trim()).filter(Boolean)
    )].sort();

    if (filtroContainer) {
      filtroContainer.innerHTML = '';

      const todasLabel = document.createElement('label');
      todasLabel.innerHTML = `
        <input type="radio" name="categoria" value="">
        <span>Todas</span>
      `;
      filtroContainer.appendChild(todasLabel);

      categorias.forEach(categoria => {
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="radio" name="categoria" value="${categoria}">
          <span>${categoria}</span>
        `;
        filtroContainer.appendChild(label);
      });

      filtroContainer.querySelectorAll('input[name="categoria"]').forEach(input => {
        input.addEventListener('change', renderizarProductos);
      });
    }

    renderizarProductos();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar los productos.</p>`;
  }

  function normalizarSrc(imagen) {
    return imagen?.startsWith('/') ? '..' + imagen : '../' + imagen;
  }

  function renderizarProductos() {
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const categoria = document.querySelector('input[name="categoria"]:checked')?.value || '';
    const destacadoSolo = !!(filtroDestacado?.checked);

    const filtrados = productos.filter(p => {
      const cat = (p.categoria || '').trim();
      const esDestacado = p.destacado === true;
      const okCategoria = !categoria || cat === categoria;
      const okDestacado = !destacadoSolo || esDestacado;
      return okCategoria && okDestacado;
    });

    if (filtrados.length === 0) {
      contenedor.innerHTML = `<p class="text-muted">No hay productos que coincidan con los filtros.</p>`;
      return;
    }

    filtrados.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col-9 col-md-4 col-lg-3';

      const src = normalizarSrc(producto.imagen);
      const nombre = producto.nombre || 'Producto';
      const precio = Number(producto.precio || 0).toLocaleString('es-AR');

      col.innerHTML = `
        <div class="card clay-card h-100 text-center p-3">
          <div class="flip-img-container mb-3" role="button" aria-label="Ver detalle">
            <div class="flip-img-inner">
              <div class="flip-img-front">
                <img src="${src}" class="img-fluid rounded" alt="${nombre}">
              </div>
              <div class="flip-img-back d-flex align-items-center justify-content-center">
                <p class="small px-2">${producto.descripcion || 'Sin descripción disponible.'}</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title titulo-producto">${nombre}</h5>
            <p class="card-text color-page">$${precio}</p>
            <a href="#" class="btn btn-outline-dark">
              <i class="bi bi-bag-plus-fill fs-4 color-page"></i>
            </a>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });

    document.querySelectorAll('.flip-img-container').forEach(container => {
      container.addEventListener('click', () => {
        container.querySelector('.flip-img-inner')?.classList.toggle('flipped');
      });
    });
  }

  filtroDestacado?.addEventListener('change', renderizarProductos);
});
