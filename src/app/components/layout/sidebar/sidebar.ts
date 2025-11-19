import { Component, inject, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from '@app/services/auth.service';
import { Usuario } from '@app/models/auth.model';

@Component({
  selector: 'sidebar-seccion',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected usuario: Usuario | null = null;

  ngOnInit(): void {
    // Suscribirse al observable del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  protected cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00A5A5',
      cancelButtonColor: '#d33',
      confirmButtonText: '<span style="padding: 0 15px;">Sí, cerrar sesión</span>',
      cancelButtonText: '<span style="padding: 0 15px;">Cancelar</span>',
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio de logout
        this.authService.logout();

        Swal.fire({
          icon: 'success',
          title: 'Has cerrado sesión con éxito',
          text: environment.systemName,
          confirmButtonColor: '#00A5A5',
          confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
          timer: 2000,
          timerProgressBar: true
        });
      }
    });
  }
}
