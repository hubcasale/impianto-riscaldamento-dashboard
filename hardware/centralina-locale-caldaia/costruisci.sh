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
# via di cucitura della massa: una griglia di via GND dove c'e' posto, cosi' i frammenti dei piani sui due strati restano collegati
mm=pcbnew.FromMM
gnd=b.FindNet("GND")
items=[*b.GetTracks()]+[p for f in b.GetFootprints() for p in f.Pads()]
def libero(x,y):
    pos=pcbnew.VECTOR2I(mm(x),mm(y))
    for it in items:
        n=it.GetNetname() if hasattr(it,"GetNetname") else ""
        if n=="GND": continue
        if it.HitTest(pos, mm(0.62)): return False
    for f in b.GetFootprints():
        for p in f.Pads():
            if p.GetAttribute()==pcbnew.PAD_ATTRIB_NPTH and p.HitTest(pos, mm(1.2)): return False
    for g in b.GetDrawings():
        if g.GetLayer()==pcbnew.Edge_Cuts and g.HitTest(pos, mm(1.5)): return False
    return True
n_via=0
y=3.0
while y<77.5:
    x=3.0
    while x<117.5:
        if libero(x,y):
            v=pcbnew.PCB_VIA(b); v.SetPosition(pcbnew.VECTOR2I(mm(x),mm(y))); v.SetWidth(mm(0.6)); v.SetDrill(mm(0.3)); v.SetNet(gnd); v.SetViaType(pcbnew.VIATYPE_THROUGH)
            b.Add(v); items.append(v); n_via+=1
        x+=6.0
    y+=6.0
pcbnew.ZONE_FILLER(b).Fill(b.Zones())
# ogni frammento di piano di massa deve avere almeno una via GND: se manca, se ne aggiunge una dentro il frammento
for giro in range(4):
    aggiunte=0
    for z in b.Zones():
        lay=z.GetLayer()
        polys=z.GetFilledPolysList(lay)
        for i in range(polys.OutlineCount()):
            bb=polys.COutline(i).BBox()
            ha_via=any(isinstance(t,pcbnew.PCB_VIA) and t.GetNetname()=="GND" and polys.Contains(t.GetPosition(), i) for t in items)
            if ha_via: continue
            trovato=False
            yy=pcbnew.ToMM(bb.GetTop())+0.3
            while yy<pcbnew.ToMM(bb.GetBottom()) and not trovato:
                xx=pcbnew.ToMM(bb.GetLeft())+0.3
                while xx<pcbnew.ToMM(bb.GetRight()) and not trovato:
                    pos=pcbnew.VECTOR2I(mm(xx),mm(yy))
                    if polys.Contains(pos, i) and libero(xx,yy):
                        v=pcbnew.PCB_VIA(b); v.SetPosition(pos); v.SetWidth(mm(0.6)); v.SetDrill(mm(0.3)); v.SetNet(gnd); v.SetViaType(pcbnew.VIATYPE_THROUGH)
                        b.Add(v); items.append(v); n_via+=1; aggiunte+=1; trovato=True
                    xx+=0.5
                yy+=0.5
    if not aggiunte: break
    pcbnew.ZONE_FILLER(b).Fill(b.Zones())
pcbnew.SaveBoard(PCB,b)
print("piste importate:", len(list(b.GetTracks())), "segmenti e via, di cui", n_via, "via di cucitura")
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
