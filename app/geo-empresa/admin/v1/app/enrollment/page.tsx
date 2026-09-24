import Link from 'next/link';

export default function EnrollmentPage() {
  return (
    <main className="wrap">
      <Link href="/">← Flota</Link>
      <h1>Provisionar Device Owner</h1>
      <div className="card">
        <ol>
          <li>Factory reset del teléfono corporativo (sin cuentas de usuario).</li>
          <li>
            QR / ADB:
            <pre>
              adb shell dpm set-device-owner
              com.wika.geoempresa/com.wika.geoempresa.devicepolicy.GeoDeviceAdminReceiver
            </pre>
          </li>
          <li>Abrir el agente y registrar nombre + coordenadas base.</li>
          <li>Volver a Flota y pulsar Aprobar (otorgar permiso).</li>
        </ol>
        <p className="muted">
          El panel no reemplaza el provisionamiento de Android. Sin Owner, lock/reboot/PIN fallan.
        </p>
      </div>
    </main>
  );
}
