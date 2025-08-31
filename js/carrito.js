const carrito = [];
const carritoLista = document.getElementById('carritoLista');
const carritoTotal = document.getElementById('carritoTotal');
const contadorCarrito = document.getElementById('contadorCarrito');

// 🧠 Cargar carrito desde localStorage
function cargarCarrito() {
  const guardado = localStorage.getItem('carrito');
  if (guardado) {
    carrito.splice(0, carrito.length, ...JSON.parse(guardado));
    actualizarCarrito();
  }
}

// 💾 Guardar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// 🛒 Delegación de eventos para agregar productos
document.addEventListener('click', (e) => {
  const enlace = e.target.closest('a.btn-outline-dark');
  if (enlace) {
    e.preventDefault();

    const card = enlace.closest('.card');
    const nombre = card.querySelector('.card-title')?.textContent.trim();
    const precioTexto = card.querySelector('.card-text')?.textContent.trim();
    const precio = parseFloat(precioTexto?.replace('$', '').replace('.', ''));

    if (nombre && !isNaN(precio)) {
      const producto = { nombre, precio };
      carrito.push(producto);
      guardarCarrito();
      actualizarCarrito();
    }
  }
});

// 🔄 Actualizar vista del carrito
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

// 📤 Finalizar compra y enviar ticket por WhatsApp
const finalizarBtn = document.querySelector('.btn.btn-dark.mt-3');
if (finalizarBtn) {
  finalizarBtn.addEventListener('click', () => {
    if (carrito.length === 0) return;

    const fecha = new Date();
    const formatoFecha = fecha.toLocaleDateString('es-AR');
    const formatoHora = fecha.toLocaleTimeString('es-AR');
    const empresa = "nombrecomercio";// 📤 nombre del comercio
    const direccion = "Catamarca - Capital";
    const telefono = "383-000-0000";// 📤 numero tel del comercio
    const cuit = "10223093481";// 📤 numero de hab del comercio-cuit

    let ticket = ` ${empresa}\n${direccion}\nTel: ${telefono}\nCuit: ${cuit}\n`;
    ticket += `Fecha: ${formatoFecha} - \nHora: ${formatoHora}\n`;
    ticket += `Cliente: Público General\n`;
    ticket += `Ticket #${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}\n`;
    ticket += `----------------------------------\n`;

    let subtotal = 0;
    carrito.forEach((item, i) => {
      ticket += `${i + 1}. ${item.nombre} - \n $${item.precio.toFixed(2)}\n`;
      subtotal += item.precio;
    });

    const total = subtotal;

    ticket += `----------------------------------\n`;
    ticket += `TOTAL: $${total.toFixed(2)}\n`;
    ticket += `----------------------------------\n`;
    ticket += `¡GRACIAS POR TU COMPRA\nNO SE ACEPTAN CAMBIOS NI DEVOLUCIONES`;

    // Número de WhatsApp destino (con código de país, sin +)
    const numeroDestino = "5493834046923"; // ← numero del comercio
    const mensajeCodificado = encodeURIComponent(ticket);
    const urlWhatsApp = `https://wa.me/${numeroDestino}?text=${mensajeCodificado}`;

    window.open(urlWhatsApp, '_blank');

    carrito.splice(0, carrito.length);
    guardarCarrito();
    actualizarCarrito();
  });
}

// 🚀 Inicializar
if (carritoLista && carritoTotal && contadorCarrito) {
  cargarCarrito();
}
