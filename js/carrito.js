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

    const stockTexto = card.textContent.match(/Stock:\s*(\d+)/);
    const stock = stockTexto ? parseInt(stockTexto[1]) : 1;

    // 📌 Extraer ID con expresión regular
    const idTexto = card.textContent.match(/ID:\s*([A-Z0-9]+)/);
    const id = idTexto ? idTexto[1] : "";

    if (nombre && !isNaN(precio)) {
      const existente = carrito.find(p => p.nombre === nombre);
      if (existente) {
        if (existente.cantidad < existente.stock) {
          existente.cantidad++;
        }
      } else {
        carrito.push({ id, nombre, precio, stock, cantidad: 1 });
      }
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
    total += item.precio * item.cantidad;

    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <div class="fw-bold">${item.nombre}</div>
        <div class="small text-muted">Precio unitario: $${item.precio}</div>
        <div class="small text-muted">Stock: ${item.stock}</div>
        <div class="small text-muted">ID: ${item.id}</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary btn-restar" data-index="${index}">–</button>
        <span class="cantidad">${item.cantidad}</span>
        <button class="btn btn-sm btn-outline-secondary btn-sumar" data-index="${index}">+</button>
        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-index="${index}" title="Eliminar">
          <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    `;
    carritoLista.appendChild(li);
  });

  carritoTotal.textContent = `$${total.toLocaleString()}`;
  contadorCarrito.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  activarBotonesCantidad();
  guardarCarrito();
}

// ⚙️ Manejo de botones + – 🗑️
function activarBotonesCantidad() {
  document.querySelectorAll('.btn-sumar').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const item = carrito[index];
      if (item.cantidad < item.stock) {
        item.cantidad++;
        actualizarCarrito();
      }
    });
  });

  document.querySelectorAll('.btn-restar').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const item = carrito[index];
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        carrito.splice(index, 1);
      }
      actualizarCarrito();
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      carrito.splice(index, 1);
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
    const empresa = "nombrecomercio";
    const direccion = "Catamarca - Capital";
    const telefono = "383-000-0000";
    const cuit = "10223093481";

    let ticket = ` ${empresa}\n${direccion}\nTel: ${telefono}\nCuit: ${cuit}\n`;
    ticket += `Fecha: ${formatoFecha} - \nHora: ${formatoHora}\n`;
    ticket += `Cliente: Público General\n`;
    ticket += `Ticket #${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}\n`;
    ticket += `----------------------------------\n`;

    let subtotal = 0;
    carrito.forEach((item, i) => {
      ticket += `${i + 1}. ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
      subtotal += item.precio * item.cantidad;
    });

    ticket += `----------------------------------\n`;
    ticket += `TOTAL: $${subtotal.toFixed(2)}\n`;
    ticket += `----------------------------------\n`;
    ticket += `¡GRACIAS POR TU COMPRA\nNO SE ACEPTAN CAMBIOS NI DEVOLUCIONES`;

    const numeroDestino = "5493834046923";
    const mensajeCodificado = encodeURIComponent(ticket);
    const urlWhatsApp = `https://wa.me/${numeroDestino}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, '_blank');

    // 🔄 Actualizar stock en Google Sheets
    carrito.forEach(item => {
      fetch("https://script.google.com/macros/s/AKfycbzNKuetNmueajUc6--ljTXr90RF7H-JNWRXCMQXU20xJd4DR48nPRg-U1PmwSy4cmdu4w/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          cantidadVendida: item.cantidad
        })
      })
      .then(res => res.json())
      .then(data => console.log("Stock actualizado:", data))
      .catch(err => console.error("Error al actualizar stock:", err));
    });

    // 🧹 Vaciar carrito
    carrito.splice(0, carrito.length);
    guardarCarrito();
    actualizarCarrito();
  });
}

// 🚀 Inicializar
if (carritoLista && carritoTotal && contadorCarrito) {
  cargarCarrito();
}
