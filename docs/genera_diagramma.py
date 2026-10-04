"""Genera docs/funzionamento.svg: diagramma di flusso dell'accensione rapida, dello spegnimento, della salvaguardia
e della misura del tempo di messa in temperatura. Uso: python3 docs/genera_diagramma.py (poi sips per il PNG)."""

import html

W, H = 1520, 1200
out = []
a = out.append

COL = dict(
    start="#dcfce7", start_s="#16a34a", act="#e0f2fe", act_s="#0284c7", dec="#fef3c7", dec_s="#d97706",
    stop="#fee2e2", stop_s="#dc2626", note="#f1f5f9", note_s="#94a3b8", txt="#0f172a", sub="#475569",
    yes="#16a34a", no="#dc2626", line="#475569",
)


def text(x, y, lines, size=13, weight="400", fill=None, anchor="middle", gap=None):
    gap = gap or size + 4
    y0 = y - (len(lines) - 1) * gap / 2 + size * 0.35
    s = ""
    for i, ln in enumerate(lines):
        s += f'<text x="{x}" y="{y0 + i * gap:.1f}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{fill or COL["txt"]}">{html.escape(ln, quote=False)}</text>'
    return s


def box(cx, cy, w, h, lines, kind="act", dashed=False, size=13, bold=False):
    f, s = COL[kind], COL[kind + "_s"] if kind + "_s" in COL else COL["note_s"]
    d = ' stroke-dasharray="6 4"' if dashed else ""
    a(f'<rect x="{cx - w/2}" y="{cy - h/2}" width="{w}" height="{h}" rx="12" fill="{f}" stroke="{s}" stroke-width="2"{d}/>')
    a(text(cx, cy, lines, size=size, weight="700" if bold else "400"))


def oval(cx, cy, w, h, lines):
    a(f'<rect x="{cx - w/2}" y="{cy - h/2}" width="{w}" height="{h}" rx="{h/2}" fill="{COL["start"]}" stroke="{COL["start_s"]}" stroke-width="2"/>')
    a(text(cx, cy, lines, size=13, weight="700"))


def diamond(cx, cy, w, h, lines, size=12.5, small=None):
    pts = f"{cx},{cy - h/2} {cx + w/2},{cy} {cx},{cy + h/2} {cx - w/2},{cy}"
    a(f'<polygon points="{pts}" fill="{COL["dec"]}" stroke="{COL["dec_s"]}" stroke-width="2"/>')
    a(text(cx, cy - (6 if small else 0), lines, size=size, weight="700"))
    if small:
        a(text(cx, cy + 20 + (len(lines) - 1) * 8, small, size=10.5, fill=COL["sub"], gap=12))


