// Análisis automático de contenido (Instagram o TikTok) con Apify.
// Variables de entorno en Vercel:
//   APIFY_TOKEN   token de API de Apify (Apify Console → Settings → API & Integrations)
// POST { cuenta: "@usuario" | "https://instagram.com/usuario" | "https://tiktok.com/@usuario" }

export const config = { maxDuration: 60 };

const ACTOR_IG = "apify~instagram-profile-scraper";
const ACTOR_TT = "clockworks~tiktok-profile-scraper";

export function leerCuenta(txt) {
  const v = String(txt || "").trim();
  if (!v) return null;
  const tt = v.match(/tiktok\.com\/@?([A-Za-z0-9._]{2,30})/i);
  if (tt) return { red: "tiktok", usuario: tt[1] };
  const ig = v.match(/instagram\.com\/([A-Za-z0-9._]{1,30})/i);
  if (ig && !["p", "reel", "reels", "stories", "explore"].includes(ig[1].toLowerCase())) return { red: "instagram", usuario: ig[1] };
  if (/^https?:\/\//i.test(v) || /\.[a-z]{2,}\//i.test(v) || /\.(com|net|org|io|co|me|app|bo|es|mx|ar|cl|pe|ec|uy|py|us|ae|site|online|store|shop)$/i.test(v)) return { red: "web", url: v };
  const u = v.replace(/^@/, "").replace(/\s.*$/, "");
  if (/^[A-Za-z0-9._]{1,30}$/.test(u)) return { red: /tiktok/i.test(v) ? "tiktok" : "instagram", usuario: u };
  return null;
}

async function apify(actor, input, maxItems, token) {
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=50&maxItems=${maxItems}&maxTotalChargeUsd=0.25&clean=true`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(`Apify ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

const n = (x) => (Number.isFinite(+x) ? +x : 0);

function normalizarIG(items) {
  const p = items?.[0];
  if (!p || !p.username) return null;
  const tipo = (x) => (x.productType === "clips" || x.type === "Video" ? "Reels" : x.type === "Sidecar" ? "Carruseles" : "Fotos");
  return {
    red: "instagram", usuario: p.username, nombre: p.fullName || "", bio: p.biography || "",
    link: p.externalUrl || "", seguidores: n(p.followersCount), privada: !!p.private, destacados: n(p.highlightReelCount),
    posts: (p.latestPosts || []).map((x) => ({
      tipo: tipo(x), fecha: x.timestamp, pin: !!x.isPinned, texto: x.caption || "", url: x.url || "",
      vistas: x.videoViewCount != null ? n(x.videoViewCount) : null,
      interacciones: n(x.likesCount) + n(x.commentsCount), comentarios: n(x.commentsCount),
    })),
  };
}

function normalizarTT(items) {
  if (!Array.isArray(items) || !items.length) return null;
  const a = items[0].authorMeta || {};
  return {
    red: "tiktok", usuario: a.name || "", nombre: a.nickName || "", bio: a.signature || "",
    link: a.bioLink || "", seguidores: n(a.fans), privada: !!a.privateAccount,
    posts: items.map((x) => ({
      tipo: x.isSlideshow ? "Carruseles" : "Videos", fecha: x.createTimeISO, pin: !!x.isPinned, texto: x.text || "", url: x.webVideoUrl || "",
      vistas: n(x.playCount),
      interacciones: n(x.diggCount) + n(x.commentCount) + n(x.shareCount) + n(x.collectCount), comentarios: n(x.commentCount),
    })),
  };
}

const CTA_BIO = /(agenda|escr[ií]be|reserva|descarga|empieza|aplica|link|enlace|👇|⬇|dm|whatsapp|clic|click|inscr[ií]bete|compra|gratis|diagn[oó]stico|consulta)/i;
const CTA_POST = /(comenta|escr[ií]beme|agenda|link|enlace|dm|mensaje|guarda|comparte|reserva|inscr|whatsapp|aplica|descarga)/i;

const pct = (x) => String(Math.round(x * 1000) / 10).replace(".", ","); // 0.0123 -> "1,2"
const fmt = (x) => Math.round(x).toLocaleString("es-ES");

// Contenido: qué comunica el perfil (bio, destacados, pilares, aperturas repetidas) y estrategia concreta.
const STOP = new Set("para como pero porque cuando desde sobre entre tambien tiene tienen puedes puede hacer esto esta este estos estas eso ese esa todo todos toda cada muy mas menos aqui ahora siempre nunca solo sino aunque donde quien cual estoy estan somos tienes hay fue ser son era sus nos les nuestro nuestra mismo misma hasta ademas".split(" "));
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z\s]/g, " ");

