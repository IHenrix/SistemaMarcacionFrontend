import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedImports } from '@app/shared/shared.imports';
import { environment } from '@env/environment';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [SharedImports],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  formLogin!: FormGroup;
  private router = inject(Router);
  private authService = inject(AuthService);

  version: string = environment.version;
  loading: boolean = false;

  ngOnInit(): void {
    this.buildForm();

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/sistema/menu-principal']);
    }
  }

  buildForm() {
    this.formLogin = new FormGroup({
      usuario: new FormControl('75911772', [Validators.required]),
      password: new FormControl('Pedro1415@', [Validators.required]),
    });
  }

  login() {
    if (this.formLogin.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor ingrese su usuario y contraseña',
        confirmButtonColor: '#00A5A5',
        confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
      });
      return;
    }

    const data = this.formLogin.value;
    const username = data.usuario?.trim();
    const password = data.password;

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor ingrese su usuario y contraseña',
        confirmButtonColor: '#00A5A5',
        confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
      });
      return;
    }

    this.loading = true;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${response.data.usuario.nombre}`,
            confirmButtonColor: '#00A5A5',
            confirmButtonText: '<span style="padding: 0 15px;">Continuar</span>',
            timer: 2000,
            timerProgressBar: true
          }).then(() => {
            this.router.navigate(['/sistema/menu-principal']);
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error en login:', error);

        const mensaje = error.error?.message || 'Error al iniciar sesión. Por favor intenta nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: mensaje,
          confirmButtonColor: '#00A5A5',
          confirmButtonText: '<span style="padding: 0 15px;">Aceptar</span>',
        });
      }
    });
  }
}
