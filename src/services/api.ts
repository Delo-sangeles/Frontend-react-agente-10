// services/api.ts

const API_URL = "http://localhost:8000";

const MOCK = true; // cambia a false cuando el backend esté listo

export type Platform = "blog" | "twitter" | "instagram" | "linkedin" | "science" | "finance";
export type Tone = "formal" | "casual" | "inspirational" | "educational";
export type Language = "es" | "en" | "fr" | "it";
export type ModelChoice = "groq" | "gemini" | "ollama" | "haiku" | "sonnet";

export interface GenerateRequest {
  platform: Platform;
  topic: string;
  audience: string;
  tone: Tone;
  language: Language;
  model: ModelChoice;
  company_context?: string;
}

export interface GenerateResponse {
  content: string;
  platform: string;
  model_used: string;
  tokens_used?: number;
  latency_ms?: number;
  image_url?: string;
  confidence_score?: number;
}

const MOCK_RESPONSE: GenerateResponse = {
  content: `🧵 1/5 La IA está transformando el mundo del desarrollo...

2/5 En 2024, el 70% de los developers ya usan herramientas de IA en su flujo de trabajo diario. ¿Tú eres uno de ellos?

3/5 Las ventajas son claras: más velocidad, menos bugs, mejor documentación. Pero hay algo que la IA no puede reemplazar: tu criterio.

4/5 El futuro no es IA vs developers. Es developers que usan IA vs los que no.

5/5 ¿Ya tienes tu stack de herramientas IA definido? Cuéntame abajo 👇`,
  platform: "twitter",
  model_used: "groq/llama-3.3-70b-versatile",
  tokens_used: 342,
  latency_ms: 1240,
};

export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 2000));
    return { ...MOCK_RESPONSE, platform: request.platform };
  }

  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error generating content");
  }

  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}