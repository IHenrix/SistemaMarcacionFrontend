import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-interno',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="not-found-interno">
      <h1>404</h1>
      <h2>Sección del sistema no encontrada</h2>
      <p>La ruta que buscas no existe o fue movida.</p>
      <nav class="links">
        <a routerLink="/sistema/menu-principal">Volver al menú principal</a>
      </nav>
    </section>
  `,
  styles: [`
    .not-found-interno { text-align: center; padding: 5rem 2rem; }
    h1 { font-size: 5rem; color: #ffb300; margin-bottom: .5rem; }
    h2 { margin: 0 0 .75rem; }
    .links a { color: #00796b; text-decoration: none; font-weight: 600; }
    .links a:hover { text-decoration: underline; }
  `],
})
export class NotFoundInternoComponent {}
