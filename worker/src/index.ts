interface Env {
  TCSTORE: KVNamespace;
}

interface Profile {
  id: string;
  name: string;
  purchased: string[];
  wishlist: string[];
  updatedAt: number;
}

const CORS_ORIGIN = "https://tc-shop.ff14.tw";
const ID_PATTERN = /^[A-Za-z0-9]{8}$/;
const MAX_BODY_SIZE = 100 * 1024; // 100KB
const MAX_NAME_LENGTH = 50;
const RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW = 60; // seconds

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

async function checkRateLimit(ip: string, kv: KVNamespace): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }

  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
  return true;
}

function validateProfile(data: unknown): data is Profile {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== "string" || !ID_PATTERN.test(obj.id)) return false;
  if (typeof obj.name !== "string" || obj.name.length === 0 || obj.name.length > MAX_NAME_LENGTH) return false;
  if (!Array.isArray(obj.purchased) || !obj.purchased.every((v: unknown) => typeof v === "string")) return false;
  if (!Array.isArray(obj.wishlist) || !obj.wishlist.every((v: unknown) => typeof v === "string")) return false;
  if (typeof obj.updatedAt !== "number") return false;

  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Rate limiting
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const allowed = await checkRateLimit(ip, env.TCSTORE);
    if (!allowed) {
      return jsonResponse({ error: "Rate limit exceeded" }, 429);
    }

    // Route matching: /profiles/:id
    const match = url.pathname.match(/^\/profiles\/([A-Za-z0-9]{8})$/);
    if (!match) {
      return jsonResponse({ error: "Not found" }, 404);
    }

    const profileId = match[1];
    const kvKey = `profile:${profileId}`;

    switch (request.method) {
      case "GET": {
        const raw = await env.TCSTORE.get(kvKey);
        if (!raw) {
          return jsonResponse({ error: "Profile not found" }, 404);
        }
        return jsonResponse(JSON.parse(raw), 200);
      }

      case "PUT": {
        // Check body size
        const contentLength = request.headers.get("Content-Length");
        if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
          return jsonResponse({ error: "Body too large" }, 413);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON" }, 400);
        }

        if (!validateProfile(body)) {
          return jsonResponse({ error: "Invalid profile data" }, 400);
        }

        // Ensure URL ID matches body ID
        if (body.id !== profileId) {
          return jsonResponse({ error: "ID mismatch" }, 400);
        }

        await env.TCSTORE.put(kvKey, JSON.stringify(body));
        return jsonResponse({ ok: true }, 200);
      }

      case "DELETE": {
        await env.TCSTORE.delete(kvKey);
        return jsonResponse({ ok: true }, 200);
      }

      default:
        return jsonResponse({ error: "Method not allowed" }, 405);
    }
  },
} satisfies ExportedHandler<Env>;
