/**
 * SHA-256 en hex con Web Crypto. Módulo neutro (sin imports server-only) para
 * poder compartirlo entre el browser (Ajustes, al generar el token) y el
 * servidor (MCP, al verificarlo): así el contrato de hasheo del token vive en
 * un solo lugar y no puede divergir entre ambos lados.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
