import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SharedImports } from '../../../shared/shared/shared.imports';

@Component({
  selector: 'seccion-header',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  mostrarHeader = false;
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.mostrarHeader = event.urlAfterRedirects === '/menu-principal';
      });
  }
}
