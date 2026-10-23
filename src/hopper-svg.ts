import { svg } from "lit";
import { HOPPER_HEIGHT, HOPPER, depthAtKg, hopperOutline, levelColor } from "./hopper-logic";

/** Larghezza del serbatoio (cm) alla profondita' indicata: il lato destro e' obliquo. */
function widthAt(depth: number): number {
  const top = HOPPER.topH;
  const mid = HOPPER.topH + HOPPER.midH;
  if (depth <= top) return HOPPER.topW;
  if (depth <= mid) return HOPPER.topW + ((HOPPER.midBottomW - HOPPER.topW) * (depth - top)) / HOPPER.midH;
  return HOPPER.midBottomW + ((HOPPER.lowBottomW - HOPPER.midBottomW) * (Math.min(depth, HOPPER_HEIGHT) - mid)) / HOPPER.lowH;
}

/**
 * Disegno del serbatoio del pellet (stessa forma di quello vero, visto da davanti): il lato sinistro e' verticale, quello
 * destro obliquo. Il riempimento sale fino alla quota che corrisponde ai chili rimasti. `kg` nullo = quantita' sconosciuta.
 */
export function hopperSvg(kg: number | null, label: string) {
  const pts = hopperOutline()
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
  const depth = kg === null ? HOPPER_HEIGHT : depthAtKg(kg);
  const color = levelColor(kg);
  return svg`
    <svg class="hopper-svg" viewBox="-3 -3 ${HOPPER.topW + 6} ${HOPPER_HEIGHT + 6}" role="img" aria-label=${label}>
      <defs>
        <clipPath id="hp-clip"><rect x="-3" y=${depth} width=${HOPPER.topW + 6} height=${HOPPER_HEIGHT + 6 - depth} /></clipPath>
      </defs>
      <polygon points=${pts} fill="var(--card-background-color, #1f2937)" stroke="none" />
      ${kg === null ? svg`` : svg`<g clip-path="url(#hp-clip)"><polygon points=${pts} fill=${color} opacity="0.9" /></g>`}
      ${kg === null ? svg`` : svg`<line x1="0" x2=${widthAt(depth)} y1=${depth} y2=${depth} stroke="rgba(255,255,255,0.6)" stroke-width="1" />`}
      <polygon points=${pts} fill="none" stroke="var(--secondary-text-color, #94a3b8)" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
  `;
}
