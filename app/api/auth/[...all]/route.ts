import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs";

async function handle(request: Request, method: "GET" | "POST") {
  const { auth } = await import("../../../../lib/auth");
  const handler = toNextJsHandler(auth)[method];
  return handler(request);
}

export const GET = (request: Request) => handle(request, "GET");
export const POST = (request: Request) => handle(request, "POST");
