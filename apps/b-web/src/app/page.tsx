'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3000';

  useEffect(() => {
    fetch(`${baseUrl}/health`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStatus(data.status === 'ok' ? 'ok' : 'error');
      })
      .catch(() => setStatus('error'));
  }, [baseUrl]);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>b-web</h1>
      <p>API status: {status}</p>
    </main>
  );
}
