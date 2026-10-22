# CONTEXTO — Fórmula de Arquetipos del Quiz · Quantum Branding (Ana Sepúlveda)
Versión final · 22 oct 2026 · Código de referencia: `formula_arquetipos.py`

## 1. Qué es
El quiz asigna a cada persona **1 de 28 arquetipos** usando **solo su fecha de nacimiento**. La misma fecha da siempre el mismo arquetipo.
Usa 3 fuentes: **Camino de Vida (numerología GG33)**, **día de nacimiento** y **animal chino**.
No usa carta natal (depende de la hora, que no es segura) ni BaZi (queda para el diagnóstico 1:1).

## 2. Las 8 cualidades (ejes)
Visibilidad · Estructura · Alianzas · Expansión · Autoridad · Precisión · Cuidado · Estrategia.
Cada arquetipo es la combinación de 2 cualidades.

## 3. Cómo se calcula

**Paso 1 · Camino de Vida (método GG33)**
- Se suman TODOS los dígitos de la fecha (dd mm aaaa) y se reduce.
- El 11, el 22 y el 33 se conservan solo si salen al reducir.
- **No existe el Camino de Vida 2:** si el resultado final es 2, se lee como 11.
- Ej.: 11/12/1980 → 1+1+1+2+1+9+8+0 = 23 → 5.
- **1ª cualidad = la PRIMERA cualidad de ese número** en la tabla.

**Paso 2 · 2ª cualidad (día + animal chino)**
- El día y el animal aportan 2 cualidades cada uno, y cada cualidad suma 1 punto.
- Gana la cualidad con más puntos, sin repetir la 1ª.
- Si día y animal coinciden en una cualidad, esa gana.
- Si hay empate, decide el animal: primero su 1ª cualidad, luego la 2ª; después, el orden del día.

**Paso 3 · Arquetipo = 1ª cualidad + 2ª cualidad.**

**Día de nacimiento**
- Días 11 y 22: maestros, usan las cualidades de su número.
- Días especiales (no se reducen):
  - **20** (falso 11, influencia): Visibilidad + Alianzas
  - **28** (semi maestro: el 1 con dinero y poder en alianzas): Autoridad + Alianzas
  - **29** (el 2 con el poder del 11): Alianzas + Visibilidad
- El resto se reduce a un dígito. El día 2 sí existe como día (Alianzas + Cuidado).

**Animal chino**
- Se calcula con la **fecha exacta del Año Nuevo Chino** de cada año, en hora de Beijing. Quien nace antes de esa fecha tiene el animal del año anterior.
- Ej.: 16/02/1988 = Conejo; 17/02/1988 = Dragón.
- Tabla de fechas de 1944 a 2009 en el código. Fechas de 1985, 1995 y 2007 verificadas contra el Observatorio de Hong Kong (algunas webs de zodiaco las tienen mal).

## 4. Tablas

| Número | Cualidades (la 1ª manda) | Significado (Ana / GG33) |
|---|---|---|
| 1 | Autoridad + Visibilidad | Independencia, liderar, sostener emprendimientos. El líder. |
| 2 (solo como día) | Alianzas + Cuidado | Diplomacia, alianzas, equipo, persuasión, calma. |
| 3 | Visibilidad + Expansión | El mejor comunicador, ventas, marketing. Sombra: manipulación. |
| 4 | Estructura + Precisión | Ley y orden, sistema, palabra; los que cumplen. |
| 5 | Expansión + Visibilidad | El viajero, presencia que vende, se expande viajando. |
| 6 | Cuidado + Alianzas | Familia, sostener, bienestar. Sombra: no pone límites. |
| 7 | Estrategia + Precisión | Sistemas, estrategia, el genio; conexión espiritual. Sombra: autoestima. |
| 8 | Autoridad + Estructura | Poder, dinero, lujo; kármico: dinero de buenas fuentes. |
| 9 | Expansión + Cuidado | Camaleón, se adapta, amplificador; dinero con propósito mayor. |
| 11 | Alianzas + Visibilidad | Influencia, poder de la palabra (absorbe al 2). |
| 22 | Estructura + Expansión | Maestro constructor, forja imperios. |
| 33 | Cuidado + Autoridad | Maestro de maestros, enseña, influencia a las masas. |

