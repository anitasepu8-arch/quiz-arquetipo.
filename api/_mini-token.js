// Enlace personal del Mini: datos codificados + firma, para que nadie pueda fabricar un Mini sin pagar.
import crypto from "node:crypto";
import { EJES } from "./_mini-banco.js";

const b64u = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const desdeB64u = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");

// Referencia corta que viaja por Stripe (client_reference_id, máx. 200, solo A-Z a-z 0-9 - _):
// m1-<eje1><eje2><superpoder><bloqueo>-<f|m>-<AAAAMMDD>   ej.: m1-3402-f-19880928
// m2-<eje1><eje2><superpoder><bloqueo>-<n.º superpoderes><n.º bloqueos>-<decisión s|n|x>-<f|m>-<AAAAMMDD>
//    ej.: m2-3402-53-s-f-19880928  (5 superpoderes, 3 bloqueos, tiene una decisión pendiente)
export function leerReferencia(ref) {
  const r = String(ref || "");
  const m2 = /^m2-([0-7])([0-7])([0-7])([0-7])-([1-8])([1-8])-([snx])-([fm])-(\d{8})$/.exec(r);
  if (m2) {
    const [, a, b, sp, bl, nSp, nBl, dec, g, f] = m2;
    return { ejes: [EJES[+a], EJES[+b]], sp: EJES[+sp], bl: EJES[+bl], g, fecha: f, nSp: +nSp, nBl: +nBl, decision: dec === "s" };
  }
  const m = /^m1-([0-7])([0-7])([0-7])([0-7])-([fm])-(\d{8})$/.exec(r);
  if (!m) return null;
  const [, a, b, sp, bl, g, f] = m;
  return { ejes: [EJES[+a], EJES[+b]], sp: EJES[+sp], bl: EJES[+bl], g, fecha: f, nSp: 1, nBl: 1, decision: false };
}

function firma(texto) {
  // MINI_SECRET es opcional: si no existe, se deriva de la clave de MailerLite (nunca se muestra).
  const base = process.env.MINI_SECRET || (process.env.MAILERLITE_API_KEY ? crypto.createHash("sha256").update("qb-mini|" + process.env.MAILERLITE_API_KEY).digest("hex") : "");
  if (!base) throw new Error("Falta MINI_SECRET o MAILERLITE_API_KEY");
  const secreto = base;
  return b64u(crypto.createHmac("sha256", secreto).update(texto).digest()).slice(0, 32);
}

// datos: { ref, nombre, compra (AAAA-MM-DD) }
export function crearToken(datos) {
  const cuerpo = b64u(JSON.stringify(datos));
  return `${cuerpo}.${firma(cuerpo)}`;
}

export function leerToken(token) {
  const [cuerpo, sig] = String(token || "").split(".");
  if (!cuerpo || !sig) return null;
  const esperado = firma(cuerpo);
  if (sig.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;
  try { return JSON.parse(desdeB64u(cuerpo).toString("utf8")); } catch { return null; }
}
