#!/usr/bin/env python3
"""Genera la scheda principale della centralina del locale caldaia (KiCad 10, API Python pcbnew).

Uso (Python di KiCad):
  /Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3 genera_scheda.py

Fonte unica del circuito: parti, reti e posizioni stanno qui. Il file prodotto e' kicad/centralina.kicad_pcb (senza piste: le piste
si fanno dopo, con instrada.py). Misure in mm, origine in alto a sinistra, y verso il basso.
"""
import os
import sys

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "kicad", "centralina.kicad_pcb")
FP = "/Applications/KiCad/KiCad.app/Contents/SharedSupport/footprints"

W, H = 120.0, 80.0          # contorno della scheda
ROW = 22.86                  # distanza tra le due file del DevKit (da verificare sul tuo esemplare con il calibro)
X0 = 30.0                    # x del primo pin delle prese del DevKit
Y_J3, Y_J1 = 12.0, 12.0 + ROW


def mm(v):
    return pcbnew.FromMM(v)


def vec(x, y):
    return pcbnew.VECTOR2I(mm(x), mm(y))


board = pcbnew.BOARD()
nets = {}


def net(name):
    if name not in nets:
        n = pcbnew.NETINFO_ITEM(board, name)
        board.Add(n)
        nets[name] = n
    return nets[name]


def load(lib, name):
    return pcbnew.FootprintLoad(os.path.join(FP, lib + ".pretty"), name)


def place(ref, lib, name, x, y, rot=0, value="", pads=None, side_text=True):
    """Mette un footprint; `pads` = {numero_pad: nome_rete}."""
    fp = load(lib, name)
    if fp is None:
        sys.exit(f"footprint non trovato: {lib}:{name}")
    pads = {str(k): v for k, v in (pads or {}).items()}   # i numeri dei pad sono stringhe
    fp.SetReference(ref)
    fp.SetValue(value or name)
    fp.SetPosition(vec(x, y))
    fp.SetOrientationDegrees(rot)
    fp.Value().SetVisible(False)
    fp.Reference().SetLayer(pcbnew.F_Fab)   # i riferimenti non si stampano sulla serigrafia (l'assemblaggio usa la distinta)
    fp.Reference().SetTextSize(pcbnew.VECTOR2I(mm(0.8), mm(0.8)))
    fp.Reference().SetTextThickness(mm(0.12))
    board.Add(fp)
    for pad in fp.Pads():
        n = pads.get(pad.GetNumber()) if pads else None
        if n:
            pad.SetNet(net(n))
    return fp


def text(s, x, y, size=1.0, layer=pcbnew.F_SilkS, rot=0):
    t = pcbnew.PCB_TEXT(board)
    t.SetText(s)
    t.SetPosition(vec(x, y))
    t.SetLayer(layer)
    t.SetTextSize(pcbnew.VECTOR2I(mm(size), mm(size)))
    t.SetTextThickness(mm(0.15))
    t.SetTextAngleDegrees(rot)
    board.Add(t)


def pin_labels(ref, names, dx, dy, size=0.9, align="left"):
    """Scrive sulla serigrafia il nome di ogni pin accanto al pad (`names` = {numero_pad: testo})."""
    fp = board.FindFootprintByReference(ref)
    for pad in fp.Pads():
        t = names.get(pad.GetNumber())
        if not t:
            continue
        x, y = pcbnew.ToMM(pad.GetPosition().x), pcbnew.ToMM(pad.GetPosition().y)
        tx = pcbnew.PCB_TEXT(board)
        tx.SetText(t)
        tx.SetPosition(vec(x + dx, y + dy))
        tx.SetLayer(pcbnew.F_SilkS)
        tx.SetTextSize(pcbnew.VECTOR2I(mm(size), mm(size)))
        tx.SetTextThickness(mm(0.15))
        tx.SetHorizJustify(pcbnew.GR_TEXT_H_ALIGN_RIGHT if align == "right" else pcbnew.GR_TEXT_H_ALIGN_LEFT if align == "left" else pcbnew.GR_TEXT_H_ALIGN_CENTER)
        board.Add(tx)


# ---------------------------------------------------------------------------------------------------------------
# contorno (angoli arrotondati, 2 mm)
def edge_line(x1, y1, x2, y2):
    s = pcbnew.PCB_SHAPE(board)
    s.SetShape(pcbnew.SHAPE_T_SEGMENT)
    s.SetLayer(pcbnew.Edge_Cuts)
    s.SetStart(vec(x1, y1))
    s.SetEnd(vec(x2, y2))
    s.SetWidth(mm(0.1))
    board.Add(s)


