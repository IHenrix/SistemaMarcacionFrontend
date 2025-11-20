import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, Usuario } from '@app/models/auth.model';
import { PersonaAsignacionDTO } from '@app/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = environment.urlEndPoint;
  private readonly http = inject(HttpClient);


  obtenerPerfil(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuario/perfil.php`);
  }

  registrarUsuario(data: RegistrarUsuarioRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuario/registrar.php`, data);
  }

  listarUsuarios(): Observable<ApiResponse<PersonaAsignacionDTO[]>> {
    return this.http.get<ApiResponse<PersonaAsignacionDTO[]>>(`${this.apiUrl}/usuario/listar.php`);
  }
}

export interface RegistrarUsuarioRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  id_area?: number;
  username: string;
  password: string;
  roles?: number[];
}
