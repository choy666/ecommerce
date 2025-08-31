const carrito = [];
const botonesAgregar = document.querySelectorAll('.bi-bag-plus-fill');
const carritoLista = document.getElementById('carritoLista');
const carritoTotal = document.getElementById('carritoTotal');
const contadorCarrito = document.getElementById('contadorCarrito');

// Cargar carrito desde localStorage
function cargarCarrito() {
  const guardado = localStorage.getItem('carrito');
  if (guardado) {
    carrito.splice(0, carrito.length, ...JSON.parse(guardado));
    actualizarCarrito();
  }
}

// Guardar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Agregar producto
botonesAgregar.forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const nombre = card.querySelector('.card-title').textContent.trim();
    const precio = parseFloat(card.querySelector('.card-text').textContent.replace('$', '').replace('.', '').trim());
    const producto = { nombre, precio };

    carrito.push(producto);
    guardarCarrito();
    actualizarCarrito();
  });
});

// Actualizar vista del carrito
function actualizarCarrito() {
  carritoLista.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${item.nombre}</span>
      <div class="d-flex align-items-center gap-2">
        <span>$${item.precio}</span>
        <button class="btn btn-sm btn-outline-danger" data-index="${index}" title="Eliminar">
          <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    `;
    carritoLista.appendChild(li);
  });

  carritoTotal.textContent = `$${total}`;
  contadorCarrito.textContent = carrito.length;

  // Botones de eliminar
  const botonesEliminar = carritoLista.querySelectorAll('button[data-index]');
  botonesEliminar.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index'));
      carrito.splice(index, 1);
      guardarCarrito();
      actualizarCarrito();
    });
  });
}

// Inicializar
if (carritoLista && carritoTotal && contadorCarrito) {
  cargarCarrito();
}

