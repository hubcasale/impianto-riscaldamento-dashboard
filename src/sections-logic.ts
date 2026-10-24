// Quali parti della scheda panoramica mostrare: boiler, caldaia, stufa a pellet, termostato.
// Logica pura (nessuna dipendenza da Lit o da Home Assistant), si prova con node:test.

export type SectionKey = "boiler" | "caldaia" | "stufa" | "termostato";

export const SECTION_KEYS: SectionKey[] = ["boiler", "caldaia", "stufa", "termostato"];

export const SECTION_INFO: Record<SectionKey, { label: string; hint: string; icon: string }> = {
  boiler: { label: "Boiler solare", hint: "Temperature, docce, puffer e pannello solare.", icon: "mdi:water-boiler" },
  caldaia: { label: "Caldaia a pellet (Polygon)", hint: "Stato, serbatoio del pellet, programma e preferenze dell'impianto.", icon: "mdi:fire" },
  stufa: { label: "Stufa a pellet", hint: "Stato, potenza, accensione e programma della stufa.", icon: "mdi:stove" },
  termostato: { label: "Termostato ambiente", hint: "Temperatura, obiettivo, modalità e programma.", icon: "mdi:thermostat" },
};

export type Sections = Record<SectionKey, boolean>;

/** Chiave dei dati utente di Home Assistant (frontend/set_user_data) in cui si salva la scelta di ogni utente. */
export const SECTIONS_USER_KEY = "impianto_riscaldamento_sezioni";

/** Tutte visibili, oppure solo quelle dell'elenco `show` della configurazione YAML. */
export function defaultSections(show?: unknown): Sections {
  const list = Array.isArray(show) ? show.filter((k): k is SectionKey => SECTION_KEYS.includes(k as SectionKey)) : [];
  const only = list.length > 0;
  return { boiler: !only || list.includes("boiler"), caldaia: !only || list.includes("caldaia"), stufa: !only || list.includes("stufa"), termostato: !only || list.includes("termostato") };
}

/**
 * La scelta dell'utente (dati utente di Home Assistant: `{ version: 1, sections: {...} }`) sopra i valori di partenza.
 * Valori mancanti o non validi restano quelli di partenza; almeno una sezione resta sempre visibile.
 */
export function normalizeSections(stored: unknown, show?: unknown): Sections {
  const base = defaultSections(show);
  const raw = stored && typeof stored === "object" ? (stored as { sections?: unknown }).sections : undefined;
  if (raw && typeof raw === "object") {
    for (const k of SECTION_KEYS) {
      const v = (raw as Record<string, unknown>)[k];
      if (typeof v === "boolean") base[k] = v;
    }
  }
  return visibleKeys(base).length === 0 ? defaultSections(show) : base;
}

export function visibleKeys(s: Sections): SectionKey[] {
  return SECTION_KEYS.filter((k) => s[k]);
}

/** Cambia una sezione; l'ultima rimasta visibile non si puo' spegnere. */
export function toggleSection(s: Sections, key: SectionKey): Sections {
  const next = { ...s, [key]: !s[key] };
  return visibleKeys(next).length === 0 ? s : next;
}

/** Riga di riepilogo: «Tutte e quattro» oppure l'elenco di quelle mostrate. */
export function sectionsSummary(s: Sections): string {
  const v = visibleKeys(s);
  if (v.length === SECTION_KEYS.length) return "Tutte le sezioni";
  if (v.length === 1) return `Solo ${SECTION_INFO[v[0]].label.toLowerCase()}`;
  return v.map((k) => SECTION_INFO[k].label.split(" (")[0].toLowerCase()).join(", ");
}

/** Dato da salvare nei dati utente. */
export function sectionsToStore(s: Sections): { version: 1; sections: Sections } {
  return { version: 1, sections: { ...s } };
}
