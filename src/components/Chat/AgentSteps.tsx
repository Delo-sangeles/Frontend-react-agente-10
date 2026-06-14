// components/Chat/AgentSteps.tsx

interface AgentStepsProps {
  isLoading: boolean;
  platform: string;
  model: string;
}

export function AgentSteps({ isLoading }: AgentStepsProps) {
  // Si no está cargando, no muestra nada
  if (!isLoading) return null;

  return (
    <div style={{ display: "flex", padding: "12px 16px", marginTop: "4px" }}>
      {/* Tres puntos suspensivos con animación de parpadeo */}
      <span className="loading-dots" style={{ color: "var(--accent-text)", fontSize: "24px", fontWeight: "bold", letterSpacing: "2px" }}>
        ...
      </span>

      {/* Animación CSS para el parpadeo suave */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .loading-dots {
          animation: blink 1.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}