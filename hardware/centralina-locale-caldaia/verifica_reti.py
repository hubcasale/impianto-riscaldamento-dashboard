#!/usr/bin/env python3
"""Controllo indipendente delle reti: confronta i pad della scheda con la piedinatura attesa (SPECIFICHE.md). Esce con errore se qualcosa non torna."""
import os
import sys

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
b = pcbnew.LoadBoard(os.path.join(HERE, "kicad", "centralina.kicad_pcb"))


def net(ref, pad):
    f = b.FindFootprintByReference(ref)
    p = next(p for p in f.Pads() if p.GetNumber() == str(pad))
    return p.GetNetname()


# DevKit S3-DevKitC-1: J1 (fila bassa, pin 1 a sinistra) e J3
ATTESI = {
    ("J1", 1): "+3V3", ("J1", 2): "+3V3", ("J1", 4): "ADC_S3", ("J1", 5): "ADC_S2", ("J1", 8): "DISP_TX", ("J1", 9): "DISP_RX",
    ("J1", 10): "ETH_RST", ("J1", 12): "I2C_SDA", ("J1", 15): "I2C_SCL", ("J1", 16): "ETH_CS", ("J1", 17): "ETH_MOSI",
    ("J1", 18): "ETH_SCLK", ("J1", 19): "ETH_MISO", ("J1", 20): "ETH_INT", ("J1", 21): "+5V_DK", ("J1", 22): "GND",
    ("J3", 1): "GND", ("J3", 21): "GND", ("J3", 22): "GND",
    # cavo del W5500 Lite (3,3 V): XH1 +3V3, XH2 GND, XH3 SCLK, XH4 MISO, XH5 MOSI, XH6 CS, XH7 INT, XH8 RST
    ("J20", 1): "+3V3_ETH", ("J20", 2): "GND", ("J20", 3): "ETH_SCLK", ("J20", 4): "ETH_MISO", ("J20", 5): "ETH_MOSI",
    ("J20", 6): "ETH_CS", ("J20", 7): "ETH_INT", ("J20", 8): "ETH_RST",
    ("J21", 1): "+5V", ("J21", 2): "GND", ("J21", 3): "DISP_TX", ("J21", 4): "DISP_RX",
    ("U1", 1): "GND", ("U1", 3): "GND", ("U1", 4): "N0", ("U1", 5): "N1", ("U1", 6): "N2", ("U1", 7): "N3", ("U1", 8): "+3V3",
    ("U1", 9): "I2C_SDA", ("U1", 10): "I2C_SCL",
    ("U2", 1): "+5V", ("U2", 2): "GND", ("U2", 3): "+5V", ("U2", 5): "+3V3_ETH",
    ("Q1", 1): "Q1G", ("Q1", 2): "+5V", ("Q1", 3): "VIN_F", ("D1", 1): "VIN_F", ("D1", 2): "GND", ("D2", 1): "+5V_DK", ("D2", 2): "+5V",
    ("J10", 1): "VIN", ("J10", 2): "GND",
    ("J11", 1): "N0", ("J12", 1): "N1", ("J13", 1): "N2", ("J14", 1): "N3", ("J15", 1): "ADC_S3", ("J16", 1): "ADC_S2",
}
errori = [f"{r}.{p}: atteso {a}, trovato {net(r, p) or '(nessuna rete)'}" for (r, p), a in ATTESI.items() if net(r, p) != a]
for i in range(6):
    if net(f"R{30 + i}", 1) != "+3V3":
        errori.append(f"R{30 + i}.1 non e' su +3V3")
if errori:
    print("ERRORI:\n  " + "\n  ".join(errori))
    sys.exit(1)
print(f"verifica reti: {len(ATTESI)} pad controllati, tutto corrisponde")
