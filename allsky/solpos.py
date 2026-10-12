"""Posizione del sole (algoritmo NOAA semplificato): azimut da nord in senso orario, elevazione in gradi."""
import math, datetime


def sun_position(when_utc: datetime.datetime, lat: float, lon: float):
    d = when_utc.timetuple().tm_yday
    h = when_utc.hour + when_utc.minute / 60 + when_utc.second / 3600
    g = 2 * math.pi / 365 * (d - 1 + (h - 12) / 24)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g) - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    decl = 0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g) + 0.000907 * math.sin(2 * g) - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g)
    tst = (h * 60 + eqt + 4 * lon) % 1440
    ha = math.radians(tst / 4 - 180)
    la = math.radians(lat)
    cz = math.sin(la) * math.sin(decl) + math.cos(la) * math.cos(decl) * math.cos(ha)
    zen = math.acos(max(-1, min(1, cz)))
    el = 90 - math.degrees(zen)
    az = math.degrees(math.atan2(math.sin(ha), math.cos(ha) * math.sin(la) - math.tan(decl) * math.cos(la))) + 180
    return az % 360, el


if __name__ == "__main__":
    # prova: 21 giugno 2026, 10:36 UTC a 45 N, 9 E (elevazione circa 66 gradi, azimut circa 151)
    print(sun_position(datetime.datetime(2026, 6, 21, 10, 36, 0), 45.0, 9.0))
