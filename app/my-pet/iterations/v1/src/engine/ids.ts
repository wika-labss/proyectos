export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const TOKEN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function newPublicToken(length = 12): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * TOKEN_ALPHABET.length);
    out += TOKEN_ALPHABET[idx];
  }
  return out;
}
