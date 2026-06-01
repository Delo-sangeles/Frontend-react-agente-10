// hooks/useAgentChat.ts
import { useState, useCallback } from "react";
import {
  generateContent,
  type GenerateRequest,
  type GenerateResponse,
  type Platform,
  type Tone,
  type Language,
  type ModelChoice,
} from "../services/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    platform?: string;
    model_used?: string;
    tokens_used?: number;
    latency_ms?: number;
  };
}

export interface AgentConfig {
  platform: Platform;
  tone: Tone;
  language: Language;
  model: ModelChoice;
  audience: string;
  company_context?: string;
}

const DEFAULT_CONFIG: AgentConfig = {
  platform: "twitter",
  tone: "casual",
  language: "es",
  model: "groq",
  audience: "general",
};

export function useAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);

  const addMessage = useCallback((role: "user" | "assistant", content: string, metadata?: Message["metadata"]) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      metadata,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      setError(null);
      addMessage("user", userInput);
      setIsLoading(true);

      try {
        const request: GenerateRequest = {
          platform: config.platform,
          topic: userInput,
          audience: config.audience,
          tone: config.tone,
          language: config.language,
          model: config.model,
          company_context: config.company_context,
        };

        const response: GenerateResponse = await generateContent(request);

        addMessage("assistant", response.content, {
          platform: response.platform,
          model_used: response.model_used,
          tokens_used: response.tokens_used,
          latency_ms: response.latency_ms,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMsg);
        addMessage("assistant", `❌ Error: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [config, isLoading, addMessage]
  );

  const updateConfig = useCallback((newConfig: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    config,
    sendMessage,
    updateConfig,
    clearChat,
  };
}