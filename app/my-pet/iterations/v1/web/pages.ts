import { DEMO_FOUND_COORDS, type Pet } from '../src/engine';

export const THEME_CSS = `
:root {
  --background: #F4F7F5;
  --surface: #FFFFFF;
  --text: #1C2B24;
  --text-muted: #5C6B64;
  --accent: #1F7A5C;
  --accent-muted: #D5EDE4;
  --alert: #C45C26;
  --error: #B42318;
  --border: #D5E0DA;
  --radius: 12px;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  background: var(--background);
  color: var(--text);
}
.wrap { max-width: 420px; margin: 0 auto; padding: 24px 16px 48px; }
.brand { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
h1 { font-size: 28px; margin: 8px 0 4px; }
.muted { color: var(--text-muted); }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin: 16px 0;
}
.btn {
  display: block;
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: var(--radius);
  font-size: 16px; font-weight: 700;
  cursor: pointer;
  padding: 12px 16px;
}
.btn-alert { background: var(--alert); color: var(--surface); }
.btn-accent { background: var(--accent); color: var(--surface); }
.btn-ghost { background: var(--accent-muted); color: var(--text); margin-top: 8px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ok { color: var(--accent); font-weight: 700; }
.err { color: var(--error); }
a { color: var(--accent); }
.qr { width: 100%; max-width: 280px; display: block; margin: 16px auto; background: var(--surface); padding: 12px; border-radius: var(--radius); }
.list { list-style: none; padding: 0; margin: 0; }
.list li { padding: 12px 0; border-bottom: 1px solid var(--border); }
@media print {
  .no-print { display: none !important; }
  body { background: white; }
}
`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${THEME_CSS}</style>
</head>
<body>
  <div class="wrap">${body}</div>
