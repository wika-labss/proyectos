import {
  fetchHoroscopeToday,
  parseBirthDate,
  resolveZodiacSign,
  validateRegistrationInput,
  ZODIAC_SIGN_COUNT,
} from '../src/engine';

type ZodiacCase = {
  iso: string;
  expectedSlug: string;
};

const CASES: ZodiacCase[] = [
  { iso: '1990-03-25', expectedSlug: 'aries' },
  { iso: '1990-04-25', expectedSlug: 'tauro' },
  { iso: '1990-05-25', expectedSlug: 'geminis' },
  { iso: '1990-06-25', expectedSlug: 'cancer' },
  { iso: '1990-08-15', expectedSlug: 'leo' },
  { iso: '1990-09-01', expectedSlug: 'virgo' },
  { iso: '1990-10-01', expectedSlug: 'libra' },
  { iso: '1990-11-01', expectedSlug: 'escorpio' },
  { iso: '1990-12-01', expectedSlug: 'sagitario' },
  { iso: '1990-01-05', expectedSlug: 'capricornio' },
  { iso: '1990-12-25', expectedSlug: 'capricornio' },
  { iso: '1990-01-25', expectedSlug: 'acuario' },
  { iso: '1990-02-25', expectedSlug: 'piscis' },
];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log('=== Smoke V1 — Horóscopo Alan ===');

  assert(ZODIAC_SIGN_COUNT === 12, 'Deben existir 12 signos');

  for (const testCase of CASES) {
    const date = parseBirthDate(testCase.iso);
    const sign = resolveZodiacSign(date);
    assert(
      sign.slug === testCase.expectedSlug,
      `${testCase.iso} esperado ${testCase.expectedSlug}, recibido ${sign.slug}`,
    );
  }

  console.log(`[ok] zodiac engine (${CASES.length} casos)`);

  const invalidName = validateRegistrationInput('A', parseBirthDate('2000-01-01'));
  assert(invalidName !== null, 'Nombre corto debe fallar');

  const validName = validateRegistrationInput('Alan', parseBirthDate('2000-01-01'));
  assert(validName === null, 'Registro válido no debe fallar');

  console.log('[ok] registration validation');

  const horoscope = await fetchHoroscopeToday('leo');
  assert(Boolean(horoscope.signo.amor), 'Horóscopo debe incluir amor');
  assert(typeof horoscope.signo.animo === 'number', 'Ánimo debe ser numérico');

  console.log('[ok] horoscope API (leo)');
  console.log('Smoke passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
