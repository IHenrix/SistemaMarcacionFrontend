import { Component, inject } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { environment } from '@env/environment';
import { FooterComponent } from './footer/footer';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, RouterModule,FooterComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  private router = inject(Router);
  private ar = inject(ActivatedRoute);

  protected mostrarModulos = false;
  protected pageTitle = '';
  protected moduloColor = 'var(--utp-green)';
  protected version: string = environment.version;

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e: NavigationEnd) => {
          const mostrarModulos = e.urlAfterRedirects === '/sistema/menu-principal';
          let route = this.ar;
          while (route.firstChild) route = route.firstChild;
          const pageTitle = (route.snapshot.routeConfig?.title as string) || '';
          const moduloColor = (route.snapshot.data?.['color'] as string) || 'var(--utp-green)';
          return { mostrarModulos, pageTitle, moduloColor };
        })
      )
      .subscribe(({ mostrarModulos, pageTitle, moduloColor }) => {
        this.mostrarModulos = mostrarModulos;
        this.pageTitle = pageTitle;
        this.moduloColor = moduloColor;
      });
  }
}
