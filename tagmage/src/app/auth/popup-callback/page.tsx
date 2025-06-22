'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PopupCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (window.opener) {
      if (error) {
        window.opener.postMessage({ type: 'auth-error', error }, window.location.origin);
      } else if (code) {
        // We can't send the full session, but we can signal success.
        // The main window will then re-fetch the session.
        window.opener.postMessage({ type: 'auth-success' }, window.location.origin);
      }
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-gray-700">Autenticando, por favor aguarde...</p>
    </div>
  );
} 