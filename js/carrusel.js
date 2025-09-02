// 📌 URL pública de tu hoja de Google Sheets en formato CSV
const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5QG5ZfJE8Rl7o2ue-RQGFyQpxVoIixwRS4UxQXypBUS99n6ZxbRVZaZdzbeEV8rEuX316ZMEmE4Aw/pub?output=csv';

document.addEventListener('DOMContentLoaded', async function () {
  const lista = document.getElementById('lista-productos');
  if (!lista) return;

  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL);
    const csvText = await res.text();
    const productos = parseCSV(csvText);

    // 🏆 Filtrar solo los productos destacados
    const destacados = productos.filter(p => {
      const val = String(p.destacado || '').toLowerCase();
      return val === 'true';
    });

    // 🎨 Renderizar cada slide
    destacados.forEach(producto => {
      const li = document.createElement('li');
      li.className = 'splide__slide';
      const imagen = normalizarSrc(producto.imagen);
      const nombre = producto.nombre || 'Producto';
      const precio = Number(producto.precio || 0).toLocaleString('es-AR');
      li.innerHTML = `
        <a href="pages/productos.html" class="text-decoration-none text-dark">
          <div class="card-producto">
            <img src="${imagen}" alt="${nombre}" onerror="this.src='../img/placeholder.jpeg'">
            <h3>${nombre}</h3>
            <p class="color-page">$${precio}</p>
          </div>
        </a>
      `;
      lista.appendChild(li);
    });

    // 🛞 Inicializar carrusel
    new Splide('#splide', {
      type: 'loop',
      perPage: 1,
      gap: '1rem',
      pagination: false,
      arrows: true,
      drag: true,
      pauseOnFocus: true,
      pauseOnHover: true,
      autoplay: true,
      interval: 3000,
      breakpoints: {
        768: { perPage: 1 },
        480: { perPage: 1 }
      }
    }).mount();
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }

  // 🧩 Parser CSV básico
  function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.toLowerCase()] = values[i];
      });
      return obj;
    });
  }

  // 🖼️ Normaliza enlaces de imagen
  function normalizarSrc(imagen) {
    if (!imagen) return '../img/placeholder.jpeg';
    let limpia = imagen.replace(/['"\n\r]/g, '').trim();

    // Imgur: convierte imgur.com/ID → i.imgur.com/ID.png
    if (limpia.startsWith('https://imgur.com/')) {
      const id = limpia.split('/').pop();
      limpia = `https://i.imgur.com/${id}.png`;
    }

    // Drive: convierte /file/d/ID/view → uc?export=view&id=ID
    if (limpia.includes('drive.google.com') && limpia.includes('/file/d/')) {
      const id = limpia.split('/d/')[1]?.split('/')[0];
      if (id) limpia = `https://drive.google.com/uc?export=view&id=${id}`;
    }

    return limpia;
  }
});
