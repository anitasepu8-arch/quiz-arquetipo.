// Análisis por capturas: la persona sube 1 a 3 capturas (perfil, Insights o publicaciones)
// y conversa con la analista sobre ellas. No se guarda nada: solo se usa para responder.
// Variables de entorno en Vercel:
//   ANTHROPIC_API_KEY   clave de la API de Anthropic (console.anthropic.com)
// POST { imagenes: ["data:image/jpeg;base64,..."], mensajes: [{role:"user"|"assistant", texto}], arquetipo, vende }

export const config = { maxDuration: 60, api: { bodyParser: { sizeLimit: "4mb" } } };

const MODELO = "claude-sonnet-5-5";
const RE_IMG = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: "sin_clave" });

  const imgs = (Array.isArray(b.imagenes) ? b.imagenes : []).slice(0, 3);
  if (!imgs.length || !imgs.every((s) => typeof s === "string" && RE_IMG.test(s) && s.length < 1_000_000)) {
    return res.status(400).json({ ok: false, error: "imagen" });
  }

  const hist = (Array.isArray(b.mensajes) ? b.mensajes : [])
    .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.texto === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, texto: m.texto.slice(0, 2000) }));
  if (!hist.length || hist[0].role !== "user") return res.status(400).json({ ok: false, error: "mensajes" });

  const arq = String(b.arquetipo || "").slice(0, 80);
  const vende = String(b.vende || "").slice(0, 200);
  const system = `Eres la analista de Quantum Branding. Lees capturas de Instagram o TikTok (perfil, Insights o publicaciones) y respondes en español, de tú, directo y concreto.
Usa solo lo que se ve en las capturas: si un número no se lee, dilo. No inventes cifras.
Diseño de la persona: arquetipo "${arq}"${vende ? `, vende cuando puede ${vende}` : ""}. Basa la estrategia en ese diseño: pilares y ángulos que lo sostengan, no consejos genéricos.
Señala todo lo que no funciona, sin suavizarlo: cada número en rojo o amarillo y cada punto débil visible (bio, destacados, pilares, aperturas repetidas, formatos, constancia). No te limites a lo que funciona.
En el primer análisis usa estos títulos, en este orden: Lo que veo · Lo que comunica tu perfil · Pilares · Ángulos que funcionan · Freno principal · Estrategia en 3 pasos.
En las respuestas siguientes, contesta a lo que pregunte y sé breve.`;

  const messages = hist.map((m, i) => (i === 0
    ? { role: "user", content: [
        ...imgs.map((s) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: s.split(",")[1] } })),
        { type: "text", text: m.texto },
      ] }
    : { role: m.role, content: m.texto }));

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODELO, max_tokens: 1500, system, messages }),
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status} ${(await r.text()).slice(0, 200)}`);
    const data = await r.json();
    const respuesta = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    return res.status(200).json({ ok: true, respuesta });
  } catch (e) {
    console.error("Captura", e?.message);
    return res.status(502).json({ ok: false, error: "modelo" });
  }
}
