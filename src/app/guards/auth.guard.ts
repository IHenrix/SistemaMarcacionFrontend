import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import Swal from 'sweetalert2';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  Swal.fire({
    icon: 'warning',
    title: 'Acceso restringido',
    text: 'Debes iniciar sesión para acceder a esta página.',
    confirmButtonColor: '#00A5A5',
    confirmButtonText: 'Ir al login'
  }).then(() => {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  });

  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    Swal.fire({
      icon: 'warning',
      title: 'Acceso restringido',
      text: 'Debes iniciar sesión para acceder a esta página.',
      confirmButtonColor: '#00A5A5',
      confirmButtonText: 'Ir al login'
    }).then(() => {
      router.navigate(['/login']);
    });
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  Swal.fire({
    icon: 'error',
    title: 'Acceso denegado',
    text: 'No tienes permisos de administrador para acceder a esta página.',
    confirmButtonColor: '#00A5A5',
    confirmButtonText: 'Aceptar'
  }).then(() => {
    router.navigate(['/sistema/menu-principal']);
  });

  return false;
};
