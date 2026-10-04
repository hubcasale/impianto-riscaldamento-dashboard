"""Genera docs/schema-cablaggio.svg: Shelly 1PM sulla pompa di integrazione (OUT2 dell'Elios come segnale)."""
import html

W, H = 1400, 940
o = []
a = o.append
BR, BL, GR, RED, INK, SUB = "#92400e", "#2563eb", "#16a34a", "#dc2626", "#0f172a", "#475569"

def t(x, y, s, size=13, w="400", fill=INK, anchor="start"):
    a(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}">{html.escape(s, quote=False)}</text>')

def wire(pts, col=BR, dash=None, wd=3):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    a(f'<polyline points="{" ".join(f"{x},{y}" for x, y in pts)}" fill="none" stroke="{col}" stroke-width="{wd}" stroke-linejoin="round"{d}/>')

def path(d, col=BR, dash=None, wd=3):
    ds = f' stroke-dasharray="{dash}"' if dash else ""
    a(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{wd}" stroke-linejoin="round"{ds}/>')

def term(x, y, label, side="l", col=INK):
    a(f'<circle cx="{x}" cy="{y}" r="5" fill="#fff" stroke="{col}" stroke-width="2.5"/>')
    if label:
        if side == "l":
            t(x + 12, y + 4, label, 12, "700")
        else:
            t(x - 12, y + 4, label, 12, "700", anchor="end")

def n_stub(x, y, direction="l"):
    """tratto di neutro verso il morsetto comune"""
    x2 = x - 38 if direction == "l" else x + 38
    wire([(x, y), (x2, y)], BL)
    a(f'<rect x="{x2 - 11 if direction == "l" else x2}" y="{y - 9}" width="11" height="18" rx="3" fill="{BL}"/>')
    t(x2 - 16 if direction == "l" else x2 + 16, y + 4, "N comune", 11, "700", BL, "end" if direction == "l" else "start")

def pe_stub(x, y, direction="d"):
    if direction == "d":
        wire([(x, y), (x, y + 24)], GR, wd=4); wire([(x, y), (x, y + 24)], "#facc15", "6 6", 4)
        for i, w in enumerate((18, 12, 6)):
            a(f'<line x1="{x - w}" y1="{y + 24 + i * 5}" x2="{x + w}" y2="{y + 24 + i * 5}" stroke="{GR}" stroke-width="2.5"/>')
        t(x + 26, y + 38, "terra comune", 11, "700", GR)
    else:
        x2 = x - 38
        wire([(x, y), (x2, y)], GR, wd=4); wire([(x, y), (x2, y)], "#facc15", "6 6", 4)
        for i, w in enumerate((9, 6, 3)):
            a(f'<line x1="{x2 - i * 5}" y1="{y - w}" x2="{x2 - i * 5}" y2="{y + w}" stroke="{GR}" stroke-width="2.5"/>')
        t(x2 - 22, y + 4, "terra comune", 11, "700", GR, "end")

def box(x, y, w, h, title, fill="#f8fafc", stroke="#94a3b8", sub=None, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="2.5"{d}/>')
    t(x + w / 2, y + 24, title, 15, "700", anchor="middle")
    if sub:
        t(x + w / 2, y + 42, sub, 11.5, fill=SUB, anchor="middle")

def tag(x, y, n):
    a(f'<circle cx="{x}" cy="{y}" r="13" fill="{RED}"/>')
    t(x, y + 5, str(n), 14, "700", "#fff", "middle")

a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Helvetica, Arial, sans-serif">')
a(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')
t(W / 2, 34, "Pompa di integrazione con Shelly 1PM: schema dei collegamenti", 22, "700", anchor="middle")
t(W / 2, 56, "L'Elios (schema 02, OUT2) non alimenta più la pompa: dà solo il segnale «richiesta integrazione». Il relè dello Shelly alimenta la pompa e può bloccarla da Home Assistant.", 12.5, fill=SUB, anchor="middle")

# ---- quadro
box(30, 110, 190, 110, "Quadro", sub="fase protetta 10 A")
term(220, 160, "L", "r", BR)

# ---- Elios
box(330, 100, 330, 410, "Elios 25 (schema 02)", sub="uscite OUT = contatti puliti 2(1) A, 230 V~")
term(330, 160, "L alimentazione", "l", BR)
term(330, 200, "N alimentazione", "l", BL)
t(645, 245, "OUT2 · pompa di integrazione", 12, "700", SUB, "end")
term(660, 275, "a", "r", BR); term(660, 315, "b", "r", BR)
t(645, 375, "OUT1 · pompa del collettore", 12, "700", SUB, "end")
term(660, 405, "a", "r", BR); term(660, 445, "b", "r", BR)
a(f'<line x1="640" y1="275" x2="640" y2="315" stroke="{SUB}" stroke-width="2" stroke-dasharray="3 3"/>')
a(f'<line x1="640" y1="405" x2="640" y2="445" stroke="{SUB}" stroke-width="2" stroke-dasharray="3 3"/>')
term(495, 510, "", "l", GR)

# ---- Shelly 1PM
box(800, 235, 200, 195, "Shelly 1PM", fill="#eff6ff", stroke="#3b82f6", sub="relè 16 A + misura di potenza")
term(800, 300, "L", "l", BR); term(800, 340, "SW (ingresso)", "l", BR); term(800, 390, "N", "l", BL)
term(1000, 300, "O (uscita)", "r", BR)
# ---- pompe
box(1150, 235, 200, 195, "Pompa integrazione", fill="#fef3c7", stroke="#d97706", sub="230 V~, circa 40 W")
term(1150, 300, "L", "l", BR); term(1150, 350, "N", "l", BL); term(1150, 395, "PE", "l", GR)
box(1150, 450, 200, 100, "Pompa collettore", fill="#dcfce7", stroke="#16a34a", sub="circa 20 W (invariata)")
term(1150, 487, "L", "l", BR); term(1150, 525, "N", "l", BL)

# ---- fili di fase
wire([(225, 160), (330, 160)])
wire([(280, 160), (280, 76), (700, 76)])
wire([(700, 76), (700, 405)])
wire([(700, 275), (665, 275)]); wire([(700, 405), (665, 405)])
wire([(760, 76), (760, 300), (800, 300)])
# OUT2 b -> SW (spostato), con ponticello sull'incrocio con la linea a x=700
path("M665 315 H693 a7 7 0 0 1 14 0 H740 V340 H800", dash="9 5", wd=4)
# O -> pompa (nuovo)
wire([(1005, 300), (1150, 300)], wd=4)
# OUT1 b -> misura -> pompa collettore
wire([(665, 445), (700, 445), (700, 490), (1100, 490), (1100, 487), (1150, 487)])
# pinza amperometrica attorno al solo filo di fase del collettore (nessun taglio)
a('<circle cx="900" cy="490" r="17" fill="#fff7ed" fill-opacity="0.6" stroke="#fb923c" stroke-width="4"/>')
a('<line x1="915" y1="478" x2="930" y2="470" stroke="#fb923c" stroke-width="3"/>')
t(900, 466, "pinza (CT)", 12, "700", "#c2410c", "middle")
t(960, 482, "freccia verso la pompa", 10.5, fill="#c2410c")
box(800, 575, 200, 125, "Shelly EM Mini Gen4", fill="#fff7ed", stroke="#fb923c", sub="esistente · solo misura, senza relè")
term(800, 630, "L", "l", BR); term(800, 668, "N", "l", BL)
wire([(770, 630), (800, 630)]); t(765, 634, "L permanente", 11, "700", BR, "end")
n_stub(800, 668, "l")
term(900, 575, "", "l", "#fb923c")
t(888, 566, "ingresso pinza CT", 11, "700", "#c2410c", "end")
wire([(900, 507), (900, 575)], "#fb923c", dash="5 4", wd=2.5)
# neutro e terra: tratti verso i morsetti comuni
n_stub(330, 200, "l")
pe_stub(495, 510, "d")
n_stub(800, 390, "l")
n_stub(1150, 350, "l"); pe_stub(1150, 395, "l")
n_stub(1150, 525, "l")

# ---- numeri
tag(722, 346, 1); tag(770, 418, 2); tag(1075, 286, 3)

# ---- legenda
ly = 735
a(f'<rect x="30" y="{ly - 22}" width="1340" height="195" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>')
wire([(50, ly), (100, ly)]); t(110, ly + 4, "fase (L)", 12)
wire([(210, ly), (260, ly)], BL); t(270, ly + 4, "neutro (N)", 12)
wire([(390, ly), (440, ly)], GR, wd=4); wire([(390, ly), (440, ly)], "#facc15", "6 6", 4); t(450, ly + 4, "terra (PE)", 12)
wire([(560, ly), (620, ly)], BR, dash="9 5", wd=4); t(630, ly + 4, "filo che cambia destinazione", 12)
wire([(840, ly), (900, ly)], BR, wd=4); t(910, ly + 4, "filo nuovo", 12)
t(50, ly + 32, "1  Il filo di fase che oggi esce da OUT2 (morsetto b) verso la pompa va ora all'ingresso SW dello Shelly: l'Elios dà solo il segnale (la pompa non passa più da lì).", 12.5)
t(50, ly + 54, "2  Lo Shelly è alimentato da L e N permanenti, non dal contatto OUT2: deve restare acceso anche quando l'Elios non chiama la pompa.", 12.5)
t(50, ly + 76, "3  Filo nuovo dall'uscita O dello Shelly alla fase della pompa. Neutro e terra della pompa restano com'erano; la linea del collettore (OUT1) non cambia.", 12.5)
t(50, ly + 98, "4  Lo Shelly di misura (EM Mini Gen4) resta alimentato da L e N come ora: si sposta solo la PINZA, aperta e richiusa attorno al SOLO filo di fase tra OUT1 b e la pompa del collettore (freccia verso la pompa). Nessun filo si taglia.", 12.5)
t(50, ly + 122, "«N comune» e «terra comune» sono le barre che hai già: i tratti disegnati sono i conduttori di oggi, non servono fili in più.", 12.5, fill=SUB)
t(50, ly + 152, "Stessa fase per L, SW e O. Prima di toccare qualsiasi filo togli corrente dal quadro. Lavori da elettricista abilitato, con puntalini sui conduttori.", 12.5, "700", RED)
a('</svg>')
open("docs/schema-cablaggio.svg", "w").write("\n".join(o))
print("ok")
