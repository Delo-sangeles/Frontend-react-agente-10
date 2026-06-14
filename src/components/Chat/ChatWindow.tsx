// components/Chat/ChatWindow.tsx
import { useRef, useState } from "react";
import { useAgentChat } from "../../hooks/useAgentChat";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { AgentSteps } from "./AgentSteps";
import { uploadPDF, publishToBluesky } from "../../services/api"; 
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
  "Cómo aprender a programar en 2026",
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
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null); 
  const bottomRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  // ── ESTADOS Y REFERENCIAS PARA LA SUBIDA DE PDFS ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── ESTADOS PARA LA VENTANA EMERGENTE DE BLUESKY ──
  const [isPublishing, setIsPublishing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingContent, setPendingContent] = useState("");
  const [blueskyHandle, setBlueskyHandle] = useState("");
  const [blueskyPassword, setBlueskyPassword] = useState("");

  // ── ESTADO PARA LA NOTIFICACIÓN EMERGENTE PERSONALIZADA ──
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const assistantMessages = messages.filter(m => m.role === "assistant");
  const lastAssistantMessageId = assistantMessages.length > 0 
    ? assistantMessages[assistantMessages.length - 1].id 
    : null;

  const handlePlusClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Por favor, selecciona únicamente archivos en formato PDF.");
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadPDF(file);
      alert(response.message); 
    } catch (err: any) {
      alert("Error al subir el archivo: " + (err.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
    }
  };

  const adjustTextareaHeight = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
    
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    if (bottomTextareaRef.current) bottomTextareaRef.current.style.height = "auto";
    
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

  const handleOpenPublishModal = (content: string) => {
    let cleanText = content.replace(/\*\*/g, "");

    if (cleanText.length > 280) {
      const lineas = cleanText.split("\n").filter(linea => linea.trim().length > 0);
      const titulo = lineas[0] ? lineas[0].trim() : "Artículo de Finanzas";
      const resumen = lineas[1] ? lineas[1].trim() : "¡Echa un vistazo a este nuevo contenido generado por IA!";
      
      cleanText = `📢 ${titulo}\n\n${resumen}`;
      
      if (cleanText.length > 270) {
        cleanText = cleanText.substring(0, 270) + "...";
      }
    }

    setPendingContent(cleanText);
    setShowModal(true);
  };

  const handleActualPublish = async () => {
    if (!pendingContent.trim()) {
      alert("El contenido del post no puede estar vacío.");
      return;
    }
    if (!blueskyHandle.trim() || !blueskyPassword.trim()) {
      alert("Por favor, rellena todos los campos de credenciales.");
      return;
    }

    try {
      setIsPublishing(true);
      await publishToBluesky({
        text: pendingContent,
        handle: blueskyHandle.trim(), 
        app_password: blueskyPassword.trim()
      });
      
      // Muestra la ventana pequeña elegante abajo a la derecha
      setNotification({ show: true, message: "Publicación subida con éxito" });
      setShowModal(false);
      setBlueskyPassword("");

      // Se autooculta a los 4 segundos
      setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 4000);

    } catch (err: any) {
      alert("Error al publicar: " + (err.message || "Error desconocido"));
    } finally {
      setIsPublishing(false);
    }
  };

  const plusButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "0.5px solid var(--border)",
    borderRadius: "4px",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "bold",
    transition: "all 0.15s",
    opacity: isLoading || isUploading ? 0.4 : 1,
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
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* ── VENTANA EMERGENTE (MODAL CREDENCIALES + EDICIÓN DE TEXTO) ── */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 999, padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "24px", maxWidth: "420px", width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)"
          }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 600 }}>Publicar en Bluesky</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "11px", color: "var(--text-muted)" }}>
              Revisa el texto recortado e introduce tus credenciales de aplicación.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              {/* Bloque del Recorte de Texto editable */}
              <div>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Contenido del Post (Editable)
                </label>
                <textarea
                  value={pendingContent}
                  onChange={(e) => setPendingContent(e.target.value)}
                  maxLength={280}
                  rows={8}
                  style={{
                    width: "100%", 
                   minHeight: "150px",   // 
                  padding: "10px",      // 
                  borderRadius: "4px",
                  border: "0.5px solid var(--border)", 
                  background: "var(--input-bg)",
                  color: "var(--text-primary)", 
                  fontFamily: "inherit", 
                  fontSize: "13px",     
                  resize: "vertical",  
                  outline: "none", 
                  lineHeight: 1.5       
                  }}
                />
                <div style={{ textAlign: "right", fontSize: "10px", color: pendingContent.length >= 280 ? "#f09595" : "var(--text-muted)", marginTop: "2px" }}>
                  {pendingContent.length} / 280 caracteres
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "4px", color: "var(--text-secondary)" }}>Usuario / Handle</label>
                <input 
                  type="text" 
                  placeholder="ejemplo.bsky.social"
                  value={blueskyHandle}
                  onChange={(e) => setBlueskyHandle(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "0.5px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", fontFamily: "inherit", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "4px", color: "var(--text-secondary)" }}>Contraseña de Aplicación (App Password)</label>
                <input 
                  type="password" 
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  value={blueskyPassword}
                  onChange={(e) => setBlueskyPassword(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "0.5px solid var(--border)", background: "var(--input-bg)", color: "var(--text-primary)", fontFamily: "inherit", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button 
                onClick={() => setShowModal(false)}
                disabled={isPublishing}
                style={{ background: "transparent", border: "0.5px solid var(--border)", color: "var(--text-secondary)", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleActualPublish}
                disabled={isPublishing}
                style={{ background: "var(--accent)", border: "none", color: "var(--btn-text)", padding: "6px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: "12px" }}
              >
                {isPublishing ? "Publicando..." : "Enviar Post"}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-text)", flexShrink: 0 }}>
            <rect x="7" y="7" width="10" height="10" rx="1"/>
            <path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3"/>
            <rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" fillOpacity="0.15"/>
          </svg>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "none" }} className="sm-show">
            AI Operations
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "0.5px solid var(--border)", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
              clear
            </button>
          )}

          <button onClick={onThemeToggle} title={isDark ? "Switch to light" : "Switch to dark"} style={{ width: "32px", height: "32px", borderRadius: "6px", border: "0.5px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "border-color 0.15s" }}>
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {/* ── Main scroll area ── */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Empty state — generator form */}
        {messages.length === 0 && !isLoading && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: "28px", maxWidth: "560px", margin: "0 auto", width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>CONTENT GENERATOR</p>
              <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>What do you want to create?</h1>
            </div>

            {/* Platform selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", width: "100%" }}>
              {PLATFORMS.map((p) => {
                const active = config.platform === p.value;
                return (
                  <button key={p.value} onClick={() => updateConfig({ platform: p.value })} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 8px", border: active ? "1.5px solid var(--accent)" : "0.5px solid var(--border)", borderRadius: "6px", background: active ? "var(--accent-subtle)" : "var(--bg-secondary)", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: active ? "var(--accent-text)" : "var(--text-muted)" }}>{p.badge}</span>
                    <span style={{ fontSize: "10px", letterSpacing: "0.04em", color: active ? "var(--accent-text)" : "var(--text-muted)" }}>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Topic input */}
            <div style={{ width: "100%" }}>
              <div style={{ border: "0.5px solid var(--border)", borderRadius: "8px", background: "var(--input-bg)", overflow: "hidden", transition: "border-color 0.15s" }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onInput={() => adjustTextareaHeight(textareaRef)}
                  disabled={isLoading}
                  placeholder="Describe your topic... e.g. 'AI trends in healthcare'"
                  rows={3}
                  style={{ width: "100%", background: "transparent", border: "none", padding: "14px 16px", fontSize: "13px", color: "var(--text-primary)", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderTop: "0.5px solid var(--border)", background: "var(--bg-secondary)" }}>
                  <button onClick={() => setShowAdvanced((v) => !v)} style={{ fontSize: "11px", color: showAdvanced ? "var(--accent-text)" : "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>{showAdvanced ? "▲" : "▼"}</span>
                    <span>Advanced options</span>
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={handleSend} disabled={!input.trim() || isLoading || isUploading} style={{ background: "var(--accent)", color: "var(--btn-text)", border: "none", padding: "8px 20px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em", opacity: !input.trim() || isLoading || isUploading ? 0.4 : 1, transition: "opacity 0.15s" }}>
                      {isLoading ? "..." : "GENERATE"}
                    </button>
                    
                    <button type="button" onClick={handlePlusClick} disabled={isLoading || isUploading} style={{ ...plusButtonStyle, padding: "8px 14px", fontSize: "14px" }}
                      onMouseEnter={(e) => { if(!isLoading && !isUploading) { e.currentTarget.style.border = "1px solid var(--accent)"; e.currentTarget.style.color = "var(--accent-text)"; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.border = "0.5px solid var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      {isUploading ? "..." : "+"}
                    </button>
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div style={{ marginTop: "8px", border: "0.5px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)", overflow: "hidden" }}>
                  <ChatInput config={config} onConfigChange={updateConfig} isLoading={isLoading} />
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => { setInput(s); setTimeout(() => adjustTextareaHeight(textareaRef), 0); textareaRef.current?.focus(); }} style={{ fontSize: "11px", padding: "6px 12px", border: "0.5px solid var(--border)", borderRadius: "4px", background: "none", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages History Area */}
        {(messages.length > 0 || isLoading) && (
          <div style={{ flex: 1, maxWidth: "640px", margin: "0 auto", width: "100%", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((message) => {
              const isLastAssistantResponse = message.id === lastAssistantMessageId;

              return (
                <div key={message.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <ChatMessage message={message} />
                  
                  {isLastAssistantResponse && !isLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
                      <button onClick={() => handleOpenPublishModal(message.content)} disabled={isPublishing} style={{ fontSize: "11px", fontFamily: "inherit", background: "var(--bg-secondary)", color: "var(--accent-text)", border: "0.5px solid var(--accent)", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: 600, letterSpacing: "0.04em", opacity: isPublishing ? 0.5 : 1, transition: "all 0.15s" }}>
                        PUBLICAR EN BLUESKY
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && <AgentSteps isLoading={isLoading} platform={config.platform} model={config.model} />}

            {error && (
              <div style={{ padding: "12px 16px", border: "0.5px solid #f09595", borderRadius: "6px", background: "#fcebeb", fontSize: "12px", color: "#a32d2d", fontFamily: "inherit" }}>
                ⚠ {error}
              </div>
            )}

            <div ref={bottomRef} />

            {/* Barra de entrada de texto fijada en la parte inferior */}
            <div style={{ position: "sticky", bottom: "16px", marginTop: "8px" }}>
              <div style={{ border: "0.5px solid var(--border)", borderRadius: "8px", background: "var(--input-bg)", overflow: "hidden", boxShadow: isDark ? "0 0 0 1px #1f1f1f" : "0 2px 12px rgba(0,0,0,0.08)" }}>
                <textarea
                  ref={bottomTextareaRef} 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onInput={() => adjustTextareaHeight(bottomTextareaRef)} 
                  disabled={isLoading}
                  placeholder="Write another topic... (Enter to send)"
                  rows={1}
                  style={{ width: "100%", background: "transparent", border: "none", padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "0.5px solid var(--border)", background: "var(--bg-secondary)" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={handleSend} disabled={!input.trim() || isLoading || isUploading} style={{ background: "var(--accent)", color: "var(--btn-text)", border: "none", padding: "7px 18px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em", opacity: !input.trim() || isLoading || isUploading ? 0.4 : 1 }}>
                      {isLoading ? "..." : "GENERATE"}
                    </button>

                    <button type="button" onClick={handlePlusClick} disabled={isLoading || isUploading} style={{ ...plusButtonStyle, padding: "7px 12px", fontSize: "13px" }}
                      onMouseEnter={(e) => { if(!isLoading && !isUploading) { e.currentTarget.style.border = "1px solid var(--accent)"; e.currentTarget.style.color = "var(--accent-text)"; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.border = "0.5px solid var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      {isUploading ? "..." : "+"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── VENTANA EMERGENTE PEQUEÑA (TOAST NOTIFICATION) ── */}
      {notification.show && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--accent)",
          borderRadius: "6px",
          padding: "12px 18px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideIn 0.2s ease-out forwards",
        }}>
          <span style={{ color: "var(--accent-text)", fontSize: "14px", fontWeight: "bold" }}>✓</span>
          <span style={{ fontSize: "12px", color: "var(--text-primary)", letterSpacing: "0.02em" }}>
            {notification.message}
          </span>

          <style>{`
            @keyframes slideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}