import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.LoginComponent),
    title: 'Iniciar sesión',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
    title: 'Recuperar contraseña',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/reset-password/reset-password').then(m => m.ResetPasswordComponent),
    title: 'Nueva contraseña',
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
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'sistema',
        loadChildren: () =>
          import('./components/sistema/sistema.routes').then(m => m.SISTEMA_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: '404' },
];
