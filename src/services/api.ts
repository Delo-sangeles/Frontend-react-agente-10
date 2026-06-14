// services/api.ts

const API_URL = "http://localhost:8000";

const MOCK = false; // cambia a false cuando el backend esté listo

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

// ── INTERFAZ AJUSTADA PARA TU ENDPOINT DE BLUESKY ──
// Mapea exactamente los campos del payload que tu FastAPI espera (payload: BlueskyPublishRequest)
export interface BlueskyPublishRequest {
  text: string;
  handle: string;
  app_password?: string; // Opcional por si en producción prefieres leerlo de variables de entorno en el backend
}

// Interfaz para tipar la respuesta exitosa que devuelve tu backend
export interface BlueskyPublishResponse {
  message: string;
  uri: string;
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

// Funcion para subir PDFS
// Envía un archivo PDF al servidor de FastAPI para extraer su texto
// e indexarlo directamente en la colección de ChromaDB.
export async function uploadPDF(file: File): Promise<{ message: string }> {
  // 1. Creamos el contenedor FormData que empaqueta archivos binarios
  const formData = new FormData();
  
  // CRUCIAL: El nombre "file" tiene que ser EXACTAMENTE el mismo 
  // que pusiste en FastAPI -> (file: UploadFile = File(...))
  formData.append("file", file);

  // 2. Hacemos la petición POST a tu servidor local
  const response = await fetch(`${API_URL}/upload-pdf`, {
    method: "POST",
    body: formData,
  });

  // 3. Si el backend escupe un error (un 400 o 500), lo capturamos
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error en el servidor (${response.status})`);
  }

  // 4. Retornamos la respuesta exitosa del backend
  return response.json(); 
}

// ── FUNCIÓN NUEVA: PUBLICAR EN BLUESKY ──
// Conecta directamente con tu endpoint asíncrono @app.post("/api/publish-bluesky")
export async function publishToBluesky(request: BlueskyPublishRequest): Promise<BlueskyPublishResponse> {
  // 1. Si estás probando la interfaz en local con MOCK activo, simulamos el delay
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    return { 
      message: "¡Post publicado con éxito en Bluesky! (Simulado por Frontend)", 
      uri: "at://did:plc:mockuri12345/app.bsky.feed.post/mock" 
    };
  }

  // 2. Petición POST real enviando el JSON estructurado con text, handle y app_password
  const response = await fetch(`${API_URL}/api/publish-bluesky`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  // 3. Si Bluesky rechaza las credenciales o el texto, capturamos el HTTPException(status_code=400)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // errorData.detail obtendrá el result["error"] devuelto por tu servicio de Python
    throw new Error(errorData.detail || `Error al publicar en Bluesky (${response.status})`);
  }

  // 4. Devolvemos el JSON con el mensaje y el URI de la publicación
  return response.json();
}