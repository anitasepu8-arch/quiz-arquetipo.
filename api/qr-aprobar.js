// Al aprobar un pago por QR desde el botón del correo: confirma y envía a la persona el siguiente paso.
// Variables de entorno: las mismas de api/qr.js, más (opcional) ML_GROUP_MINI (ya existente para el Mini)
// y ML_GROUP_DIAGNOSTICO (grupo "Diagnóstico · comprado", id 202324811542693007) para el Diagnóstico.
import { leerToken, crearToken, leerReferencia } from "./_mini-token.js";

const BASE = "https://quiz.quantumbranding.iprosper28.com";
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sumarDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

async function enviarEmailComprador(to, asunto, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Quantum Branding <onboarding@resend.dev>",
        to: [to],
        subject: asunto,
        html,
      }),
    });
  } catch (e) { console.error("enviarEmailComprador", e); }
}

async function mlActualizar(email, fields, grupo) {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key || !email) return;
  try {
    const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ email, fields }),
    });
    if (!r.ok) { console.error("MailerLite qr-aprobar", r.status, (await r.text()).slice(0, 400)); return; }
    if (grupo) {
      const sub = (await r.json())?.data || {};
      if (sub.id) {
        await fetch(`https://connect.mailerlite.com/api/subscribers/${sub.id}/groups/${grupo}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}` } }).catch(() => {});
        await fetch(`https://connect.mailerlite.com/api/subscribers/${sub.id}/groups/${grupo}`, { method: "POST", headers: { Authorization: `Bearer ${key}` } }).catch(() => {});
      }
    }
  } catch (e) { console.error("mlActualizar", e); }
}

function pagina(titulo, texto) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title></head>
  <body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0E0506;color:#F5F1E8;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center">
    <div><h1 style="color:#D4AF78;font-size:22px">${esc(titulo)}</h1><p style="color:#BFB3A6;max-width:360px;margin:0 auto">${texto}</p></div>
  </body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  let datos = null;
  try { datos = leerToken(req.query.t); } catch (e) { console.error("leerToken", e); return res.status(500).send(pagina("Error de configuración", "Falta configurar la clave que firma estos enlaces.")); }
  if (!datos) return res.status(400).send(pagina("Enlace no válido", "Este link de aprobación no es válido, ya se usó o expiró."));

  const { tipo, nombre, email, ref } = datos;

  if (tipo === "mini" && ref) {
    const refDatos = leerReferencia(ref);
    if (refDatos) {
      const compra = new Date().toISOString().slice(0, 10);
      let link = "";
      try { link = `${BASE}/mini.html?t=${crearToken({ ref, nombre, compra })}`; } catch (e) { console.error("crearToken mini", e); }
      await mlActualizar(email, {
        name: nombre, quiz_estado: "mini_comprado", quiz_mini_compra: compra,
        quiz_mini_vence: sumarDias(compra, 7), quiz_mini_link: link,
      }, process.env.ML_GROUP_MINI || "");
      await enviarEmailComprador(email, "Tu Mini Diagnóstico Exprés está listo",
        `<p>Hola ${esc(nombre || "")},</p><p>Confirmamos tu pago. Aquí está tu Mini Diagnóstico Exprés:</p><p><a href="${link}">${link}</a></p><p>— Quantum Branding</p>`);
    } else {
      await enviarEmailComprador(email, "Tu pago fue confirmado",
        `<p>Hola ${esc(nombre || "")},</p><p>Confirmamos tu pago del Mini Diagnóstico Exprés. Ana te escribe en breve con tu resultado.</p>`);
    }
  } else if (tipo === "auditoria") {
    await enviarEmailComprador(email, "Tu pago fue confirmado — Auditoría de Marca",
      `<p>Hola ${esc(nombre || "")},</p><p>Confirmamos tu pago de la Auditoría de Marca™. Ana se pondrá en contacto contigo por WhatsApp para los siguientes pasos.</p>`);
  } else {
    // Diagnóstico de Identidad™: se consolida en MailerLite — al entrar al grupo, la automatización
    // "Diagnóstico · Entrega" envía el correo con el link al formulario en PDF. Sin correo directo por Resend
    // (evita duplicar el envío).
    await mlActualizar(email, { name: nombre, quiz_estado: "diagnostico_comprado" }, process.env.ML_GROUP_DIAGNOSTICO || "202324811542693007");
  }

  return res.status(200).send(pagina("✅ Pago aprobado", `Se confirmó el pago de <b>${esc(nombre || "")}</b>${email ? ` (${esc(email)})` : ""} y se le avisó por correo.`));
}
