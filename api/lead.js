// Recibe los datos del quiz y los guarda en MailerLite (crea o actualiza el contacto).
// Variables de entorno en Vercel:
//   MAILERLITE_API_KEY         clave de API de MailerLite (Integraciones → API)
//   ML_GROUP_INICIADO          id del grupo "Quiz · iniciado"   (opcional)
//   ML_GROUP_COMPLETADO        id del grupo "Quiz · completado" (opcional)
//   ML_GROUP_PAGO_ABIERTO_MINI id del grupo "Pago · Mini abierto sin completar" (default: 202403942273910636)
//   ML_GROUP_PAGO_ABIERTO_DIAG id del grupo "Pago · Diagnóstico abierto sin completar" (default: 202403942930319163)
// estado "pago_abierto" (Diagnóstico) y "pago_abierto_mini" (Mini) disparan el recordatorio del mismo día
// en MailerLite (automatizaciones "Pago · ... abierto — recordatorio mismo día").

const CAMPOS = [
  "estado", "genero", "fecha_nac", "hora_nac", "lugar_nac", "arquetipo", "arquetipo_percibido",
  "dedica", "negocio", "modelo", "modelo_detalle", "modelo_encaje", "ingreso", "ubicacion",
  "busca", "dolor", "tiempo", "alineacion_vida", "alineacion_negocio", "acepta_mensajes", "paso",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid",
  "cuenta", "analisis", "redes", "marca", "instagram", "decision", "mini_pago_link",
];

const limpiar = (v, max = 400) => (v === undefined || v === null ? "" : String(v).slice(0, max).trim());

// Mismo tipo de cambio fijo que usa el front (TIPO_FIJO.BOB en index.html).
const bs = (usd) => "Bs " + Math.round(usd * 11).toLocaleString("es-BO");

// Bloque de CTA del producto a recomendar, según tramo de ingreso y si paga en bolivianos (QR) o en tarjeta (USD).
// Solo se usa en el correo de "Quiz completado sin compra": en los otros, el producto ya está fijo por la fase.
function ctaBloque(ingreso, latam) {
  const precioMini = latam ? `USD 27 (${bs(27)} por QR)` : "USD 27";
  const precioDiag = latam ? `USD 152 (${bs(152)} por QR)` : "USD 152";
  const precioDiagDesc = latam ? `USD 125 (${bs(125)} por QR)` : "USD 125";
  const btn = (href, texto) => `<p style="text-align:center;margin:24px 0"><a href="${href}" style="display:inline-block;background:#D4AF78;color:#1a1008;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">${texto}</a></p>`;
  if (["10000", "50000"].includes(ingreso)) {
    const wa = "https://wa.me/17865188044?text=" + encodeURIComponent("Hola Ana, hice el quiz y quiero agendar una llamada.");
    return btn(wa, "Agendar mi llamada");
  }
  if (ingreso === "3000") {
    return btn("https://buy.stripe.com/aFa8wP4nW53Y14576U4F20e", `Ver mi Diagnóstico de Identidad · ${precioDiag}`)
      + `<p style="font-size:13px;color:#777">¿Prefieres algo más ligero? El Mini Diagnóstico Exprés (${precioMini}) también está disponible.</p>`;
  }
  return btn("https://quiz.quantumbranding.iprosper28.com/", `Ver mi Mini Diagnóstico · ${precioMini}`)
    + `<p style="font-size:13px;color:#777">Si tomas el Diagnóstico completo en los 7 días siguientes, esos USD 27 se descuentan y te queda en ${precioDiagDesc}.</p>`;
}

// Bloque de contexto (brecha de alineación + redes/reconocimiento), reutilizado en los correos de seguimiento.
function contextoBloque(negocioSi, alineVida, alineNeg, marcaReconocen, usaRedes) {
  const partes = [];
  if (alineVida !== "" && alineVida !== undefined) {
    const v = Number(alineVida) || 0;
    const n = negocioSi && alineNeg !== "" && alineNeg !== undefined ? Number(alineNeg) : null;
    const pct = n !== null ? Math.min(v, n) : v;
    const alta = pct >= 90;
    if (negocioSi) {
      partes.push(alta
        ? "Tu alineación ya está en un nivel alto (90% o más): lo que más te conviene ahora es posicionamiento fuera de la lógica de referidos, que te encuentren por lo que eres, no solo por quién te recomendó."
        : "Antes de pensar en posicionamiento, lo que más te conviene es claridad: entender primero cómo estás diseñada y desde ahí construir tu marca.");
    } else {
      partes.push(alta
        ? "Tu alineación ya está en un nivel alto: el paso que sigue es sostenerlo con una dirección clara, no seguir probando opciones."
        : "Lo que más te conviene ahora es claridad primero: entender cómo estás diseñada antes de decidir el siguiente paso.");
    }
  }
  if (negocioSi) {
    partes.push(marcaReconocen && usaRedes
      ? "Ya construiste reconocimiento en redes: el siguiente paso es afinarlo. Te ofrezco una mini-auditoría gratis de tu Instagram o TikTok, y si quieres ir más a fondo, la Auditoría de Marca completa."
      : "Antes de pensar en auditar tu contenido, lo que más urge es visibilidad: que te vean y te recuerden. Eso empieza por tu Diagnóstico de Identidad, no por auditar lo que todavía no existe.");
  }
  return partes.map((t) => `<p>${t}</p>`).join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const key = process.env.MAILERLITE_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: "Falta MAILERLITE_API_KEY" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  const email = limpiar(b.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: "Correo inválido" });

  const fields = { name: limpiar(b.nombre, 100) };
  if (b.telefono) fields.phone = limpiar(b.telefono, 20);
  for (const k of CAMPOS) {
    const v = limpiar(b[k], k === "analisis" ? 900 : 400);
    if (v !== "") fields["quiz_" + k] = v;
  }

  // Bloques calculados para los correos de seguimiento segmentados (ver automatizaciones "... — recordatorio").
  const negocioSi = ["negocio", "independiente"].includes(limpiar(b.dedica));
  const latam = limpiar(b.ubicacion) === "Latinoamérica";
  fields.quiz_negocio_sn = negocioSi ? "si" : "no";
  fields.quiz_cta_bloque = limpiar(ctaBloque(limpiar(b.ingreso), latam), 1500);
  fields.quiz_contexto_bloque = limpiar(
    contextoBloque(negocioSi, limpiar(b.alineacion_vida), limpiar(b.alineacion_negocio), limpiar(b.marca) === "Sí, me reconocen y me recuerdan", ["si", "aveces"].includes(limpiar(b.redes))),
    1500
  );

  const groups = [];
  if (process.env.ML_GROUP_INICIADO) groups.push(process.env.ML_GROUP_INICIADO);
  if (b.estado === "completado" && process.env.ML_GROUP_COMPLETADO) groups.push(process.env.ML_GROUP_COMPLETADO);
  if (b.estado === "pago_abierto_mini") groups.push(process.env.ML_GROUP_PAGO_ABIERTO_MINI || "202403942273910636");
  if (b.estado === "pago_abierto") groups.push(process.env.ML_GROUP_PAGO_ABIERTO_DIAG || "202403942930319163");

  try {
    const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ email, fields, ...(groups.length ? { groups } : {}) }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("MailerLite", r.status, t.slice(0, 500));
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("MailerLite error", e);
    return res.status(502).json({ ok: false });
  }
}
