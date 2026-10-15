/** Cloudflare Worker entry point for the standalone RU_LIFE runtime. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { handleManagedSso, hasManagedSsoSession, managedSsoEnabled, requiresManagedBrowserSso } from "./app-manager-sso.mjs";

interface Env {
  ASSETS: Fetcher;
  RU_LIFE_ACCESS_MODE?: string;
  RU_LIFE_SSO_ENABLED?: string;
  RU_LIFE_SSO_CALLBACK_URL?: string;
  RU_LIFE_SSO_SESSION_KEY?: string;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const sso = await handleManagedSso(request, env);
    if (sso) return sso;
    if (managedSsoEnabled(env) && requiresManagedBrowserSso(url.pathname) &&
        !await hasManagedSsoSession(request, env)) {
      if (request.method === "GET") {
        return Response.redirect(url.origin + "/__sso/start", 303);
      }
      return Response.json({ ok: false, code: "APP_MANAGER_SSO_REQUIRED" }, {
        status: 401, headers: { "cache-control": "no-store, private" }
      });
    }
        if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
