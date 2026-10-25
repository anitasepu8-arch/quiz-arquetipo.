// Devuelve el contenido del Mini para un enlace personal firmado: GET /api/mini?t=TOKEN
import { leerToken, leerReferencia } from "./_mini-token.js";
import { ARQ, NOMBRE_M, PERFIL_EJE, SUPERPODER, BLOQUEO, masculino } from "./_mini-banco.js";

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fechaLarga = (iso) => { const [a, m, d] = iso.split("-").map(Number); return `${d} de ${MESES[m - 1]}`; };

export default function handler(req, res) {
  let datos = null;
  try { datos = leerToken(req.query.t); } catch (e) { return res.status(500).json({ error: "config" }); }
  const ref = datos && leerReferencia(datos.ref);
  if (!ref) return res.status(404).json({ error: "Enlace no válido" });

  const clave = ref.ejes.join("+");
  const [nombreF, desc] = ARQ[clave] || ARQ[[ref.ejes[1], ref.ejes[0]].join("+")] || ["", ""];
  const hombre = ref.g === "m";
  const g = (t) => (hombre ? masculino(t) : t);
  const nombreArq = hombre && NOMBRE_M[nombreF] ? NOMBRE_M[nombreF] : nombreF;
  const f = ref.fecha;
  const vence = (() => { const d = new Date(datos.compra + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 7); return d.toISOString().slice(0, 10); })();
  const sp = SUPERPODER[ref.sp], bl = BLOQUEO[ref.bl];
  // Perfil: una frase del eje principal (el del superpoder) y dos del segundo eje, para que no repita la ficha 2.
  const principal = ref.ejes.includes(ref.sp) ? ref.sp : ref.ejes[0];
  const segundo = ref.ejes.find((e) => e !== principal) || ref.ejes[1];

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({
    nombre: datos.nombre || "",
    fechaNac: `${+f.slice(6, 8)} de ${MESES[+f.slice(4, 6) - 1]} de ${f.slice(0, 4)}`,
    arquetipo: nombreArq,
    ejes: ref.ejes,
    perfil: { titulo: hombre ? "Cómo estás hecho" : "Cómo estás hecha", texto: desc, puntos: [PERFIL_EJE[principal][0], PERFIL_EJE[segundo][1], PERFIL_EJE[segundo][2]].map(g) },
    superpoder: { titulo: sp.titulo, texto: g(sp.texto), usa: g(sp.usa), desperdicia: g(sp.desperdicia), total: ref.nSp || 1 },
    bloqueo: { titulo: g(bl.titulo), texto: g(bl.texto), senales: bl.senales.map(g), costo: g(bl.costo), total: ref.nBl || 1 },
    decision: !!ref.decision,
    accion: { titulo: g(bl.accion.titulo), texto: g(bl.accion.texto), pasos: bl.accion.pasos.map(([d, t]) => [d, g(t)]) },
    credito: { vence, venceTexto: fechaLarga(vence), precio: 125 },
  });
}
