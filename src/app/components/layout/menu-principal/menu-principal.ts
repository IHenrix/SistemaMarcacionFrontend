import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'menu-principal-section',
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.scss'
})
export class MenuPrincipalComponent {
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.isAdmin();
}
