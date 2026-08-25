export type EstadoRef = {
  codigo: number;
  nombre: string;
};

export type RubroRef = {
  codigo: string;
  nombre: string;
};

export type ResumenEstado = EstadoRef & { n: number };
export type ResumenRubro = RubroRef & { n: number };
export type ResumenDia = { fecha: string; n: number; adjudicadas: number };

export type ResumenPayload = {
  por_estado: ResumenEstado[];
  por_rubro: ResumenRubro[];
  por_dia: ResumenDia[];
};

export type LicitacionCard = {
  codigo: string;
  tipo: string;
  nombre: string;
  estado: EstadoRef;
  organismo: string | null;
  region: string | null;
  moneda: string | null;
  monto_estimado: number | null;
  monto_adjudicado: number | null;
  monto: number | null;
  detalle_completo: boolean;
  fecha: string | null;
  tiene_ganador: boolean;
  tiene_acta: boolean;
  rubro: RubroRef | null;
  url_ficha: string;
};

export type LicitacionesPayload = {
  total: number;
  limit: number;
  offset: number;
  items: LicitacionCard[];
};

export type GanadorItem = {
  correlativo: number;
  nombre_producto: string | null;
  descripcion: string | null;
  unidad_medida: string | null;
  cantidad: number | null;
  monto_unitario: number | null;
  subtotal: number | null;
  rut_proveedor: string | null;
  nombre_proveedor: string | null;
};

export type GanadorPayload = {
  codigo: string;
  tipo: string;
  nombre: string;
  estado: EstadoRef;
  organismo: string | null;
  region: string | null;
  moneda: string | null;
  monto_estimado: number | null;
  monto_adjudicado: number | null;
  detalle_completo: boolean;
  fecha_adjudicacion: string | null;
  url_ficha: string;
  tiene_ganador: boolean;
  tiene_acta: boolean;
  url_acta: string | null;
  numero_oferentes: number | null;
  items: GanadorItem[];
};
