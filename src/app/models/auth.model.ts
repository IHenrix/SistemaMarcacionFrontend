
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    usuario: Usuario;
  };
  message: string;
}

export interface Usuario {
  id: number;
  dni: string;
  nombre: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  area: Area | null;
  roles: Rol[];
  perfil: string;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Rol {
  id_rol: number;
  nombre: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: any;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: {
    missing_fields?: string[];
  };
}
