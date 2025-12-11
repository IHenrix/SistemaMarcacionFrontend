import { Routes } from '@angular/router';
import { adminGuard } from '@app/guards/auth.guard';

export const SISTEMA_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'menu-principal',
  },
  {
    path: 'menu-principal',
    loadComponent: () =>
      import('../layout/menu-principal/menu-principal').then((m) => m.MenuPrincipalComponent),
    title: 'Menú principal',
  },
  {
    path: 'presencial',
    loadComponent: () => import('./presencial/presencial').then((m) => m.PresencialComponent),
    title: 'Marcación presencial',
    data: { color: 'var(--utp-green)' },
  },
  {
    path: 'horarios',
    loadComponent: () => import('./horarios/horarios').then((m) => m.HorariosComponent),
    title: 'Horarios',
    data: { color: 'var(--utp-cyan)' },
    canActivate: [adminGuard],
  },
  {
    path: 'reportes',
    loadComponent: () => import('./reporte/reporte').then((m) => m.ReporteComponent),
    title: 'Reportes',
    data: { color: 'var(--utp-yellow)' },
  },
  {
    path: 'contacto',
    loadComponent: () => import('./contacto/contacto').then((m) => m.ContactoComponent),
    title: 'Formulario de contacto',
    data: { color: 'var(--utp-red)' },
  },
  {
    path: 'administracion',
    loadComponent: () =>
      import('../administrador/administrador').then((m) => m.AdministradorComponent),
    title: 'Administración',
    data: { color: 'var(--utp-gray-dark)' },
    canActivate: [adminGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('../../shared/errors/not-found-interno/not-found-interno').then(
        (m) => m.NotFoundInternoComponent
      ),
    title: 'No encontrado',
  },
];
