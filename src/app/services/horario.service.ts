import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AsignacionHorario, AsignacionRequest, Horario, HorarioRequest } from '@app/models/horario.model';
import { ApiResponse } from '@app/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.urlEndPoint}`;

  listarHorarios(): Observable<ApiResponse<Horario[]>> {
    return this.http.get<ApiResponse<Horario[]>>(`${this.apiUrl}/horario/listar.php`);
  }

  crearHorario(payload: HorarioRequest): Observable<ApiResponse<{ id_horario: number }>> {
    return this.http.post<ApiResponse<{ id_horario: number }>>(
      `${this.apiUrl}/horario/crear.php`,
      payload
    );
  }

  actualizarHorario(payload: HorarioRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/horario/actualizar.php`, payload);
  }

  eliminarHorario(id_horario: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/horario/eliminar.php`, { id_horario });
  }

  cambiarEstado(id_horario: number, estado: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/horario/cambiar_estado.php`, {
      id_horario,
      estado,
    });
  }

  listarAsignaciones(params?: { id_persona?: number; id_area?: number }): Observable<ApiResponse<AsignacionHorario[]>> {
    let httpParams = new HttpParams();
    if (params?.id_persona) httpParams = httpParams.set('id_persona', params.id_persona);
    if (params?.id_area) httpParams = httpParams.set('id_area', params.id_area);
    return this.http.get<ApiResponse<AsignacionHorario[]>>(
      `${this.apiUrl}/horario/listar_asignaciones.php`,
      { params: httpParams }
    );
  }

  asignarHorario(payload: AsignacionRequest): Observable<ApiResponse<{ id_asignacion: number }>> {
    return this.http.post<ApiResponse<{ id_asignacion: number }>>(
      `${this.apiUrl}/horario/asignar.php`,
      payload
    );
  }

  actualizarAsignacion(payload: AsignacionRequest & { id_asignacion: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/horario/actualizar_asignacion.php`, payload);
  }

  eliminarAsignacion(id_asignacion: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/horario/eliminar_asignacion.php`, {
      id_asignacion,
    });
  }

  actualizarAsignacionEstado(id_asignacion: number, estado: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/horario/actualizar_asignacion_estado.php`,
      { id_asignacion, estado }
    );
  }
}
