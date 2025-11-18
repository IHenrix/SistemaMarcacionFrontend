import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';
// import { authGuard } from './core/guards/auth.guard'; //

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.LoginComponent),
    title: 'Iniciar sesión',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/errors/not-found-externo/not-found-externo')
        .then(m => m.NotFoundComponent),
    title: 'Página no encontrada',
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  {
    path: '',
    component: LayoutComponent,
    // canActivate: [authGuard],
    // canActivateChild: [authGuard],
    children: [
      {
        path: 'sistema',
        loadChildren: () =>
          import('./components/sistema/sistema.routes').then(m => m.SISTEMA_ROUTES),
        // runGuardsAndResolvers: 'always',
      },
    ],
  },

  { path: '**', redirectTo: '404' },
];
