"""
Fórmula de arquetipos — Quantum Branding (versión final, oct 2026).
El arquetipo sale SOLO de la fecha de nacimiento: misma fecha = mismo arquetipo.

1. Eje principal  = primer eje del Camino de Vida.
2. Segundo eje    = la cualidad donde coinciden día y animal chino
                    (cada uno suma 1 punto a sus dos cualidades),
                    sin repetir el eje principal.
   Desempate: gana el primer eje del animal; luego el segundo del animal;
              luego el orden del día.
"""
import datetime as dt

EJES = ["Visibilidad", "Estructura", "Alianzas", "Expansión",
        "Autoridad", "Precisión", "Cuidado", "Estrategia"]

# El orden importa: el primer eje es el dominante.
NUMEROS = {
    1: ("Autoridad", "Visibilidad"),  2: ("Alianzas", "Cuidado"),
    3: ("Visibilidad", "Expansión"),  4: ("Estructura", "Precisión"),
    5: ("Expansión", "Visibilidad"),  # viajero, presencia que vende
    6: ("Cuidado", "Alianzas"),       7: ("Estrategia", "Precisión"),  # sistemas, estrategia, el genio
    8: ("Autoridad", "Estructura"),   9: ("Expansión", "Cuidado"),
    11: ("Alianzas", "Visibilidad"),  # el 2 con poder maestro
    22: ("Estructura", "Expansión"),
    33: ("Cuidado", "Autoridad"),
}

# Días especiales: no se reducen.
DIAS_ESPECIALES = {
    20: ("Visibilidad", "Alianzas"),  # falso 11: influencia
    28: ("Autoridad", "Alianzas"),    # semi maestro: el 1 con poder y dinero en alianzas
    29: ("Alianzas", "Visibilidad"),  # el 2 con el poder del 11
}

ANIMALES = ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
            "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"]
EJES_ANIMAL = {
    "Rata": ("Estrategia", "Expansión"),   "Buey": ("Estructura", "Precisión"),
    "Tigre": ("Autoridad", "Visibilidad"), "Conejo": ("Alianzas", "Cuidado"),
    "Dragón": ("Visibilidad", "Autoridad"), "Serpiente": ("Estrategia", "Precisión"),
    "Caballo": ("Expansión", "Visibilidad"), "Cabra": ("Cuidado", "Precisión"),
    "Mono": ("Estrategia", "Expansión"),   "Gallo": ("Precisión", "Estructura"),
    "Perro": ("Cuidado", "Alianzas"),      "Cerdo": ("Alianzas", "Cuidado"),
}

ARQUETIPOS = {frozenset(k): v for k, v in [
    (("Visibilidad", "Estructura"), "La Arquitecta Visible"),
    (("Visibilidad", "Alianzas"), "La Voz que Convoca"),
    (("Visibilidad", "Expansión"), "La Luz al Frente"),
    (("Visibilidad", "Autoridad"), "La Referente"),
    (("Visibilidad", "Precisión"), "La Mirada Exacta"),
    (("Visibilidad", "Cuidado"), "La Anfitriona"),
    (("Visibilidad", "Estrategia"), "La Estratega Visible"),
    (("Estructura", "Alianzas"), "La Tejedora"),
    (("Estructura", "Expansión"), "La Arquitecta de Expansión"),
    (("Estructura", "Autoridad"), "La Institución"),
    (("Estructura", "Precisión"), "Arquitecta de Método"),
    (("Estructura", "Cuidado"), "La Guardiana"),
    (("Estructura", "Estrategia"), "La Arquitecta Estratega"),
    (("Alianzas", "Expansión"), "La que Cruza Fronteras"),
    (("Alianzas", "Autoridad"), "La Convocante"),
    (("Alianzas", "Precisión"), "La Negociadora"),
    (("Alianzas", "Cuidado"), "La Aliada"),
    (("Alianzas", "Estrategia"), "La Diplomática"),
    (("Expansión", "Autoridad"), "La Pionera"),
    (("Expansión", "Precisión"), "La Exploradora Exacta"),
    (("Expansión", "Cuidado"), "La Cultivadora"),
    (("Expansión", "Estrategia"), "La Navegante"),
    (("Autoridad", "Precisión"), "La Autoridad Exacta"),
    (("Autoridad", "Cuidado"), "La Guía Firme"),
    (("Autoridad", "Estrategia"), "La Estratega Mayor"),
    (("Precisión", "Cuidado"), "La Artesana"),          # antes: La Orfebre
    (("Precisión", "Estrategia"), "La Mente Quirúrgica"),
    (("Cuidado", "Estrategia"), "La Guardiana Estratégica"),
]}


