import { useState } from 'react';

export default function RulesOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-page right-page w-10 h-10 border border-text-primary rounded-button font-mono text-lg text-text-primary hover:border-accent hover:text-accent focus:outline-none transition-colors"
        aria-label="ver reglas del juego"
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="reglas del juego"
          className="fixed inset-0 bg-background z-50 overflow-y-auto"
        >
          <div
            className="flex min-h-full flex-col items-center justify-center px-page"
            style={{
              paddingTop: 'max(24px, env(safe-area-inset-top))',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="w-full max-w-md space-y-section font-sans text-sm text-text-primary lowercase text-left">
            <h2 className="font-display text-3xl tracking-tight text-accent">reglas del juego</h2>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">objetivo</h3>
              <p className="text-text-secondary">responde palabras de una categoría antes de que termine el tiempo.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">modo local</h3>
              <p className="text-text-secondary">dos jugadores comparten el dispositivo. uno elige la categoría, el otro responde en voz alta contra reloj y el primero valida las respuestas.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">modo online</h3>
              <p className="text-text-secondary">crea o únete a una sala compartiendo el código de juego. en tu turno, escribe y envía todas las respuestas posibles antes de que expire el tiempo.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">rondas y tiempo</h3>
              <p className="text-text-secondary">son 3 rondas en online (5 rondas en local). el tiempo límite por turno disminuye en cada ronda (5s, 4s y 3s). el límite de respuestas también baja por ronda.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">puntuación</h3>
              <p className="text-text-secondary">cada respuesta que el host marque como válida te da 1 punto. gana quien tenga más puntos acumulados al final.</p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-outline w-full mt-section"
            >
              cerrar
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
