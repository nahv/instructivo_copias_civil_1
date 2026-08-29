/* Hash y QR para copias de traslado.
   El archivo NUNCA sale del navegador: crypto.subtle calcula el SHA-256
   localmente y el QR se dibuja sobre el link que escribe el usuario. */

const $ = (id) => document.getElementById(id);

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

/* ---------- Generar hash + QR ---------- */

let qr = null;

$('generateBtn').addEventListener('click', async () => {
  const file = $('fileInput').files[0];
  const link = $('linkInput').value.trim();
  const boton = $('generateBtn');

  if (!file) return $('fileInput').focus();
  if (!link) return $('linkInput').focus();

  boton.disabled = true;
  boton.textContent = 'Calculando…';
  try {
    const hash = await calcularHash(file);
    $('hashOutput').innerHTML = `URL: ${link}<br>SHA256: ${hash}`;
    $('resultSection').hidden = false;

    // Un solo QR por sesión: se re-dibuja en vez de apilar canvases.
    const contenedor = $('qrCanvas');
    contenedor.innerHTML = '';
    qr = new QRCodeStyling({
      width: 190,
      height: 190,
      data: link,
      dotsOptions: { color: '#0f0f0e', type: 'rounded' },
      backgroundOptions: { color: '#ffffff' },
    });
    qr.append(contenedor);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Generar hash y QR';
  }
});

$('downloadQrBtn').addEventListener('click', () => {
  if (qr) qr.download({ name: 'qr-copias', extension: 'png' });
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