| Animal | Cualidades | Animal | Cualidades |
|---|---|---|---|
| Rata | Estrategia + Expansión | Caballo | Expansión + Visibilidad |
| Buey | Estructura + Precisión | Cabra | Cuidado + Precisión |
| Tigre | Autoridad + Visibilidad | Mono | Estrategia + Expansión |
| Conejo | Alianzas + Cuidado | Gallo | Precisión + Estructura |
| Dragón | Visibilidad + Autoridad | Perro | Cuidado + Alianzas |
| Serpiente | Estrategia + Precisión | Cerdo | Alianzas + Cuidado |

## 5. Los 28 arquetipos (y cuántas personas de cada 100 lo reciben)

| Arquetipo | Cualidades | Descripción | /100 |
|---|---|---|---|
| La Arquitecta Visible | Visibilidad + Estructura | Construyes en grande y el mundo lo ve. Tu obra tiene cimientos y tiene escenario. | 2.1 |
| La Voz que Convoca | Visibilidad + Alianzas | Cuando hablas, la gente se reúne. Tu palabra organiza, dirige y mueve a otros a la acción. | 3.1 |
| La Luz al Frente | Visibilidad + Expansión | Iluminas el camino y otros te siguen. Vas adelante porque ves lo que viene. | 5.4 |
| La Referente | Visibilidad + Autoridad | Eres el estándar contra el que se miden. Tu nombre ya significa un nivel. | 5.5 |
| La Mirada Exacta | Visibilidad + Precisión | Ves lo que otros pasan por alto. Donde hay ruido, encuentras el dato que importa. | 1.2 |
| La Anfitriona | Visibilidad + Cuidado | Creas espacios donde todos quieren estar. Conviertes lugares en experiencias. | 3.0 |
| La Estratega Visible | Visibilidad + Estrategia | Piensas en grande y lo muestras sin miedo. Tu estrategia vive al frente. | 3.2 |
| La Tejedora | Estructura + Alianzas | Unes piezas y personas en algo mayor. Lo suelto, contigo se vuelve red. | 2.8 |
| La Arquitecta de Expansión | Estructura + Expansión | Escalas con cimientos que no se caen. | 3.2 |
| La Institución | Estructura + Autoridad | Tu nombre ya es una garantía. Vendes trayectoria que respalda. | 2.5 |
| Arquitecta de Método | Estructura + Precisión | Conviertes caos en sistema. | 2.1 |
| La Guardiana | Estructura + Cuidado | Proteges lo que importa. Tu lealtad no se negocia. | 2.7 |
| La Arquitecta Estratega | Estructura + Estrategia | Diseñas la jugada completa: tablero, piezas y los próximos tres movimientos. | 2.9 |
| La que Cruza Fronteras | Alianzas + Expansión | Ningún mapa te contiene. Donde otros ven límite, tú ves puerta. | 5.1 |
| La Convocante | Alianzas + Autoridad | Reúnes a los indicados para cada misión. | 4.4 |
| La Negociadora | Alianzas + Precisión | Cierras tratos donde otros ven muros. | 1.2 |
| La Aliada | Alianzas + Cuidado | La lealtad es tu moneda. Quien te tiene de su lado, no falla. | 6.6 |
| La Diplomática | Alianzas + Estrategia | Abres puertas sin romper nada. Consigues lo imposible con tacto. | 3.9 |
| La Pionera | Expansión + Autoridad | Llegas primero y marcas el camino. | 4.2 |
| La Exploradora Exacta | Expansión + Precisión | Exploras sin perder el norte, con brújula propia. | 2.5 |
| La Cultivadora | Expansión + Cuidado | Haces crecer personas y proyectos. Lo que tocas con paciencia, florece. | 5.0 |
| La Navegante | Expansión + Estrategia | Cruzas mares que otros ni miran. Tu rumbo es propio. | 8.0 |
| La Autoridad Exacta | Autoridad + Precisión | Tu palabra pesa porque es precisa. Cuando hablas, se anota. | 2.4 |
| La Guía Firme | Autoridad + Cuidado | Lideras cuidando el rumbo. Tu gente avanza segura. | 4.4 |
| La Estratega Mayor | Autoridad + Estrategia | Ves el tablero entero. Tú diriges el juego. | 4.8 |
| **La Artesana** (antes La Orfebre) | Precisión + Cuidado | El detalle es tu firma. Un acabado que nadie más logra. | 1.9 |
| La Mente Quirúrgica | Precisión + Estrategia | Cortas exacto donde duele y sana. | 2.0 |
| La Guardiana Estratégica | Cuidado + Estrategia | Proteges con inteligencia y con plan, no con ansiedad. | 3.8 |

