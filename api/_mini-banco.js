// Banco de textos del Mini Diagnóstico Exprés (USD 27).
// Voz de Ana: tú, frases cortas, sin predicciones absolutas.
// Palabras prohibidas: alma, vibración, manifestar, transformación.
// Se escribe en femenino; para hombres se pasa por masculino() (al final).

export const EJES = ["Visibilidad","Estructura","Alianzas","Expansión","Autoridad","Precisión","Cuidado","Estrategia"];

// Cómo se nota cada eje en el perfil (3 frases: rindes, te apagas, tu negocio crece)
export const PERFIL_EJE = {
  Visibilidad: ["Rindes más cuando te ven: en vivo, en cámara, en un escenario.", "Te apagas cuando trabajas escondida detrás de otros.", "Tu negocio crece cuando tu cara y tu voz están al frente."],
  Estructura: ["Rindes más cuando hay un sistema claro y lo construyes tú.", "Te apagas en el caos y en lo improvisado.", "Tu negocio crece con procesos que funcionan sin que estés en todo."],
  Alianzas: ["Rindes más cuando construyes con otras personas.", "Te apagas cuando trabajas aislada, sin con quién crear.", "Tu negocio crece por relaciones: gente que trae a más gente."],
  Expansión: ["Rindes más cuando hay algo nuevo que abrir: un mercado, un formato, un país.", "Te apagas en la rutina que se repite igual cada mes.", "Tu negocio crece cuando lo llevas a lugares nuevos."],
  Autoridad: ["Rindes más cuando tú decides y llevas el rumbo.", "Te apagas cuando otros deciden por ti.", "Tu negocio crece cuando cobras por tu criterio, no por tus horas."],
  Precisión: ["Rindes más cuando puedes ir al detalle y hacerlo bien.", "Te apagas cuando te piden rapidez sin calidad.", "Tu negocio crece cuando vendes exactitud y acabado."],
  Cuidado: ["Rindes más cuando acompañas a alguien en su proceso.", "Te apagas en relaciones frías o solo transaccionales.", "Tu negocio crece cuando tus clientes se quedan y te recomiendan."],
  Estrategia: ["Rindes más cuando ves el panorama completo y planeas.", "Te apagas cuando solo ejecutas sin entender el para qué.", "Tu negocio crece cuando vendes el plan, no la tarea."],
};

// Superpoder principal (sale del primer eje del arquetipo)
export const SUPERPODER = {
  Visibilidad: { titulo: "Tu presencia", texto: "Tu superpoder es que la gente te ve y te recuerda. Cuando te muestras, abres puertas que otros tardan años en abrir.", usa: "Hablas a cámara o en vivo y la gente te escribe para trabajar contigo.", desperdicia: "Te escondes detrás de textos, logos o de otras personas, y nadie sabe que existes." },
  Estructura: { titulo: "Tu método", texto: "Tu superpoder es convertir el desorden en un sistema que funciona. Lo que tocas queda ordenado y se puede repetir.", usa: "Nombras tu método, lo documentas y lo vendes como un proceso claro.", desperdicia: "Ordenas todo para otros y tu propio negocio sigue sin sistema." },
  Alianzas: { titulo: "Tu red", texto: "Tu superpoder es unir a las personas correctas. Sabes quién falta en la mesa y cómo traerlo.", usa: "Una alianza bien elegida te trae clientes que solo no alcanzarías.", desperdicia: "Haces todo sola porque pedir o proponer te parece más lento." },
  Expansión: { titulo: "Tu alcance", texto: "Tu superpoder es abrir caminos nuevos. Donde otros ven un límite, tú ves la siguiente puerta.", usa: "Llevas lo que ya haces a un mercado, un formato o un país nuevo.", desperdicia: "Empiezas cosas nuevas cada mes y ninguna llega a dar frutos." },
  Autoridad: { titulo: "Tu criterio", texto: "Tu superpoder es que tu palabra pesa. Cuando decides, otros te siguen.", usa: "Cobras por tu criterio y tu opinión cierra decisiones.", desperdicia: "Pides permiso, bajas tu precio y dejas que otros pongan las reglas." },
  Precisión: { titulo: "Tu exactitud", texto: "Tu superpoder es ver lo que otros pasan por alto. Encuentras el detalle que cambia el resultado.", usa: "Vendes diagnósticos, revisiones o un acabado que nadie más logra.", desperdicia: "Corriges todo sin cobrar por ello, o perfeccionas en vez de entregar." },
  Cuidado: { titulo: "Tu acompañamiento", texto: "Tu superpoder es hacer que las personas se sientan sostenidas. Contigo, la gente avanza.", usa: "Creas procesos largos donde tus clientes se quedan meses o años.", desperdicia: "Das de más, no pones límites y terminas agotada sin cobrar lo que vale." },
  Estrategia: { titulo: "Tu visión", texto: "Tu superpoder es ver el tablero completo. Mientras otros resuelven hoy, tú ves los próximos tres movimientos.", usa: "Vendes el plan completo y diriges en lugar de ejecutar tareas sueltas.", desperdicia: "Lo ves todo claro, pero no lo dices ni lo cobras." },
};

