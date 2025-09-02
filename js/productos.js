// 📌 URL pública de tu hoja de Google Sheets en formato CSV
const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5QG5ZfJE8Rl7o2ue-RQGFyQpxVoIixwRS4UxQXypBUS99n6ZxbRVZaZdzbeEV8rEuX316ZMEmE4Aw/pub?output=csv';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const contenedor = document.getElementById('contenedor-productos');
  const filtroDestacado = document.getElementById('filtroDestacado');
  const filtroContainer = document.getElementById('filtroCategoriaContainer');

  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="text-center my-5">
      <div class="spinner-border text-dark" role="status" aria-hidden="true"></div>
      <div class="mt-2">Cargando productos...</div>
    </div>
  `;

  let productos = [];

  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      throw new Error('La hoja no está publicada como CSV o el enlace es incorrecto');
    }

    const csv = await res.text();
    const filas = parseCSVRobusto(csv);

    if (!Array.isArray(filas) || filas.length === 0) {
      throw new Error('CSV vacío o ilegible');
    }


    productos = filas.map((r) => {
      const precio = parsePrecioAR(r.precio ?? r.precioars ?? r.precio$);
      return {
        nombre: (r.nombre ?? r.titulo ?? 'Producto').trim(),precio,
        imagen: normalizarImagen(r.imagen ?? r.foto ?? r.imagenurl),
        descripcion: (r.descripcion ?? r.descripcioncorta ?? '').trim(),
        categoria: (r.categoria ?? r.rubro ?? '').trim(),
        destacado: toBool(r.destacado ?? r.featured ?? '')
      };
    });

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort();

    if (filtroContainer) {
      filtroContainer.innerHTML = crearRadiosCategorias(categorias);
      filtroContainer.addEventListener('change', render);
    }

    filtroDestacado?.addEventListener('change', render);

    render();

  } catch (err) {
    console.error('Error al cargar productos:', err);
    contenedor.innerHTML = `<p class="text-danger text-center my-5">No se pudieron cargar los productos. Verificá que la hoja esté publicada como CSV.</p>`;
  }

  function render() {
    const categoria = document.querySelector('input[name="categoria"]:checked')?.value || '';
    const soloDestacados = !!filtroDestacado?.checked;

    const filtrados = productos.filter(p =>
      (!categoria || p.categoria === categoria) &&
      (!soloDestacados || p.destacado)
    );

    if (filtrados.length === 0) {
      contenedor.innerHTML = `<p class="text-muted text-center my-5">No hay productos que coincidan con los filtros.</p>`;
      return;
    }

    contenedor.innerHTML = '';
    const frag = document.createDocumentFragment();

    filtrados.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3 mb-4';
      col.innerHTML = `
        <div class="card clay-card h-100 text-center p-3">
          <div class="flip-img-container mb-3" role="button" aria-label="Ver detalle">
            <div class="flip-img-inner">
              <div class="flip-img-front">
                <img src="${escapeHTML(p.imagen)}" class="img-fluid rounded" alt="${escapeHTML(p.nombre)}">
              </div>
              <div class="flip-img-back d-flex align-items-center justify-content-center">
                <p class="small px-2 mb-0">${escapeHTML(p.descripcion || 'Sin descripción disponible.')}</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title titulo-producto mb-1">${escapeHTML(p.nombre)}</h5>
            <p class="card-text color-page">${formatearARS(p.precio)}</p>
            <a href="#" class="btn btn-outline-dark agregar-carrito"
              data-nombre="${escapeHTML(p.nombre)}"
              data-precio="${p.precio}"
              data-imagen="${escapeHTML(p.imagen)}">
              <i class="bi bi-bag-plus-fill fs-4 color-page icono-agregar"></i>
            </a>
          </div>
        </div>
      `;
      frag.appendChild(col);
    });

    contenedor.appendChild(frag);
    // 🛍️ Activar toast al agregar producto
    contenedor.addEventListener('click', function (e) {
      const btn = e.target.closest('.agregar-carrito');
      if (!btn) return;
      e.preventDefault();

      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = `${btn.dataset.nombre} agregado al carrito 🛍️`;
        toast.style.display = 'block';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 2000);
      }
    });
  }
}

/* ---------- Utils ---------- */

function parseCSVRobusto(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;

  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  while (i < text.length) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (!inQuotes && (char === ',' || char === '\n')) {
      row.push(field);
      field = '';
      if (char === '\n') {
        rows.push(row);
        row = [];
      }
      i++;
      continue;
    }

    field += char;
    i++;
  }

  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);

  if (rows.length === 0) return [];

  const headersRaw = rows[0].map((h) => normalizeKey(h));
  const dataRows = rows.slice(1).filter(r => r.some(c => c && c.trim() !== ''));

  return dataRows.map((cols) => {
    const obj = {};
    headersRaw.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? '').trim();
    });
    return obj;
  });
}

function normalizeKey(k) {
  return (k || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\s$%#]+/g, '')
    .replace(/[^a-z0-9_]/g, '');
}

function parsePrecioAR(v) {
  let s = (v ?? '').toString().trim();
  if (!s) return 0;

  s = s.replace(/[^\d.,-]/g, '');

  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function formatearARS(n) {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(n || 0);
  } catch {
    return `$${Math.round(n || 0)}`;
  }
}

function toBool(v) {
  const s = (v ?? '').toString().trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'x';
}

function normalizarImagen(url) {
  if (!url) return '../img/placeholder.jpeg';
  url = url.trim();

  if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
    const id = url.split('/').pop().split('.')[0];
    return `https://i.imgur.com/${id}.png`;
  }

  if (url.includes('drive.google.com')) {
    const id = url.match(/\/d\/([^/]+)\//)?.[1] || url.match(/[?&]id=([^&]+)/)?.[1];
    return id ? `https://drive.google.com/uc?export=view&id=${id}` : '../img/placeholder.jpeg';
  }

  return url;
}

function escapeHTML(s) {
  return (s ?? '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function crearRadiosCategorias(categorias) {
  if (categorias.length === 0) return '';
  let html = `<div class="mydict"><div>`;
  html += `
    <label>
      <input type="radio" name="categoria" id="cat-todas" value="">
      <span>Todas</span>
    </label>
  `;
  categorias.forEach((cat, i) => {
    const id = `cat-${i}`;
    html += `
      <label>
        <input type="radio" name="categoria" id="${id}" value="${escapeHTML(cat)}">
        <span>${escapeHTML(cat)}</span>
      </label>
    `;
  });
  html += `</div></div>`;
  return html;
}
