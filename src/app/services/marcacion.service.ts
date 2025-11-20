import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@app/models/auth.model';

export type TipoMarcacion = 'ENTRADA' | 'INICIO_REFRI' | 'FIN_REFRI' | 'SALIDA';

export interface MarcacionRequest {
  tipo: TipoMarcacion;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm (24h)
}

export interface MarcacionItem {
  id_marcacion: number;
  id_persona: number;
  id_horario_resuelto: number | null;
  tipo: TipoMarcacion;
  fecha: string;
  hora: string;
  creado_en: string;
  nombres?: string;
  apellidos?: string;
  horario_nombre?: string;
}

export interface MarcacionReporteItem {
  id_persona: number;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  fecha: string;
  horario_nombre?: string;
  entrada: string | null;
  inicio_refri: string | null;
  fin_refri: string | null;
  salida: string | null;
  tardanza: boolean;
  minutos_tarde: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class MarcacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.urlEndPoint}`;

  registrar(payload: MarcacionRequest): Observable<ApiResponse<{ id_marcacion: number }>> {
    return this.http.post<ApiResponse<{ id_marcacion: number }>>(
      `${this.apiUrl}/marcacion/registrar.php`,
      payload
    );
  }

  listar(params?: { id_persona?: number; fecha?: string }): Observable<ApiResponse<MarcacionItem[]>> {
    let httpParams = new HttpParams();
    if (params?.id_persona) httpParams = httpParams.set('id_persona', params.id_persona);
    if (params?.fecha) httpParams = httpParams.set('fecha', params.fecha);
    return this.http.get<ApiResponse<MarcacionItem[]>>(`${this.apiUrl}/marcacion/listar.php`, {
      params: httpParams,
    });
  }

  resumenHoy(): Observable<ApiResponse<{ fecha: string; marcaciones: MarcacionItem[] }>> {
    return this.http.get<ApiResponse<{ fecha: string; marcaciones: MarcacionItem[] }>>(
      `${this.apiUrl}/marcacion/resumen_hoy.php`
    );
  }

  reporte(params: {
    personal?: boolean;
    id_persona?: number;
    desde?: string;
    hasta?: string;
    tardanza?: boolean;
  }): Observable<ApiResponse<MarcacionReporteItem[]>> {
    let httpParams = new HttpParams();
    if (params.personal) httpParams = httpParams.set('personal', '1');
    if (params.id_persona) httpParams = httpParams.set('id_persona', params.id_persona);
    if (params.desde) httpParams = httpParams.set('desde', params.desde);
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
    if (params.tardanza === true) httpParams = httpParams.set('tardanza', '1');
    if (params.tardanza === false) httpParams = httpParams.set('tardanza', '0');

    return this.http.get<ApiResponse<MarcacionReporteItem[]>>(
      `${this.apiUrl}/marcacion/reporte.php`,
      { params: httpParams }
    );
  }
}
