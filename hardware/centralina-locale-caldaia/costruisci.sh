#!/bin/bash
# Rigenera la scheda, la instrada con Freerouting 1.9.0 (si apre una finestra per qualche secondo) e controlla le regole (DRC).
# Variabili: FREEROUTING_JAR (percorso del file .jar)
set -e
cd "$(dirname "$0")"
PY=/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3
CLI=/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli
JAVA=${JAVA:-/opt/homebrew/opt/openjdk@17/bin/java}
rm -f kicad/centralina.ses
$PY genera_scheda.py 2>&1 | grep -v assert
$PY instrada.py 2>&1 | grep -E "DSN scritto" || true
"$JAVA" -jar "$FREEROUTING_JAR" -de kicad/centralina.dsn -do kicad/centralina.ses -mp 30 > /tmp/freerouting.log 2>&1 || true
[ -f kicad/centralina.ses ] || { echo "Freerouting non ha prodotto il file SES"; tail -5 /tmp/freerouting.log; exit 1; }
$PY - <<'PYEOF' 2>&1 | grep -v assert
import pcbnew
PCB="kicad/centralina.kicad_pcb"; SES="kicad/centralina.ses"
b=pcbnew.LoadBoard(PCB)
assert pcbnew.ImportSpecctraSES(b, SES), "importazione SES fallita"
pcbnew.ZONE_FILLER(b).Fill(b.Zones())
pcbnew.SaveBoard(PCB,b)
print("piste importate:", len(list(b.GetTracks())), "segmenti e via")
PYEOF
"$CLI" pcb drc --format json --severity-all --output /tmp/drc.json kicad/centralina.kicad_pcb 2>&1 | tail -1
python3 - <<'PYEOF'
import json,collections
d=json.load(open('/tmp/drc.json'))
print("DRC:", dict(collections.Counter(v['type'] for v in d.get('violations',[]))) or "nessuna violazione", "| non connessi:", len(d.get('unconnected_items',[])))
for v in d.get('violations',[])[:15]:
    print(" ", v['type'], v['description'][:70], [(i.get('description') or '')[:40] for i in v.get('items',[])][:2])
for u in d.get('unconnected_items',[])[:10]:
    print("  NC", [(i.get('description') or '')[:50] for i in u.get('items',[])])
PYEOF
