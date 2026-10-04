// Tipi condivisi. Della parte Home Assistant si importa solo lo stretto necessario,
// per non dipendere da custom-card-helpers.

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed?: string;
  attributes: Record<string, unknown> & {
    unit_of_measurement?: string;
    friendly_name?: string;
    min?: number;
    max?: number;
    step?: number;
    temperature?: number;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
  [key: string]: unknown;
}
