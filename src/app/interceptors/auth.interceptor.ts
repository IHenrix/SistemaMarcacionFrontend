import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          confirmButtonColor: '#00A5A5',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          authService.logout();
        });
      }

      if (error.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: error.error?.message || 'No tienes permisos para realizar esta acción.',
          confirmButtonColor: '#00A5A5',
          confirmButtonText: 'Aceptar'
        });
      }

      if (error.status === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Ha ocurrido un error en el servidor. Por favor intenta más tarde.',
          confirmButtonColor: '#00A5A5',
          confirmButtonText: 'Aceptar'
        });
      }

      return throwError(() => error);
    })
  );
};