Calculado con todas las fechas del 01/01/1945 al 31/12/2008. Salen los 28; ninguno baja de 1.2 ni pasa de 8.

## 6. Ejemplos verificados

| Fecha | Camino de Vida | Día | Animal | Arquetipo |
|---|---|---|---|---|
| 28/09/1988 (Ana) | 45 → 9 → Expansión | 28 → Autoridad + Alianzas | Dragón → Visibilidad + Autoridad | Coinciden en Autoridad → **La Pionera** |
| 11/12/1980 | 23 → 5 → Expansión | 11 → Alianzas + Visibilidad | Mono → Estrategia + Expansión | Empate → animal → **La Navegante** |
| 11/01/1945 | 22 → Estructura | 11 → Alianzas + Visibilidad | Mono (año chino 1944) | Empate → animal → **La Arquitecta Estratega** |
| 07/03/1981 | 29 → 11 → Alianzas | 7 → Estrategia + Precisión | Gallo → Precisión + Estructura | Coinciden en Precisión → **La Negociadora** |

## 7. Decisiones tomadas y por qué
- **La fórmula original solo dejaba salir 21 arquetipos** (7 nunca salían) porque el Camino de Vida pesaba el doble y los empates siempre los ganaba Visibilidad por estar primera en la lista.
- **Camino de Vida = 1ª cualidad:** la numerología sigue mandando.
- **Método GG33** de suma, sin mezclar con otros métodos, para que coincida con lo que los clientes ven en gg33.info. En GG33 no existe el Camino de Vida 2.
- **11 = Alianzas + Visibilidad** (no Visibilidad primero): el 11 absorbe a todos los que serían 2 y carga su energía de alianzas más el carisma del maestro. Con Visibilidad primero, La Negociadora deja de salir.
- **5 = Expansión + Visibilidad** y **7 = Estrategia + Precisión:** alineados a los significados de Ana.
- **El empate lo decide el animal:** es la regla que deja salir los 28 arquetipos con el reparto más parejo.
- **Sin carta natal ni BaZi en la fórmula:** dependen de la hora o quedan para el 1:1.
- **Día 28 semi maestro, día 20 falso 11, día 29 = 2 con poder del 11:** criterio de Ana.

## 8. Pendiente
- Redactar en la voz de Ana los textos de cada número (1, 3–9, 11, 22, 33) y de los días especiales (20, 28, 29), con sus significados de la sección 4. Para el 9: acento en adaptación y dinero con propósito, no en humanitarismo.
- Si el quiz acepta nacimientos fuera de 1944–2009, sumar esos años a la tabla de Año Nuevo Chino (fuente: Observatorio de Hong Kong, hko.gov.hk).
- Lanzar esta versión antes de difundir más el quiz: cambia el resultado de quienes ya lo hicieron.
