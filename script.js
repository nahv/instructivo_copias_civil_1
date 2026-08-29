/* Hash y QR para copias de traslado.
   El archivo NUNCA sale del navegador: crypto.subtle calcula el SHA-256
   localmente y el QR se dibuja sobre el link que escribe el usuario.

   Los dos campos son independientes: con el archivo sale el hash, con el
   link sale el QR, con los dos salen los dos. */

const $ = (id) => document.getElementById(id);

/* Marca al centro del QR. Come modulos, asi que el codigo se genera con
   correccion de error H (recupera hasta un 30%) y el logo ocupa un 18%:
   el margen que queda es de sobra para que siga leyendose. */
const MARCA = 'assets/iudex-mark.png';

async function calcularHash(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Copia al portapapeles y confirma en el propio botón (sin alert). */
async function copiar(texto, boton) {
  if (!texto.trim()) return;
  try {
    await navigator.clipboard.writeText(texto);
    const original = boton.textContent;
    boton.textContent = 'Copiado';
    setTimeout(() => { boton.textContent = original; }, 1600);
  } catch {
    boton.textContent = 'No se pudo copiar';
    setTimeout(() => { boton.textContent = 'Copiar'; }, 1600);
  }
}

function crearQR(link, tamano) {
  return new QRCodeStyling({
    width: tamano,
    height: tamano,
    data: link,
    image: MARCA,
    qrOptions: { errorCorrectionLevel: 'H' },
    imageOptions: {
      imageSize: 0.18,
      margin: Math.round(tamano * 0.012),
      hideBackgroundDots: true,
      crossOrigin: 'anonymous',
    },
    dotsOptions: { color: '#0f0f0e', type: 'rounded' },
    backgroundOptions: { color: '#ffffff' },
  });
}

/* ---------- Estado del botón según lo que haya cargado ---------- */

function loQueHay() {
  return {
    file: $('fileInput').files[0] || null,
    link: $('linkInput').value.trim(),
  };
}

function actualizarBoton() {
  const { file, link } = loQueHay();
  const boton = $('generateBtn');
  boton.disabled = !file && !link;
  if (file && link) boton.textContent = 'Generar hash y QR';
  else if (file) boton.textContent = 'Generar hash';
  else if (link) boton.textContent = 'Generar QR';
  else boton.textContent = 'Generar hash y QR';
}

$('fileInput').addEventListener('change', actualizarBoton);
$('linkInput').addEventListener('input', actualizarBoton);

/* ---------- Generar ---------- */

let linkDelQR = '';

$('generateBtn').addEventListener('click', async () => {
  const { file, link } = loQueHay();
  const boton = $('generateBtn');
  if (!file && !link) return;

  const etiqueta = boton.textContent;
  boton.disabled = true;
  if (file) boton.textContent = 'Calculando…';

  try {
    const lineas = [];
    if (link) lineas.push(`URL: ${link}`);
    if (file) lineas.push(`SHA256: ${await calcularHash(file)}`);

    // El bloque del hash tambien muestra la URL sola: sirve para pegar en
    // la cedula aunque no se haya cargado archivo.
    $('hashOutput').innerHTML = lineas.join('<br>');
    $('hashBlock').hidden = false;

    if (link) {
      // Un solo QR por sesion: se re-dibuja en vez de apilar canvases.
      const contenedor = $('qrCanvas');
      contenedor.innerHTML = '';
      crearQR(link, 190).append(contenedor);
      linkDelQR = link;
      $('qrBlock').hidden = false;
    } else {
      $('qrBlock').hidden = true;
      linkDelQR = '';
    }

    $('resultSection').hidden = false;
  } finally {
    boton.disabled = false;
    boton.textContent = etiqueta;
  }
});

/* ---------- Descarga del QR ---------- */

function cargarImagen(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('QR')); };
    img.src = url;
  });
}

/* Descarga a 600px (impreso en una cedula, 190 se ve pixelado) sobre fondo
   blanco con margen: es la zona de silencio que necesita el lector. */
$('downloadQrBtn').addEventListener('click', async (e) => {
  if (!linkDelQR) return;
  const boton = e.currentTarget;
  boton.disabled = true;
  try {
    const lado = 600;
    const blob = await crearQR(linkDelQR, lado).getRawData('png');
    const img = await cargarImagen(blob);

    const margen = Math.round(lado * 0.08);
    const canvas = document.createElement('canvas');
    canvas.width = lado + margen * 2;
    canvas.height = lado + margen * 2;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, margen, margen, lado, lado);

    const png = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const url = URL.createObjectURL(png);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-copias.png';
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    boton.disabled = false;
  }
});

$('copyHashBtn').addEventListener('click', (e) => {
  copiar($('hashOutput').innerText, e.currentTarget);
});

/* ---------- Verificador ---------- */

async function verificar() {
  const file = $('verifyFileInput').files[0];
  if (!file) {
    $('verifyResultSection').hidden = true;
    return;
  }
  $('verifyHashOutput').textContent = await calcularHash(file);
  $('verifyResultSection').hidden = false;
}

// Al elegir archivo calcula solo; el botón queda para reintentar.
$('verifyFileInput').addEventListener('change', verificar);
$('calculateHashBtn').addEventListener('click', verificar);

$('copyVerifyHashBtn').addEventListener('click', (e) => {
  copiar($('verifyHashOutput').textContent, e.currentTarget);
});
