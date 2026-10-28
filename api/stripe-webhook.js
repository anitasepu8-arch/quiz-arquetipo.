// Stripe → (pago del Mini o del Diagnóstico confirmado) → MailerLite (el grupo dispara el correo de entrega).
// Variables de entorno en Vercel:
//   STRIPE_WEBHOOK_SECRET      firma del webhook (Stripe → Developers → Webhooks → tu endpoint → Signing secret)
//   MINI_SECRET                opcional (si no está, se deriva de MAILERLITE_API_KEY)
//   MAILERLITE_API_KEY         ya existente
//   ML_GROUP_MINI               id del grupo "Mini · comprado" en MailerLite
//   ML_GROUP_DIAGNOSTICO        id del grupo "Diagnóstico · comprado" en MailerLite (202324811542693007)
// El Diagnóstico (Payment Link directo sin client_reference_id) se distingue del Mini ($27) por el monto
// pagado (amount_total en centavos): 15200 = Diagnóstico completo ($152), 12500 = Diagnóstico con el
// descuento de USD 27 ya aplicado ($125, para quien ya pagó el Mini). Cualquier otro valor se procesa
// como Mini (compatibilidad).
import crypto from "node:crypto";
import { crearToken, leerReferencia } from "./_mini-token.js";

const BASE = "https://quiz.quantumbranding.iprosper28.com";

async function cuerpoCrudo(req) {
  const partes = [];
  for await (const p of req) partes.push(typeof p === "string" ? Buffer.from(p) : p);
  return Buffer.concat(partes).toString("utf8");
}

function firmaValida(crudo, cabecera, secreto) {
  const campos = Object.fromEntries(String(cabecera || "").split(",").map((x) => x.split("=")).filter((x) => x.length === 2));
  const t = campos.t;
  const v1s = String(cabecera || "").split(",").filter((x) => x.startsWith("v1=")).map((x) => x.slice(3));
  if (!t || !v1s.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false;
  const esperado = crypto.createHmac("sha256", secreto).update(`${t}.${crudo}`).digest("hex");
  return v1s.some((v) => v.length === esperado.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(esperado)));
}

const sumarDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) return res.status(500).json({ error: "Falta STRIPE_WEBHOOK_SECRET" });

  const crudo = await cuerpoCrudo(req);
  if (!firmaValida(crudo, req.headers["stripe-signature"], secreto)) return res.status(400).json({ error: "Firma inválida" });

  let ev; try { ev = JSON.parse(crudo); } catch { return res.status(400).end(); }
  if (ev.type !== "checkout.session.completed") return res.status(200).json({ ok: true, ignorado: ev.type });

  const s = ev.data?.object || {};
  const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
  const nombre = String(s.customer_details?.name || "").trim().split(/\s+/)[0] || "";
  const ref = s.client_reference_id || "";
  const datos = leerReferencia(ref);
  const compra = new Date((ev.created || Date.now() / 1000) * 1000).toISOString().slice(0, 10);

  const ml = (ruta, metodo, cuerpo) => fetch(`https://connect.mailerlite.com/api${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}` },
    ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
  });

  // Diagnóstico de Identidad™ ($152): Payment Link directo, sin datos del quiz.
  // Solo hace falta guardar el nombre y meterlo al grupo que dispara el correo con el PDF del formulario.
  if (s.amount_total === 15200 || s.amount_total === 12500) {
    if (!email) { console.error("Diagnóstico sin correo", s.id); return res.status(200).json({ ok: false }); }
    const grupoDiag = process.env.ML_GROUP_DIAGNOSTICO || "202324811542693007";
    try {
      const r = await ml("/subscribers", "POST", { email, fields: { name: nombre, quiz_estado: "diagnostico_comprado" } });
      if (!r.ok) { console.error("MailerLite Diagnóstico", r.status, (await r.text()).slice(0, 400)); return res.status(500).json({ ok: false }); }
      const sub = (await r.json())?.data || {};
      const id = sub.id;
      if (id) {
        await ml(`/subscribers/${id}/groups/${grupoDiag}`, "DELETE").catch(() => {});
        const g = await ml(`/subscribers/${id}/groups/${grupoDiag}`, "POST");
        if (!g.ok) { console.error("MailerLite grupo Diagnóstico", g.status, (await g.text()).slice(0, 400)); return res.status(500).json({ ok: false }); }
      }
    } catch (e) { console.error("MailerLite error Diagnóstico", e); return res.status(500).json({ ok: false }); }
    return res.status(200).json({ ok: true, tipo: "diagnostico" });
  }

  if (!email) { console.error("Mini sin correo", s.id); return res.status(200).json({ ok: false }); }

  const fields = { name: nombre, quiz_estado: "mini_comprado", quiz_mini_compra: compra, quiz_mini_vence: sumarDias(compra, 7) };
  if (datos) {
    const token = crearToken({ ref, nombre, compra });
    fields.quiz_mini_link = `${BASE}/mini.html?t=${token}`;
  } else {
    // Compra sin datos del quiz: Ana completa a mano (queda marcado en MailerLite)
    fields.quiz_mini_link = "";
    fields.quiz_estado = "mini_sin_datos";
    console.error("Mini sin referencia del quiz", s.id, email);
  }

  const grupo = process.env.ML_GROUP_MINI || "";
  try {
    // 1) Guardar datos y enlace (sin grupo todavía)
    const r = await ml("/subscribers", "POST", { email, fields });
    if (!r.ok) { console.error("MailerLite", r.status, (await r.text()).slice(0, 400)); return res.status(500).json({ ok: false }); }
    const sub = (await r.json())?.data || {};
    const id = sub.id;
    // 2) Sacar y volver a meter en el grupo: la automatización se dispara al ENTRAR al grupo,
    //    así que quien ya estaba (segunda compra, pruebas) no recibía el correo.
    if (grupo && id) {
      await ml(`/subscribers/${id}/groups/${grupo}`, "DELETE").catch(() => {});
      const g = await ml(`/subscribers/${id}/groups/${grupo}`, "POST");
      if (!g.ok) { console.error("MailerLite grupo", g.status, (await g.text()).slice(0, 400)); return res.status(500).json({ ok: false }); }
    }
    // 3) Quien tiene negocio entra además a "Mini · comprado con negocio": una automatización aparte
    //    le ofrece la mini-auditoría gratis 24 h después. No toca la automatización de entrega.
    //    Pausa de 4s antes de esta segunda alta: si entra al mismo segundo que "Mini · comprado",
    //    MailerLite puede registrar un solo evento de disparador y perder una de las dos automatizaciones
    //    que escuchan ese grupo (visto en compras reales, ej. 26 oct 19:26:56).
    const dedica = String(sub.fields?.quiz_dedica || "");
    const grupoNegocio = process.env.ML_GROUP_MINI_NEGOCIO || "202276509645276405";
    if (id && ["negocio", "independiente"].includes(dedica)) {
      await new Promise((r) => setTimeout(r, 4000));
      await ml(`/subscribers/${id}/groups/${grupoNegocio}`, "DELETE").catch(() => {});
      const gn = await ml(`/subscribers/${id}/groups/${grupoNegocio}`, "POST").catch(() => null);
      if (gn && !gn.ok) console.error("MailerLite grupo negocio", gn.status);
    }
  } catch (e) { console.error("MailerLite error", e); return res.status(500).json({ ok: false }); }

  return res.status(200).json({ ok: true });
}
