export { isInsideFence } from './fence';
export { inferTelefonoEncendido, shouldLock } from './deviceState';
export {
  GeoApiError,
  acusarComando,
  obtenerComandoPendiente,
  obtenerDispositivo,
  registrarDispositivo,
  reportarPolitica,
  reportarUbicacion,
} from './geoApi';
export type {
  ComandoPendiente,
  ComandoTipo,
  DispositivoSnapshot,
  EnrollmentEstado,
  PolicyStatus,
  ShouldLockInput,
} from './types';