// Bloqueo principal (eje de tu diseño que hoy no estás usando) + acción de la semana
export const BLOQUEO = {
  Visibilidad: { titulo: "Te escondes", texto: "Tu diseño pide que te vean. Hoy te muestras poco, o te muestras a medias, porque exponerte te incomoda.", senales: ["Publicas sin tu cara o sin tu voz.", "Otros con menos experiencia que tú consiguen más clientes.", "Postergas el vivo, el video o la charla que sabes que te toca."], costo: "Lo que no se ve, no se compra. Tu talento existe, pero el mercado no lo encuentra.",
    accion: { titulo: "Muéstrate una vez", texto: "Esta semana haces una sola pieza con tu cara y tu voz.", pasos: [["Día 1","Elige una pregunta que tus clientes te hacen siempre."],["Día 2–3","Graba un video de un minuto respondiéndola. Sin editar de más."],["Día 4","Publícalo y responde cada comentario."]] } },
  Estructura: { titulo: "Todo vive en tu cabeza", texto: "Tu diseño pide sistema. Hoy trabajas improvisando, y cada cliente empieza desde cero.", senales: ["Explicas lo mismo una y otra vez.", "No sabes cuánto ganaste el mes pasado sin revisar todo.", "Si te enfermas una semana, todo se detiene."], costo: "Sin estructura, tu ingreso depende de tus horas. Y las horas se acaban.",
    accion: { titulo: "Escribe tu proceso", texto: "Esta semana pones por escrito cómo trabajas, paso a paso.", pasos: [["Día 1","Anota los pasos que sigues con un cliente, del primer mensaje a la entrega."],["Día 2–3","Ponle nombre a cada paso. Ese es el inicio de tu método."],["Día 4","Revisa tus números de la semana: cuánto entró y cuánto salió."]] } },
  Alianzas: { titulo: "Lo haces sola", texto: "Tu diseño crece con otros. Hoy cargas todo tú, porque pedir ayuda o proponer una alianza te parece más lento que hacerlo tú misma.", senales: ["Haces tú la venta, el contenido, la entrega y el cobro.", "Tienes en mente personas con las que podrías unirte, y no las llamas.", "Tu agenda está llena y tus ingresos no crecen al mismo ritmo."], costo: "Trabajar sola tiene un techo: el de tus propias horas.",
    accion: { titulo: "Convoca a una aliada", texto: "Esta semana le propones algo concreto a una persona.", pasos: [["Día 1","Escribe 3 nombres de personas cuyo público se parece al tuyo."],["Día 2–3","Elige una y piensa una idea que les sirva a las dos: un vivo, un taller, un intercambio."],["Día 4","Mándale un audio de un minuto con la propuesta."]] } },
  Expansión: { titulo: "Te quedaste en lo conocido", texto: "Tu diseño pide moverte hacia lo nuevo. Hoy repites lo que ya funciona, aunque ya no te alcanza.", senales: ["Vendes lo mismo, al mismo público, desde hace mucho.", "Tienes una idea nueva guardada hace meses.", "Sientes que te quedó chico tu propio negocio."], costo: "Lo conocido se vuelve techo. Y el mercado se mueve aunque tú no.",
    accion: { titulo: "Prueba una puerta nueva", texto: "Esta semana validas una sola idea nueva, sin lanzarla completa.", pasos: [["Día 1","Elige una idea: un formato, un público o un lugar nuevo."],["Día 2–3","Pregúntale a 5 personas de ese público si lo comprarían."],["Día 4","Con sus respuestas, decide si sigue o se descarta."]] } },
  Autoridad: { titulo: "Pides permiso", texto: "Tu diseño pide que lleves el rumbo. Hoy dudas de tu criterio y dejas que otros decidan por ti.", senales: ["Bajas tu precio antes de que te lo pidan.", "Preguntas a varias personas antes de cada decisión.", "Explicas de más para justificar lo que cobras."], costo: "Quien no se para como autoridad, termina compitiendo por precio.",
    accion: { titulo: "Decide sin consultar", texto: "Esta semana tomas una decisión de tu negocio sin pedir opinión.", pasos: [["Día 1","Elige una decisión que llevas tiempo postergando."],["Día 2–3","Escribe tus razones en tres líneas. Eso es tu criterio."],["Día 4","Decide y comunícalo, sin justificarte."]] } },
  Precisión: { titulo: "Pierdes el foco", texto: "Tu diseño pide ir a fondo en pocas cosas. Hoy te dispersas en muchas a la vez.", senales: ["Tienes varios proyectos abiertos y ninguno terminado.", "Cambias de idea cuando una empieza a costar.", "Sientes que trabajas mucho y avanzas poco."], costo: "La energía repartida en todo no alcanza para nada.",
    accion: { titulo: "Elige un solo frente", texto: "Esta semana trabajas en una sola cosa hasta terminarla.", pasos: [["Día 1","Haz la lista de todo lo que tienes abierto."],["Día 2–3","Elige la que más dinero o impacto te da. Pausa el resto por escrito."],["Día 4","Termina un entregable concreto de esa única cosa."]] } },
  Cuidado: { titulo: "Te olvidas de ti", texto: "Tu diseño pide cuidar, empezando por ti. Hoy das mucho a otros y te quedas sin energía para tu propio negocio.", senales: ["Atiendes a todos menos a tus propios proyectos.", "Te cuesta cobrar porque sientes que ayudar debería ser gratis.", "Terminas el día cansada y con la sensación de no haber avanzado."], costo: "Si tú te apagas, tu negocio se apaga contigo.",
    accion: { titulo: "Pon un límite", texto: "Esta semana defines un límite claro y lo sostienes.", pasos: [["Día 1","Identifica qué das gratis que debería tener precio."],["Día 2–3","Ponle precio o un horario, y escríbelo."],["Día 4","Aplícalo con la próxima persona que te lo pida."]] } },
  Estrategia: { titulo: "Ejecutas sin plan", texto: "Tu diseño pide pensar antes de mover. Hoy resuelves lo urgente y lo importante queda para después.", senales: ["Tu semana se llena de tareas y nunca de planeación.", "Reaccionas a lo que hacen otros en vez de marcar tu camino.", "No sabes qué meta tienes para los próximos tres meses."], costo: "Sin plan, el esfuerzo se va en apagar fuegos.",
    accion: { titulo: "Diseña tus próximos 90 días", texto: "Esta semana defines una meta y tres pasos para llegar.", pasos: [["Día 1","Escribe una sola meta para los próximos 90 días, con un número."],["Día 2–3","Divide la meta en tres pasos, uno por mes."],["Día 4","Bloquea en tu agenda una hora semanal para revisarla."]] } },
};

