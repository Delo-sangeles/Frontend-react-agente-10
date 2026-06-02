// components/Chat/ChatWindow.tsx
import { useRef, useState } from "react";
import { useAgentChat } from "../../hooks/useAgentChat";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { AgentSteps } from "./AgentSteps";
import type { Theme } from "../../hooks/useTheme";
import type { Platform } from "../../services/api";

interface ChatWindowProps {
  theme: Theme;
  onThemeToggle: () => void;
}

const PLATFORMS: { value: Platform; label: string; badge: string }[] = [
  { value: "twitter", label: "Twitter / X", badge: "𝕏" },
  { value: "linkedin", label: "LinkedIn", badge: "in" },
  { value: "instagram", label: "Instagram", badge: "◈" },
  { value: "blog", label: "Blog", badge: "✦" },
  { value: "science", label: "Ciencia", badge: "⚗" },
  { value: "finance", label: "Finanzas", badge: "◎" },
];

const SUGGESTIONS = [
  "IA en la educación del futuro",
  "Tips de productividad para devs",
  "El futuro del trabajo remoto",
  "Cómo aprender a programar en 2025",
];

export function ChatWindow({ theme, onThemeToggle }: ChatWindowProps) {
  const {
    messages,
    isLoading,
    error,
    config,
    sendMessage,
    updateConfig,
    clearChat,
  } = useAgentChat();

  const [input, setInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-mono, monospace)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-primary)",
          borderBottom: "0.5px solid var(--border)",
          padding: "0 20px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ color: "var(--accent-text)", flexShrink: 0 }}
>
  <rect x="7" y="7" width="10" height="10" rx="1"/>
  <path d="M9 7V4M12 7V4M15 7V4"/>
  <path d="M9 20v-3M12 20v-3M15 20v-3"/>
  <path d="M7 9H4M7 12H4M7 15H4"/>
  <path d="M20 9h-3M20 12h-3M20 15h-3"/>
  <rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" fillOpacity="0.15"/>
</svg>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              display: "none",
            }}
            className="sm-show"
          >
            AI Operations
          </span>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                background: "none",
                border: "0.5px solid var(--border)",
                padding: "5px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
              }}
            >
              clear
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            title={isDark ? "Switch to light" : "Switch to dark"}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: "0.5px solid var(--border)",
              background: "var(--bg-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              transition: "border-color 0.15s",
            }}
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {/* ── Main scroll area ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Empty state — generator form */}
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              gap: "28px",
              maxWidth: "560px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* Title */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                CONTENT GENERATOR
              </p>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                What do you want to create?
              </h1>
            </div>

            {/* Platform selector */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                width: "100%",
              }}
            >
              {PLATFORMS.map((p) => {
                const active = config.platform === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => updateConfig({ platform: p.value })}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      padding: "14px 8px",
                      border: active
                        ? "1.5px solid var(--accent)"
                        : "0.5px solid var(--border)",
                      borderRadius: "6px",
                      background: active
                        ? "var(--accent-subtle)"
                        : "var(--bg-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: active
                          ? "var(--accent-text)"
                          : "var(--text-muted)",
                      }}
                    >
                      {p.badge}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.04em",
                        color: active
                          ? "var(--accent-text)"
                          : "var(--text-muted)",
                      }}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Topic input */}
            <div style={{ width: "100%" }}>
              <div
                style={{
                  border: "0.5px solid var(--border)",
                  borderRadius: "8px",
                  background: "var(--input-bg)",
                  overflow: "hidden",
                  transition: "border-color 0.15s",
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onInput={() => {
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                      textareaRef.current.style.height = `${Math.min(
                        textareaRef.current.scrollHeight,
                        160
                      )}px`;
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Describe your topic... e.g. 'AI trends in healthcare 2025'"
                  rows={3}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "14px 16px",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderTop: "0.5px solid var(--border)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <button
                    onClick={() => setShowAdvanced((v) => !v)}
                    style={{
                      fontSize: "11px",
                      color: showAdvanced
                        ? "var(--accent-text)"
                        : "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      letterSpacing: "0.04em",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{showAdvanced ? "▲" : "▼"}</span>
                    <span>Advanced options</span>
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    style={{
                      background: "var(--accent)",
                      color: "var(--btn-text)",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      letterSpacing: "0.05em",
                      opacity: !input.trim() || isLoading ? 0.4 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {isLoading ? "..." : "GENERATE"}
                  </button>
                </div>
              </div>

              {/* Advanced options */}
              {showAdvanced && (
                <div
                  style={{
                    marginTop: "8px",
                    border: "0.5px solid var(--border)",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    overflow: "hidden",
                  }}
                >
                  <ChatInput
                    config={config}
                    onConfigChange={updateConfig}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    textareaRef.current?.focus();
                  }}
                  style={{
                    fontSize: "11px",
                    padding: "6px 12px",
                    border: "0.5px solid var(--border)",
                    borderRadius: "4px",
                    background: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {(messages.length > 0 || isLoading) && (
          <div
            style={{
              flex: 1,
              maxWidth: "640px",
              margin: "0 auto",
              width: "100%",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <AgentSteps
                isLoading={isLoading}
                platform={config.platform}
                model={config.model}
              />
            )}

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  border: "0.5px solid #f09595",
                  borderRadius: "6px",
                  background: "#fcebeb",
                  fontSize: "12px",
                  color: "#a32d2d",
                  fontFamily: "inherit",
                }}
              >
                ⚠ {error}
              </div>
            )}

            <div ref={bottomRef} />

            {/* Send bar after messages */}
            <div
              style={{
                position: "sticky",
                bottom: "16px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  border: "0.5px solid var(--border)",
                  borderRadius: "8px",
                  background: "var(--input-bg)",
                  overflow: "hidden",
                  boxShadow: isDark
                    ? "0 0 0 1px #1f1f1f"
                    : "0 2px 12px rgba(0,0,0,0.08)",
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={isLoading}
                  placeholder="Write another topic... (Enter to send)"
                  rows={1}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "12px 16px",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "8px 12px",
                    borderTop: "0.5px solid var(--border)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    style={{
                      background: "var(--accent)",
                      color: "var(--btn-text)",
                      border: "none",
                      padding: "7px 18px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      letterSpacing: "0.05em",
                      opacity: !input.trim() || isLoading ? 0.4 : 1,
                    }}
                  >
                    {isLoading ? "..." : "GENERATE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}