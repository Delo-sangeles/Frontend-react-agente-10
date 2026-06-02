// components/Chat/ChatMessage.tsx
import { useState } from "react";
import type { Message } from "../../hooks/useAgentChat";

interface ChatMessageProps {
  message: Message;
}

const PLATFORM_BADGE: Record<string, string> = {
  twitter: "𝕏",
  instagram: "◈",
  linkedin: "in",
  blog: "✍",
  science: "⚗",
  finance: "◎",
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // Extraemos la imagen si viene en la raíz o dentro de la metadata del hook
  const imageUrl = message.image_url || (message.metadata as any)?.image_url;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            maxWidth: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <div
            style={{
              background: "var(--accent-subtle)",
              border: "0.5px solid var(--accent)",
              borderRadius: "8px 8px 2px 8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </div>
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              fontFamily: "inherit",
            }}
          >
            {message.timestamp.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

      {/* Platform + model label */}
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
        {message.metadata?.platform && (
          <>
            <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>
              {PLATFORM_BADGE[message.metadata.platform]}
            </span>
            <span style={{ textTransform: "uppercase" }}>
              {message.metadata.platform}
            </span>
            <span style={{ color: "var(--border-strong)" }}>·</span>
          </>
        )}
        <span>generated</span>
      </div>

      {/* Content bubble */}
      <div
        style={{
          position: "relative",
          background: "var(--bg-secondary)",
          border: "0.5px solid var(--border)",
          borderRadius: "2px 8px 8px 8px",
          padding: "14px 16px",
          fontSize: "13px",
          color: "var(--text-primary)",
          fontFamily: "inherit",
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
        }}
      >
        <div>{message.content}</div>

        {/* 🛠️ FIX AQUÍ: Si detecta la imagen base64, la inyecta de forma integrada */}
        {imageUrl && (
          <div 
            style={{ 
              marginTop: "14px", 
              borderTop: "0.5px solid var(--border)", 
              paddingTop: "14px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <img 
              src={imageUrl} 
              alt="Visualización del Contenido" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "350px", 
                borderRadius: "6px", 
                border: "0.5px solid var(--border)",
                objectFit: "contain"
              }} 
            />
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "10px",
            padding: "4px 10px",
            border: "0.5px solid var(--border)",
            borderRadius: "3px",
            background: "var(--bg-primary)",
            color: copied ? "var(--accent-text)" : "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>

      {/* Metadata */}
      {message.metadata?.model_used && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "10px",
            color: "var(--text-muted)",
            fontFamily: "inherit",
            paddingLeft: "2px",
          }}
        >
          <span>◎ {message.metadata.model_used.split("/").pop()}</span>
          {message.metadata.tokens_used && (
            <span>⬡ {message.metadata.tokens_used} tokens</span>
          )}
          {message.metadata.latency_ms && (
            <span> {(message.metadata.latency_ms / 1000).toFixed(1)}s</span>
          )}
          <span style={{ marginLeft: "auto" }}>
            {message.timestamp.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
}