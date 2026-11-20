#!/usr/bin/env python3
"""Instrada la scheda: esporta il file Specctra (DSN), lascia fare l'autoinstradamento a Freerouting e importa le piste (SES).

Uso:  python3 instrada.py   (con il Python di KiCad)   Variabili: FREEROUTING_JAR, JAVA
"""
import os
import subprocess
import sys

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
PCB = os.path.join(HERE, "kicad", "centralina.kicad_pcb")
DSN = os.path.join(HERE, "kicad", "centralina.dsn")
SES = os.path.join(HERE, "kicad", "centralina.ses")
JAVA = os.environ.get("JAVA", "/opt/homebrew/opt/openjdk@17/bin/java")
JAR = os.environ.get("FREEROUTING_JAR")

board = pcbnew.LoadBoard(PCB)
if not pcbnew.ExportSpecctraDSN(board, DSN):
    sys.exit("esportazione DSN fallita")
print("DSN scritto", DSN)
if not JAR:
    sys.exit("imposta FREEROUTING_JAR per instradare")
if os.path.exists(SES):
    os.remove(SES)
subprocess.run([JAVA, "-Djava.awt.headless=true", "-jar", JAR, "-de", DSN, "-do", SES, "-mp", "30"], check=False, timeout=900)
if not os.path.exists(SES):
    sys.exit("Freerouting non ha prodotto il file SES")
board = pcbnew.LoadBoard(PCB)
if not pcbnew.ImportSpecctraSES(board, SES):
    sys.exit("importazione SES fallita")
filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())
pcbnew.SaveBoard(PCB, board)
print("piste importate e zone riempite")
