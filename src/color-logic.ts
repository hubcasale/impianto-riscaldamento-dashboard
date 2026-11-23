/**
 * Colore proprio della scheda (opzione `color`): lo sfondo ne prende una tinta e il bordo lo segue, così la scheda
 * si riconosce a colpo d'occhio in una plancia a blocchi colorati. I pannelli interni restano come li disegna il tema.
 */

/** I nomi dei colori di Home Assistant, con il valore del tema predefinito: serve solo dove le variabili del tema mancano (banco di prova). */
const THEME_COLORS: Record<string, string> = {
  red: "#f44336",
  pink: "#e91e63",
  purple: "#926bc7",
  "deep-purple": "#6e41ab",
  indigo: "#3f51b5",
  blue: "#2196f3",
  "light-blue": "#03a9f4",
  cyan: "#00bcd4",
  teal: "#009688",
  green: "#4caf50",
  "light-green": "#8bc34a",
  lime: "#cddc39",
  yellow: "#ffeb3b",
  amber: "#ffc107",
  orange: "#ff9800",
  "deep-orange": "#ff6f22",
  brown: "#795548",
  "light-grey": "#bdbdbd",
  grey: "#9e9e9e",
  "dark-grey": "#606060",
  "blue-grey": "#607d8b",
  black: "#000000",
  white: "#ffffff",
};

/**
 * Il colore CSS che corrisponde all'opzione, oppure niente se la scheda resta com'è.
 * Un nome della tavolozza di Home Assistant segue il tema; nello YAML scritto a mano si può mettere anche un colore
 * CSS (`#ff5722`, `rgb(255, 87, 34)`). Tutto il resto non è un colore e non tinge niente: il valore finisce in uno
 * stile, quindi passano solo le forme di un colore.
 */
export function tintColor(color: unknown): string | undefined {
  if (typeof color !== "string") return undefined;
  const c = color.trim().toLowerCase();
  if (!c || c === "none" || c === "default") return undefined;
  if (c === "primary" || c === "accent") return `var(--${c}-color)`;
  if (THEME_COLORS[c]) return `var(--${c}-color, ${THEME_COLORS[c]})`;
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(c)) return c;
  if (/^(rgb|hsl)a?\([0-9\s.,%/]+\)$/.test(c)) return c;
  return undefined;
}