def edge_arc(cx, cy, sx, sy, ex, ey):
    s = pcbnew.PCB_SHAPE(board)
    s.SetShape(pcbnew.SHAPE_T_ARC)
    s.SetLayer(pcbnew.Edge_Cuts)
    s.SetArcGeometry(vec(sx, sy), vec(cx + (sx - cx) * 0.70710678 + (ex - cx) * 0.70710678, cy + (sy - cy) * 0.70710678 + (ey - cy) * 0.70710678), vec(ex, ey))
    s.SetWidth(mm(0.1))
    board.Add(s)


R = 2.0
edge_line(R, 0, W - R, 0)
edge_line(W, R, W, H - R)
edge_line(W - R, H, R, H)
edge_line(0, H - R, 0, R)
edge_arc(W - R, R, W - R, 0, W, R)
edge_arc(W - R, H - R, W, H - R, W - R, H)
edge_arc(R, H - R, R, H, 0, H - R)
edge_arc(R, R, 0, R, R, 0)

# fori M3
for i, (x, y) in enumerate([(4, 4), (W - 4, 4), (4, H - 4), (W - 4, H - 4)], 1):
    place(f"H{i}", "MountingHole", "MountingHole_3.2mm_M3", x, y, value="M3")

# ---------------------------------------------------------------------------------------------------------------
# ESP32-S3 DevKitC-1: due prese 1x22. Vista dall'alto, USB-C a destra, antenna a sinistra: la fila J3 sta sopra, la J1 sotto,
# e in entrambe il pin 1 e' a sinistra.
J1 = {
    1: "+3V3", 2: "+3V3", 4: "ADC_S3", 5: "ADC_S2", 8: "DISP_TX", 9: "DISP_RX", 12: "I2C_SDA", 15: "I2C_SCL",
    16: "ETH_CS", 17: "ETH_MOSI", 18: "ETH_SCLK", 19: "ETH_MISO", 20: "ETH_INT", 10: "ETH_RST", 21: "+5V_DK", 22: "GND",
}
J3 = {1: "GND", 21: "GND", 22: "GND", 4: "GPIO1", 5: "GPIO2", 6: "GPIO42", 7: "GPIO41", 8: "GPIO40", 9: "GPIO39", 10: "GPIO38",
      16: "GPIO48", 17: "GPIO47"}
place("J1", "Connector_PinSocket_2.54mm", "PinSocket_1x22_P2.54mm_Vertical", X0, Y_J1, rot=90, value="Presa femmina 1x22 2,54 mm", pads=J1)
place("J3", "Connector_PinSocket_2.54mm", "PinSocket_1x22_P2.54mm_Vertical", X0, Y_J3, rot=90, value="Presa femmina 1x22 2,54 mm", pads=J3)
text("ESP32-S3 DevKitC-1  (USB-C a destra)", X0 + 27, Y_J3 + ROW / 2, 1.0)

# ---------------------------------------------------------------------------------------------------------------
# alimentazione 5 V: morsettiera -> fusibile -> TVS -> MOSFET anti-inversione -> +5V; Schottky verso il pin 5 V del DevKit
TB = ("TerminalBlock_Phoenix", "TerminalBlock_Phoenix_MKDS-1,5-2-5.08_1x02_P5.08mm_Horizontal")
YT = 72.0                    # riga dei pad delle morsettiere (fili dal bordo inferiore)
XT0 = 14.0
PITCH_T = 11.4              # passo tra le morsettiere (5,08 mm x 2 poli + margine per l'ingombro)
place("J10", *TB, XT0 + 6 * PITCH_T, YT, value="Morsettiera 5,08 mm 2 poli", pads={"1": "VIN", "2": "GND"})
text("+5V", XT0 + 6 * PITCH_T - 1, YT + 6.5, 1.0)
text("GND", XT0 + 6 * PITCH_T + 4.5, YT + 6.5, 1.0)
place("F1", "Fuse", "Fuse_1812_4532Metric", 92, 62, rot=90, value="PTC 1,5A", pads={"1": "VIN", "2": "VIN_F"})
place("D1", "Diode_SMD", "D_SMB", 98, 62, rot=90, value="SMBJ5.0A", pads={"1": "VIN_F", "2": "GND"})
place("Q1", "Package_TO_SOT_SMD", "SOT-23", 104, 62, value="AO3401A", pads={"1": "Q1G", "2": "+5V", "3": "VIN_F"})
place("R10", "Resistor_SMD", "R_0603_1608Metric", 104, 67, rot=90, value="10k", pads={"1": "Q1G", "2": "GND"})
place("C10", "Capacitor_SMD", "CP_Elec_6.3x5.4", 111, 62, rot=90, value="100uF 10V", pads={"1": "+5V", "2": "GND"})
place("C11", "Capacitor_SMD", "C_0603_1608Metric", 111, 54, rot=90, value="100n", pads={"1": "+5V", "2": "GND"})
place("D2", "Diode_SMD", "D_SMA", 90, 54, value="SS14", pads={"1": "+5V_DK", "2": "+5V"})
place("LED1", "LED_SMD", "LED_0603_1608Metric", 94, 71, rot=90, value="5V", pads={"1": "LED5K", "2": "+5V"})
place("R11", "Resistor_SMD", "R_0603_1608Metric", 94, 74.5, rot=90, value="1k", pads={"1": "LED5K", "2": "GND"})
place("LED2", "LED_SMD", "LED_0603_1608Metric", 100, 71, rot=90, value="3V3", pads={"1": "LED3K", "2": "+3V3"})
place("R12", "Resistor_SMD", "R_0603_1608Metric", 100, 74.5, rot=90, value="1k", pads={"1": "LED3K", "2": "GND"})

