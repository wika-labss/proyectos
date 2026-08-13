/** app-theme — blanco / negro / rojo solo errores */
export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  number: '#000000',
  border: '#000000',
  borderBold: '#000000',
  error: '#EF0000',
  selected: '#F0F0F0',
  given: '#000000',
  locked: '#888888',
  buttonBg: '#FFFFFF',
  buttonBorder: '#000000',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const typography = { title: 28, body: 16, cell: 20, small: 12 } as const;
