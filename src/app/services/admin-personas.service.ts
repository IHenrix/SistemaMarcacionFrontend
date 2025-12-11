import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PersonaDto {
  id_persona: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo: string;
  id_area?: number;
  estado: number;
  fecha_creacion: string;
  area?: {
    id_area: number;
    nombre: string;
    descripcion: string;
  };
  tiene_usuario: boolean;
  username?: string;
}

export interface PersonaCreatePayload {
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo: string;
  id_area?: number | null;
}

export interface PersonaUpdatePayload extends PersonaCreatePayload {
  estado: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdminPersonasService {
  private readonly baseUrl = `${environment.urlEndPoint}/admin/personas.php`;

  constructor(private http: HttpClient) {}

  listar(filtros?: {
    nombres?: string;
    apellidos?: string;
    estado?: number | string;
    sinUsuario?: boolean;
  }): Observable<PersonaDto[]> {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params = params.set(k, String(v));
        }
      });
    }
    return this.http
      .get<ApiResponse<PersonaDto[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  obtener(id: number): Observable<PersonaDto> {
    return this.http
      .get<ApiResponse<PersonaDto>>(`${this.baseUrl}?id=${id}`)
      .pipe(map((res) => res.data));
  }

  crear(payload: PersonaCreatePayload): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: PersonaUpdatePayload): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, payload);
  }

  desactivar(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
