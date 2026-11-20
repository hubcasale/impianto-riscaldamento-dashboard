#!/bin/bash
# Rigenera la scheda, la instrada con Freerouting 1.9.0 (si apre una finestra per qualche secondo), verifica le reti e lancia il DRC.
# Se il risultato non e' pulito riprova con un numero diverso di passaggi del router. Variabile: FREEROUTING_JAR (file .jar).
cd "$(dirname "$0")"
PY=/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3
CLI=/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli
JAVA=${JAVA:-/opt/homebrew/opt/openjdk@17/bin/java}
for MP in ${FREEROUTING_MP:-60 30 45 80 100}; do
  echo "== instradamento con $MP passaggi"
  rm -f kicad/centralina.ses
  $PY genera_scheda.py 2>&1 | grep -v assert
  $PY instrada.py 2>&1 | grep -E "DSN scritto" || true
  "$JAVA" -jar "$FREEROUTING_JAR" -de kicad/centralina.dsn -do kicad/centralina.ses -mp "$MP" > /tmp/freerouting.log 2>&1 || true
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
  $PY verifica_reti.py 2>&1 | grep -v assert || exit 1
  "$CLI" pcb drc --format json --severity-all --output /tmp/drc.json kicad/centralina.kicad_pcb > /dev/null 2>&1
  if python3 - <<'PYEOF'
import json,collections,sys
d=json.load(open('/tmp/drc.json'))
v=d.get('violations',[]); u=d.get('unconnected_items',[])
print("DRC:", dict(collections.Counter(x['type'] for x in v)) or "nessuna violazione", "| non connessi:", len(u))
for x in v[:10]: print(" ", x['type'], [(i.get('description') or '')[:45] for i in x.get('items',[])][:2])
for x in u[:6]: print("  NC", [(i.get('description') or '')[:50] for i in x.get('items',[])])
sys.exit(0 if not v and not u else 1)
PYEOF
  then echo "scheda pulita"; exit 0; fi
done
echo "ATTENZIONE: nessun tentativo ha dato una scheda pulita"; exit 1