function analizarContenido(d, base, ctaBio) {
  // Pilares: palabras (5+ letras) que aparecen en al menos 3 publicaciones y en 1 de cada 4 como mínimo
  const conteo = {};
  base.forEach((p) => {
    const set = new Set(norm(p.texto).split(/\s+/).filter((w) => w.length >= 5 && !STOP.has(w)));
    set.forEach((w) => { conteo[w] = (conteo[w] || 0) + 1; });
  });
  const minimo = Math.max(3, Math.ceil(base.length * 0.25));
  const pilares = Object.entries(conteo).filter(([, c]) => c >= minimo).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tema, veces]) => ({ tema, veces }));

  // Aperturas repetidas: las dos primeras palabras de la publicación que se repiten 3 veces o más
  const aperturas = {};
  base.forEach((p) => {
    const w = norm(p.texto).split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
    if (w.length >= 4) aperturas[w] = (aperturas[w] || 0) + 1;
  });
  const angulos = Object.entries(aperturas).filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([texto, veces]) => ({ texto, veces }));

  const bio = norm(d.bio);
  const dice = /(ayudo|ayudamos|soy|transformo|creo|asesoro|consultor|coach|fundador|especialista|marca|empresa|ense)/.test(bio);
  const destacados = Number.isFinite(d.destacados) ? d.destacados : null;

  const estrategia = [];
  if (!dice) estrategia.push("Tu bio no dice a quién ayudas ni qué logra. Escribe: «Ayudo a [quién] a [resultado]».");
  if (destacados === 0) estrategia.push("No tienes destacados. Crea 3: Método, Casos y Cómo trabajar conmigo.");
  else if (destacados > 0) estrategia.push(`Tienes ${destacados} destacados: revisa que cada portada diga qué encontrará quien entra.`);
  if (!pilares.length) estrategia.push("No se ve un tema que se repita. Elige 3 pilares y publica cada uno al menos 4 veces al mes.");
  else estrategia.push(`Tus pilares actuales son ${pilares.map((x) => x.tema).join(", ")}. Úsalos como base de tu contenido.`);
  if (angulos.length) estrategia.push(`Tus publicaciones empiezan igual («${angulos[0].texto}…», ${angulos[0].veces} veces). Cambia la apertura: pregunta, dato o historia.`);
  return {
    bio: { dice, cta: ctaBio },
    destacados,
    pilares,
    angulos,
    estrategia: estrategia.slice(0, 4),
  };
}

