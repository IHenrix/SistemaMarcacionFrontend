import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import Swal from 'sweetalert2';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, mostrar mensaje y redirigir al login
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

/**
 * Guard funcional para proteger rutas que requieren rol de administrador
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
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

  // Verificar si el usuario es administrador
  if (authService.isAdmin()) {
    return true;
  }

  // Si no es administrador, mostrar mensaje y redirigir
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
