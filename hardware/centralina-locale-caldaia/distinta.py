#!/usr/bin/env python3
"""Distinta (BOM) e posizioni (CPL) nel formato richiesto dal produttore, dalla scheda instradata. Il codice LCSC si compila al momento dell'ordine."""
import collections
import csv
import os
import re

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
b = pcbnew.LoadBoard(os.path.join(HERE, "kicad", "centralina.kicad_pcb"))
SUGG = {
    "ADS1115": "ADS1115IDGSR (TI, VSSOP-10)",
    "10k 0.1%": "10 kOhm 0,1 % 0603 (25 ppm o meglio)",
    "100n": "100 nF 0603 X7R 50 V",
    "10u": "10 uF 0603/0805 X5R 10 V",
    "10k": "10 kOhm 0603 1 %",
    "4k7": "4,7 kOhm 0603 1 %",
    "1k": "1 kOhm 0603 1 %",
    "100uF 10V": "100 uF 10 V elettrolitico SMD 6,3 x 5,4 mm",
    "PTC 1,5A": "fusibile ripristinabile 1812, 1,5 A di mantenimento, 6 V o piu'",
    "SMBJ5.0A": "TVS unidirezionale SMBJ5.0A (SMB)",
    "AO3401A": "MOSFET canale P AO3401A (SOT-23), Vgs max 12 V",
    "AP2112K-3.3": "regolatore LDO AP2112K-3.3 (SOT-23-5), 600 mA",
    "SS14": "diodo Schottky SS14 (SMA), 1 A 40 V",
    "5V": "LED 0603 (colore a scelta)",
    "3V3": "LED 0603 (colore a scelta)",
    "Morsettiera 5,08 mm 2 poli": "morsettiera a vite 5,08 mm, 2 poli, passo e ingombro come Phoenix MKDS 1,5",
    "JST XH 8 poli": "JST XH B8B-XH-A (passo 2,50 mm, verticale)",
    "JST XH 4 poli": "JST XH B4B-XH-A (passo 2,50 mm, verticale)",
    "Presa femmina 1x22 2,54 mm": "presa femmina 1x22, 2,54 mm (per il DevKit)",
    "Presa femmina 1x6 2,54 mm": "presa femmina 1x6, 2,54 mm (per il modulo W5500 Lite)",
    "Strip 1x4 2,54 mm": "strip maschio 1x4, 2,54 mm",
    "Strip 1x12 2,54 mm": "strip maschio 1x12, 2,54 mm",
}


def natkey(r):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", r)]


groups = collections.OrderedDict()
cpl = []
for f in b.GetFootprints():
    ref = f.GetReference()
    if ref.startswith("H"):
        continue
    tht = any(p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH for p in f.Pads())
    g = groups.setdefault((f.GetValue(), str(f.GetFPID().GetLibItemName())), {"refs": [], "tht": tht})
    g["refs"].append(ref)
    pos = f.GetPosition()
    cpl.append((ref, f"{pcbnew.ToMM(pos.x):.3f}mm", f"{-pcbnew.ToMM(pos.y):.3f}mm", "Top", f"{f.GetOrientationDegrees():.0f}"))
out = os.path.join(HERE, "produzione")
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, "distinta.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Comment", "Designator", "Footprint", "LCSC Part #", "Tipo", "Nota"])
    for (val, fpn), g in groups.items():
        w.writerow([val, ",".join(sorted(g["refs"], key=natkey)), fpn, "", "THT" if g["tht"] else "SMD", SUGG.get(val, "")])
with open(os.path.join(out, "posizioni_JLC.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Designator", "Mid X", "Mid Y", "Layer", "Rotation"])
    for r in sorted(cpl, key=lambda c: natkey(c[0])):
        w.writerow(r)
print("distinta e posizioni scritte")
