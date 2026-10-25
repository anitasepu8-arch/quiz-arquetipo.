// Pago por QR en Bolivia: recibe el comprobante y le avisa a Ana por correo con un botón para aprobar.
// Variables de entorno en Vercel:
//   RESEND_API_KEY   clave de Resend (resend.com → API Keys) — sin esto, este endpoint no puede enviar el correo
//   RESEND_FROM      opcional, ej. "Quantum Branding <pagos@quantumbranding.iprosper28.com>" (si falta, usa onboarding@resend.dev)
//   ANA_EMAIL        opcional, correo de Ana para recibir el aviso (si falta, usa asepulveda@iprosper28.com)
//   MINI_SECRET / MAILERLITE_API_KEY  ya existentes (firman el link de aprobar, vía _mini-token.js)
import { crearToken } from "./_mini-token.js";

const BASE = "https://quiz.quantumbranding.iprosper28.com";
const limpiar = (v, max = 400) => (v === undefined || v === null ? "" : String(v).slice(0, max).trim());
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const NOMBRE_PRODUCTO = {
  diagnostico: "Diagnóstico de Identidad (USD 152)",
  mini: "Mini Diagnóstico Exprés (USD 27)",
  auditoria: "Auditoría de Marca (USD 555)",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: "sin_clave" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  const tipo = ["diagnostico", "mini", "auditoria"].includes(b.tipo) ? b.tipo : "diagnostico";
  const nombre = limpiar(b.nombre, 100) || "Sin nombre";
  const email = limpiar(b.email, 200).toLowerCase();
  const telefono = limpiar(b.telefono, 30);
  const monto = limpiar(b.monto, 30);
  const ref = limpiar(b.ref, 200);

  const img = b.imagen || {};
  const base64 = typeof img.base64 === "string" ? img.base64.split(",").pop() : "";
  if (!base64) return res.status(400).json({ ok: false, error: "sin_imagen" });
  if (base64.length > 7_000_000) return res.status(400).json({ ok: false, error: "imagen_grande" });

  let aprobarUrl = "";
  try {
    const token = crearToken({ tipo, nombre, email, telefono, ref, ts: Date.now() });
    aprobarUrl = `${BASE}/api/qr-aprobar?t=${encodeURIComponent(token)}`;
  } catch (e) {
    console.error("crearToken qr.js", e);
    return res.status(500).json({ ok: false, error: "config" });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px">
      <h2 style="color:#4E0000">Pago por QR (Bolivia) pendiente de aprobar</h2>
      <p>
        <b>Producto:</b> ${esc(NOMBRE_PRODUCTO[tipo])}<br>
        <b>Nombre:</b> ${esc(nombre)}<br>
        ${email ? `<b>Correo:</b> ${esc(email)}<br>` : ""}
        ${telefono ? `<b>Teléfono:</b> ${esc(telefono)}<br>` : ""}
        ${monto ? `<b>Monto declarado:</b> ${esc(monto)}<br>` : ""}
      </p>
      <p>Revisa el comprobante adjunto contra tu banco. Cuando confirmes que el dinero llegó, aprueba el pago:</p>
      <p><a href="${aprobarUrl}" style="display:inline-block;background:#D4AF78;color:#0E0506;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">✅ Aprobar pago</a></p>
      <p style="font-size:12px;color:#888">Al aprobar, se le envía automáticamente a la persona el siguiente paso de su producto.</p>
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Quantum Branding <onboarding@resend.dev>",
        to: [process.env.ANA_EMAIL || "asepulveda@iprosper28.com"],
        subject: `QR pendiente de aprobar: ${nombre} — ${NOMBRE_PRODUCTO[tipo]}`,
        html,
        attachments: [{ filename: "comprobante.jpg", content: base64 }],
      }),
    });
    if (!r.ok) {
      console.error("Resend", r.status, (await r.text()).slice(0, 500));
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("qr.js error", e);
    return res.status(502).json({ ok: false });
  }
}
