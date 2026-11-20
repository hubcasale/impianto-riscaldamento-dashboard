#!/bin/bash
# Esporta Gerber, fori, posizioni e distinta dalla scheda gia' instradata (kicad/centralina.kicad_pcb) nella cartella produzione/.
set -e
cd "$(dirname "$0")"
PY=/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3
CLI=/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli
rm -rf produzione && mkdir -p produzione/gerber
$CLI pcb export gerbers --layers F.Cu,B.Cu,F.Paste,B.Paste,F.SilkS,B.SilkS,F.Mask,B.Mask,Edge.Cuts --output produzione/gerber/ kicad/centralina.kicad_pcb | tail -1
$CLI pcb export drill --format excellon --excellon-separate-th --drill-origin absolute --excellon-units mm --output produzione/gerber/ kicad/centralina.kicad_pcb | tail -1

$PY distinta.py 2>&1 | grep -v assert
(cd produzione/gerber && zip -q ../centralina_revC_gerber.zip *)
ls produzione
