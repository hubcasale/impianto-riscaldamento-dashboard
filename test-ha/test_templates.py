"""Prova offline dei template del pacchetto caldaia_accensione_rapida.yaml con un motore Jinja e stati simulati.
Uso: python3 test-ha/test_templates.py   (richiede PyYAML e jinja2)"""
import datetime as dt
import sys
import types
import yaml
from jinja2 import Environment

PKG = yaml.safe_load(open("ha-packages/caldaia_accensione_rapida.yaml"))
BOILER = yaml.safe_load(open("ha-packages/boiler_solare.yaml"))


def find(domain, name, pkg=None):
    for item in (pkg or PKG)["template"]:
        for e in item.get(domain, []):
            if e["name"] == name:
                return e
    raise KeyError(name)


def make_env(states, attrs, now, changed=None):
    env = Environment()

    def st(eid):
        return states.get(eid, "unknown")

    def is_state(eid, v):
        return st(eid) == v

    def is_number(v):
        try:
            float(v)
            return True
        except (TypeError, ValueError):
            return False

    def state_attr(eid, a):
        return attrs.get((eid, a))

    import math
    env.filters['as_datetime'] = lambda v, d=None: dt.datetime.fromisoformat(v) if isinstance(v, str) else d
    env.filters['as_local'] = lambda v: v
    env.globals.update(sin=math.sin, cos=math.cos, tan=math.tan, sqrt=math.sqrt, pi=math.pi, e=math.e)
    class _Dom:
        def __init__(self, dom): self._d = dom
        def __getattr__(self, name):
            eid = f"{self._d}.{name}"
            return types.SimpleNamespace(state=st(eid), last_changed=(changed or {}).get(eid, now)) if eid in states else None

    class _States:
        def __call__(self, eid): return st(eid)
        def __getattr__(self, dom): return _Dom(dom)

    env.globals.update(timedelta=dt.timedelta, states=_States(), is_state=is_state, is_number=is_number, state_attr=state_attr, now=lambda: now)
    return env


def render(tpl, states, attrs=None, now=None, this_state=None, extra=None, this_attrs=None, changed=None):
    now = now or dt.datetime(2026, 10, 5, 6, 0)  # lunedi
    env = make_env(states, attrs or {}, now, changed or {})
    this = types.SimpleNamespace(state=this_state, attributes=this_attrs or {})
    return env.from_string(tpl).render(this=this, **(extra or {})).strip()


fails = 0


def check(label, got, want):
    global fails
    ok = got.lower() == want.lower() if isinstance(got, str) and isinstance(want, str) else got == want
    fails += 0 if ok else 1
    print(("ok   " if ok else "FAIL ") + label + ("" if ok else f"  -> ottenuto {got!r}, atteso {want!r}"))


