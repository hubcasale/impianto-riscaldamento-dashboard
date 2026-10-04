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


def make_env(states, attrs, now):
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

    env.globals.update(timedelta=dt.timedelta, states=st, is_state=is_state, is_number=is_number, state_attr=state_attr, now=lambda: now)
    return env


def render(tpl, states, attrs=None, now=None, this_state=None):
    now = now or dt.datetime(2026, 10, 5, 6, 0)  # lunedi
    env = make_env(states, attrs or {}, now)
    this = types.SimpleNamespace(state=this_state)
    return env.from_string(tpl).render(this=this).strip()


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

print("\nTutto ok" if not fails else f"\n{fails} prove FALLITE")
sys.exit(1 if fails else 0)
