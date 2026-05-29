const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function PressureBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 120% at 50% 6%, transparent 42%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, opacity: 0.04 }}
      />
    </div>
  );
}
