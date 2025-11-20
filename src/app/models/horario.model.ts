export interface Horario {
  id_horario: number;
  nombre: string;
  entrada: string;
  inicio_refri: string;
  fin_refri: string;
  salida: string;
  tol_entrada_min: number;
  tol_salida_min: number;
  tol_refri_min: number;
  color?: string | null;
  estado: number;
  dias: number[];
}

export interface HorarioRequest {
  id_horario?: number;
  nombre: string;
  entrada: string;
  inicio_refri: string;
  fin_refri: string;
  salida: string;
  tol_entrada_min: number;
  tol_salida_min: number;
  tol_refri_min: number;
  color?: string | null;
  dias: number[];
}

export interface AsignacionHorario {
  id_asignacion: number;
  id_horario: number;
  id_persona: number | null;
  id_area: number | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  prioridad: 'PERSONA' | 'AREA';
  estado: number;
  horario_nombre?: string;
  nombres?: string;
  apellidos?: string;
  area_nombre?: string;
}

export interface AsignacionRequest {
  id_horario: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  prioridad: 'PERSONA' | 'AREA';
  id_persona?: number | null;
  id_area?: number | null;
}
