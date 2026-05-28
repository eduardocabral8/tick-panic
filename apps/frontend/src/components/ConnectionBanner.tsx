interface ConnectionBannerProps {
  connected: boolean;
}

export default function ConnectionBanner({ connected }: ConnectionBannerProps) {
  return (
    <div
      role="status"
      aria-live="assertive"
      aria-hidden={connected}
      className={`fixed top-0 left-0 right-0 z-50 bg-error text-background font-sans text-xs lowercase tracking-wide text-center py-1 px-page transition-opacity duration-200 ${
        connected ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      sin conexión, reintentando…
    </div>
  );
}
