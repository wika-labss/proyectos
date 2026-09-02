export type CountryId = 'mx' | 'co' | 'pe' | 'br' | 'ar';

export type Country = {
  id: CountryId;
  name: string;
  order: number;
};

export const COUNTRIES: Country[] = [
  { id: 'mx', name: 'México', order: 0 },
  { id: 'co', name: 'Colombia', order: 1 },
  { id: 'pe', name: 'Perú', order: 2 },
  { id: 'br', name: 'Brasil', order: 3 },
  { id: 'ar', name: 'Argentina', order: 4 },
];

export function getCountry(id: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === id);
}
