"""Genera docs/schema-cablaggio.svg: Shelly 1PM sulla pompa di integrazione (OUT2, pin 8-9) e Shelly EM Mini
in serie sull'alimentazione dell'Elios (la pompa del collettore, OUT1 pin 6-7, si deduce dalla potenza). Numeri dei morsetti dal manuale Elios 25 (pagina 8).
Prova con il cercafase del 5/10/2026: L di OUT1/OUT2 in tensione solo con la pompa in marcia, N mai =
uscite a fase commutata (non contatti puliti)."""
import html

W, H = 1400, 930
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

def n_stub(x, y):
    x2 = x - 38
    wire([(x, y), (x2, y)], BL)
    a(f'<rect x="{x2 - 11}" y="{y - 9}" width="11" height="18" rx="3" fill="{BL}"/>')
    t(x2 - 16, y + 4, "N comune", 11, "700", BL, "end")

def n_stub_down(x, y):
    wire([(x, y), (x, y + 30)], BL)
    a(f'<rect x="{x - 9}" y="{y + 30}" width="18" height="11" rx="3" fill="{BL}"/>')
    t(x + 24, y + 40, "N comune", 11, "700", BL)

def pe_stub_h(x, y):
    x2 = x - 38
    wire([(x, y), (x2, y)], GR, wd=4); wire([(x, y), (x2, y)], "#facc15", "6 6", 4)
    for i, w in enumerate((9, 6, 3)):
        a(f'<line x1="{x2 - i * 5}" y1="{y - w}" x2="{x2 - i * 5}" y2="{y + w}" stroke="{GR}" stroke-width="2.5"/>')
    t(x2 - 22, y + 4, "terra comune", 11, "700", GR, "end")

def pe_stub_v(x, y):
    wire([(x, y), (x, y + 24)], GR, wd=4); wire([(x, y), (x, y + 24)], "#facc15", "6 6", 4)
    for i, w in enumerate((18, 12, 6)):
        a(f'<line x1="{x - w}" y1="{y + 24 + i * 5}" x2="{x + w}" y2="{y + 24 + i * 5}" stroke="{GR}" stroke-width="2.5"/>')
    t(x + 26, y + 38, "terra comune", 11, "700", GR)