def _digitos(n):
    return sum(int(c) for c in str(n))


def camino_de_vida(f):
    """Método GG33: se suman TODOS los dígitos de la fecha y se reduce.
    Se conservan 11, 22 y 33 solo si aparecen al reducir. Un 2 final se lee como 11
    (en GG33 no existe el Camino de Vida 2).
    Ej.: 11/12/1980 -> 1+1+1+2+1+9+8+0 = 23 -> 5"""
    s = sum(int(c) for c in f.strftime("%d%m%Y"))
    while s > 9 and s not in (11, 22, 33):
        s = _digitos(s)
    return 11 if s == 2 else s


def ejes_del_dia(f):
    if f.day in DIAS_ESPECIALES:
        return DIAS_ESPECIALES[f.day]
    if f.day in (11, 22):
        return NUMEROS[f.day]
    n = f.day
    while n > 9:
        n = _digitos(n)
    return NUMEROS[n]


# Fecha del Año Nuevo Chino (mes, día), hora de Beijing. 1985, 1995 y 2007
# verificados contra el Observatorio de Hong Kong (hko.gov.hk). Para ampliar
# el rango, sumar años con sus fechas oficiales.
ANO_NUEVO_CHINO = {
    1944: (1, 25),
    1945: (2, 13),
    1946: (2, 2),
    1947: (1, 22),
    1948: (2, 10),
    1949: (1, 29),
    1950: (2, 17),
    1951: (2, 6),
    1952: (1, 27),
    1953: (2, 14),
    1954: (2, 3),
    1955: (1, 24),
    1956: (2, 12),
    1957: (1, 31),
    1958: (2, 18),
    1959: (2, 8),
    1960: (1, 28),
    1961: (2, 15),
    1962: (2, 5),
    1963: (1, 25),
    1964: (2, 13),
    1965: (2, 2),
    1966: (1, 21),
    1967: (2, 9),
    1968: (1, 30),
    1969: (2, 17),
    1970: (2, 6),
    1971: (1, 27),
    1972: (2, 15),
    1973: (2, 3),
    1974: (1, 23),
    1975: (2, 11),
    1976: (1, 31),
    1977: (2, 18),
    1978: (2, 7),
    1979: (1, 28),
    1980: (2, 16),
    1981: (2, 5),
    1982: (1, 25),
    1983: (2, 13),
    1984: (2, 2),
    1985: (2, 20),
    1986: (2, 9),
    1987: (1, 29),
    1988: (2, 17),
    1989: (2, 6),
    1990: (1, 27),
    1991: (2, 15),
    1992: (2, 4),
    1993: (1, 23),
    1994: (2, 10),
    1995: (1, 31),
    1996: (2, 19),
    1997: (2, 7),
    1998: (1, 28),
    1999: (2, 16),
    2000: (2, 5),
    2001: (1, 24),
    2002: (2, 12),
    2003: (2, 1),
    2004: (1, 22),
    2005: (2, 9),
    2006: (1, 29),
    2007: (2, 18),
    2008: (2, 7),
    2009: (1, 26),
}


def animal_chino(f):
    """Quien nace antes del Año Nuevo Chino pertenece al animal del año anterior."""
    m, d = ANO_NUEVO_CHINO[f.year]
    anio = f.year if (f.month, f.day) >= (m, d) else f.year - 1
    return ANIMALES[(anio - 1900) % 12]


def arquetipo(f):
    principal = NUMEROS[camino_de_vida(f)][0]
    dia = ejes_del_dia(f)
    animal = EJES_ANIMAL[animal_chino(f)]
    puntos = {e: 0 for e in EJES}
    for e in dia:
        puntos[e] += 1
    for e in animal:
        puntos[e] += 1

    def clave(e):
        return (puntos[e],
                2 if e == animal[0] else 1 if e in animal else 0,
                2 if e == dia[0] else 1 if e in dia else 0)

    segundo = max((e for e in EJES if e != principal), key=clave)
    return ARQUETIPOS[frozenset((principal, segundo))]


if __name__ == "__main__":
    from collections import Counter
    c, n, f = Counter(), 0, dt.date(1945, 1, 1)
    while f <= dt.date(2008, 12, 31):
        c[arquetipo(f)] += 1; n += 1; f += dt.timedelta(days=1)
    for nombre in sorted(ARQUETIPOS.values(), key=lambda k: -c[k]):
        print(f"{nombre:28s} {100 * c[nombre] / n:5.1f}")
    print("Arquetipos que salen:", sum(1 for v in ARQUETIPOS.values() if c[v]), "de 28")
    print("28/09/1988 ->", arquetipo(dt.date(1988, 9, 28)))