# ---------------------------------------------------------------- programma attivo ora
prog = find("binary_sensor", "Caldaia programma attivo ora")["state"]
days_mon_sat = {f"switch.casale_crono_p1_{d}": "on" for d in ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"]}
base = {"switch.casale_cronotermostato_settimanale": "on", "time.casale_crono_p1_accensione": "05:30:00", "time.casale_crono_p1_spegnimento": "08:00:00", **days_mon_sat}
LUN = dt.datetime(2026, 10, 5)  # lunedi
check("programma: lunedi 06:00 dentro P1", render(prog, base, now=LUN.replace(hour=6)), "True")
check("programma: lunedi 05:20 prima di P1", render(prog, base, now=LUN.replace(hour=5, minute=20)), "False")
check("programma: lunedi 08:00 fine esclusa", render(prog, base, now=LUN.replace(hour=8)), "False")
check("programma: domenica 06:00 giorno spento", render(prog, base, now=dt.datetime(2026, 10, 4, 6)), "False")
off_master = {**base, "switch.casale_cronotermostato_settimanale": "off"}
check("programma: cronotermostato spento", render(prog, off_master, now=LUN.replace(hour=6)), "False")
wrap = {"switch.casale_cronotermostato_settimanale": "on", "time.casale_crono_p2_accensione": "22:00:00", "time.casale_crono_p2_spegnimento": "02:00:00", "switch.casale_crono_p2_lunedi": "on"}
check("programma: scavalcamento, lunedi 23:00", render(prog, wrap, now=LUN.replace(hour=23)), "True")
check("programma: scavalcamento, martedi 01:00", render(prog, wrap, now=LUN.replace(hour=1) + dt.timedelta(days=1)), "True")
check("programma: scavalcamento, martedi 02:00", render(prog, wrap, now=LUN.replace(hour=2) + dt.timedelta(days=1)), "False")
mezz = {"switch.casale_cronotermostato_settimanale": "on", "time.casale_crono_p4_accensione": "12:00:00", "time.casale_crono_p4_spegnimento": "00:00:00", "switch.casale_crono_p4_lunedi": "on"}
check("programma: fino a mezzanotte, lunedi 23:50", render(prog, mezz, now=LUN.replace(hour=23, minute=50)), "True")
check("programma: orari non disponibili", render(prog, {"switch.casale_cronotermostato_settimanale": "on"}, now=LUN.replace(hour=6)), "False")

# ---------------------------------------------------------------- programma attivo o in partenza (tolleranza 3 minuti)
tol = find("binary_sensor", "Caldaia programma attivo o in partenza")["state"]
check("tolleranza: 3 minuti prima della partenza", render(tol, base, now=LUN.replace(hour=5, minute=27)), "True")
check("tolleranza: 4 minuti prima, ancora no", render(tol, base, now=LUN.replace(hour=5, minute=26)), "False")
check("tolleranza: dentro il programma", render(tol, base, now=LUN.replace(hour=6)), "True")
check("tolleranza: mezzanotte, programma del giorno dopo", render(tol, {"switch.casale_cronotermostato_settimanale": "on", "time.casale_crono_p1_accensione": "00:10:00", "time.casale_crono_p1_spegnimento": "03:00:00", "switch.casale_crono_p1_martedi": "on"}, now=LUN.replace(hour=23, minute=58)), "False")
check("tolleranza: mezzanotte, programma che parte alle 00:00", render(tol, {"switch.casale_cronotermostato_settimanale": "on", "time.casale_crono_p1_accensione": "00:00:00", "time.casale_crono_p1_spegnimento": "03:00:00", "switch.casale_crono_p1_martedi": "on"}, now=LUN.replace(hour=23, minute=58)), "True")
check("tolleranza: cronotermostato spento", render(tol, off_master, now=LUN.replace(hour=5, minute=28)), "False")

# ---------------------------------------------------------------- stato accensione rapida
stato = find("sensor", "Caldaia accensione rapida stato")["state"]
ok_states = {"sensor.casale_stato": "OFF", "sensor.boiler_solare_alto_stimato": "36.8", "sensor.casale_temperatura_boiler": "40",
             "sensor.casale_allarme": "____", "input_number.caldaia_t_uso_acqua": "45", "input_number.caldaia_boost_t_puffer_spegni": "50",
             "counter.caldaia_boost_oggi": "0", "input_number.caldaia_boost_max_al_giorno": "2", "input_boolean.caldaia_boost_attivo": "off"}
def s(**kw):
    return {**ok_states, **{k.replace("__", "."): v for k, v in kw.items()}}
check("stato: pronta", render(stato, ok_states), "pronta")
check("stato: attiva", render(stato, s(input_boolean__caldaia_boost_attivo="on")), "attiva")
check("stato: non serve (46 gradi)", render(stato, s(sensor__boiler_solare_alto_stimato="46")), "non_serve")
check("stato: non serve (esattamente 45)", render(stato, s(sensor__boiler_solare_alto_stimato="45.0")), "non_serve")
check("stato: puffer caldo", render(stato, s(sensor__casale_temperatura_boiler="58")), "puffer_caldo")
check("stato: limite giornaliero", render(stato, s(counter__caldaia_boost_oggi="2")), "limite")
check("stato: sotto il limite", render(stato, s(counter__caldaia_boost_oggi="1")), "pronta")
check("stato: ECO STOP con boiler freddo -> in attesa", render(stato, s(sensor__casale_stato="ECO STOP")), "in_attesa")
check("stato: ECO STOP con boiler caldo -> non serve", render(stato, s(sensor__casale_stato="ECO STOP", sensor__boiler_solare_alto_stimato="58.4")), "non_serve")
check("stato: WORK con boiler caldo -> non serve", render(stato, s(sensor__casale_stato="WORK", sensor__boiler_solare_alto_stimato="50")), "non_serve")
check("stato: STAND BY con boiler freddo -> in attesa", render(stato, s(sensor__casale_stato="STAND BY")), "in_attesa")
check("stato: WORK gia accesa", render(stato, s(sensor__casale_stato="WORK")), "accesa")
check("stato: STOP in arresto", render(stato, s(sensor__casale_stato="STOP")), "in_arresto")
check("stato: allarme", render(stato, s(sensor__casale_allarme="E12")), "allarme")
check("stato: nessun allarme (trattini)", render(stato, s(sensor__casale_allarme="-----")), "pronta")
check("stato: sonda non disponibile", render(stato, s(sensor__boiler_solare_alto_stimato="unavailable")), "non_disponibile")
check("stato: caldaia non disponibile", render(stato, s(sensor__casale_stato="unavailable")), "non_disponibile")
etich = find("sensor", "Caldaia accensione rapida stato")["attributes"]["etichetta"]
check("etichetta: pronta", render(etich, {}, this_state="pronta"), "Avvia caldaia")
check("etichetta: puffer caldo", render(etich, {}, this_state="puffer_caldo"), "Puffer caldo")
motivo = find("sensor", "Caldaia accensione rapida stato")["attributes"]["motivo"]
check("motivo: non serve", render(motivo, {}, this_state="non_serve"), "L'acqua è già a temperatura d'uso")

# ---------------------------------------------------------------- acqua pronta tra
pronta = find("sensor", "Caldaia acqua pronta tra")["state"]
NOW = dt.datetime(2026, 10, 5, 7, 0)
ts = lambda minuti_fa: (NOW - dt.timedelta(minutes=minuti_fa)).timestamp()
p_base = {"sensor.boiler_solare_alto_stimato": "37", "input_number.caldaia_t_uso_acqua": "45", "sensor.caldaia_tempo_stimato_messa_in_temperatura": "35",
          "input_boolean.caldaia_misura_acqua_in_corso": "off", "input_boolean.caldaia_boost_attivo": "off"}
check("pronta tra: gia calda -> 0", render(pronta, {**p_base, "sensor.boiler_solare_alto_stimato": "46"}, now=NOW), "0")
check("pronta tra: esattamente 45 -> 0", render(pronta, {**p_base, "sensor.boiler_solare_alto_stimato": "45"}, now=NOW), "0")
check("pronta tra: da scaldare, nessuna accensione -> stima", render(pronta, p_base, now=NOW), "35")
check("pronta tra: boost da 10 min -> 25", render(pronta, {**p_base, "input_boolean.caldaia_boost_attivo": "on"}, {("input_datetime.caldaia_boost_inizio", "timestamp"): ts(10)}, now=NOW), "25")
check("pronta tra: boost da 50 min -> minimo 1", render(pronta, {**p_base, "input_boolean.caldaia_boost_attivo": "on"}, {("input_datetime.caldaia_boost_inizio", "timestamp"): ts(50)}, now=NOW), "1")
check("pronta tra: misura in corso da 20 min -> 15", render(pronta, {**p_base, "input_boolean.caldaia_misura_acqua_in_corso": "on"}, {("input_datetime.caldaia_misura_acqua_avvio", "timestamp"): ts(20)}, now=NOW), "15")

# ---------------------------------------------------------------- condizione di spegnimento
auto = next(a for a in PKG["automation"] if a["id"] == "caldaia_boost_spegni")
cond = next(c for c in auto["conditions"] if c["condition"] == "template")["value_template"]
sp_base = {"sensor.casale_temperatura_boiler": "49", "sensor.boiler_solare_alto_stimato": "50", "input_number.caldaia_boost_max_ore": "2",
           "input_number.caldaia_boost_t_puffer_spegni": "50", "input_number.caldaia_t_uso_acqua": "45"}
a_ = lambda minuti: {("input_datetime.caldaia_boost_inizio", "timestamp"): ts(minuti)}
check("spegni: puffer sotto soglia e acqua calda", render(cond, sp_base, a_(40), now=NOW), "True")
check("spegni: puffer ancora caldo", render(cond, {**sp_base, "sensor.casale_temperatura_boiler": "62"}, a_(40), now=NOW), "False")
check("spegni: puffer sotto soglia ma acqua fredda", render(cond, {**sp_base, "sensor.boiler_solare_alto_stimato": "40"}, a_(40), now=NOW), "False")
check("spegni: scaduta la durata massima (2 h)", render(cond, {**sp_base, "sensor.casale_temperatura_boiler": "64", "sensor.boiler_solare_alto_stimato": "40"}, a_(121), now=NOW), "True")
check("spegni: poco prima delle 2 h", render(cond, {**sp_base, "sensor.casale_temperatura_boiler": "64"}, a_(119), now=NOW), "False")
check("spegni: puffer non disponibile", render(cond, {**sp_base, "sensor.casale_temperatura_boiler": "unavailable"}, a_(40), now=NOW), "False")

# ---------------------------------------------------------------- correzione delle sonde del boiler (modello di accoppiamento)
alto_t = find("sensor", "Boiler solare - alto stimato", BOILER)
basso_t = find("sensor", "Boiler solare - basso stimato", BOILER)
par = {"input_number.boiler_solare_t_ambiente": "16", "input_number.boiler_solare_k_alto": "0.766", "input_number.boiler_solare_k_basso": "0.73",
       "input_number.boiler_solare_delta_alto": "0", "input_number.boiler_solare_delta_basso": "0"}
def vicino(label, tpl, grezza_entity, grezza, reale, tol=0.4):
    global fails
    got = float(render(tpl["state"], {**par, grezza_entity: str(grezza)}))
    ok = abs(got - reale) <= tol
    fails += 0 if ok else 1
    print(("ok   " if ok else "FAIL ") + f"{label}: grezza {grezza} -> {got} (reale {reale})")
for raw, true in [(45.1, 54.0), (47.2, 56.8), (49.5, 59.6)]:
    vicino("alto", alto_t, "sensor.solare_termico_boiler_alto", raw, true)
for raw, true in [(21.4, 23.4), (27.8, 32.2)]:
    vicino("basso", basso_t, "sensor.garage_solare_termico_boiler_basso", raw, true)
check("alto: sonda scollegata (-30,7) non disponibile", render(alto_t["availability"], {**par, "sensor.solare_termico_boiler_alto": "-30.7"}), "False")
check("basso: sonda scollegata (-30,7) non disponibile", render(basso_t["availability"], {**par, "sensor.garage_solare_termico_boiler_basso": "-30.7"}), "False")
check("alto: sonda normale disponibile", render(alto_t["availability"], {**par, "sensor.solare_termico_boiler_alto": "40"}), "True")
check("delta di ritocco si somma", str(float(render(alto_t["state"], {**par, "sensor.solare_termico_boiler_alto": "49.5", "input_number.boiler_solare_delta_alto": "1"}))), "60.7")

# ---------------------------------------------------------------- curva di adattamento (regressione lineare)
curva_alto = find("sensor", "Boiler solare - curva sonda alta", BOILER)
curva_basso = find("sensor", "Boiler solare - curva sonda bassa", BOILER)
def curva(tpl, punti):
    st = {**par, "input_text.boiler_cal_punti_alto": punti, "input_text.boiler_cal_punti_basso": punti}
    return (render(tpl["state"], st), float(render(tpl["attributes"]["a"], st)), float(render(tpl["attributes"]["b"], st)), render(tpl["attributes"]["punti"], st))
st_, a_, b_, n_ = curva(curva_alto, "45.1:54.0,47.2:56.8,49.5:59.6")
check("curva: 3 punti -> regressione", st_, "regressione")
check("curva: pendenza attorno a 1,27", f"{a_:.2f}", "1.27")
check("curva: intercetta attorno a -3,3", f"{b_:.1f}", "-3.3")
check("curva: passa per i punti (49,5 -> 59,6)", f"{a_ * 49.5 + b_:.1f}", "59.6")
st_, a_, b_, n_ = curva(curva_alto, "45.1:54.0,47.2:56.8")
check("curva: 2 punti -> modello", st_, "modello")
check("curva: 2 punti, pendenza del modello (1/0,766)", str(abs(a_ - 1 / 0.766) < 0.001), "True")
st_, a_, b_, n_ = curva(curva_alto, "45.0:54.0,45.5:54.5,46.0:55.2")
check("curva: punti troppo vicini -> modello", st_, "modello")
st_, a_, b_, n_ = curva(curva_alto, "40:49,50:61,60:73")
check("curva: retta esatta con punti distanti", f"{a_:.2f}/{b_:.1f}", "1.20/1.0")
st_, a_, b_, n_ = curva(curva_alto, "40:40,50:60,60:80")
check("curva: pendenza fuori limiti -> modello", st_, "modello")
st_, a_, b_, n_ = curva(curva_alto, "abc,45.1:54.0,:,47.2:56.8,49.5:59.6")
check("curva: ignora voci non valide", (st_, n_), ("regressione", "5"))
check("curva: nessun punto -> modello", curva(curva_alto, "")[0], "modello")

def stimato_con_curva(tpl, grezza_entity, grezza, a, b):
    sid = "sensor.boiler_solare_curva_sonda_alta" if "alto" in grezza_entity or "boiler_alto" in grezza_entity else "sensor.boiler_solare_curva_sonda_bassa"
    return float(render(tpl["state"], {**par, grezza_entity: str(grezza)}, {(sid, "a"): a, (sid, "b"): b}))
check("stimata usa la retta della curva", f"{stimato_con_curva(alto_t, 'sensor.solare_termico_boiler_alto', 60.0, 1.2, 1.0):.1f}", "73.0")

# script di registrazione
reg = BOILER["script"]["boiler_cal_registra_alto"]["sequence"][1]["data"]["value"]
check("registra: aggiunge in coda", render(reg, {"input_text.boiler_cal_punti_alto": "45.1:54.0", "sensor.solare_termico_boiler_alto": "49.5", "input_number.boiler_cal_s3": "59.6"}), "45.1:54.0,49.5:59.6")
check("registra: primo punto", render(reg, {"input_text.boiler_cal_punti_alto": "", "sensor.solare_termico_boiler_alto": "49.5", "input_number.boiler_cal_s3": "59.6"}), "49.5:59.6")
venti = ",".join(f"{40 + i}:{50 + i}" for i in range(15))
r15 = render(reg, {"input_text.boiler_cal_punti_alto": venti, "sensor.solare_termico_boiler_alto": "70", "input_number.boiler_cal_s3": "85"}).split(",")
check("registra: tiene solo gli ultimi 15", (len(r15), r15[-1], r15[0]), (15, "70.0:85.0", "41:51"))
ann = BOILER["script"]["boiler_cal_annulla_alto"]["sequence"][0]["data"]["value"]
check("annulla: toglie l'ultimo", render(ann, {"input_text.boiler_cal_punti_alto": "1:2,3:4,5:6"}), "1:2,3:4")
check("annulla: con un solo punto svuota", render(ann, {"input_text.boiler_cal_punti_alto": "1:2"}), "")

# ---------------------------------------------------------------- pompe della centralina solare dalla potenza totale
POMPE = yaml.safe_load(open("ha-packages/caldaia_pompe_centralina.yaml"))
stato_p = POMPE["template"][0]["sensor"][0]["state"]
sogl = {"input_number.centralina_pompe_w_ferme": "10", "input_number.centralina_pompe_w_collettore_max": "26", "input_number.centralina_pompe_w_entrambe_min": "55"}
def classe(w):
    return render(stato_p, {**sogl, "sensor.garage_centralina_solare_pompe_potenza": w})
for w, atteso in [("3.4", "ferme"), ("9.9", "ferme"), ("10", "collettore"), ("19.6", "collettore"), ("24.4", "collettore"), ("26", "collettore"),
                  ("33.8", "integrazione"), ("44", "integrazione"), ("54.9", "integrazione"), ("55", "entrambe"), ("63.9", "entrambe"), ("79.3", "entrambe"),
                  ("unavailable", "non_disponibile"), ("unknown", "non_disponibile")]:
    check(f"pompe: {w} W -> {atteso}", classe(w), atteso)
bin_int = POMPE["template"][1]["binary_sensor"][0]["state"]
bin_col = POMPE["template"][1]["binary_sensor"][1]["state"]
def bs(tpl, s, prima=None):
    return render(tpl, {"sensor.caldaia_centralina_solare_pompe_stato": s}, this_state=prima)
check("integrazione attiva con solo integrazione", bs(bin_int, "integrazione"), "True")
check("integrazione attiva con entrambe", bs(bin_int, "entrambe"), "True")
check("integrazione non attiva con solo collettore", bs(bin_int, "collettore"), "False")
check("collettore attivo con solo collettore", bs(bin_col, "collettore"), "True")
check("collettore attivo con entrambe", bs(bin_col, "entrambe"), "True")
check("collettore non attivo con solo integrazione", bs(bin_col, "integrazione"), "False")
check("integrazione: dato mancante mantiene lo stato (acceso)", bs(bin_int, "non_disponibile", "on"), "True")
check("collettore: dato mancante mantiene lo stato (spento)", bs(bin_col, "non_disponibile", "off"), "False")


# ---- blocco e accensione forzata della pompa di integrazione
BLOCCO = yaml.safe_load(open("ha-packages/caldaia_integrazione_blocco.yaml"))
inutile = find("binary_sensor", "Caldaia integrazione inutile", BLOCCO)["state"]
forzare = find("binary_sensor", "Caldaia integrazione da forzare", BLOCCO)["state"]
def inu(p, b, prima=None, **extra):
    st = {"sensor.puffer_temperatura_effettiva": p, "sensor.boiler_solare_alto_stimato": b,
          "input_number.caldaia_integrazione_delta_blocco": "4", "input_number.caldaia_integrazione_delta_sblocco": "7"}
    st.update(extra)
    return render(inutile, st, attrs={("sensor.puffer_temperatura_effettiva", "affidabile"): True}, this_state=prima)
def forz(p, b, inutile_state="off", prima=None, tmax="55", h="2"):
    st = {"sensor.puffer_temperatura_effettiva": p, "sensor.boiler_solare_alto_stimato": b,
          "binary_sensor.caldaia_integrazione_inutile": inutile_state,
          "input_number.caldaia_integrazione_temp_max": tmax, "input_number.caldaia_integrazione_isteresi_max": h}
    return render(forzare, st, attrs={("sensor.puffer_temperatura_effettiva", "affidabile"): True}, this_state=prima)
check("inutile: puffer appena sopra il boiler", inu("44", "43.2"), "True")
check("inutile: puffer molto piu caldo", inu("60", "45"), "False")
check("inutile: isteresi, resta inutile tra 4 e 7", inu("50", "45", "on"), "True")
check("inutile: isteresi, resta utile tra 4 e 7", inu("50", "45", "off"), "False")
check("inutile: sopra lo sblocco torna utile", inu("53", "45", "on"), "False")
check("inutile: letture mancanti non blocca", inu("44", "unknown"), "False")
check("forzare: puffer caldo e boiler sotto il massimo", forz("62", "45"), "True")
check("forzare: boiler vicino al massimo non riparte", forz("70", "54", prima="off"), "False")
check("forzare: boiler vicino al massimo continua se gia acceso", forz("70", "54", prima="on"), "True")
check("forzare: boiler oltre il massimo si ferma", forz("70", "56", prima="on"), "False")
check("forzare: pompa inutile non forza", forz("46", "45", inutile_state="on"), "False")
check("forzare: regola non disponibile non forza", forz("62", "45", inutile_state="unavailable"), "False")
check("forzare: puffer mancante non forza", forz("unknown", "45"), "False")


# ---- consumo di pellet (stima)
PELLET = yaml.safe_load(open("ha-packages/caldaia_pellet.yaml"))
rate_tpl = find("sensor", "Caldaia pellet consumo istantaneo", PELLET)["state"]
acc_tpl = PELLET["template"][1]["sensor"][0]["state"]
tot_tpl = find("sensor", "Caldaia pellet stimato totale", PELLET)["state"]
def rate(stato, pot="100", fattore="1", kgh="5.6", kmin="1.63", mant="0.2"):
    return render(rate_tpl, {"sensor.casale_stato": stato, "sensor.casale_potenza_reale": pot,
                             "input_number.caldaia_pellet_fattore": fattore, "input_number.caldaia_pellet_kg_h_max": kgh,
                             "input_number.caldaia_pellet_kg_h_min": kmin,
                             "input_number.caldaia_pellet_kg_h_mantenimento": mant})
check("pellet: WORK al 100 %", float(rate("WORK")), 5.6)
check("pellet: WORK al 30 %", float(rate("WORK", "30")), 1.63)
check("pellet: WORK al 65 % (interpolato)", float(rate("WORK", "65")), 3.615)
check("pellet: WORK al 50 % (interpolato)", abs(float(rate("WORK", "50")) - 2.764) < 0.001, True)
check("pellet: WORK sotto il 30 % in proporzione", float(rate("WORK", "15")), 0.815)
check("pellet: WORK con fattore di taratura", float(rate("WORK", "100", "1.1")), 6.16)
check("pellet: potenza non valida vale 100 %", float(rate("WORK", "32768")), 5.6)
check("pellet: potenza non disponibile vale 100 %", float(rate("WORK", "unavailable")), 5.6)
check("pellet: STAND BY mantenimento", float(rate("STAND BY")), 0.2)
check("pellet: STOP mantenimento", float(rate("STOP")), 0.2)
for st_ in ("ECO STOP", "OFF", "WAIT", "START", "unavailable"):
    check(f"pellet: {st_} nessun consumo", float(rate(st_)), 0.0)
def acc(prima, g="200", f="1"):
    return render(acc_tpl, {"input_number.caldaia_pellet_g_accensione": g, "input_number.caldaia_pellet_fattore": f}, this_state=prima)
check("pellet: prima accensione (stato sconosciuto)", float(acc("unknown")), 0.2)
check("pellet: seconda accensione si somma", float(acc("0.2")), 0.4)
check("pellet: accensione con fattore", float(acc("1.0", "150", "1.2")), 1.18)
tot = lambda c, a: render(tot_tpl, {"sensor.caldaia_pellet_consumato_combustione": c, "sensor.caldaia_pellet_accensioni": a})
check("pellet: totale = combustione + accensioni", float(tot("3.5", "0.4")), 3.9)
check("pellet: totale senza accensioni ancora registrate", float(tot("3.5", "unknown")), 3.5)


# ---- pannello solare: temperatura mostrata e massima prevista
import math as _m
sys.path.insert(0, "test-ha")
from panel_model import simulate as _sim
PAN = yaml.safe_load(open("ha-packages/solare_pannello.yaml"))
def _sens(name):
    for item in PAN["template"]:
        for e_ in item.get("sensor", []):
            if e_["name"] == name: return e_
    raise KeyError(name)
temp_tpl = _sens("Solare pannello temperatura")["state"]
fonte_tpl = _sens("Solare pannello temperatura")["attributes"]["fonte"]
max_tpl = _sens("Solare pannello massima prevista")["state"]
def pann(pompa, ing, stima):
    st_ = {"binary_sensor.caldaia_pompa_collettore_attiva": pompa, "sensor.solare_termico_solare_serpentina_ingresso": ing,
           "sensor.solare_termico_t_collettore_stimata": stima}
    return render(temp_tpl, st_), render(fonte_tpl, st_)
check("pannello: pompa ferma usa la stima", pann("off", "33.5", "41.6")[0], "41.6")
check("pannello: pompa in marcia usa la misura", pann("on", "33.5", "41.6")[0], "33.5")
check("pannello: fonte misurata", pann("on", "33.5", "41.6")[1], "misurata")
check("pannello: fonte stimata", pann("off", "33.5", "41.6")[1], "stimata")
check("pannello: pompa in marcia ma sensore non disponibile usa la stima", pann("on", "unavailable", "41.6")[0], "41.6")
def massima(n, now_h=7.5, t0=17.0, oss=None, gobs=0.0, text=17.0, tmax=None):
    ore = [{"h": h, "oggi": True, "t": (16 + 10 * _m.sin(_m.pi * (h - 7) / 12)) if 7 < h < 19 else 16, "u": 60.0, "n": n} for h in range(7, 20)]
    stati = {"sensor.solare_termico_t_collettore_stimata": str(t0), "sensor.solare_pannello_massima_oggi": str(oss if oss is not None else t0),
             "sensor.solare_termico_irraggiamento_sul_piano": str(gobs), "sensor.temperatura_esterna_2_decimali": str(text),
             "input_number.solare_termico_inclinazione": "35", "input_number.solare_termico_orientamento": "180",
             "input_number.solare_termico_k": "0.07", "input_number.solare_termico_tau": "150", "input_number.solare_pannello_fattore_sereno": "1"}
    attrs = {("sensor.solare_previsione_oraria", "ore"): ore, ("sensor.solare_previsione_oraria", "mezzogiorno"): 13.1, ("zone.home", "latitude"): 43.11}
    now_ = dt.datetime(2026, 10, 7, int(now_h), int(round((now_h % 1) * 60)))
    got = float(render(max_tpl, stati, attrs, now_))
    exp, _, _, _ = _sim(ore, now_h, t0, 13.1, 43.11, 280, t_ext_now=text)
    return got, max(exp, oss if oss is not None else t0)
for nome, n in (("sereno", 5), ("variabile", 50), ("coperto", 95)):
    got, exp = massima(n)
    check(f"pannello: massima prevista {nome} come il modello Python (+-0,6)", abs(got - exp) <= 0.6, True)
g1, _ = massima(5); g2, _ = massima(50); g3, _ = massima(95)
check("pannello: piu nuvole, massima piu bassa", g1 > g2 > g3, True)
check("pannello: giornata serena oltre i 60 C", g1 > 60, True)
check("pannello: giornata coperta sotto i 50 C", g3 < 50, True)
got, _ = massima(95, oss=58.0)
check("pannello: non scende sotto la massima gia' raggiunta oggi", got >= 58, True)
got, _ = massima(5, now_h=19.5, t0=40.0, oss=58.0)
check("pannello: dopo il tramonto resta la massima osservata", got, 58.0)


# persistenza dell'irraggiamento misurato: nuvolo adesso -> massima piu' bassa che con cielo sereno misurato
low, _ = massima(5, now_h=12.0, t0=40.0, gobs=100.0)
high, _ = massima(5, now_h=12.0, t0=40.0, gobs=850.0)
check("pannello: irraggiamento misurato basso abbassa la previsione", low < high, True)

# previsione oraria: costruzione dell'attributo "ore" dal servizio meteo
ore_tpl = _sens("Solare previsione oraria")["attributes"]["ore"] if False else None
for item in PAN["template"]:
    if "actions" in item:
        ore_tpl = item["sensor"][0]["attributes"]["ore"]
fc = {"weather.casale": {"forecast": [
    {"datetime": "2026-10-07T10:00:00", "temperature": 20, "humidity": 55, "cloud_coverage": 30, "condition": "sunny"},
    {"datetime": "2026-10-07T11:30:00", "temperature": 22, "condition": "cloudy"},
    {"datetime": "2026-10-08T00:00:00", "temperature": 12, "humidity": 80, "cloud_coverage": 0, "condition": "sunny"}]}}
out = eval(render(ore_tpl, {}, now=dt.datetime(2026, 10, 7, 9, 0), extra={"fc": fc}).replace("True", "True"))
check("previsione: tre ore", len(out), 3)
check("previsione: oggi e domani", [o["oggi"] for o in out], [True, True, False])
check("previsione: nuvolosita dichiarata", out[0]["n"], 30.0)
check("previsione: nuvolosita dalla condizione se manca", out[1]["n"], 85.0)
check("previsione: umidita di riserva", out[1]["u"], 60.0)
check("previsione: ora decimale", out[1]["h"], 11.5)
out2 = eval(render(ore_tpl, {}, now=dt.datetime(2026, 10, 7, 9, 0), extra={}, this_state=None).replace("[]", "[]") or "[]")
check("previsione: senza servizio resta l'elenco precedente (vuoto)", out2, [])


# ---- puffer effettivo senza Internet
EFF = find("sensor", "Puffer temperatura effettiva", BLOCCO)
def eff(cloud, sonda="55.3", pompa="on", minuti_da=10, attesa="5"):
    now_ = dt.datetime(2026, 10, 8, 19, 0)
    stati = {"sensor.casale_temperatura_boiler": cloud, "sensor.solare_termico_integrazione_serpentina_ingresso": sonda,
             "binary_sensor.caldaia_pompa_integrazione_attiva": pompa, "input_number.caldaia_puffer_attesa_minuti": attesa,
             "input_number.caldaia_puffer_k_sonda": "0.753", "input_number.caldaia_puffer_t_ambiente_sonda": "19.7"}
    ch = {"sensor.casale_temperatura_boiler": now_ - dt.timedelta(minutes=minuti_da)}
    return (render(EFF["availability"], stati, now=now_, changed=ch), render(EFF["state"], stati, now=now_, changed=ch),
            render(EFF["attributes"]["fonte"], stati, now=now_, changed=ch), render(EFF["attributes"]["affidabile"], stati, now=now_, changed=ch))
check("puffer: con la lettura della caldaia usa quella", eff("64.0")[1], "64.0")
check("puffer: fonte caldaia", eff("64.0")[2], "caldaia")
check("puffer: caldaia non disponibile da 3 minuti, si aspetta", eff("unavailable", minuti_da=3)[0], "False")
check("puffer: caldaia non disponibile da 10 minuti, disponibile dalla sonda", eff("unavailable", minuti_da=10)[0], "True")
check("puffer: dalla sonda 55,3 C con k=0,753", float(eff("unavailable")[1]), 67.0)
check("puffer: fonte sonda ingresso", eff("unavailable")[2], "sonda ingresso")
check("puffer: sonda con pompa in marcia e' affidabile", eff("unavailable", pompa="on")[3], "True")
check("puffer: sonda a pompa ferma non e' affidabile", eff("unavailable", pompa="off")[3], "False")
check("puffer: lettura della caldaia e' sempre affidabile", eff("64.0", pompa="off")[3], "True")
check("puffer: nessuna delle due letture", eff("unavailable", sonda="unavailable")[0], "False")
INU = find("binary_sensor", "Caldaia integrazione inutile", BLOCCO)["state"]
FOR = find("binary_sensor", "Caldaia integrazione da forzare", BLOCCO)["state"]
def inu2(p, b, aff, prima=None):
    st_ = {"sensor.puffer_temperatura_effettiva": p, "sensor.boiler_solare_alto_stimato": b,
           "input_number.caldaia_integrazione_delta_blocco": "4", "input_number.caldaia_integrazione_delta_sblocco": "7"}
    return render(INU, st_, attrs={("sensor.puffer_temperatura_effettiva", "affidabile"): aff}, this_state=prima)
check("regola: puffer affidabile e freddo, blocca", inu2("44", "43", True), "True")
check("regola: puffer non affidabile, non blocca mai", inu2("44", "43", False), "False")
def for2(p, b, aff):
    st_ = {"sensor.puffer_temperatura_effettiva": p, "sensor.boiler_solare_alto_stimato": b,
           "binary_sensor.caldaia_integrazione_inutile": "off", "input_number.caldaia_integrazione_temp_max": "55",
           "input_number.caldaia_integrazione_isteresi_max": "2"}
    return render(FOR, st_, attrs={("sensor.puffer_temperatura_effettiva", "affidabile"): aff})
check("regola: puffer affidabile e caldo, forza", for2("70", "45", True), "True")
check("regola: puffer non affidabile, non forza", for2("70", "45", False), "False")

# ---------------------------------------------------------------- assenza (nessuno in casa)
ASSENZA = yaml.safe_load(open("ha-packages/caldaia_assenza.yaml"))
NES = find("binary_sensor", "Caldaia nessuno in casa", ASSENZA)["state"]
TEL = ["device_tracker.iphone_camilla", "device_tracker.iphone_corrado", "device_tracker.iphone_matilde", "device_tracker.iphone_roberta"]
RTR = ["device_tracker.iphone", "device_tracker.iphone_2", "device_tracker.iphone_3", "device_tracker.iphone12camilla"]
def nes(tel="not_home", rtr="not_home", ssid="CASALE2G", **over):
    st_ = {e: tel for e in TEL}
    st_.update({e: rtr for e in RTR})
    st_.update(over)
    return render(NES, st_, attrs={(e, "ssid"): ssid for e in RTR})
check("assenza: tutti fuori e nessun iPhone sul Wi-Fi", nes(), "True")
check("assenza: un telefono iCloud3 a casa", nes(**{TEL[1]: "home"}), "False")
check("assenza: telefono in un'altra zona conta come fuori", nes(**{TEL[2]: "Nonna Maria"}), "True")
check("assenza: iPhone sul Wi-Fi CASALE2G", nes(**{RTR[1]: "home"}), "False")
check("assenza: iPhone del router a casa ma su un'altra rete", render(NES, {**{e: "not_home" for e in TEL}, **{e: "home" for e in RTR}}, attrs={(e, "ssid"): "OSPITI" for e in RTR}), "True")
check("assenza: telefono iCloud3 non disponibile, nel dubbio non fuori", nes(**{TEL[0]: "unavailable"}), "False")
check("assenza: router non disponibile, nel dubbio non fuori", nes(**{RTR[2]: "unavailable"}), "False")

print("\nTutto ok" if not fails else f"\n{fails} prove FALLITE")
sys.exit(1 if fails else 0)
