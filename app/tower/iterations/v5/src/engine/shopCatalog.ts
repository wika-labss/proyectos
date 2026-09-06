export type ShopProductId = 'infinite' | 'content_pack';

export type ShopProduct = {
  id: ShopProductId;
  title: string;
  priceLabel: string;
  blurb: string;
  bullets: string[];
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'infinite',
    title: 'Modo Infinito',
    priceLabel: '$2.99',
    blurb: 'Oleadas sin fin con dificultad escalable.',
    bullets: [
      'Arena Fortaleza',
      'HP y cantidad suben por oleada',
      'Misma fusión y venta de torres',
    ],
  },
  {
    id: 'content_pack',
    title: 'Pack de Contenido',
    priceLabel: '$4.99',
    blurb: 'Expansión visual — compras reales próximamente.',
    bullets: [
      '10 mapas nuevos',
      'Torres nuevas (Tesla, Soporte)',
      'Modo Hardcore de niveles existentes',
    ],
  },
];

/** Preview del pack (solo UI; no jugable hasta IAP). */
export const CONTENT_PACK_PREVIEW = {
  maps: [
    'Observatorio',
    'Ferrocarril',
    'Búnker',
    'Mercado',
    'Cavernas',
    'Astillero',
    'Templo',
    'Refinería',
    'Mirador',
    'Núcleo',
  ],
  towers: ['Tesla', 'Soporte'],
  hardcore: 'Vidas ×0.5 · Enemigos +25% HP en campaña',
};

export type ShopFlags = {
  infiniteOwned: boolean;
  contentPackOwned: boolean;
};

export function defaultShopFlags(): ShopFlags {
  return { infiniteOwned: false, contentPackOwned: false };
}
