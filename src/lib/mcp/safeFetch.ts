import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

// Fetch de JSON con protección contra SSRF, para leer Client ID Metadata
// Documents (URLs que elige el cliente, sin autenticar). No alcanza con mirar
// el hostname: un dominio público puede resolver a una IP privada, de
// loopback o link-local (169.254.169.254, el metadata service de la nube), y
// con DNS rebinding puede cambiar entre la verificación y la conexión. Por
// eso la validación va en el `lookup` del propio socket: se juzga la
// dirección exacta a la que se va a conectar, y si no es pública, no hay
// conexión. Tampoco se siguen redirects: el documento tiene que vivir en la
// URL que es el client_id.

function isPublicV4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = p;
  if (a === 0 || a === 10 || a === 127) return false; // "this", privada, loopback
  if (a === 100 && b >= 64 && b <= 127) return false; // 100.64/10 (CGNAT)
  if (a === 169 && b === 254) return false; // link-local, metadata de la nube
  if (a === 172 && b >= 16 && b <= 31) return false; // 172.16/12
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false; // 192.0.0/24, TEST-NET-1
  if (a === 192 && b === 168) return false; // 192.168/16
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if (a === 198 && b === 51 && c === 100) return false; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return false; // TEST-NET-3
  if (a >= 224) return false; // multicast, reservadas, broadcast
  return true;
}

function isPublicV6(ip: string): boolean {
  const lower = ip.toLowerCase();
  // IPv4 mapeada: ::ffff:a.b.c.d o ::ffff:hhhh:hhhh → se juzga la v4.
  const dotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPublicV4(dotted[1]);
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isPublicV4(`${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`);
  }
  if (lower === "::" || lower === "::1") return false;
  if (lower.startsWith("64:ff9b:")) return false; // NAT64: puede envolver privadas
  if (lower.startsWith("2001:db8:")) return false; // documentación
  const first = parseInt(lower.split(":")[0] || "0", 16);
  if ((first & 0xfe00) === 0xfc00) return false; // fc00::/7 (ULA)
  if ((first & 0xffc0) === 0xfe80) return false; // fe80::/10 (link-local)
  if ((first & 0xff00) === 0xff00) return false; // ff00::/8 (multicast)
  return true;
}

/** ¿Es una dirección IP pública (ruteable en internet)? */
export function isPublicAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) return isPublicV4(address);
  if (family === 6) return isPublicV6(address);
  return false;
}

// `lookup` para el socket: resuelve y descarta las direcciones no públicas.
// Si no queda ninguna, la conexión falla antes de abrirse.
function guardedLookup(allowPrivate: boolean): net.LookupFunction {
  return (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, all: true }, (err, results) => {
      if (err) {
        callback(err, "", undefined);
        return;
      }
      const list = (Array.isArray(results) ? results : [results]) as dns.LookupAddress[];
      const allowed = list.filter((r) => allowPrivate || isPublicAddress(r.address));
      if (allowed.length === 0) {
        callback(new Error(`La dirección de ${hostname} no es pública`), "", undefined);
        return;
      }
      if (options.all) callback(null, allowed, undefined);
      else callback(null, allowed[0].address, allowed[0].family);
    });
  };
}

export interface FetchPublicJsonOptions {
  /** Solo para pruebas locales: acepta direcciones privadas y http plano. */
  allowPrivate?: boolean;
  timeoutMs?: number;
  maxBytes?: number;
}

/**
 * GET de un documento JSON en una URL elegida por terceros. Devuelve el JSON
 * parseado, o null si la respuesta no es 200, no es JSON, excede el tamaño,
 * tarda de más, redirige, o resuelve a una dirección no pública.
 */
export function fetchPublicJson(url: URL, opts: FetchPublicJsonOptions = {}): Promise<unknown> {
  const { allowPrivate = false, timeoutMs = 5000, maxBytes = 64 * 1024 } = opts;
  if (url.protocol !== "https:" && !(allowPrivate && url.protocol === "http:")) {
    return Promise.resolve(null);
  }
  const mod = url.protocol === "https:" ? https : http;

  return new Promise((resolve) => {
    const req = mod.request(
      url,
      {
        method: "GET",
        headers: { accept: "application/json", "user-agent": "Registruti-MCP/1.0 (+https://registruti.app)" },
        agent: false, // socket nuevo por request: nada de reusar conexiones validadas para otro host
        lookup: guardedLookup(allowPrivate),
        timeout: timeoutMs,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > maxBytes) {
            req.destroy();
            resolve(null);
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch {
            resolve(null);
          }
        });
        res.on("error", () => resolve(null));
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", () => resolve(null));
    req.end();
  });
}
