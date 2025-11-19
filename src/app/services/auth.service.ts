import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { LoginRequest, LoginResponse, Usuario } from '@app/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.urlEndPoint;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();


  login(username: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login.php`, body).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.token);
          this.setUser(response.data.usuario);

          this.currentUserSubject.next(response.data.usuario);
        }
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }


  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.some(role => role.nombre === roleName);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMINISTRADOR');
  }


  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private setUser(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }


  private getUserFromStorage(): Usuario | null {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token inválido');
      }
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Error al decodificar el token');
    }
  }
}
