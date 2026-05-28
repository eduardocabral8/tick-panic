import { useState, useEffect } from 'react';

interface ConnectionBannerProps {
  connected: boolean;
}

export default function ConnectionBanner({ connected }: ConnectionBannerProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (connected) {
      setShouldShow(false);
    } else {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-hidden={connected}
      className={`fixed top-0 left-0 right-0 z-50 bg-error text-background font-sans text-xs lowercase tracking-wide text-center py-1 px-page transition-opacity duration-200 ${
        shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      sin conexión, reintentando…
    </div>
  );
}
