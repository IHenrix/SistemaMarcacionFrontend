import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="not-found">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Esta sección no pertenece al sistema.</p>
      <nav class="links">
        <a routerLink="/login">Ir a iniciar sesión</a>
      </nav>
    </section>
  `,
  styles: [`
    .not-found { text-align: center; padding: 5rem 2rem; }
    h1 { font-size: 6rem; color: #ff5252; margin-bottom: .5rem; }
    h2 { margin: 0 0 .75rem; }
    .links a { color: #1976d2; text-decoration: none; font-weight: 600; }
    .links a:hover { text-decoration: underline; }
  `],
})
export class NotFoundComponent {}
