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

// CTA del producto a recomendar, según tramo de ingreso y si paga en bolivianos (QR) o en tarjeta (USD).
// Solo se usa en el correo de "Quiz completado sin compra": en los otros, el producto ya está fijo por la fase.
// IMPORTANTE: MailerLite inserta el valor de un campo personalizado como TEXTO PLANO escapado dentro de
// un correo HTML (builder_html), no como HTML real. Por eso esto devuelve valores sueltos (link/texto/nota)
// para rellenar un botón YA armado en la plantilla del correo, en vez de devolver las etiquetas <p>/<a> armadas.
function ctaValores(ingreso, latam) {
  const precioMini = latam ? `USD 27 (${bs(27)} por QR)` : "USD 27";
  const precioDiag = latam ? `USD 152 (${bs(152)} por QR)` : "USD 152";
  const precioDiagDesc = latam ? `USD 125 (${bs(125)} por QR)` : "USD 125";
  if (["10000", "50000"].includes(ingreso)) {
    const wa = "https://wa.me/17865188044?text=" + encodeURIComponent("Hola Ana, hice el quiz y quiero agendar una llamada.");
    return { link: wa, texto: "Agendar mi llamada", nota: "" };
  }
  if (ingreso === "3000") {
    return {
      link: "https://buy.stripe.com/aFa8wP4nW53Y14576U4F20e",
      texto: `Ver mi Diagnóstico de Identidad · ${precioDiag}`,
      nota: `¿Prefieres algo más ligero? El Mini Diagnóstico Exprés (${precioMini}) también está disponible.`,
    };
  }
  return {
    link: "https://quiz.quantumbranding.iprosper28.com/",
    texto: `Ver mi Mini Diagnóstico · ${precioMini}`,
    nota: `Si tomas el Diagnóstico completo en los 7 días siguientes, esos USD 27 se descuentan y te queda en ${precioDiagDesc}.`,
  };
}

// Contexto (brecha de alineación + redes/reconocimiento), reutilizado en los correos de seguimiento.
// Mismo motivo que arriba: devuelve hasta 2 frases sueltas en texto plano, no HTML armado.
function contextoValores(negocioSi, alineVida, alineNeg, marcaReconocen, usaRedes) {
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
  return { p1: partes[0] || "", p2: partes[1] || "" };
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

  // Valores calculados para los correos de seguimiento segmentados (ver automatizaciones "... — recordatorio").
  // Se guardan como campos sueltos de texto plano (no HTML armado): ver nota en ctaValores/contextoValores.
  const negocioSi = ["negocio", "independiente"].includes(limpiar(b.dedica));
  const latam = limpiar(b.ubicacion) === "Latinoamérica";
  fields.quiz_negocio_sn = negocioSi ? "si" : "no";

  const cta = ctaValores(limpiar(b.ingreso), latam);
  fields.quiz_cta_link = limpiar(cta.link, 500);
  fields.quiz_cta_texto = limpiar(cta.texto, 200);
  fields.quiz_cta_nota = limpiar(cta.nota, 300);

  const ctx = contextoValores(negocioSi, limpiar(b.alineacion_vida), limpiar(b.alineacion_negocio), limpiar(b.marca) === "Sí, me reconocen y me recuerdan", ["si", "aveces"].includes(limpiar(b.redes)));
  fields.quiz_contexto_1 = limpiar(ctx.p1, 400);
  fields.quiz_contexto_2 = limpiar(ctx.p2, 400);

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
