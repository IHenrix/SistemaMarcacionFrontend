import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'sidebar-seccion',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  protected cerrarSesion() {
    Swal.fire({
      icon: 'success',
      title: 'Has cerrado sesión con éxito',
      text: environment.systemName,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      confirmButtonColor: '#00A5A5',
      confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
    });
    this.router.navigate(['/login']);
  }
}
