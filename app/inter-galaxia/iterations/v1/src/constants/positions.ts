export interface PositionOption {
  code: string;
  label: string;
  group: 'Portería' | 'Defensa' | 'Mediocampo' | 'Delantera';
}

export const POSITION_CATALOG: PositionOption[] = [
  { code: 'POR', label: 'Portero', group: 'Portería' },
  { code: 'LIB', label: 'Líbero', group: 'Defensa' },
  { code: 'DFC', label: 'Defensa central', group: 'Defensa' },
  { code: 'LD', label: 'Lateral derecho', group: 'Defensa' },
  { code: 'LI', label: 'Lateral izquierdo', group: 'Defensa' },
  { code: 'MCD', label: 'Mediocentro defensivo', group: 'Mediocampo' },
  { code: 'MC', label: 'Mediocentro', group: 'Mediocampo' },
  { code: 'MCO', label: 'Mediocampista ofensivo', group: 'Mediocampo' },
  { code: 'MD', label: 'Medio derecho', group: 'Mediocampo' },
  { code: 'MI', label: 'Medio izquierdo', group: 'Mediocampo' },
  { code: 'ED', label: 'Extremo derecho', group: 'Delantera' },
  { code: 'EI', label: 'Extremo izquierdo', group: 'Delantera' },
  { code: 'SD', label: 'Segundo delantero', group: 'Delantera' },
  { code: 'DC', label: 'Delantero centro', group: 'Delantera' },
];

export function positionLabel(code: string): string {
  return POSITION_CATALOG.find((p) => p.code === code)?.label ?? code;
}

export function positionsByGroup(): Record<string, PositionOption[]> {
  return POSITION_CATALOG.reduce<Record<string, PositionOption[]>>((acc, pos) => {
    if (!acc[pos.group]) acc[pos.group] = [];
    acc[pos.group].push(pos);
    return acc;
  }, {});
}
