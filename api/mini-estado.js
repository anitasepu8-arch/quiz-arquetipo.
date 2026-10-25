// Para la pantalla de "pago confirmado" del Mini: dado el correo, dice si ya existe el enlace personal
// (lo escribe api/stripe-webhook.js en MailerLite apenas Stripe confirma el pago). El navegador hace polling
// corto a este endpoint para poder mostrar el botón directo en vez de solo "revisa tu correo".
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ ok: false, link: "" });
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) return res.status(200).json({ ok: false, link: "" });
  try {
    const r = await fetch(`https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return res.status(200).json({ ok: false, link: "" });
    const sub = (await r.json())?.data || {};
    const link = String(sub.fields?.quiz_mini_link || "");
    const estado = String(sub.fields?.quiz_estado || "");
    if (link && (estado === "mini_comprado" || estado === "diagnostico_comprado")) return res.status(200).json({ ok: true, link });
    return res.status(200).json({ ok: false, link: "" });
  } catch (e) {
    console.error("mini-estado", e);
    return res.status(200).json({ ok: false, link: "" });
  }
}
