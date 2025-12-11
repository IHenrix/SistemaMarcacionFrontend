import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RolDto {
  id_rol: number;
  nombre: string;
}

export interface AreaDto {
  id_area: number;
  nombre: string;
  descripcion: string;
  estado: number;
}

export interface PersonaUsuario {
  id_persona: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  id_area?: number;
  area_nombre?: string;
  estado: number;
}

export interface UsuarioDto {
  id_usuario: number;
  username: string;
  estado: string; // 'A', 'I', 'B'
  intentos_fallidos: number;
  fecha_ultimo_acceso?: string;
  fecha_bloqueo?: string;
  persona: PersonaUsuario;
  roles: RolDto[];
}

export interface UsuarioCreatePayload {
  id_persona: number;
  username: string;
  password: string;
  roles: number[];
}

export interface UsuarioUpdatePayload {
  username: string;
  password?: string;
  roles: number[];
  estado: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private readonly baseUrlUsuarios = `${environment.urlEndPoint}/admin/usuarios.php`;
  private readonly baseUrlRoles = `${environment.urlEndPoint}/admin/roles.php`;
  private readonly baseUrlAreas = `${environment.urlEndPoint}/admin/areas.php`;

  constructor(private http: HttpClient) {}

  listarUsuarios(filtros?: {
    nombres?: string;
    apellidos?: string;
    username?: string;
    estado?: string;
  }): Observable<UsuarioDto[]> {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        if (v) {
          params = params.set(k, v);
        }
      });
    }
    return this.http
      .get<ApiResponse<UsuarioDto[]>>(this.baseUrlUsuarios, { params })
      .pipe(map((res) => res.data));
  }

  obtenerUsuario(id: number): Observable<UsuarioDto> {
    return this.http
      .get<ApiResponse<UsuarioDto>>(`${this.baseUrlUsuarios}?id=${id}`)
      .pipe(map((res) => res.data));
  }

  crearUsuario(payload: UsuarioCreatePayload): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.baseUrlUsuarios, payload);
  }

  actualizarUsuario(id: number, payload: UsuarioUpdatePayload): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrlUsuarios}/${id}`,
      payload
    );
  }

  desactivarUsuario(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrlUsuarios}/${id}`);
  }

  activarUsuario(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrlUsuarios}/${id}/activar`,
      {}
    );
  }

  desbloquearUsuario(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrlUsuarios}/${id}/desbloquear`,
      {}
    );
  }

  listarRoles(): Observable<RolDto[]> {
    return this.http
      .get<ApiResponse<RolDto[]>>(this.baseUrlRoles)
      .pipe(map((res) => res.data));
  }

  listarAreas(): Observable<AreaDto[]> {
    return this.http
      .get<ApiResponse<AreaDto[]>>(this.baseUrlAreas)
      .pipe(map((res) => res.data));
  }
}
