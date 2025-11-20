import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@app/models/auth.model';

export interface ContactoRequest {
  nombre: string;
  email: string;
  telefono?: string;
  tipo: string;
  asunto: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.urlEndPoint;

  enviar(payload: FormData | ContactoRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/contacto/registrar.php`, payload);
  }
}