# ---------------------------------------------------------------------------------------------------------------
# ADS1115 (VSSOP-10) con I2C
place("U1", "Package_SO", "MSOP-10_3x3mm_P0.5mm", 46, 52, value="ADS1115",
      pads={"1": "GND", "2": None, "3": "GND", "4": "N0", "5": "N1", "6": "N2", "7": "N3", "8": "+3V3", "9": "I2C_SDA", "10": "I2C_SCL"})
place("C20", "Capacitor_SMD", "C_0603_1608Metric", 52, 49, rot=90, value="100n", pads={"1": "+3V3", "2": "GND"})
place("C21", "Capacitor_SMD", "C_0603_1608Metric", 54.5, 49, rot=90, value="10u", pads={"1": "+3V3", "2": "GND"})
place("R20", "Resistor_SMD", "R_0603_1608Metric", 58, 45, rot=90, value="4k7", pads={"1": "+3V3", "2": "I2C_SDA"})
place("R21", "Resistor_SMD", "R_0603_1608Metric", 60.5, 45, rot=90, value="4k7", pads={"1": "+3V3", "2": "I2C_SCL"})

def fanout(ref, pad_no, dx, dy=0.0):
    """Pista corta (0,25 mm) dal pad verso l'esterno e via (0,6/0,3 mm) in fondo: serve ai pin a passo fine."""
    fp = board.FindFootprintByReference(ref)
    pad = next(p for p in fp.Pads() if p.GetNumber() == str(pad_no))
    x0, y0 = pcbnew.ToMM(pad.GetPosition().x), pcbnew.ToMM(pad.GetPosition().y)
    n = pad.GetNet()
    t = pcbnew.PCB_TRACK(board)
    t.SetLayer(pcbnew.F_Cu)
    t.SetStart(vec(x0, y0))
    t.SetEnd(vec(x0 + dx, y0 + dy))
    t.SetWidth(mm(0.25))
    t.SetNet(n)
    board.Add(t)
    v = pcbnew.PCB_VIA(board)
    v.SetPosition(vec(x0 + dx, y0 + dy))
    v.SetWidth(mm(0.6))
    v.SetDrill(mm(0.3))
    v.SetNet(n)
    v.SetViaType(pcbnew.VIATYPE_THROUGH)
    board.Add(v)


fanout("U1", 8, 1.5)    # VDD a destra
fanout("U1", 1, -1.5)   # ADDR (GND) a sinistra
fanout("U1", 3, -1.5)   # GND a sinistra

# ---------------------------------------------------------------------------------------------------------------
# 6 canali sonda NTC 10k: 3V3 -> 10k 0,1% -> nodo -> 100 nF a GND; morsettiera (nodo, GND)
labels = ["A0 solare ing.", "A1 puffer b", "A2 solare usc.", "A3 puffer c", "S3 puffer alto", "S2 puffer basso"]
chan = ["N0", "N1", "N2", "N3", "ADC_S3", "ADC_S2"]
for i, (lab, n) in enumerate(zip(labels, chan)):
    x = XT0 + i * PITCH_T
    place(f"J{i + 11}", *TB, x, YT, value="Morsettiera 5,08 mm 2 poli", pads={"1": n, "2": "GND"})
    place(f"R{30 + i}", "Resistor_SMD", "R_0603_1608Metric", x, 63, rot=90, value="10k 0.1%", pads={"1": "+3V3", "2": n})
    place(f"C{30 + i}", "Capacitor_SMD", "C_0603_1608Metric", x + 5.08, 63, rot=90, value="100n", pads={"1": n, "2": "GND"})
    text(lab, x - 1, YT + 6.5, 0.8)

