/**
 * Smoke V1 — engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  canOpenActa,
  canOpenPerfil,
  defaultFilter,
  estadoTokenKey,
  fetchGanador,
  filterLabel,
  formatMonto,
  isEmptyResumen,
  normalizeFilter,
  pctEstimado,
  presetRange,
  toEstadoBars,
  toRpcBody,
  type GanadorPayload,
} from '../src/engine';
import { config } from '../src/constants/config';

function testFilters() {
  const f = defaultFilter(new Date('2026-08-25T12:00:00.000Z'));
  assert.equal(f.hasta, '2026-08-25');
  assert.equal(f.desde, '2026-07-26');
  const all = presetRange(0, new Date('2026-08-25T12:00:00.000Z'));
  assert.equal(all.desde, null);
  const n = normalizeFilter({ tipo: 'XX' as never, rubro: '', estados: [] });
  assert.equal(n.tipo, null);
  assert.equal(n.rubro, null);
  assert.equal(n.estados, null);
  const body = toRpcBody(f);
  assert.equal(body.p_desde, f.desde);
  assert.ok(filterLabel(f).includes('2026-08-25'));
}

function testResumenMapper() {
  const bars = toEstadoBars([
    { codigo: 5, nombre: 'Publicada', n: 10 },
    { codigo: 8, nombre: 'Adjudicada', n: 0 },
  ]);
  assert.equal(bars.length, 1);
  assert.equal(bars[0].codigo, 5);
  assert.equal(
    isEmptyResumen({
      por_estado: [{ codigo: 5, nombre: 'Publicada', n: 0 }],
      por_rubro: [],
      por_dia: [],
    }),
    true,
  );
}

function testGanadorMapper() {
  const payload: GanadorPayload = {
    codigo: '1035-20-LE26',
    tipo: 'LE',
    nombre: 'COMPOST',
    estado: { codigo: 8, nombre: 'Adjudicada' },
    organismo: 'CONAF',
    region: null,
    moneda: 'CLP',
    monto_estimado: 8854000,
    monto_adjudicado: 7320000,
    detalle_completo: true,
    fecha_adjudicacion: '2026-08-21',
    url_ficha: 'https://www.mercadopublico.cl/ficha',
    tiene_ganador: true,
    tiene_acta: true,
    url_acta: 'https://www.mercadopublico.cl/acta',
    numero_oferentes: 2,
    items: [
      {
        correlativo: 1,
        nombre_producto: 'Compost',
        descripcion: null,
        unidad_medida: 'Unidad',
        cantidad: 120,
        monto_unitario: 61000,
        subtotal: 7320000,
        rut_proveedor: '10.472.475-2',
        nombre_proveedor: 'TORRES',
      },
    ],
  };
  assert.equal(pctEstimado(payload), 82.7);
  assert.equal(canOpenActa(payload), true);
  assert.equal(formatMonto(7320000), '$7.320.000');
  assert.equal(canOpenPerfil({ tiene_ganador: false }), false);
  assert.equal(estadoTokenKey(8), 'adjudicada');
}

function testNoChileCompraClient() {
  assert.equal(config.supabaseUrl.includes('wdpvlmuescstqnliorkx'), true);
  assert.equal(config.supabaseUrl.includes('mercadopublico.cl'), false);
  const root = join(__dirname, '..');
  const files = [
    'src/engine/acdApi.ts',
    'src/constants/config.ts',
    'app/index.tsx',
    'app/licitaciones/index.tsx',
    'app/licitaciones/[codigo]/ganador.tsx',
  ];
  for (const file of files) {
    const src = readFileSync(join(root, file), 'utf8');
    assert.equal(src.includes('api.mercadopublico.cl'), false, file);
  }
}

async function testLiveGanador() {
  const data = await fetchGanador('1035-20-LE26');
  assert.ok(data);
  assert.equal(data.tiene_ganador, true);
  assert.equal(data.items[0]?.rut_proveedor, '10.472.475-2');
  assert.equal(data.numero_oferentes, 2);
  assert.equal(canOpenActa(data), true);
}

async function main() {
  testFilters();
  testResumenMapper();
  testGanadorMapper();
  testNoChileCompraClient();
  await testLiveGanador();
  console.log('smoke-v1 ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
