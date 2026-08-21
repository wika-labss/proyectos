export type ZodiacSlug =
  | 'aries'
  | 'tauro'
  | 'geminis'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'escorpio'
  | 'sagitario'
  | 'capricornio'
  | 'acuario'
  | 'piscis';

export type ZodiacSign = {
  slug: ZodiacSlug;
  nombre: string;
  elemento: 'fuego' | 'tierra' | 'aire' | 'agua';
  rango: string;
};

type SignRule = ZodiacSign & {
  /** Inclusive start month/day */
  startMonth: number;
  startDay: number;
  /** Inclusive end month/day */
  endMonth: number;
  endDay: number;
};

const SIGN_RULES: SignRule[] = [
  {
    slug: 'capricornio',
    nombre: 'Capricornio',
    elemento: 'tierra',
    rango: '22 de diciembre al 19 de enero',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
  },
  {
    slug: 'acuario',
    nombre: 'Acuario',
    elemento: 'aire',
    rango: '20 de enero al 18 de febrero',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
  },
  {
    slug: 'piscis',
    nombre: 'Piscis',
    elemento: 'agua',
    rango: '19 de febrero al 20 de marzo',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
  },
  {
    slug: 'aries',
    nombre: 'Aries',
    elemento: 'fuego',
    rango: '21 de marzo al 19 de abril',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
  },
  {
    slug: 'tauro',
    nombre: 'Tauro',
    elemento: 'tierra',
    rango: '20 de abril al 20 de mayo',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
  },
  {
    slug: 'geminis',
    nombre: 'Géminis',
    elemento: 'aire',
    rango: '21 de mayo al 20 de junio',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
  },
  {
    slug: 'cancer',
    nombre: 'Cáncer',
    elemento: 'agua',
    rango: '21 de junio al 22 de julio',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
  },
  {
    slug: 'leo',
    nombre: 'Leo',
    elemento: 'fuego',
    rango: '23 de julio al 22 de agosto',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
  },
  {
    slug: 'virgo',
    nombre: 'Virgo',
    elemento: 'tierra',
    rango: '23 de agosto al 22 de septiembre',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
  },
  {
    slug: 'libra',
    nombre: 'Libra',
    elemento: 'aire',
    rango: '23 de septiembre al 22 de octubre',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
  },
  {
    slug: 'escorpio',
    nombre: 'Escorpio',
    elemento: 'agua',
    rango: '23 de octubre al 21 de noviembre',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
  },
  {
    slug: 'sagitario',
    nombre: 'Sagitario',
    elemento: 'fuego',
    rango: '22 de noviembre al 21 de diciembre',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
  },
];

function monthDayKey(month: number, day: number): number {
  return month * 100 + day;
}

function isWithinRange(
  month: number,
  day: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
): boolean {
  const value = monthDayKey(month, day);
  const start = monthDayKey(startMonth, startDay);
  const end = monthDayKey(endMonth, endDay);

  if (start <= end) {
    return value >= start && value <= end;
  }

  return value >= start || value <= end;
}

export function resolveZodiacSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  for (const rule of SIGN_RULES) {
    if (
      isWithinRange(
        month,
        day,
        rule.startMonth,
        rule.startDay,
        rule.endMonth,
        rule.endDay,
      )
    ) {
      return {
        slug: rule.slug,
        nombre: rule.nombre,
        elemento: rule.elemento,
        rango: rule.rango,
      };
    }
  }

  throw new Error('No se pudo resolver el signo zodiacal para la fecha indicada.');
}

export function parseBirthDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    throw new Error('Fecha inválida. Usa formato YYYY-MM-DD.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('Fecha inválida.');
  }

  return date;
}

export function formatBirthDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateRegistrationInput(name: string, birthDate: Date): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return 'Ingresa un nombre válido (mínimo 2 caracteres).';
  }

  const now = new Date();
  if (birthDate.getTime() > now.getTime()) {
    return 'La fecha de nacimiento no puede ser futura.';
  }

  const ageYears = now.getFullYear() - birthDate.getFullYear();
  if (ageYears > 120) {
    return 'Ingresa una fecha de nacimiento válida.';
  }

  return null;
}

export const ZODIAC_SIGN_COUNT = SIGN_RULES.length;