def arrow(points, color=None, label=None, lx=None, ly=None, lcolor=None):
    color = color or COL["line"]
    p = " ".join(f"{x},{y}" for x, y in points)
    a(f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="2"/>')
    (x0, y0), (x1, y1) = points[-2], points[-1]
    dx, dy = x1 - x0, y1 - y0
    n = (dx * dx + dy * dy) ** 0.5 or 1
    ux, uy = dx / n, dy / n
    bx_, by_ = x1 - ux * 11, y1 - uy * 11
    a(f'<polygon points="{x1},{y1} {bx_ - uy * 5:.1f},{by_ + ux * 5:.1f} {bx_ + uy * 5:.1f},{by_ - ux * 5:.1f}" fill="{color}"/>')
    if label:
        a(f'<text x="{lx}" y="{ly}" font-size="12" font-weight="700" fill="{lcolor or color}">{label}</text>')


a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Helvetica, Arial, sans-serif">')
a('<defs><marker id="fr" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker></defs>')
a(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')
a(text(W / 2, 36, ["Impianto acqua calda: come funzionano accensione rapida, spegnimento e salvaguardia"], size=22, weight="700"))
a(text(W / 2, 60, ["Stato al 4 ottobre 2026 · soglie di partenza: boiler 45 °C, puffer 45/50 °C, durata massima 2 h, 2 accensioni rapide al giorno"], size=12.5, fill=COL["sub"]))

# intestazioni colonne
for cx, t in [(240, "A · ACCENSIONE RAPIDA (pulsante)"), (740, "B · SPEGNIMENTO DOPO L'ACCENSIONE RAPIDA"), (1230, "C · SALVAGUARDIA PARTENZE INUTILI")]:
    a(f'<rect x="{cx - 215}" y="84" width="430" height="30" rx="15" fill="#0f172a"/>')
    a(text(cx, 99, [t], size=13, weight="700", fill="#ffffff"))

# ---------------------------------------------------------------- A
ax = 240
bx = 740
oval(ax, 160, 250, 52, ["Tocco su «Avvia caldaia»", "(conferma entro 4 s)"])
arrow([(ax, 186), (ax, 232)])
diamond(ax, 310, 250, 150, ["Si può avviare?"], small=["Polygon OFF, nessun allarme", "boiler < 45 °C, puffer < 50 °C", "meno di 2 accensioni oggi"])
arrow([(ax + 125, 310), (ax + 162, 310)], color=COL["no"])
box(ax + 240, 310, 156, 96, ["Pulsante grigio", "con il motivo:", "non serve, puffer caldo,", "già accesa, allarme,", "limite di oggi"], "note", size=11.5)
a(f'<text x="{ax + 130}" y="302" font-size="12" font-weight="700" fill="{COL["no"]}">No</text>')
arrow([(ax, 385), (ax, 420)], color=COL["yes"], label="Sì", lx=ax + 8, ly=408)
box(ax, 455, 260, 66, ["Segna l'inizio, conta 1 accensione", "e attiva «accensione rapida»"])
arrow([(ax, 488), (ax, 526)])
box(ax, 552, 260, 50, ["Polygon in riscaldamento (heat)"])
arrow([(ax, 577), (ax, 618)])
box(ax, 650, 260, 66, ["Accensione: WAIT, START (~14 min)", "poi WORK, poi ECO STOP", "(puffer ~65 °C)"], size=12)
arrow([(ax, 683), (ax, 725)])
box(ax, 770, 270, 84, ["Intanto la scheda mostra", "«Acqua pronta in N min»", "35 min all'inizio, poi la media", "delle accensioni misurate"], "note", dashed=True, size=12)
# collegamento A -> B
arrow([(ax + 130, 650), (592, 650), (592, 290), (bx - 125 + 0, 290)], label="ECO STOP", lx=596, ly=480)

# ---------------------------------------------------------------- B
bx = 740
oval(bx, 160, 300, 52, ["Ogni 2 minuti e a ogni ECO STOP"])
arrow([(bx, 186), (bx, 232)])
diamond(bx, 290, 250, 116, ["Accensione rapida attiva", "e stato ECO STOP?"])
arrow([(bx + 125, 290), (bx + 170, 290)], color=COL["no"])
a(f'<text x="{bx + 130}" y="282" font-size="12" font-weight="700" fill="{COL["no"]}">No</text>')
box(bx + 245, 290, 150, 44, ["Non fa niente"], "note", size=12)
arrow([(bx, 348), (bx, 392)], color=COL["yes"], label="Sì", lx=bx + 8, ly=374)
diamond(bx, 450, 250, 116, ["Altro la tiene accesa?", "(termostato o programma)"])
arrow([(bx + 125, 450), (bx + 170, 450)], color=COL["yes"])
a(f'<text x="{bx + 130}" y="442" font-size="12" font-weight="700" fill="{COL["yes"]}">Sì</text>')
box(bx + 255, 450, 170, 86, ["Non spegne.", "Dopo 3 ore chiude la", "richiesta senza", "spegnere niente"], "note", size=11.5)
arrow([(bx, 508), (bx, 552)], color=COL["no"], label="No", lx=bx + 8, ly=534)
diamond(bx, 612, 270, 116, ["Puffer ≤ 50 °C e boiler", "≥ 45 °C, o passate 2 h?"])
arrow([(bx + 135, 612), (bx + 170, 612)], color=COL["no"])
a(f'<text x="{bx + 138}" y="604" font-size="12" font-weight="700" fill="{COL["no"]}">No</text>')
box(bx + 245, 612, 150, 54, ["Aspetta il", "prossimo controllo"], "note", size=11.5)
arrow([(bx, 670), (bx, 712)], color=COL["yes"], label="Sì", lx=bx + 8, ly=696)
box(bx, 755, 270, 80, ["Spegne la Polygon", "chiude l'accensione rapida", "scrive nel registro"], "stop", bold=True)
box(bx, 880, 330, 74, ["Annulla (sulla scheda) o caldaia spenta a mano:", "chiude la richiesta; spegne solo se", "nient'altro la deve tenere accesa"], "note", dashed=True, size=11.5)
a(f'<text x="{bx}" y="840" font-size="11" fill="{COL["sub"]}" text-anchor="middle">solo in ECO STOP, mai durante START o WORK</text>')

# ---------------------------------------------------------------- C
cx = 1230
oval(cx, 160, 330, 52, ["La Polygon passa da OFF a WAIT/START"])
arrow([(cx, 186), (cx, 232)])
diamond(cx, 280, 250, 96, ["Salvaguardia attiva?", "(interruttore dashboard)"])
arrow([(cx + 125, 280), (cx + 160, 280)], color=COL["no"])
a(f'<text x="{cx + 128}" y="272" font-size="12" font-weight="700" fill="{COL["no"]}">No</text>')
box(cx + 215, 280, 110, 44, ["Lascia partire"], "note", size=11.5)
arrow([(cx, 328), (cx, 366)], color=COL["yes"], label="Sì", lx=cx + 8, ly=352)
box(cx, 392, 220, 44, ["Attesa 10 secondi"])
arrow([(cx, 414), (cx, 444)])
diamond(cx, 506, 290, 124, ["Programma attivo o in", "partenza (±3 min) e non", "accensione rapida?"])
arrow([(cx + 145, 506), (cx + 172, 506)], color=COL["no"])
a(f'<text x="{cx + 148}" y="498" font-size="12" font-weight="700" fill="{COL["no"]}">No</text>')
box(cx + 225, 506, 105, 56, ["Lascia partire", "(a mano)"], "note", size=11)
arrow([(cx, 568), (cx, 606)], color=COL["yes"], label="Sì", lx=cx + 8, ly=592)
diamond(cx, 650, 250, 96, ["Il termostato chiede", "riscaldamento?"])
arrow([(cx + 125, 650), (cx + 160, 650)], color=COL["yes"])
a(f'<text x="{cx + 128}" y="642" font-size="12" font-weight="700" fill="{COL["yes"]}">Sì</text>')
box(cx + 215, 650, 110, 56, ["Lascia partire", "(deve scaldare)"], "note", size=11)
arrow([(cx, 698), (cx, 736)], color=COL["no"], label="No", lx=cx + 8, ly=722)
diamond(cx, 784, 250, 96, ["Puffer ≥ 45 °C e", "boiler ≥ 45 °C?"])
arrow([(cx + 125, 784), (cx + 160, 784)], color=COL["no"])
a(f'<text x="{cx + 128}" y="776" font-size="12" font-weight="700" fill="{COL["no"]}">No</text>')
box(cx + 215, 784, 110, 56, ["Lascia partire", "(serve)"], "note", size=11)
arrow([(cx, 832), (cx, 872)], color=COL["yes"], label="Sì", lx=cx + 8, ly=858)
box(cx, 908, 290, 64, ["Spegne la caldaia (partenza inutile)", "e ricorda «spenta dalla salvaguardia»"], "stop", bold=True, size=12)
arrow([(cx, 940), (cx, 978)])
box(cx, 1022, 330, 80, ["Finché il programma è attivo la riaccende se:", "il termostato chiede riscaldamento, oppure", "l'acqua si raffredda e il puffer scende sotto 45 °C"], "act", size=11.5)

# ---------------------------------------------------------------- D (striscia in basso, sotto A e B)
dy = 1110
a(f'<rect x="20" y="{dy - 56}" width="1000" height="112" rx="14" fill="#f8fafc" stroke="{COL["note_s"]}" stroke-width="2" stroke-dasharray="6 4"/>')
a(text(520, dy - 40, ["D · MISURA DEL TEMPO DI MESSA IN TEMPERATURA (alimenta «Acqua pronta in N min»)"], size=12.5, weight="700"))
steps = [
    (130, ["Polygon in START e", "boiler < 45 °C:", "parte il cronometro"]),
    (370, ["Il boiler supera 45 °C:", "i minuti trascorsi", "diventano un campione"]),
    (640, ["Scartato se il sole", "produce ≥ 1 kW, se < 3 o", "> 240 minuti, o dopo 4 h"]),
    (900, ["Media degli ultimi 10", "campioni (modificabili", "a mano nel campo di testo)"]),
]
for x, ln in steps:
    box(x, dy + 12, 200, 62, ln, "act", size=11.5)
for x0, x1 in [(230, 270), (470, 540), (740, 800)]:
    arrow([(x0, dy + 12), (x1, dy + 12)])
a('</svg>')
open("docs/funzionamento.svg", "w").write("\n".join(out))
print("ok")
