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
    .not-found-interno {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 8rem;
      font-weight: 800;
      color: #ffb300;
      margin: 0;
      line-height: 1;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 3rem 0 0.5rem;
    }

    p {
      font-size: 1rem;
      color: #666;
      margin: 0.5rem 0 2rem;
    }

    .links a {
      display: inline-block;
      padding: 0.75rem 2rem;
      background-color: #00796b;
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 4px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .links a:hover {
      background-color: #005f54;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 5rem;
      }

      h2 {
        font-size: 1.25rem;
      }
    }
  `],
})
export class NotFoundInternoComponent {}