def box(x, y, w, h, title, fill="#f8fafc", stroke="#94a3b8", sub=None, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="2.5"{d}/>')
    t(x + w / 2, y + 24, title, 15, "700", anchor="middle")
    if sub:
        t(x + w / 2, y + 42, sub, 11.5, fill=SUB, anchor="middle")

def tag(x, y, n):
    a(f'<circle cx="{x}" cy="{y}" r="13" fill="{RED}"/>')
    t(x, y + 5, str(n), 14, "700", "#fff", "middle")

HOP = "a7 7 0 0 1 14 0"

a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Helvetica, Arial, sans-serif">')
a(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')
t(W / 2, 34, "Elios 25: Shelly EM Mini sull'alimentazione e Shelly 1PM sulla pompa di integrazione", 21, "700", anchor="middle")
t(W / 2, 56, "Morsetti dal manuale Elios 25: OUT1 = pin 6 (L) e 7 (N), OUT2 = pin 8 (L) e 9 (N). Provato con il cercafase: L ha fase solo con la pompa in marcia, N mai.", 12.5, fill=SUB, anchor="middle")

# quadro
box(40, 100, 190, 80, "Quadro", sub="fase protetta 10 A")
term(230, 150, "L", "r", BR)

# Shelly EM Mini sull'alimentazione
box(40, 230, 190, 150, "Shelly EM Mini Gen4", fill="#fff7ed", stroke="#fb923c", sub="contatore in linea, senza relè")
term(230, 305, "L", "r", BR); term(230, 350, "O (uscita)", "r", BR); term(135, 380, "N", "l", BL)

# Elios
box(330, 100, 330, 520, "Elios 25 (schema 02)", sub="uscite OUT = 230 V a fase commutata (L) e neutro (N)")
term(330, 160, "L alimentazione", "l", BR); term(330, 200, "N alimentazione", "l", BL)
t(645, 245, "OUT1 · pompa del collettore", 12, "700", SUB, "end")
term(660, 275, "pin 6 · L", "r", BR); term(660, 315, "pin 7 · N", "r", BL)
t(645, 375, "OUT2 · pompa di integrazione", 12, "700", SUB, "end")
term(660, 405, "pin 8 · L", "r", BR); term(660, 445, "pin 9 · N", "r", BL)
term(495, 620, "", "l", GR)

# riquadro di lettura
box(790, 100, 330, 130, "Cosa legge l'EM Mini", fill="#f1f5f9", stroke="#94a3b8", dash="6 5")
t(805, 150, "Elios + pompa del collettore (la pompa di integrazione", 12.5, fill=SUB)
t(805, 168, "passa dall'1PM, che ha la sua fase). Soglie da tarare:", 12.5, fill=SUB)
t(805, 192, "sotto ~10 W pompe ferme", 12.5, "700")
t(805, 212, "~20-26 W collettore in marcia", 12.5, "700")

# pompa collettore
box(1150, 110, 200, 140, "Pompa collettore", fill="#dcfce7", stroke="#16a34a", sub="circa 20 W")
term(1150, 180, "L", "l", BR); term(1150, 220, "N", "l", BL)
# Shelly 1PM (integrazione)
box(800, 370, 200, 240, "Shelly 1PM", fill="#eff6ff", stroke="#3b82f6", sub="relè 16 A + misura di potenza")
term(800, 480, "L", "l", BR); term(800, 520, "SW (ingresso)", "l", BR); term(800, 570, "N", "l", BL)
term(1000, 480, "O (uscita)", "r", BR)
# pompa integrazione
box(1150, 370, 200, 240, "Pompa integrazione", fill="#fef3c7", stroke="#d97706", sub="230 V~, circa 40 W")
term(1150, 480, "L", "l", BR); term(1150, 535, "N", "l", BL); term(1150, 580, "PE", "l", GR)

# ---- fase permanente dal quadro: verso EM Mini (poi Elios) e verso Shelly 1PM
wire([(235, 150), (280, 150), (280, 76), (700, 76)])
wire([(700, 76), (700, 480)])
wire([(700, 480), (800, 480)])                                   # 1PM L, prima dell'EM Mini
wire([(280, 150), (280, 305), (235, 305)])                       # EM Mini L
# EM Mini O -> L alimentazione dell'Elios (il filo che oggi arriva all'Elios), passa sopra al neutro
path("M235 350 H310 V207 a7 7 0 0 0 0 -14 V160 H330", dash="9 5", wd=4)
# OUT1 invariata: pin 6 -> pompa collettore (fase), pin 7 -> neutro
path("M665 275 H693 " + HOP + " H1100 V180 H1150")
path("M665 315 H693 " + HOP + " H1120 V220 H1150", BL)
# OUT2: pin 8 (fase commutata) -> SW dello Shelly 1PM (spostato)
path("M665 405 H693 " + HOP + " H740 V520 H800", dash="9 5", wd=4)
# OUT2: pin 9 (neutro) -> pompa integrazione (invariato), passa sotto lo Shelly
path("M665 445 H682 V650 H1135 V587 a7 7 0 0 0 0 -14 V535 H1150", BL)
# Shelly 1PM O -> pompa integrazione (nuovo)
wire([(1005, 480), (1150, 480)], wd=4)
# neutro e terra
n_stub(330, 200); n_stub_down(135, 380); n_stub(800, 570); pe_stub_h(1150, 580)
wire([(495, 620), (495, 640)], GR, wd=4); wire([(495, 620), (495, 640)], "#facc15", "6 6", 4)
for i, w in enumerate((18, 12, 6)):
    a(f'<line x1="{495 - w}" y1="{640 + i * 5}" x2="{495 + w}" y2="{640 + i * 5}" stroke="{GR}" stroke-width="2.5"/>')
t(521, 654, "terra comune", 11, "700", GR)

# numeri
tag(262, 330, 1); tag(715, 500, 2); tag(772, 460, 3); tag(1075, 467, 4)

# legenda
ly = 700
a(f'<rect x="30" y="{ly - 22}" width="1340" height="{H - ly - 8}" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>')
wire([(50, ly), (100, ly)]); t(110, ly + 4, "fase (L)", 12)
wire([(210, ly), (260, ly)], BL); t(270, ly + 4, "neutro (N)", 12)
wire([(390, ly), (440, ly)], GR, wd=4); wire([(390, ly), (440, ly)], "#facc15", "6 6", 4); t(450, ly + 4, "terra (PE)", 12)
wire([(560, ly), (620, ly)], BR, dash="9 5", wd=4); t(630, ly + 4, "filo che cambia destinazione", 12)
wire([(840, ly), (900, ly)], BR, wd=4); t(910, ly + 4, "filo nuovo", 12)
t(50, ly + 28, "1  Shelly EM Mini in serie sulla fase che alimenta l'Elios: dal quadro in L, da O al morsetto «L alimentazione» (il filo che oggi arriva all'Elios). N dello Shelly al neutro comune. Sempre alimentato.", 12.5)
t(50, ly + 50, "2  Pompa INTEGRAZIONE (OUT2): il filo di fase che oggi va dal pin 8 alla pompa va invece all'ingresso SW dello Shelly 1PM: l'ingresso vede quando l'Elios chiama la pompa. Il neutro resta al pin 9.", 12.5)
t(50, ly + 72, "3  Lo Shelly 1PM prende L dalla fase del quadro, in parallelo all'Elios e prima dell'EM Mini: sempre acceso, può bloccare la pompa anche quando l'Elios la chiama, e la sua pompa non passa dall'EM Mini.", 12.5)
t(50, ly + 94, "4  Filo nuovo dall'uscita O dello Shelly 1PM alla fase della pompa di integrazione. Neutro e terra della pompa restano come sono.", 12.5)
t(50, ly + 120, "Pompa COLLETTORE (OUT1): nessuna modifica, resta collegata come ora (pin 6 fase, pin 7 neutro). Si deduce dalla potenza letta dall'EM Mini.", 12.5, fill=SUB)
t(50, ly + 142, "Prima di montare l'1PM l'EM Mini vede anche la pompa di integrazione (30-40 W; entrambe le pompe sopra 55 W).", 12.5, fill=SUB)
t(50, ly + 164, "Prima di collegare SW verifica con il cercafase che a pompa ferma il filo non abbia tensione. L'EM Mini sopporta fino a 16 A: la fase dell'Elios (pompe da 20-40 W) è ben dentro il limite.", 12.5, fill=SUB)
t(50, ly + 196, "Togli corrente dal quadro prima di toccare qualsiasi filo. Lavori da elettricista abilitato, con puntalini sui conduttori. I fili morti di OUT3 vanno scollegati e isolati.", 12.5, "700", RED)
a('</svg>')
open("docs/schema-cablaggio.svg", "w").write("\n".join(o))
print("ok")
