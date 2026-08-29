# Hash y QR para copias de traslado

Herramienta web que calcula el **hash SHA-256** de un archivo y genera el **QR** de su
link público, para adjuntar copias de traslado en notificaciones que se diligencian por
el [BUS Federal de Justicia](https://www.bus-justicia.org.ar/) o por carta documento.

**El archivo nunca se sube a ningún servidor**: el hash se calcula en el navegador con
`crypto.subtle`, y el QR se dibuja sobre el link que escribe el usuario.

## [🔗 Ir a la herramienta](https://nahv.github.io/instructivo_copias_civil_1/)

## Stack

- HTML, CSS y JavaScript, sin build ni dependencias de servidor
- [`crypto.subtle.digest`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) para el SHA-256
- [QRCodeStyling.js](https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js) para el QR

## Correr en local

```bash
python3 -m http.server 8020
```

## Licencia

MIT.

---

Desarrollado por Nahuel Vallejos · Una herramienta de [Iudex](https://iudex.com.ar)