</body>
</html>`;
}

export function hubPage(origin: string): string {
  return layout(
    'my Pet — web de prueba',
    `
    <div class="brand">my Pet · V1 prueba</div>
    <h1>Web de prueba</h1>
    <p class="muted">Esta URL es la que va dentro del QR. Arranca con <code>npm run web</code>.</p>
    <div class="card">
      <p><strong>Mascota semilla</strong></p>
      <p>Luna (perro) — token <code>demo-luna</code></p>
      <p><a href="/p/demo-luna">Abrir landing de hallazgo</a></p>
      <p><a href="/print/demo-luna">Ficha imprimible</a></p>
      <p><a href="/owner">Dashboard del dueño (HTML)</a></p>
    </div>
    <div class="card">
      <p class="muted">Origen actual: ${escapeHtml(origin)}</p>
      <p class="muted">API: <code>GET /api/pets</code> · <code>POST /api/p/:token/alert</code></p>
    </div>
    `,
  );
}

export function notFoundPage(): string {
  return layout(
    'my Pet — no encontrado',
    `
    <div class="brand">my Pet</div>
    <h1>No encontramos esta mascota</h1>
    <p class="muted">El código QR no coincide con un registro vigente.</p>
    <p><a href="/">Volver al inicio de prueba</a></p>
    `,
  );
}

export function landingPage(pet: Pet): string {
  const name = escapeHtml(pet.name);
  const species = escapeHtml(pet.species);
  const demoLat = DEMO_FOUND_COORDS.lat;
  const demoLng = DEMO_FOUND_COORDS.lng;
  return layout(
    `${pet.name} · my Pet`,
    `
    <div class="brand">my Pet</div>
    <h1>Me llamo ${name}</h1>
    <p class="muted">${species} · parece que me perdí</p>
    <div class="card">
      <p>Si me encontraste, avisa a mi familia. Se enviará tu ubicación aproximada (si el navegador lo permite).</p>
      <button class="btn btn-alert" id="found-btn" type="button">Encontré tu mascota<br/><span style="font-weight:400;font-size:14px">parece perdida</span></button>
      <button class="btn btn-ghost" id="demo-btn" type="button">Enviar con ubicación de prueba</button>
      <p id="status" class="muted"></p>
    </div>
    <p class="muted">No se muestra la dirección de casa. Página de prueba V1.</p>
    <script>
      const statusEl = document.getElementById('status');
      const foundBtn = document.getElementById('found-btn');
      const demoBtn = document.getElementById('demo-btn');
      const token = ${JSON.stringify(pet.publicToken)};

      function setStatus(msg, cls) {
        statusEl.className = cls || 'muted';
        statusEl.textContent = msg;
      }

      async function postAlert(payload) {
        foundBtn.disabled = true;
        demoBtn.disabled = true;
        setStatus('Enviando aviso…');
        try {
          const res = await fetch('/api/p/' + encodeURIComponent(token) + '/alert', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) {
            setStatus(data.error && data.error.message ? data.error.message : 'No se pudo enviar', 'err');
            foundBtn.disabled = false;
            demoBtn.disabled = false;
            return;
          }
          setStatus('Listo. El dueño fue notificado.', 'ok');
        } catch (e) {
          setStatus('Error de red. Intenta de nuevo.', 'err');
          foundBtn.disabled = false;
          demoBtn.disabled = false;
        }
      }

      foundBtn.addEventListener('click', function () {
        if (!navigator.geolocation) {
          postAlert({ foundLat: null, foundLng: null });
          return;
        }
        setStatus('Pidiendo ubicación…');
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            postAlert({
              foundLat: pos.coords.latitude,
              foundLng: pos.coords.longitude,
              accuracyMeters: pos.coords.accuracy,
            });
          },
          function () {
            setStatus('Sin GPS. Enviando aviso sin coordenadas…');
            postAlert({ foundLat: null, foundLng: null });
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      });

      demoBtn.addEventListener('click', function () {
        postAlert({
          foundLat: ${demoLat},
          foundLng: ${demoLng},
          accuracyMeters: 15,
          usedDemoLocation: true,
        });
      });
    </script>
    `,
  );
}

export function printPage(pet: Pet, qrSrc: string, publicUrl: string): string {
  const name = escapeHtml(pet.name);
  const species = escapeHtml(pet.species);
  return layout(
    `Imprimir QR · ${pet.name}`,
    `
    <div class="brand">my Pet</div>
    <h1>${name}</h1>
    <p class="muted">${species}</p>
    <img class="qr" alt="Código QR de ${name}" src="${escapeHtml(qrSrc)}" />
    <p style="text-align:center;font-weight:700">Si me encuentras, escanea este código</p>
    <p class="muted" style="text-align:center;word-break:break-all">${escapeHtml(publicUrl)}</p>
    <p class="no-print"><button class="btn btn-accent" type="button" onclick="window.print()">Imprimir</button></p>
    `,
  );
}

export function ownerPage(
  origin: string,
  pets: Pet[],
  alertsHtml: string,
): string {
  const rows = pets
    .map(
      (p) =>
        `<li><strong>${escapeHtml(p.name)}</strong> · ${escapeHtml(p.species)}<br/>
         <span class="muted">${escapeHtml(p.address)}</span><br/>
         <a href="/p/${encodeURIComponent(p.publicToken)}">Landing</a> ·
         <a href="/print/${encodeURIComponent(p.publicToken)}">Imprimir QR</a></li>`,
    )
    .join('');
  return layout(
    'my Pet — dueño (prueba)',
    `
    <div class="brand">my Pet · dashboard prueba</div>
    <h1>Mascotas</h1>
    <p class="muted">Vista HTML para probar sin Expo. La app Android es la experiencia del dueño.</p>
    <div class="card">
      <ul class="list">${rows || '<li class="muted">Sin mascotas</li>'}</ul>
    </div>
    <h1>Alertas</h1>
    <div class="card">
      <ul class="list">${alertsHtml || '<li class="muted">Sin alertas todavía</li>'}</ul>
    </div>
    <p><a href="/">Hub</a> · origen ${escapeHtml(origin)}</p>
    `,
  );
}
