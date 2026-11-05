import Link from 'next/link';

export default function EnrollmentPage() {
  return (
    <main className="wrap">
      <Link href="/">← Flota</Link>
      <h1>Provisionar Device Owner</h1>
      <div className="card">
        <ol>
          <li>
            Teléfono corporativo <strong>sin cuentas</strong> (nuevo o factory reset). En el
            asistente omití Wi‑Fi/SIM y no creés Google ni Samsung.
          </li>
          <li>
            Instalá el APK (no pide reboot). USB + depuración. <code>adb devices</code> debe
            decir <code>device</code>.
          </li>
          <li>
            Owner:
            <pre>
              adb shell dpm set-device-owner
              com.wika.geoempresa/com.wika.geoempresa.devicepolicy.GeoDeviceAdminReceiver
            </pre>
          </li>
          <li>Abrí el agente y registrá nombre + coordenadas base.</li>
          <li>
            Volvé a Flota, clic en el <strong>nombre</strong> del equipo (no en la tabla) y
            pulsá Aprobar.
          </li>
        </ol>
        <p className="muted">
          Si <code>dpm</code> falla por cuentas, queda Device Admin: lock remoto sí; reboot, PIN
          y autolock no. El panel no reemplaza el provisionamiento de Android.
        </p>
      </div>
    </main>
  );
}