# ---------------------------------------------------------------------------------------------------------------
# regolatore 3,3 V per il modulo W5500 Lite (assorbe circa 130 mA, alimentato solo a 3,3 V): AP2112K-3.3 (SOT-23-5)
place("U2", "Package_TO_SOT_SMD", "SOT-23-5", 25, 50, value="AP2112K-3.3", pads={"1": "+5V", "2": "GND", "3": "+5V", "5": "+3V3_ETH"})
place("C40", "Capacitor_SMD", "C_0603_1608Metric", 20.5, 50, rot=90, value="10u", pads={"1": "+5V", "2": "GND"})
place("C41", "Capacitor_SMD", "C_0603_1608Metric", 29.5, 50, rot=90, value="10u", pads={"1": "+3V3_ETH", "2": "GND"})
text("3V3 W5500", 25, 55, 0.8)

# ---------------------------------------------------------------------------------------------------------------
# connettori: W5500 (JST XH 8 poli), display (JST XH 4 poli), I2C esterno, pin liberi
place("J20", "Connector_JST", "JST_XH_B8B-XH-A_1x08_P2.50mm_Vertical", 12, 14, rot=-90, value="JST XH 8 poli",
      pads={"1": "+3V3_ETH", "2": "GND", "3": "ETH_SCLK", "4": "ETH_MISO", "5": "ETH_MOSI", "6": "ETH_CS", "7": "ETH_INT", "8": "ETH_RST"})
text("W5500 Lite (3V3)", 10, 9.4, 1.0)
pin_labels("J20", {"1": "1 3V3", "2": "2 GND", "3": "3 SCLK", "4": "4 MISO", "5": "5 MOSI", "6": "6 CS", "7": "7 INT", "8": "8 RST"}, -4.2, 0.0, 0.9, "right")
place("J21", "Connector_JST", "JST_XH_B4B-XH-A_1x04_P2.50mm_Vertical", 12, 40, rot=-90, value="JST XH 4 poli",
      pads={"1": "+5V", "2": "GND", "3": "DISP_TX", "4": "DISP_RX"})
text("DISPLAY (5V)", 10, 35.6, 1.0)
pin_labels("J21", {"1": "1 5V", "2": "2 GND", "3": "3 TX", "4": "4 RX"}, -4.2, 0.0, 0.9, "right")
place("J22", "Connector_PinHeader_2.54mm", "PinHeader_1x04_P2.54mm_Vertical", 100, 42, value="Strip 1x4 2,54 mm",
      pads={"1": "+3V3", "2": "GND", "3": "I2C_SDA", "4": "I2C_SCL"})
pin_labels("J22", {"1": "3V3", "2": "GND", "3": "SDA", "4": "SCL"}, 2.2, 0.0, 0.9, "left")
text("I2C", 100, 39, 0.9)
hb = ["+3V3", "+5V", "GND", "GPIO1", "GPIO2", "GPIO42", "GPIO41", "GPIO40", "GPIO39", "GPIO38", "GPIO48", "GPIO47"]
place("J23", "Connector_PinHeader_2.54mm", "PinHeader_1x12_P2.54mm_Vertical", 30, 4, rot=90, value="Strip 1x12 2,54 mm",
      pads={str(i + 1): n for i, n in enumerate(hb)})
pin_labels("J23", {"1": "3V3", "2": "5V", "3": "GND", "4": "1", "5": "2", "6": "42", "7": "41", "8": "40", "9": "39", "10": "38", "11": "48", "12": "47"}, 0.0, 3.4, 0.8, "center")
text("GPIO liberi (numeri)", 69, 4, 0.8)

# ---------------------------------------------------------------------------------------------------------------
# GND su entrambi gli strati (zone riempite)
def zone(layer):
    z = pcbnew.ZONE(board)
    z.SetLayer(layer)
    z.SetNet(net("GND"))
    z.SetLocalClearance(mm(0.3))
    z.SetMinThickness(mm(0.25))
    z.SetIslandRemovalMode(pcbnew.ISLAND_REMOVAL_MODE_ALWAYS)
    z.SetPadConnection(pcbnew.ZONE_CONNECTION_FULL)
    outline = z.Outline()
    outline.NewOutline()
    for x, y in [(0.5, 0.5), (W - 0.5, 0.5), (W - 0.5, H - 0.5), (0.5, H - 0.5)]:
        outline.Append(mm(x), mm(y))
    board.Add(z)


zone(pcbnew.B_Cu)   # piano di massa continuo sul retro; davanti la massa passa dai via

REV = "C"
text(f"rev {REV} 2026-11-20", 106, 77.5, 0.8)
tb = pcbnew.PCB_TEXT(board)
tb.SetText(f"rev {REV}")
tb.SetPosition(vec(60, 40))
tb.SetLayer(pcbnew.B_SilkS)
tb.SetMirrored(True)
tb.SetTextSize(pcbnew.VECTOR2I(mm(2.0), mm(2.0)))
board.Add(tb)

# ---------------------------------------------------------------------------------------------------------------
board.SetCopperLayerCount(2)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
pcbnew.SaveBoard(OUT, board)
print("scritto", OUT)
