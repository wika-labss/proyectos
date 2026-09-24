'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserSupabase } from '../../src/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) throw signError;
      router.replace('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <h1>Geo Empresa TI</h1>
      <p className="muted">Solo cuentas con rol TI.</p>
      <form className="card" onSubmit={(e) => void onSubmit(e)} style={{ maxWidth: 400 }}>
        <label className="muted">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ height: 12 }} />
        <label className="muted">Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="error">{error}</p> : null}
        <div style={{ height: 16 }} />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
