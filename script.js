// Función para calcular el hash del archivo
async function calculateHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Generar QR para el link ingresado
function generateQRCode(link) {
    const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        data: link,
        dotsOptions: {
            color: "#0056b3",
            type: "rounded"
        },
        backgroundOptions: {
            color: "#ffffff",
        }
    });

    const canvas = document.getElementById('qrCanvas');
    qrCode.append(canvas);

    return qrCode; // Para usar en descarga
}

// Manejo del evento de generación
document.getElementById('generateBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const linkInput = document.getElementById('linkInput');
    const hashOutput = document.getElementById('hashOutput');
    const resultSection = document.getElementById('resultSection');

    if (!fileInput.files.length) {
        alert("Seleccione un archivo para generar su hash.");
        return;
    }

    if (!linkInput.value) {
        alert("Ingrese un link para generar el QR.");
        return;
    }

    const file = fileInput.files[0];
    const link = linkInput.value;

    // Calcular hash
    const hash = await calculateHash(file);
    hashOutput.innerHTML = `URL: ${link}<br>SHA256: ${hash}`;
    resultSection.style.display = 'block';

    // Generar y mostrar QR
    const qrCode = generateQRCode(link);

    // Descargar QR
    document.getElementById('downloadQrBtn').addEventListener('click', () => {
        qrCode.download({
            name: "qr_code",
            extension: "png"
        });
    });
});

// Copiar el contenido del hashOutput al portapapeles
document.getElementById('copyHashBtn').addEventListener('click', () => {
    const hashOutput = document.getElementById('hashOutput');
    const content = hashOutput.innerText;

    if (content.trim() === "") {
        alert("No hay contenido para copiar.");
        return;
    }

    navigator.clipboard.writeText(content)
        .then(() => {
            alert("Copiado al portapapeles.");
        })
        .catch(err => {
            console.error("Error al copiar:", err);
            alert("Hubo un error al intentar copiar el contenido.");
        });
});

// Detectar cambios en el input de archivo y calcular el hash automáticamente
document.getElementById('verifyFileInput').addEventListener('change', async (event) => {
    const fileInput = event.target;
    const hashOutput = document.getElementById('verifyHashOutput');
    const resultSection = document.getElementById('verifyResultSection');

    // Verificar si se seleccionó un archivo
    if (!fileInput.files.length) {
        resultSection.style.display = 'none';
        return;
    }

    const file = fileInput.files[0];

    try {
        // Calcular el hash
        const hash = await calculateHash(file);
        hashOutput.textContent = hash;
        resultSection.style.display = 'block';
    } catch (error) {
        console.error("Error al calcular el hash:", error);
        alert("Ocurrió un error al calcular el hash. Intente de nuevo.");
    }
});

// Copiar el SHA256 del Modal
document.getElementById('copyVerifyHashBtn').addEventListener('click', () => {
    const hashOutput = document.getElementById('verifyHashOutput').textContent;
    navigator.clipboard.writeText(hashOutput).then(() => {
        alert("Hash copiado al portapapeles.");
    }).catch((error) => {
        console.error("Error al copiar el hash:", error);
        alert("No se pudo copiar el hash. Inténtelo manualmente.");
    });
});

// Mostrar el hash cuando se hace clic en el botón de calcular hash en móvil
document.getElementById('calculateHashBtn').addEventListener('click', async () => {
    const verifyFileInput = document.getElementById('verifyFileInput');
    const hashOutput = document.getElementById('verifyHashOutput');
    const resultSection = document.getElementById('verifyResultSection');

    // Verificar si se seleccionó un archivo
    if (!verifyFileInput.files.length) {
        alert("Seleccione un archivo para calcular su hash.");
        return;
    }

    const file = verifyFileInput.files[0];

    try {
        // Calcular el hash
        const hash = await calculateHash(file);
        hashOutput.textContent = hash;
        resultSection.style.display = 'block';
    } catch (error) {
        console.error("Error al calcular el hash:", error);
        alert("Ocurrió un error al calcular el hash. Por favor, intente de nuevo.");
    }
});