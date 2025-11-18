import { Routes } from '@angular/router';

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
    path: 'contacto',
    loadComponent: () => import('./contacto/contacto.component').then((m) => m.ContactoComponent),
    title: 'Contacto',
    data: { color: 'var(--utp-red)' },
  },
  {
    path: 'presencial',
    loadComponent: () => import('./presencial/presencial.component').then((m) => m.PresencialComponent),
    title: 'Presencial',
    data: { color: 'var(--utp-cyan)' },
  },
  {
    path: 'ejemplos-ui',
    loadComponent: () =>
      import('../layout/ejemplos-ui/ejemplos-ui').then((m) => m.EjemplosUiComponent),
    title: 'Ejemplos UI',
    data: { color: 'var(--utp-cyan)' },
  },
    {
    path: 'ejemplos-ui-material',
    loadComponent: () =>
      import('../layout/demo-material/demo-material').then((m) => m.DemoMaterialComponent),
    title: 'Ejemplos Angular Material UI',
    data: { color: 'var(--utp-cyan)' },
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
