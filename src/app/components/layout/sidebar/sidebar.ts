import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'sidebar-seccion',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
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