// Masculino para hombres: frases exactas
const M = [["escondida","escondido"],["aislada","aislado"],["agotada","agotado"],["cansada","cansado"],["sola","solo"],["tú misma","tú mismo"],["Convoca a una aliada","Convoca a un aliado"],["Cómo estás hecha","Cómo estás hecho"],["sirva a las dos","sirva a los dos"]];
export function masculino(t){ let s = String(t); for (const [f, m] of M) s = s.split(f).join(m); return s; }

// 28 arquetipos: clave "EjeA+EjeB" (orden canónico) → [nombre, descripción]. Copia de BANCO del quiz.
export const ARQ = {
"Visibilidad+Estructura": [
"La Arquitecta Visible",
"Construyes en grande y el mundo lo ve. No haces cosas pequeñas ni las escondes: tu obra tiene cimientos y tiene escenario."
],
"Visibilidad+Alianzas": [
"La Voz que Convoca",
"Cuando hablas, la gente se reúne. Tu palabra organiza, dirige y mueve a otros a la acción."
],
"Visibilidad+Expansión": [
"La Luz al Frente",
"Iluminas el camino y otros te siguen. Vas adelante no por ambición, sino porque ves lo que viene."
],
"Visibilidad+Autoridad": [
"La Referente",
"Eres el estándar contra el que se miden. En tu sector, tu nombre ya significa un nivel."
],
"Visibilidad+Precisión": [
"La Mirada Exacta",
"Ves con precisión lo que otros pasan por alto. Donde hay ruido, tú encuentras el dato que importa."
],
"Visibilidad+Cuidado": [
"La Anfitriona",
"Creas espacios donde todos quieren estar. Tu presencia convierte lugares en experiencias."
],
"Visibilidad+Estrategia": [
"La Estratega Visible",
"Piensas en grande y lo muestras sin miedo. Tu estrategia no vive en un cajón: vive al frente."
],
"Estructura+Alianzas": [
"La Tejedora",
"Unes piezas y personas en algo mayor. Lo que estaba suelto, contigo se vuelve red."
],
"Estructura+Expansión": [
"La Arquitecta de Expansión",
"Escalas con cimientos que no se caen. Creces rápido, pero nada de lo que construyes se derrumba."
],
"Estructura+Autoridad": [
"La Institución",
"Tu nombre ya es una garantía. No vendes promesas: vendes trayectoria que respalda."
],
"Estructura+Precisión": [
"Arquitecta de Método",
"Conviertes caos en sistema. Lo que para otros es desorden, para ti es un proceso esperando nacer."
],
"Estructura+Cuidado": [
"La Guardiana",
"Proteges lo que importa. Tu lealtad no se negocia y tu cuidado tiene peso."
],
"Estructura+Estrategia": [
"La Arquitecta Estratega",
"Diseñas la jugada completa. Ves el tablero, las piezas y los próximos tres movimientos."
],
"Alianzas+Expansión": [
"La que Cruza Fronteras",
"Ningún mapa te contiene. Países, mercados, idiomas: donde otros ven límite, tú ves puerta."
],
"Alianzas+Autoridad": [
"La Convocante",
"Reúnes a los indicados para cada misión. Sabes quién falta en la mesa antes de sentarte."
],
"Alianzas+Precisión": [
"La Negociadora",
"Cierras tratos donde otros ven muros. Lees a las personas y encuentras el sí escondido."
],
"Alianzas+Cuidado": [
"La Aliada",
"La lealtad es tu moneda. Quien te tiene de su lado, tiene a alguien que no falla."
],
"Alianzas+Estrategia": [
"La Diplomática",
"Abres puertas sin romper nada. Consigues lo imposible con tacto, no con fuerza."
],
"Expansión+Autoridad": [
"La Pionera",
"Llegas primero y marcas el camino. Lo que hoy es obvio, tú lo viste antes que nadie."
],
"Expansión+Precisión": [
"La Exploradora Exacta",
"Exploras sin perder el norte. Te adentras en lo nuevo con brújula propia."
],
"Expansión+Cuidado": [
"La Cultivadora",
"Haces crecer personas y proyectos. Lo que tocas con paciencia, florece."
],
"Expansión+Estrategia": [
"La Navegante",
"Cruzas mares que otros ni miran. Tu visión es amplia, tu movimiento es libre y tu rumbo es propio."
],
"Autoridad+Precisión": [
"La Autoridad Exacta",
"Tu palabra pesa porque es precisa. No hablas mucho; cuando hablas, se anota."
],
"Autoridad+Cuidado": [
"La Guía Firme",
"Lideras cuidando el rumbo. Tu gente avanza segura porque tú no improvisas la dirección."
],
"Autoridad+Estrategia": [
"La Estratega Mayor",
"Ves el tablero entero. Mientras otros juegan su casilla, tú diriges el juego."
],
"Precisión+Cuidado": [
"La Artesana",
"El detalle es tu firma. Lo que produces tiene un acabado que nadie más logra."
],
"Precisión+Estrategia": [
"La Mente Quirúrgica",
"Cortas exacto donde duele y sana. Precisión que resuelve, no que adorna."
],
"Cuidado+Estrategia": [
"La Guardiana Estratégica",
"Proteges con inteligencia, no con miedo. Cuidas lo valioso con plan, no con ansiedad."
]
};
export const NOMBRE_M = {"La Arquitecta Visible":"El Arquitecto Visible","La Referente":"El Referente","La Anfitriona":"El Anfitrión","La Estratega Visible":"El Estratega Visible","La Tejedora":"El Tejedor","La Arquitecta de Expansión":"El Arquitecto de Expansión","Arquitecta de Método":"Arquitecto de Método","La Guardiana Estratégica":"El Guardián Estratégico","La Guardiana":"El Guardián","La Arquitecta Estratega":"El Arquitecto Estratega","La que Cruza Fronteras":"El que Cruza Fronteras","La Convocante":"El Convocante","La Negociadora":"El Negociador","La Aliada":"El Aliado","La Diplomática":"El Diplomático","La Pionera":"El Pionero","La Exploradora Exacta":"El Explorador Exacto","La Cultivadora":"El Cultivador","La Navegante":"El Navegante","La Guía Firme":"El Guía Firme","La Estratega Mayor":"El Estratega Mayor","La Artesana":"El Artesano"};
