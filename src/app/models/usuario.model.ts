export interface PersonaAsignacionDTO {
  id_persona: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  correo?: string | null;
  id_area?: number | null;
  area_nombre?: string | null;
  id_usuario?: number | null;
  username?: string | null;
  roles?: string[];
}
