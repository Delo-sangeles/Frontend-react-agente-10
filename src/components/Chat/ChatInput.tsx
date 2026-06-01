// components/Chat/ChatInput.tsx
import type { AgentConfig } from "../../hooks/useAgentChat";
import type { Tone, Language, ModelChoice } from "../../services/api";

interface ChatInputProps {
  config: AgentConfig;
  onConfigChange: (config: Partial<AgentConfig>) => void;
  isLoading: boolean;
}

const TONES: { value: Tone; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "inspirational", label: "Inspiracional" },
  { value: "educational", label: "Educativo" },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "it", label: "IT" },
];

const MODELS: { value: ModelChoice; label: string; free: boolean }[] = [
  { value: "groq", label: "Groq · Llama 3.3", free: true },
  { value: "gemini", label: "Gemini 2.0 Flash", free: true },
  { value: "ollama", label: "Ollama · Local", free: true },
  { value: "haiku", label: "Claude Haiku", free: false },
  { value: "sonnet", label: "Claude Sonnet", free: false },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "10px",
        color: "var(--text-muted)",
        letterSpacing: "0.1em",
        marginBottom: "8px",
        fontFamily: "inherit",
      }}
    >
      {children}
    </p>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: "11px",
        padding: "5px 10px",
        border: active
          ? "1px solid var(--accent)"
          : "0.5px solid var(--border)",
        borderRadius: "4px",
        background: active ? "var(--accent-subtle)" : "transparent",
        color: active ? "var(--accent-text)" : "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.03em",
        transition: "all 0.15s",
        opacity: disabled ? 0.4 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function ChatInput({ config, onConfigChange, isLoading }: ChatInputProps) {
  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Tone */}
      <div>
        <Label>TONE</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {TONES.map((t) => (
            <OptionButton
              key={t.value}
              active={config.tone === t.value}
              onClick={() => onConfigChange({ tone: t.value })}
              disabled={isLoading}
            >
              {t.label}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <Label>LANGUAGE</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {LANGUAGES.map((l) => (
            <OptionButton
              key={l.value}
              active={config.language === l.value}
              onClick={() => onConfigChange({ language: l.value })}
              disabled={isLoading}
            >
              {l.label}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Model */}
      <div>
        <Label>LLM ENGINE</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {MODELS.map((m) => (
            <button
              key={m.value}
              onClick={() => onConfigChange({ model: m.value })}
              disabled={isLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                padding: "8px 12px",
                border:
                  config.model === m.value
                    ? "1px solid var(--accent)"
                    : "0.5px solid var(--border)",
                borderRadius: "4px",
                background:
                  config.model === m.value
                    ? "var(--accent-subtle)"
                    : "transparent",
                color:
                  config.model === m.value
                    ? "var(--accent-text)"
                    : "var(--text-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                opacity: isLoading ? 0.4 : 1,
              }}
            >
              <span>{m.label}</span>
              {m.free && (
                <span
                  style={{
                    fontSize: "9px",
                    padding: "2px 6px",
                    border: "0.5px solid var(--accent)",
                    borderRadius: "3px",
                    color: "var(--accent-text)",
                    letterSpacing: "0.06em",
                    opacity: 0.7,
                  }}
                >
                  FREE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div>
        <Label>AUDIENCE</Label>
        <input
          type="text"
          value={config.audience}
          onChange={(e) => onConfigChange({ audience: e.target.value })}
          disabled={isLoading}
          placeholder="e.g. developers, students..."
          style={{
            width: "100%",
            background: "transparent",
            border: "0.5px solid var(--border)",
            borderRadius: "4px",
            padding: "8px 12px",
            fontSize: "11px",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            outline: "none",
            opacity: isLoading ? 0.4 : 1,
          }}
        />
      </div>

      {/* Company context */}
      <div>
        <Label>COMPANY CONTEXT</Label>
        <textarea
          value={config.company_context ?? ""}
          onChange={(e) => onConfigChange({ company_context: e.target.value })}
          disabled={isLoading}
          placeholder="Brand tone, keywords, sector..."
          rows={3}
          style={{
            width: "100%",
            background: "transparent",
            border: "0.5px solid var(--border)",
            borderRadius: "4px",
            padding: "8px 12px",
            fontSize: "11px",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            outline: "none",
            resize: "none",
            opacity: isLoading ? 0.4 : 1,
            lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  );
}