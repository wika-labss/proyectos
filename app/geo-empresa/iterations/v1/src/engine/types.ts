export type EnrollmentEstado = 'pendiente' | 'aprobado' | 'rechazado';

export type ComandoTipo = 'lock' | 'unlock_policy' | 'reset_pin' | 'reboot';

export type PolicyStatus = {
  isDeviceOwner: boolean;
  isAdminActive: boolean;
};

export type DispositivoSnapshot = {
  id: string;
  nombre_registrado: string;
  telefono_encendido: boolean;
  dentro_perimetro: boolean;
  distancia_base_m: number | null;
  radio_metros: number;
  ultimo_ping_at: string | null;
  estado_enrollment: EnrollmentEstado;
  politica_autolock: boolean;
  es_device_owner: boolean;
  admin_activo?: boolean;
  debe_bloquear?: boolean;
};

export type ComandoPendiente = {
  id: string;
  tipo: ComandoTipo;
  payload: { pin?: string } | null;
  solicitado_at: string;
  estado_enrollment: EnrollmentEstado;
  politica_autolock: boolean;
};

export type ShouldLockInput = {
  estadoEnrollment: EnrollmentEstado | string;
  politicaAutolock: boolean;
  dentroPerimetro: boolean;
  esDeviceOwner: boolean;
};
