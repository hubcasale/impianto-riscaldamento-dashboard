#!/usr/bin/env python3
"""Eta' dell'ultima foto dell'allsky, per l'allarme "foto ferma". Stampa una riga JSON.

Fa solo una richiesta HEAD all'indirizzo di allsky_config.json (non scarica l'immagine) e legge Last-Modified:
  {"ok": true,  "eta_min": 1.2}
  {"ok": false, "motivo": "..."}          (rete, certificato, timeout, Last-Modified mancante)
Di notte le foto continuano (circa una al minuto, misurato il 12/11/2026), quindi l'eta' e' sempre significativa.
"""
import datetime
import json
import os
import ssl
import sys
import urllib.request
from email.utils import parsedate_to_datetime

HERE = os.path.dirname(os.path.abspath(__file__))


def out(d):
    print(json.dumps(d, ensure_ascii=False))


def main():
    try:
        cfg = json.load(open(os.path.join(HERE, "allsky_config.json")))
        url = cfg["image_url"]
    except Exception as e:
        return out({"ok": False, "motivo": "configurazione: %s" % e})
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            lm = r.headers.get("Last-Modified")
    except Exception as e:
        return out({"ok": False, "motivo": "non raggiungibile: %s" % str(e)[:80]})
    if not lm:
        return out({"ok": False, "motivo": "Last-Modified mancante"})
    now = datetime.datetime.now(datetime.timezone.utc)
    age = (now - parsedate_to_datetime(lm)).total_seconds() / 60
    out({"ok": True, "eta_min": round(max(age, 0.0), 1)})


if __name__ == "__main__":
    main()
