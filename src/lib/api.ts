import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return jsonError(message, 401);
}

export function forbidden(message = "Forbidden") {
  return jsonError(message, 403);
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return unauthorized();
    if (error.message === "FORBIDDEN") return forbidden();
  }
  return jsonError("Request failed", 500);
}
