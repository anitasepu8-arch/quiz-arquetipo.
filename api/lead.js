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