export function analizar(d) {
  const recientes = d.posts.filter((p) => !p.pin && p.fecha).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const base = recientes.length ? recientes : d.posts;
  const seg = Math.max(d.seguidores, 1);
  const prom = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);

  // 1) Alcance: vistas promedio de los videos frente a los seguidores
  const vids = base.filter((p) => p.vistas != null && p.vistas > 0);
  const vistasProm = prom(vids.map((p) => p.vistas));
  const alc = vids.length ? vistasProm / seg : null;
  const alcance = alc == null ? null : {
    nivel: alc >= 0.15 ? "verde" : alc >= 0.05 ? "amarillo" : "rojo",
    valor: `${pct(alc)} %`, detalle: `Tus videos llegan en promedio a ${fmt(vistasProm)} personas: el ${pct(alc)} % de tus ${fmt(seg)} seguidores.`,
  };

  // 2) Interacción por publicación frente a lo sano para su tamaño
  const intProm = prom(base.map((p) => p.interacciones));
  const ref = seg < 10000 ? 0.03 : seg < 100000 ? 0.015 : 0.008;
  const inter = intProm / seg;
  const interaccion = {
    nivel: inter >= ref ? "verde" : inter >= ref / 2.5 ? "amarillo" : "rojo",
    valor: `${pct(inter)} %`, ref: `${pct(ref)} %`,
    detalle: `Cada publicación recibe en promedio ${fmt(intProm)} interacciones: el ${pct(inter)} % de tu audiencia. Lo sano para una cuenta de tu tamaño es ${pct(ref)} %.`,
  };

  // 3) Constancia: publicaciones por semana y días desde la última
  let porSemana = 0, diasUltima = 999;
  if (recientes.length) {
    const ult = new Date(recientes[0].fecha), pri = new Date(recientes[recientes.length - 1].fecha);
    diasUltima = Math.floor((Date.now() - ult) / 864e5);
    const dias = Math.max((ult - pri) / 864e5, 7);
    porSemana = recientes.length / (dias / 7);
  }
  const ps = Math.round(porSemana * 10) / 10;
  const constancia = {
    nivel: diasUltima > 14 ? "rojo" : ps >= 3 ? "verde" : ps >= 1.5 ? "amarillo" : "rojo",
    valor: `${String(ps).replace(".", ",")} por semana`,
    detalle: diasUltima > 14 ? `Tu última publicación fue hace ${diasUltima} días.` : `Publicas unas ${String(ps).replace(".", ",")} veces por semana. Tu última publicación fue hace ${diasUltima === 0 ? "menos de un día" : diasUltima === 1 ? "1 día" : diasUltima + " días"}.`,
  };

  // 4) Perfil: ¿la visita sabe qué hacer después?
  const ctaBio = CTA_BIO.test(d.bio), hayLink = !!d.link;
  const conCta = base.filter((p) => CTA_POST.test(p.texto)).length;
  const faltas = [!ctaBio && "no le dice a la gente qué hacer", !hayLink && "no tiene enlace"].filter(Boolean);
  const perfil = {
    nivel: ctaBio && hayLink ? "verde" : ctaBio || hayLink ? "amarillo" : "rojo",
    valor: faltas.length ? (faltas.length === 2 ? "Sin llamado ni enlace" : !ctaBio ? "Sin llamado" : "Sin enlace") : "Llamado + enlace",
    detalle: `${faltas.length ? `Tu bio ${faltas.join(" y ")}.` : "Tu bio tiene un llamado a la acción y un enlace."} ${conCta} de tus últimas ${base.length} publicaciones piden una acción concreta.`,
    conCta, total: base.length,
  };

  // Mejor formato
  const grupos = {};
  base.forEach((p) => { (grupos[p.tipo] ||= []).push(p.interacciones); });
  const formatos = Object.entries(grupos).map(([t, v]) => ({ tipo: t, n: v.length, prom: prom(v) })).sort((a, b) => b.prom - a.prom);
  let formato = null;
  if (formatos.length >= 2 && formatos[1].prom > 0) {
    const x = formatos[0].prom / formatos[1].prom;
    if (x >= 1.3) formato = { mejor: formatos[0].tipo, peor: formatos[1].tipo, veces: Math.round(x * 10) / 10, texto: `Tus ${formatos[0].tipo.toLowerCase()} generan ${String(Math.round(x * 10) / 10).replace(".", ",")} veces más interacción que tus ${formatos[1].tipo.toLowerCase()}.` };
  }

  // Mejor publicación
  const top = [...base].sort((a, b) => b.interacciones - a.interacciones)[0];
  const mejor = top ? { texto: ((t) => (t.length > 110 ? t.slice(0, 107).replace(/\s+\S*$/, "") + "…" : t))((top.texto || "").split("\n")[0]), interacciones: fmt(top.interacciones), veces: intProm ? String(Math.round((top.interacciones / intProm) * 10) / 10).replace(".", ",") : "0", url: top.url } : null;

  // Freno principal: el indicador más débil, en orden de impacto
  // Qué significa cada número, en lenguaje simple
  const de100 = (x) => (x * 100 < 1 ? "menos de 1" : String(Math.round(x * 100)));
  if (alcance) alcance.significa = `De cada 100 seguidores, unos ${de100(alc)} ven tus videos. Lo sano es 15 o más: si pocos te ven, el algoritmo tampoco te muestra a personas nuevas.`;
  interaccion.significa = `De cada 100 seguidores, unos ${de100(inter)} reaccionan a cada publicación. Para tu tamaño lo sano son unos ${de100(ref)}: te miran, pero no sienten que les hablas a ellos.`;
  constancia.significa = diasUltima > 14
    ? `Llevas ${diasUltima} días sin publicar. Quien te siguió deja de esperarte y el algoritmo deja de empujarte.`
    : `${ps >= 3 ? "Publicas con ritmo." : "Publicas menos de 3 veces por semana."} Con poca frecuencia, tu audiencia no construye el hábito de verte.`;
  perfil.significa = perfil.nivel === "verde"
    ? "Quien entra a tu perfil sabe qué hacer y dónde. Eso convierte visitas en conversaciones."
    : "Quien entra a tu perfil ve tu bio y decide en segundos. Hoy no tiene una acción clara: se va sin hacer nada.";
  const ind = { alcance, interaccion, constancia, perfil };
  const orden = ["alcance", "interaccion", "constancia", "perfil"];
  const peso = { rojo: 0, amarillo: 1, verde: 2 };
  const candidatos = orden.filter((k) => ind[k] && ind[k].nivel !== "verde").sort((a, b) => peso[ind[a].nivel] - peso[ind[b].nivel] || orden.indexOf(a) - orden.indexOf(b));
  const clave = candidatos[0] || "oferta";
  const FRENOS = {
    alcance: { titulo: "Tu contenido no llega ni a tu propia audiencia", texto: `${alcance?.detalle || ""} El algoritmo no está empujando tus videos, ni siquiera a quienes ya te siguen. Casi siempre el problema está en los primeros 3 segundos: no detienen el scroll.`, accion: "Graba 3 videos cambiando solo el inicio: empieza con tu frase más fuerte, sin presentarte ni saludar." },
    interaccion: { titulo: "Te ven, pero no te responden", texto: `${interaccion.detalle} La gente consume tu contenido, pero no siente que le hablas a ella.`, accion: "Cierra cada publicación con una pregunta concreta sobre la situación de quien te lee, no sobre tu contenido." },
    constancia: { titulo: "Publicas sin ritmo", texto: `${constancia.detalle} El algoritmo y tu audiencia premian la constancia más que la perfección.`, accion: "Elige 3 días fijos a la semana y cúmplelos durante 4 semanas, aunque el contenido sea más simple." },
    perfil: { titulo: "Tu perfil no convierte la visita en cliente", texto: `${perfil.detalle} Quien llega por un video no sabe qué hacer después, y se va.`, accion: "Cambia la última línea de tu bio por una sola acción: qué hacer y dónde (por ejemplo, «Agenda tu diagnóstico 👇» + tu enlace)." },
    oferta: { titulo: "Tu contenido funciona. Lo que frena es la conversión", texto: `Tus números de contenido están sanos. Si tu negocio no escala, el freno no está en cuánta gente te ve: está en qué vendes y cómo lo conectas con tu contenido. ${perfil.conCta} de tus últimas ${perfil.total} publicaciones piden una acción concreta.`, accion: "Revisa tus últimas 12 publicaciones y cuenta cuántas llevan a tu oferta. Si son menos de 4, ahí está tu freno." },
  };

  const contenido = analizarContenido(d, base, ctaBio);
  // Todo lo que no funciona, sin suavizar: cada indicador no verde + lo que falta en la bio, destacados, pilares y aperturas
  const NOMBRES = { alcance: "Alcance", interaccion: "Interacción", constancia: "Constancia", perfil: "Perfil que convierte" };
  const fallas = Object.entries(ind).filter(([, v]) => v && v.nivel !== "verde").map(([k, v]) => `${NOMBRES[k]}: ${v.detalle}`);
  if (!contenido.bio.dice) fallas.push("Tu bio no dice a quién ayudas ni qué logras.");
  if (!contenido.bio.cta) fallas.push("Tu bio no tiene un llamado a la acción.");
  if (contenido.destacados === 0) fallas.push("No tienes destacados: quien llega a tu perfil no encuentra tu método ni tus casos.");
  if (contenido.angulos.length) fallas.push(`Repites la misma apertura en ${contenido.angulos[0].veces} publicaciones («${contenido.angulos[0].texto}…»).`);
  if (!contenido.pilares.length) fallas.push("No se ve un tema que se repita: tu contenido no tiene pilares claros.");
  return {
    contenido, fallas,
    red: d.red, usuario: d.usuario, nombre: d.nombre, seguidores: fmt(seg), publicaciones: base.length,
    indicadores: [
      alcance && { clave: "alcance", nombre: "Alcance", ...alcance },
      { clave: "interaccion", nombre: "Interacción", ...interaccion },
      { clave: "constancia", nombre: "Constancia", ...constancia },
      { clave: "perfil", nombre: "Perfil que convierte", ...perfil },
    ].filter(Boolean),
    freno: { clave, ...FRENOS[clave] },
    formato, mejor,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  const c = leerCuenta(b?.cuenta);
  if (!c) return res.status(400).json({ ok: false, error: "cuenta" });
  if (c.red === "web") return res.status(200).json({ ok: false, error: "web" });

  const token = process.env.APIFY_TOKEN;
  if (!token) return res.status(503).json({ ok: false, error: "sin_token" });

  try {
    let d;
    if (c.red === "tiktok") {
      d = normalizarTT(await apify(ACTOR_TT, { profiles: [c.usuario], resultsPerPage: 12, shouldDownloadVideos: false, shouldDownloadCovers: false, shouldDownloadSubtitles: false, shouldDownloadSlideshowImages: false }, 12, token));
    } else {
      d = normalizarIG(await apify(ACTOR_IG, { usernames: [c.usuario] }, 1, token));
    }
    if (!d) return res.status(200).json({ ok: false, error: "no_encontrada", red: c.red, usuario: c.usuario });
    if (d.privada || !d.posts.length) return res.status(200).json({ ok: false, error: "privada", red: c.red, usuario: d.usuario });
    return res.status(200).json({ ok: true, analisis: analizar(d) });
  } catch (e) {
    console.error("Análisis", c, e?.message);
    return res.status(502).json({ ok: false, error: "apify" });
  }
}
