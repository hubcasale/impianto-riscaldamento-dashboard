#!/usr/bin/env python3
"""Stima della copertura nuvolosa e del sole dalla foto dell'allsky (fisheye). Stampa una riga JSON.

Uso: allsky_clouds.py LATITUDINE LONGITUDINE [file_immagine]
Senza file legge l'ultima immagine dall'indirizzo di allsky_config.json. Servono numpy e Pillow (ci sono in Home Assistant).
Fuori ordine (immagine vecchia, sole basso, errori) stampa {"ok": false, "motivo": "..."}: nessun dato inventato.
"""
import datetime
import json
import math
import os
import ssl
import sys
import urllib.request
import zoneinfo
from email.utils import parsedate_to_datetime

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def out(d):
    print(json.dumps(d, ensure_ascii=False))


def main():
    try:
        lat, lon = float(sys.argv[1]), float(sys.argv[2])
    except (IndexError, ValueError):
        return out({"ok": False, "motivo": "coordinate mancanti"})
    cfg = json.load(open(os.path.join(HERE, "allsky_config.json")))
    from solpos import sun_position
    now = datetime.datetime.now(datetime.timezone.utc)
    if len(sys.argv) > 3:                      # prova con un file dell'archivio: l'ora si ricava dal nome (AAAAMMGG_oommss)
        try:
            now = datetime.datetime.strptime(os.path.basename(sys.argv[3])[:15], "%Y%m%d_%H%M%S").replace(
                tzinfo=zoneinfo.ZoneInfo("Europe/Rome")).astimezone(datetime.timezone.utc)
        except ValueError:
            pass
    az_s, el_s = sun_position(now, lat, lon)
    if el_s < cfg["min_sun_elevation"]:
        return out({"ok": False, "motivo": "sole basso", "sole_elevazione": round(el_s, 1)})
    import numpy as np
    from PIL import Image
    import io
    path = sys.argv[3] if len(sys.argv) > 3 else None
    try:
        if path:
            raw = open(path, "rb").read()
            age_min = 0.0
        else:
            ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
            with urllib.request.urlopen(urllib.request.Request(cfg["image_url"]), timeout=15, context=ctx) as r:
                raw = r.read()
                lm = r.headers.get("Last-Modified")
            age_min = (now - parsedate_to_datetime(lm)).total_seconds() / 60 if lm else 0.0
    except Exception as e:  # rete, certificato, timeout
        return out({"ok": False, "motivo": "immagine non raggiungibile: %s" % e})
    if age_min > cfg["max_age_minutes"]:
        return out({"ok": False, "motivo": "immagine vecchia di %d minuti" % age_min})
    im = Image.open(io.BytesIO(raw)); im.draft("RGB", (1100, 800)); im = im.convert("RGB")
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    g = cfg["geometry"]; s = w / g["ref_width"]
    cx, cy, rad = g["cx"] * s, g["cy"] * s, g["radius"] * s
    yy, xx = np.mgrid[0:h, 0:w]
    rr = np.hypot(xx - cx, yy - cy) / rad
    ob = np.asarray(Image.open(os.path.join(HERE, cfg["mask"])).convert("L").resize((w, h), Image.NEAREST)) > 127
    valid = (rr < 0.9) & ~ob
    n = int(valid.sum())
    if n < 0.5 * int((rr < 0.9).sum()):
        return out({"ok": False, "motivo": "troppo cielo mascherato"})
    lum = a.max(axis=2)
    rbr = a[..., 0] / np.maximum(a[..., 2], 1)
    v0, v1 = cfg["rbr_veil"]
    sereno = float((valid & (rbr < v0)).sum()) / n
    velato = float((valid & (rbr >= v0) & (rbr < v1)).sum()) / n
    coperto = float((valid & (rbr >= v1)).sum()) / n
    # sole: posizione prevista nel fisheye (equidistante, ruotato)
    z = (90 - el_s) / 90
    t = math.radians(az_s + g["rotation_deg"])
    sx, sy = cx - z * rad * math.sin(t), cy - z * rad * math.cos(t)
    d = np.hypot(xx - sx, yy - sy) / (rad / 90.0)          # distanza dal sole in gradi
    disk = d < 3.5
    halo = (d >= 3.5) & (d < 20) & valid
    sun_sat = float((lum[disk] > 250).mean())
    halo_sat = float((lum[halo] > 250).mean()) if halo.any() else 0.0
    halo_lum = float(lum[halo].mean()) / 255 if halo.any() else 0.0
    m = cfg["model_station_scale"]
    kt = m["sun_sat"] * sun_sat + m["halo_sat"] * halo_sat + m["halo_lum"] * halo_lum + m["intercept"]
    kt = max(0.0, min(1.1, kt))
    cz = math.sin(math.radians(el_s))
    ghi_sereno = 1098 * cz * math.exp(-0.057 / cz)          # cielo sereno (Haurwitz), W/m2
    out({
        "ok": True,
        "sereno": round(100 * sereno, 1), "velato": round(100 * velato, 1), "coperto": round(100 * coperto, 1),
        "copertura_eq": round(100 * (coperto + 0.45 * velato), 1),
        "sole_libero": sun_sat > 0.2,
        "sole_saturo": round(sun_sat, 3), "alone_saturo": round(halo_sat, 3), "alone_luminosita": round(halo_lum, 3),
        "kt_scala_stazione": round(kt, 3),
        "ghi_sereno": round(ghi_sereno, 0),
        "sole_azimut": round(az_s, 1), "sole_elevazione": round(el_s, 1),
        "eta_immagine_min": round(age_min, 1),
    })


if __name__ == "__main__":
    main()
