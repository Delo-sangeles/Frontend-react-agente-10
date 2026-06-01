// components/Chat/AgentSteps.tsx

interface AgentStepsProps {
  isLoading: boolean;
  platform: string;
  model: string;
}

type StepStatus = "done" | "active" | "pending";

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

const STEPS_BY_PLATFORM: Record<string, Omit<Step, "status">[]> = {
  twitter: [
    { id: "1", label: "Analyzing topic" },
    { id: "2", label: "Building prompt" },
    { id: "3", label: "Generating thread" },
    { id: "4", label: "Optimizing characters" },
  ],
  instagram: [
    { id: "1", label: "Analyzing topic" },
    { id: "2", label: "Building prompt" },
    { id: "3", label: "Generating caption" },
    { id: "4", label: "Adding hashtags" },
  ],
  linkedin: [
    { id: "1", label: "Analyzing topic" },
    { id: "2", label: "Building prompt" },
    { id: "3", label: "Generating post" },
    { id: "4", label: "Adjusting tone" },
  ],
  blog: [
    { id: "1", label: "Analyzing topic" },
    { id: "2", label: "Building structure" },
    { id: "3", label: "Generating content" },
    { id: "4", label: "Optimizing SEO" },
  ],
  science: [
    { id: "1", label: "Analyzing topic" },
    { id: "2", label: "Searching papers" },
    { id: "3", label: "Generating article" },
    { id: "4", label: "Verifying accuracy" },
  ],
  finance: [
    { id: "1", label: "Analyzing market" },
    { id: "2", label: "Fetching live data" },
    { id: "3", label: "Generating analysis" },
    { id: "4", label: "Adding disclaimer" },
  ],
};

export function AgentSteps({ isLoading, platform, model }: AgentStepsProps) {
  if (!isLoading) return null;

  const baseSteps =
    STEPS_BY_PLATFORM[platform] ?? STEPS_BY_PLATFORM["twitter"];

  const steps: Step[] = baseSteps.map((step, i) => ({
    ...step,
    status:
      i === 0 ? "done" : i === 1 ? "active" : "pending",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

      {/* Label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "10px",
          color: "var(--text-muted)",
          fontFamily: "inherit",
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ color: "var(--accent-text)" }}>◎</span>
        <span>{model} · processing</span>
        <span style={{ display: "inline-flex", gap: "2px" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </span>
      </div>

      {/* Steps card */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "0.5px solid var(--border)",
          borderRadius: "2px 8px 8px 8px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "16px",
                height: "16px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {step.status === "done" && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-text)",
                    fontFamily: "inherit",
                  }}
                >
                  ✓
                </span>
              )}
              {step.status === "active" && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "inline-block",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                />
              )}
              {step.status === "pending" && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    border: "0.5px solid var(--border-strong)",
                    display: "inline-block",
                  }}
                />
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: "12px",
                fontFamily: "inherit",
                color:
                  step.status === "active"
                    ? "var(--text-primary)"
                    : step.status === "done"
                    ? "var(--text-muted)"
                    : "var(--border-strong)",
                textDecoration:
                  step.status === "done" ? "line-through" : "none",
                transition: "color 0.15s",
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}