import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SistemaComponent } from './components/sistema/sistema.component';
import { MainComponent } from './components/sistema/main/main.component';
import { PresencialComponent } from './components/sistema/main/presencial/presencial.component';
;

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
 {
    path: 'menu-principal',
    component: SistemaComponent,
    children: [
      { path: '', component: MainComponent },
      { path: 'presencial', component: PresencialComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
